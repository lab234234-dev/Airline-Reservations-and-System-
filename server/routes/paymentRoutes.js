const express = require('express');
const router = express.Router();
const { 
    createOrder, 
    verifyPayment, 
    handleWebhook, 
    getPayment, 
    getAllPayments, 
    getStats 
} = require('../controllers/paymentController');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { paymentLimiter } = require('../middleware/rateLimiter');

// Payment endpoints
router.post('/create-order', protect, paymentLimiter, createOrder);
router.post('/verify', protect, paymentLimiter, verifyPayment);
router.post('/webhook', handleWebhook);
router.get('/:id', protect, getPayment);

// Admin endpoints
router.get('/', protect, adminOnly, getAllPayments);
router.get('/stats/overview', protect, adminOnly, getStats);

module.exports = router;
