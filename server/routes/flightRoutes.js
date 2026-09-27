const express = require('express');
const router = express.Router();
const { getFlights, getFlightById, addFlight, updateFlight, deleteFlight } = require('../controllers/flightController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/', getFlights);
router.get('/:id', getFlightById);
router.post('/', protect, adminOnly, addFlight);
router.put('/:id', protect, adminOnly, updateFlight);
router.delete('/:id', protect, adminOnly, deleteFlight);

module.exports = router;
