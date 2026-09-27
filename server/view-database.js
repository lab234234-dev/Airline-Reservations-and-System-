const mongoose = require('mongoose');
const User = require('./models/User');
const Flight = require('./models/Flight');
const dotenv = require('dotenv');
dotenv.config();

const showData = async () => {
    try {
        const mongoURI = process.env.MONGO_URI.includes('<db_password>')
            ? 'mongodb://localhost:27017/airline-reservation'
            : process.env.MONGO_URI;

        await mongoose.connect(mongoURI);

        console.log('\n--- 👥 REGISTERED USERS ---');
        const users = await User.find({});
        if (users.length === 0) console.log('No users found.');
        users.forEach(u => {
            console.log(`Name: ${u.name} | Email: ${u.email} | Role: ${u.role}`);
        });

        console.log('\n--- ✈️ AVAILABLE FLIGHTS ---');
        const flights = await Flight.find({});
        if (flights.length === 0) console.log('No flights found.');
        flights.forEach(f => {
            console.log(`Flight: ${f.flightNumber} | ${f.origin} -> ${f.destination} | Price: ₹${f.price}`);
        });

        console.log('\n---------------------------\n');
        process.exit();
    } catch (error) {
        console.error('Error fetching data:', error.message);
        process.exit(1);
    }
};

showData();
