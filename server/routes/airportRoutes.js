const express = require('express');
const router = express.Router();
const { bookCounterTicket, getCounterBookings, getTicketByPNR } = require('../controllers/airportController');
const { protect } = require('../middleware/authMiddleware');

// Counter ticket routes
router.post('/book-counter-ticket', protect, bookCounterTicket);
router.get('/counter-bookings', protect, getCounterBookings);
router.get('/ticket/:pnr', getTicketByPNR); // Public lookup by PNR for verification

module.exports = router;
