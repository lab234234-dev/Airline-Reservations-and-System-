const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const testConnection = async () => {
    try {
        console.log('Testing connection to:', process.env.MONGO_URI || 'mongodb://localhost:27017/airline-reservation');
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/airline-reservation', { serverSelectionTimeoutMS: 5000 });
        console.log('SUCCESS: Connected to MongoDB');
        process.exit(0);
    } catch (err) {
        console.error('FAILURE: Could not connect to MongoDB. Is it running?');
        console.error('Error details:', err.message);
        process.exit(1);
    }
};

testConnection();
