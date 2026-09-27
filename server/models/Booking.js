const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    flight: { type: mongoose.Schema.Types.ObjectId, ref: 'Flight', required: true },
    origin: { type: String },
    destination: { type: String },
    airline: { type: String },
    flightNumber: { type: String },
    pnr: { type: String },
    seatNumber: { type: String },
    passengers: [{
        name: String,
        age: Number,
        gender: String,
        seatNumber: String
    }],
    totalAmount: { type: Number, required: true },
    paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'paid' },
    paymentMethod: { type: String, default: 'Credit/Debit Card' },
    bookingStatus: { type: String, enum: ['confirmed', 'cancelled'], default: 'confirmed' },
    checkInStatus: { type: String, enum: ['pending', 'completed'], default: 'pending' },
    flightFlyingStatus: { type: String, default: 'Check-In Required' },
    boardingPassIssued: { type: Boolean, default: false },
    gate: { type: String, default: 'B4' },
    terminal: { type: String, default: 'T2' },
    boardingTime: { type: String, default: '45m Before Departure' },
    transactionId: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
