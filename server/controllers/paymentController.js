const Razorpay = require('razorpay');
const crypto = require('crypto');
const Payment = require('../models/Payment');
const Booking = require('../models/Booking');

// Initialize Razorpay instance
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Create Razorpay Order
exports.createOrder = async (req, res) => {
    try {
        const { amount, currency = 'INR', bookingId } = req.body;

        if (!amount || amount < 1) {
            return res.status(400).json({ message: 'Invalid amount' });
        }

        const options = {
            amount: Math.round(amount * 100), // Amount in paise (1 rupee = 100 paise)
            currency,
            receipt: `booking_${bookingId || Date.now()}`,
            notes: {
                bookingId,
                userId: req.user._id
            }
        };

        const order = await razorpay.orders.create(options);

        res.status(200).json({
            orderId: order.id,
            amount: order.amount / 100, // Convert back to rupees
            currency: order.currency,
            key: process.env.RAZORPAY_KEY_ID
        });
    } catch (error) {
        console.error('Razorpay Order Creation Error:', error);
        res.status(500).json({ message: 'Failed to create payment order' });
    }
};

// Verify Razorpay Payment & Create Payment Record
exports.verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId } = req.body;

        // Verify signature
        const body = razorpay_order_id + '|' + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body)
            .digest('hex');

        if (expectedSignature !== razorpay_signature) {
            return res.status(400).json({ message: 'Payment verification failed' });
        }

        // Fetch booking
        const booking = await Booking.findById(bookingId).populate('flight user');
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Create/Update payment record
        const payment = await Payment.findOneAndUpdate(
            { booking: bookingId },
            {
                user: req.user._id,
                booking: bookingId,
                amount: booking.totalAmount,
                transactionId: razorpay_payment_id,
                paymentMethod: 'Razorpay',
                status: 'success'
            },
            { upsert: true, new: true }
        );

        // Update booking payment status
        booking.paymentStatus = 'paid';
        booking.transactionId = razorpay_payment_id;
        await booking.save();

        res.status(200).json({
            message: 'Payment verified successfully',
            payment,
            booking
        });
    } catch (error) {
        console.error('Payment Verification Error:', error);
        res.status(500).json({ message: 'Payment verification failed' });
    }
};

// Handle Razorpay Webhook
exports.handleWebhook = async (req, res) => {
    try {
        const event = req.body;
        const signature = req.headers['x-razorpay-signature'];

        // Verify webhook signature
        const body = JSON.stringify(event);
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
            .update(body)
            .digest('hex');

        if (expectedSignature !== signature) {
            return res.status(400).json({ message: 'Invalid webhook signature' });
        }

        // Handle different webhook events
        if (event.event === 'payment.authorized') {
            const transactionId = event.payload.payment.entity.id;
            await Payment.updateOne(
                { transactionId },
                { status: 'success' }
            );
        } else if (event.event === 'payment.failed') {
            const transactionId = event.payload.payment.entity.id;
            await Payment.updateOne(
                { transactionId },
                { status: 'failed' }
            );
        }

        res.status(200).json({ message: 'Webhook processed' });
    } catch (error) {
        console.error('Webhook Error:', error);
        res.status(500).json({ message: 'Webhook processing failed' });
    }
};

// Get payment details
exports.getPayment = async (req, res) => {
    try {
        const payment = await Payment.findById(req.params.id)
            .populate('user', 'name email')
            .populate('booking');

        if (!payment) {
            return res.status(404).json({ message: 'Payment not found' });
        }

        res.json(payment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get all payments (Admin only)
exports.getAllPayments = async (req, res) => {
    try {
        const payments = await Payment.find({})
            .populate('user', 'name email')
            .populate({
                path: 'booking',
                populate: { path: 'flight', select: 'flightNumber origin destination' }
            })
            .sort({ createdAt: -1 });

        res.json(payments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get payment statistics (Admin only)
exports.getStats = async (req, res) => {
    try {
        const totalPayments = await Payment.countDocuments({ status: 'success' });
        const totalFailedPayments = await Payment.countDocuments({ status: 'failed' });
        
        const revenue = await Payment.aggregate([
            { $match: { status: 'success' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        res.json({
            totalPayments,
            totalFailedPayments,
            revenue: revenue[0]?.total || 0
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
