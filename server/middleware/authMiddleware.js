const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Validate JWT_SECRET is set on server startup
const validateJWTSecret = () => {
    if (!process.env.JWT_SECRET) {
        throw new Error('CRITICAL: JWT_SECRET is not defined in .env file. Server cannot start.');
    }
    if (process.env.JWT_SECRET.length < 32) {
        console.warn('WARNING: JWT_SECRET is less than 32 characters. Use a stronger secret in production.');
    }
};

const protect = async (req, res, next) => {
    let token;

    if (req.cookies.token) {
        token = req.cookies.token;
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id).select('-password');
        if (!req.user) {
            return res.status(401).json({ message: 'User not found' });
        }
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token has expired' });
        }
        res.status(401).json({ message: 'Not authorized, token failed' });
    }
};

const adminOnly = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Not authorized as an admin' });
    }
};

module.exports = {
    protect,
    adminOnly,
    validateJWTSecret
};
