const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
    amount: { type: Number, required: true },
    paymentMethod: { type: String, required: true, default: 'Razorpay' },
    transactionId: { type: String, required: true, unique: true },
    status: { type: String, enum: ['success', 'failed', 'pending'], default: 'success' }
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
