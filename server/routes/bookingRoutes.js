const express = require('express');
const router = express.Router();
const { 
    createBooking, 
    getUserBookings, 
    getAllBookings, 
    getBooking, 
    cancelBooking,
    completeCheckIn,
    completeCheckInByPnr
} = require('../controllers/bookingController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// User booking endpoints
router.post('/', protect, createBooking);
router.get('/my-bookings', protect, getUserBookings);
router.post('/checkin-pnr', completeCheckInByPnr);
router.put('/:id/checkin', protect, completeCheckIn);
router.get('/:id', protect, getBooking);
router.put('/:id/cancel', protect, cancelBooking);

// Admin endpoints
router.get('/', protect, adminOnly, getAllBookings);

module.exports = router;
