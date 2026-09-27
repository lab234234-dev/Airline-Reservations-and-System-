const mongoose = require('mongoose');
const Flight = require('./models/Flight');
const dotenv = require('dotenv');

const path = require('path'); dotenv.config({ path: path.join(__dirname, '.env') });

const now = Date.now();
const day = 86400000;

const sampleFlights = [
    // --- ðŸ‡®ðŸ‡³ DOMESTIC FLIGHTS (INDIAN STATES) ---
    {
        flightNumber: 'SH-102',
        airline: 'SkyHigh Air',
        origin: 'Surat',
        destination: 'Mumbai',
        departureTime: new Date(now + 3600000 * 2), // in 2 hours
        arrivalTime: new Date(now + 3600000 * 3.25),
        price: 3600,
        seatsAvailable: 110,
        totalSeats: 150,
        status: 'scheduled'
    },
    {
        flightNumber: 'AI-208',
        airline: 'Air India',
        origin: 'Ahmedabad',
        destination: 'Delhi',
        departureTime: new Date(now + 3600000 * 4),
        arrivalTime: new Date(now + 3600000 * 5.5),
        price: 4200,
        seatsAvailable: 95,
        totalSeats: 160,
        status: 'scheduled'
    },
    {
        flightNumber: 'SH-101',
        airline: 'SkyHigh Air',
        origin: 'Mumbai',
        destination: 'Delhi',
        departureTime: new Date(now + day),
        arrivalTime: new Date(now + day + 7200000),
        price: 4500,
        seatsAvailable: 85,
        totalSeats: 150,
        status: 'scheduled'
    },
    {
        flightNumber: 'IN-505',
        airline: 'IndiGo',
        origin: 'Bangalore',
        destination: 'Goa',
        departureTime: new Date(now + day * 1.5),
        arrivalTime: new Date(now + day * 1.5 + 4500000),
        price: 3400,
        seatsAvailable: 130,
        totalSeats: 180,
        status: 'scheduled'
    },
    {
        flightNumber: 'SG-404',
        airline: 'SpiceJet',
        origin: 'Jaipur',
        destination: 'Kolkata',
        departureTime: new Date(now + day * 2),
        arrivalTime: new Date(now + day * 2 + 8100000),
        price: 4900,
        seatsAvailable: 78,
        totalSeats: 160,
        status: 'scheduled'
    },
    {
        flightNumber: 'AI-303',
        airline: 'Air India',
        origin: 'Chennai',
        destination: 'Bangalore',
        departureTime: new Date(now + day * 2.5),
        arrivalTime: new Date(now + day * 2.5 + 3600000),
        price: 2800,
        seatsAvailable: 140,
        totalSeats: 180,
        status: 'scheduled'
    },
    {
        flightNumber: 'AI-601',
        airline: 'Air India',
        origin: 'Delhi',
        destination: 'Srinagar',
        departureTime: new Date(now + day * 3),
        arrivalTime: new Date(now + day * 3 + 5400000),
        price: 5800,
        seatsAvailable: 60,
        totalSeats: 150,
        status: 'scheduled'
    },
    {
        flightNumber: '6E-712',
        airline: 'IndiGo',
        origin: 'Kochi',
        destination: 'Chennai',
        departureTime: new Date(now + day * 3.5),
        arrivalTime: new Date(now + day * 3.5 + 4200000),
        price: 3100,
        seatsAvailable: 115,
        totalSeats: 180,
        status: 'scheduled'
    },
    {
        flightNumber: '6E-889',
        airline: 'IndiGo',
        origin: 'Surat',
        destination: 'Bangalore',
        departureTime: new Date(now + day * 4),
        arrivalTime: new Date(now + day * 4 + 7500000),
        price: 4900,
        seatsAvailable: 105,
        totalSeats: 180,
        status: 'scheduled'
    },
    {
        flightNumber: 'HY-707',
        airline: 'Air India Express',
        origin: 'Hyderabad',
        destination: 'Pune',
        departureTime: new Date(now + day * 4.5),
        arrivalTime: new Date(now + day * 4.5 + 4500000),
        price: 3200,
        seatsAvailable: 90,
        totalSeats: 160,
        status: 'scheduled'
    },

    // --- âœˆï¸ INTERNATIONAL FLIGHTS (GLOBAL ROUTES) ---
    {
        flightNumber: 'EK-501',
        airline: 'Emirates',
        origin: 'Mumbai',
        destination: 'Dubai',
        departureTime: new Date(now + day),
        arrivalTime: new Date(now + day + 12600000), // 3.5h
        price: 16500,
        seatsAvailable: 180,
        totalSeats: 300,
        status: 'scheduled'
    },
    {
        flightNumber: 'BA-138',
        airline: 'British Airways',
        origin: 'Delhi',
        destination: 'London',
        departureTime: new Date(now + day * 2),
        arrivalTime: new Date(now + day * 2 + 32400000), // 9h
        price: 48000,
        seatsAvailable: 210,
        totalSeats: 320,
        status: 'scheduled'
    },
    {
        flightNumber: 'SQ-402',
        airline: 'Singapore Airlines',
        origin: 'Bangalore',
        destination: 'Singapore',
        departureTime: new Date(now + day * 2.5),
        arrivalTime: new Date(now + day * 2.5 + 16200000), // 4.5h
        price: 19800,
        seatsAvailable: 155,
        totalSeats: 260,
        status: 'scheduled'
    },
    {
        flightNumber: 'AI-101',
        airline: 'Air India',
        origin: 'Delhi',
        destination: 'New York',
        departureTime: new Date(now + day * 3),
        arrivalTime: new Date(now + day * 3 + 55800000), // 15.5h
        price: 72000,
        seatsAvailable: 190,
        totalSeats: 340,
        status: 'scheduled'
    },
    {
        flightNumber: 'TG-318',
        airline: 'Thai Airways',
        origin: 'Ahmedabad',
        destination: 'Bangkok',
        departureTime: new Date(now + day * 3.5),
        arrivalTime: new Date(now + day * 3.5 + 15300000), // 4.25h
        price: 17200,
        seatsAvailable: 140,
        totalSeats: 240,
        status: 'scheduled'
    },
    {
        flightNumber: 'AF-218',
        airline: 'Air France',
        origin: 'Mumbai',
        destination: 'Paris',
        departureTime: new Date(now + day * 4),
        arrivalTime: new Date(now + day * 4 + 34200000), // 9.5h
        price: 52000,
        seatsAvailable: 165,
        totalSeats: 280,
        status: 'scheduled'
    }
];

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/airline-reservation');
        console.log('Connected to MongoDB for seeding rich routes...');

        await Flight.deleteMany({});
        await Flight.insertMany(sampleFlights);

        console.log(`Successfully added ${sampleFlights.length} domestic & international flights!`);
        process.exit();
    } catch (err) {
        console.error('Error seeding data:', err);
        process.exit(1);
    }
};

seedDB();