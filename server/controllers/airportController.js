const Flight = require('../models/Flight');
const AirportBooking = require('../models/AirportBooking');
const crypto = require('crypto');

// Generate unique 6-digit alphanumeric PNR (e.g. SK8F2P)
const generatePNR = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Avoid ambiguous chars like 0, O, 1, I
    let pnr = 'SK';
    for (let i = 0; i < 4; i++) {
        pnr += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return pnr;
};

// Book counter ticket (Offline walk-in passenger booking)
exports.bookCounterTicket = async (req, res) => {
    try {
        const { travelDetails, passengers, contact, billing } = req.body;

        if (!travelDetails || !travelDetails.flightId) {
            return res.status(400).json({ message: 'Flight ID is required' });
        }

        if (!passengers || !Array.isArray(passengers) || passengers.length === 0) {
            return res.status(400).json({ message: 'At least one passenger is required' });
        }

        if (!billing || !billing.paymentMethod) {
            return res.status(400).json({ message: 'Payment method (CASH, CARD, UPI) is required' });
        }

        const flight = await Flight.findById(travelDetails.flightId);
        if (!flight) {
            return res.status(404).json({ message: 'Flight not found' });
        }

        if (flight.seatsAvailable < passengers.length) {
            return res.status(400).json({ 
                message: `Not enough seats available. Only ${flight.seatsAvailable} seats remaining.` 
            });
        }

        // Validate that requested seats are not already booked (Concurrency Protection)
        const requestedSeats = passengers.map(p => p.seatNumber.toUpperCase());
        const bookedSet = new Set(flight.bookedSeats || []);
        
        for (const seat of requestedSeats) {
            if (bookedSet.has(seat)) {
                return res.status(409).json({ 
                    message: `Seat ${seat} has already been reserved by another passenger! Please select an available seat.` 
                });
            }
        }

        // Generate unique PNR
        let pnr = generatePNR();
        let exists = await AirportBooking.findOne({ pnr });
        while (exists) {
            pnr = generatePNR();
            exists = await AirportBooking.findOne({ pnr });
        }

        // Atomically lock seats in flight document
        await Flight.findByIdAndUpdate(
            travelDetails.flightId,
            {
                $addToSet: { bookedSeats: { $each: requestedSeats } },
                $inc: { seatsAvailable: -passengers.length }
            },
            { new: true }
        );

        // Create Counter Booking record in MongoDB
        const airportBooking = await AirportBooking.create({
            pnr,
            agentId: req.user._id,
            agentName: req.user.name || 'Airport Desk Agent',
            bookingChannel: 'AIRPORT_COUNTER',
            travelDetails: {
                flightId: flight._id,
                class: travelDetails.class || 'Economy'
            },
            passengers: passengers.map(p => ({
                name: p.name,
                age: Number(p.age),
                gender: p.gender,
                category: p.category || 'Adult',
                idType: p.idType || 'Aadhaar',
                idNumber: p.idNumber,
                seatNumber: p.seatNumber.toUpperCase(),
                mealPreference: p.mealPreference || 'Vegetarian'
            })),
            contact: {
                phone: contact.phone,
                email: contact.email
            },
            billing: {
                baseFare: Number(billing.baseFare),
                addOnCharges: Number(billing.addOnCharges || 0),
                totalPaid: Number(billing.totalPaid),
                paymentStatus: 'COMPLETED',
                paymentMethod: billing.paymentMethod
            }
        });

        // Populate flight details for response / ticket printing
        const populatedBooking = await AirportBooking.findById(airportBooking._id)
            .populate('travelDetails.flightId')
            .populate('agentId', 'name email');

        res.status(201).json({
            success: true,
            message: 'Airport Counter Ticket booked successfully!',
            booking: populatedBooking
        });

    } catch (error) {
        console.error('Airport Counter Booking Error:', error);
        res.status(500).json({ message: error.message || 'Counter booking failed' });
    }
};

// Get all airport counter bookings
exports.getCounterBookings = async (req, res) => {
    try {
        const bookings = await AirportBooking.find()
            .populate('travelDetails.flightId')
            .populate('agentId', 'name email')
            .sort({ createdAt: -1 });

        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Search / Verify Ticket by PNR
exports.getTicketByPNR = async (req, res) => {
    try {
        const { pnr } = req.params;
        const booking = await AirportBooking.findOne({ pnr: pnr.toUpperCase() })
            .populate('travelDetails.flightId')
            .populate('agentId', 'name email');

        if (!booking) {
            return res.status(404).json({ message: 'Ticket not found for this PNR' });
        }

        res.json(booking);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
