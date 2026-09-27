const rateLimit = require('express-rate-limit');

// General API rate limiter
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
});

// Rate limiter for authentication endpoints (login, register)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Relaxed limit to avoid blocking during testing
    message: { message: 'Too many attempts from this IP, please try again after 15 minutes' },
    skipSuccessfulRequests: true,
    standardHeaders: true,
    legacyHeaders: false,
});

// Rate limiter for payment endpoints
const paymentLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 20, // Limit each IP to 20 payment requests per hour
    message: 'Too many payment requests, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = {
    apiLimiter,
    authLimiter,
    paymentLimiter
};
