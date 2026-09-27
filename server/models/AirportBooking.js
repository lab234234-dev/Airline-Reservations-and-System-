const mongoose = require('mongoose');

const airportBookingSchema = new mongoose.Schema({
    pnr: { type: String, unique: true, required: true, uppercase: true, index: true }, // Automatically generated 6-digit alpha-numeric PNR
    agentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Tracks the agent/admin working the counter
    agentName: { type: String, default: 'Airport Desk Agent' },
    bookingChannel: { type: String, default: 'AIRPORT_COUNTER' },
    travelDetails: {
        flightId: { type: mongoose.Schema.Types.ObjectId, ref: 'Flight', required: true },
        class: { type: String, enum: ['Economy', 'Premium Economy', 'Business', 'First Class'], default: 'Economy' }
    },
    passengers: [{
        name: { type: String, required: true },
        age: { type: Number, required: true },
        gender: { type: String, required: true },
        category: { type: String, enum: ['Adult', 'Child', 'Infant'], default: 'Adult' },
        idType: { type: String, required: true }, // e.g., 'PASSPORT', 'AADHAAR'
        idNumber: { type: String, required: true },
        seatNumber: { type: String, required: true },
        mealPreference: { type: String, default: 'Vegetarian' }
    }],
    contact: {
        phone: { type: String, required: true },
        email: { type: String, required: true }
    },
    billing: {
        baseFare: { type: Number, required: true },
        addOnCharges: { type: Number, default: 0 },
        totalPaid: { type: Number, required: true },
        paymentStatus: { type: String, enum: ['COMPLETED', 'FAILED'], default: 'COMPLETED' },
        paymentMethod: { type: String, enum: ['CASH', 'CARD', 'UPI'], required: true }
    }
}, { timestamps: true });

module.exports = mongoose.model('AirportBooking', airportBookingSchema);
