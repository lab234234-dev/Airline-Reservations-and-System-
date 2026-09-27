const Booking = require('../models/Booking');
const Flight = require('../models/Flight');
const Payment = require('../models/Payment');
const User = require('../models/User');

exports.createBooking = async (req, res) => {
    const { flightId, passengers, totalAmount, paymentMethod, paymentStatus } = req.body;

    try {
        const flight = await Flight.findById(flightId);
        if (!flight) return res.status(404).json({ message: 'Flight not found' });

        if (flight.seatsAvailable < (passengers ? passengers.length : 1)) {
            return res.status(400).json({ message: 'Not enough seats available' });
        }

        const transactionId = 'TXN-' + Math.random().toString(36).substr(2, 9).toUpperCase();
        const pnr = 'SH-' + Math.random().toString(36).substr(2, 6).toUpperCase();

        const seatNum = passengers && passengers.length > 0 
            ? passengers.map(p => p.seatNumber).join(', ') 
            : (req.body.seatNumber || '12A');

        // Create booking with confirmed payment
        const booking = await Booking.create({
            user: req.user._id,
            flight: flightId,
            origin: flight.origin,
            destination: flight.destination,
            airline: flight.airline,
            flightNumber: flight.flightNumber,
            pnr: pnr,
            seatNumber: seatNum,
            passengers: passengers || [],
            totalAmount: totalAmount || flight.price,
            paymentStatus: paymentStatus || 'paid',
            paymentMethod: paymentMethod || 'Credit/Debit Card',
            bookingStatus: 'confirmed',
            checkInStatus: 'pending',
            flightFlyingStatus: 'Check-In Required',
            boardingPassIssued: false,
            gate: 'B' + (Math.floor(Math.random() * 12) + 1),
            terminal: 'T' + (Math.floor(Math.random() * 3) + 1),
            boardingTime: '45m Before Departure',
            transactionId: transactionId
        });

        // Create Payment record
        try {
            await Payment.create({
                user: req.user._id,
                booking: booking._id,
                amount: totalAmount || flight.price,
                paymentMethod: paymentMethod || 'Credit/Debit Card',
                transactionId: transactionId,
                status: 'success'
            });
        } catch (payErr) {
            console.warn('Payment record notice:', payErr.message);
        }

        // Award reward points
        try {
            const pointsEarned = Math.floor((totalAmount || flight.price) * 0.1);
            await User.findByIdAndUpdate(req.user._id, { $inc: { rewardPoints: pointsEarned } });
        } catch (uErr) {
            console.warn('User points notice:', uErr.message);
        }

        // Reserve seats on flight
        if (passengers && passengers.length > 0) {
            flight.seatsAvailable = Math.max(0, flight.seatsAvailable - passengers.length);
            await flight.save();
        }

        res.status(201).json({
            booking,
            message: 'Payment received & booking confirmed successfully!',
            paymentRequired: false
        });
    } catch (error) {
        console.error('Create booking error:', error);
        res.status(500).json({ message: error.message });
    }
};

exports.getUserBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ user: req.user._id })
            .populate('flight')
            .sort({ createdAt: -1 });
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getAllBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({})
            .populate('user', 'name email')
            .populate('flight')
            .sort({ createdAt: -1 });
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get a specific booking
exports.getBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id)
            .populate('flight')
            .populate('user', 'name email');

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Check if user is the owner or admin
        if (booking.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to view this booking' });
        }

        res.json(booking);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Cancel a booking
exports.cancelBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id).populate('flight');

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        if (booking.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to cancel this booking' });
        }

        if (booking.bookingStatus === 'cancelled') {
            return res.status(400).json({ message: 'Booking is already cancelled' });
        }

        if (booking.flight && booking.passengers && booking.passengers.length > 0) {
            booking.flight.seatsAvailable += booking.passengers.length;
            await booking.flight.save();
        }

        booking.bookingStatus = 'cancelled';
        await booking.save();

        res.json({ message: 'Booking cancelled successfully', booking });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Complete Web Check-In & Boarding Pass Confirmation
exports.completeCheckIn = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id).populate('flight');
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        booking.checkInStatus = 'completed';
        booking.boardingPassIssued = true;
        booking.flightFlyingStatus = 'In Flight ✈️ (Flying)';
        booking.gate = booking.gate || 'B' + (Math.floor(Math.random() * 12) + 1);
        booking.terminal = booking.terminal || 'T' + (Math.floor(Math.random() * 3) + 1);
        booking.boardingTime = booking.boardingTime || '45m Before Departure';
        await booking.save();

        res.json({
            message: 'Web Check-In confirmed! Boarding pass issued and flight marked ready for flying.',
            booking
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Complete Web Check-In by PNR
exports.completeCheckInByPnr = async (req, res) => {
    try {
        const { pnr } = req.body;
        if (!pnr) return res.status(400).json({ message: 'PNR is required' });

        const booking = await Booking.findOne({ pnr: pnr.trim().toUpperCase() }).populate('flight');
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found for this PNR' });
        }

        booking.checkInStatus = 'completed';
        booking.boardingPassIssued = true;
        booking.flightFlyingStatus = 'In Flight ✈️ (Flying)';
        booking.gate = booking.gate || 'B' + (Math.floor(Math.random() * 12) + 1);
        booking.terminal = booking.terminal || 'T' + (Math.floor(Math.random() * 3) + 1);
        booking.boardingTime = booking.boardingTime || '45m Before Departure';
        await booking.save();

        res.json({
            message: 'Web Check-In confirmed! Boarding pass issued and flight marked ready for flying.',
            booking
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
