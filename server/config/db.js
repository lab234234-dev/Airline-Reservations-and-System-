const mongoose = require('mongoose');

const connectDB = async () => {
    const mongoURI = process.env.MONGO_URI.includes('<db_password>')
        ? 'mongodb://localhost:27017/airline-reservation'
        : process.env.MONGO_URI;

    const attemptConnect = async () => {
        try {
            console.log('Connecting to MongoDB...');
            const conn = await mongoose.connect(mongoURI, {
                serverSelectionTimeoutMS: 15000,
                connectTimeoutMS: 15000
            });
            console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        } catch (error) {
            console.error(`❌ MongoDB Connection Error: ${error.message}`);
            console.log('⏳ Retrying MongoDB connection in 5 seconds...');
            setTimeout(attemptConnect, 5000);
        }
    };

    mongoose.connection.on('disconnected', () => {
        console.warn('⚠️  MongoDB disconnected! Attempting reconnect...');
        setTimeout(attemptConnect, 5000);
    });

    await attemptConnect();
};

module.exports = connectDB;
