const Flight = require('../models/Flight');

exports.getFlights = async (req, res) => {
    const { origin, destination, date } = req.query;
    let query = {};
    if (origin) query.origin = new RegExp(origin, 'i');
    if (destination) query.destination = new RegExp(destination, 'i');

    if (date) {
        const startDate = new Date(date);
        const endDate = new Date(date);
        endDate.setDate(endDate.getDate() + 1);
        query.departureTime = { $gte: startDate, $lt: endDate };
    }

    try {
        const flights = await Flight.find(query);
        res.json(flights);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getFlightById = async (req, res) => {
    try {
        const flight = await Flight.findById(req.params.id);
        if (!flight) return res.status(404).json({ message: 'Flight not found' });
        res.json(flight);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.addFlight = async (req, res) => {
    try {
        const flight = await Flight.create(req.body);
        res.status(201).json(flight);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateFlight = async (req, res) => {
    try {
        const flight = await Flight.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(flight);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteFlight = async (req, res) => {
    try {
        await Flight.findByIdAndDelete(req.params.id);
        res.json({ message: 'Flight deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
