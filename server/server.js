const path = require('path');
const fs = require('fs');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
require('express-async-errors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const { validateJWTSecret } = require('./middleware/authMiddleware');
const { apiLimiter, authLimiter } = require('./middleware/rateLimiter');

dotenv.config();

// Validate critical environment variables
try {
    validateJWTSecret();
} catch (error) {
    console.error(error.message);
    process.exit(1);
}

connectDB();

const app = express();

// Security Middleware
app.use(helmet({ contentSecurityPolicy: false })); // Set security HTTP headers
app.use(mongoSanitize()); // Prevent NoSQL injection
const allowedOrigins = [
    'http://localhost:4200',
    'http://localhost:5173',
    process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({ 
    origin: function(origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    }, 
    credentials: true 
}));

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cookieParser());

// Rate limiting
app.use('/api/', apiLimiter); // Apply general rate limiter to all API routes
app.use('/api/auth/login', authLimiter); // Stricter limit on login
app.use('/api/auth/register', authLimiter); // Stricter limit on register

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/flights', require('./routes/flightRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/airport', require('./routes/airportRoutes'));

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware for unhandled routes
// Serve static production Angular frontend
const frontendDist = path.join(__dirname, '../angular-client/dist/angular-client/browser');
if (fs.existsSync(frontendDist)) {
    console.log('Serving production Angular frontend from:', frontendDist);
    app.use(express.static(frontendDist));
    app.get('*', (req, res, next) => {
        if (req.url.startsWith('/api')) {
            return next();
        }
        res.sendFile(path.join(frontendDist, 'index.html'));
    });
} else {
    app.use((req, res) => {
        res.status(404).json({ message: 'Route not found' });
    });
}

// Global error handling middleware
app.use((error, req, res, next) => {
    console.error(error);
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ 
        message: error.message || 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`🔒 Security headers enabled`);
    console.log(`⚡ Rate limiting active`);
});
