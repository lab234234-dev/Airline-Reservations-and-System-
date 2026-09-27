const { body, validationResult, query } = require('express-validator');

// Validation middleware that runs validations and returns errors
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(err => err.msg).join(', ');
        return res.status(400).json({ 
            message: errorMessages,
            errors: errors.array() 
        });
    }
    next();
};

// Rules for user registration
const validateRegister = [
    body('name')
        .trim()
        .notEmpty().withMessage('Name is required')
        .isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
    body('email')
        .trim()
        .isEmail().withMessage('Valid email is required')
        .normalizeEmail(),
    body('password')
        .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
        .matches(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)/).withMessage('Password must contain uppercase, lowercase, and number'),
    validate
];

// Rules for user login
const validateLogin = [
    body('email')
        .trim()
        .isEmail().withMessage('Valid email is required')
        .normalizeEmail(),
    body('password')
        .notEmpty().withMessage('Password is required'),
    validate
];

// Rules for flight creation/update
const validateFlight = [
    body('flightNumber')
        .trim()
        .notEmpty().withMessage('Flight number is required')
        .matches(/^[A-Z]{2}-\d{3,4}$/).withMessage('Flight number format invalid (e.g., SH-101)'),
    body('airline')
        .trim()
        .notEmpty().withMessage('Airline name is required'),
    body('origin')
        .trim()
        .notEmpty().withMessage('Origin is required'),
    body('destination')
        .trim()
        .notEmpty().withMessage('Destination is required'),
    body('departureTime')
        .isISO8601().withMessage('Invalid departure time'),
    body('arrivalTime')
        .isISO8601().withMessage('Invalid arrival time'),
    body('price')
        .isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('totalSeats')
        .isInt({ min: 1 }).withMessage('Total seats must be at least 1'),
    validate
];

// Rules for booking creation
const validateBooking = [
    body('flightId')
        .notEmpty().withMessage('Flight ID is required')
        .isMongoId().withMessage('Invalid flight ID'),
    body('passengers')
        .isArray({ min: 1 }).withMessage('At least one passenger is required'),
    body('passengers.*.name')
        .trim()
        .notEmpty().withMessage('Passenger name is required'),
    body('passengers.*.age')
        .isInt({ min: 1, max: 120 }).withMessage('Valid age is required'),
    body('passengers.*.gender')
        .isIn(['Male', 'Female', 'Other']).withMessage('Valid gender is required'),
    body('totalAmount')
        .isFloat({ min: 0 }).withMessage('Total amount must be positive'),
    validate
];

// Rules for flight search query parameters
const validateFlightSearch = [
    query('origin')
        .optional()
        .trim()
        .isLength({ min: 2 }).withMessage('Origin must be at least 2 characters'),
    query('destination')
        .optional()
        .trim()
        .isLength({ min: 2 }).withMessage('Destination must be at least 2 characters'),
    query('date')
        .optional()
        .isISO8601().withMessage('Date must be in ISO format'),
    validate
];

module.exports = {
    validateRegister,
    validateLogin,
    validateFlight,
    validateBooking,
    validateFlightSearch
};
