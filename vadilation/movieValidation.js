// validation/movieValidation.js

const { body, param, validationResult } = require('express-validator');

// Validation rules for creating a movie (used by POST)
const createMovieValidation = [
    body('title')
        .trim() // Removes whitespace from both ends of a string
        .notEmpty().withMessage('Title is required')
        .isLength({ min: 1, max: 255 }).withMessage('Title must be between 1 and 255 characters'),
    body('director')
        .trim()
        .notEmpty().withMessage('Director is required')
        .isLength({ min: 1, max: 255 }).withMessage('Director must be between 1 and 255 characters'),
    body('year')
        .notEmpty().withMessage('Year is required')
        .isInt({ min: 1800, max: new Date().getFullYear() + 5 }).withMessage('Year must be a valid number between 1800 and ' + (new Date().getFullYear() + 5))
];

// Validation rules for updating a movie (used by PUT)
// We can reuse some, but also add optional validation if fields aren't strictly required
const updateMovieValidation = [
    // These fields are optional for update, but if present, they must be valid
    body('title')
        .optional() // Field is optional
        .trim()
        .isLength({ min: 1, max: 255 }).withMessage('Title must be between 1 and 255 characters'),
    body('director')
        .optional()
        .trim()
        .isLength({ min: 1, max: 255 }).withMessage('Director must be between 1 and 255 characters'),
    body('year')
        .optional()
        .isInt({ min: 1800, max: new Date().getFullYear() + 5 }).withMessage('Year must be a valid number between 1800 and ' + (new Date().getFullYear() + 5))
];

// Validation for movie ID in parameters (used by GET /:id, PUT /:id, DELETE /:id)
const movieIdValidation = [
    param('id')
        .isMongoId().withMessage('Invalid movie ID format') // Checks if it's a valid MongoDB ObjectId
];

// Middleware to handle validation results
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (errors.isEmpty()) {
        return next(); // If no errors, proceed to the next middleware/route handler
    }

    // If there are errors, format them and send a 400 response
    const extractedErrors = [];
    errors.array().map(err => extractedErrors.push({ [err.path]: err.msg }));

    return res.status(400).json({
        message: 'Validation failed',
        errors: extractedErrors
    });
};

module.exports = {
    createMovieValidation,
    updateMovieValidation,
    movieIdValidation,
    validate
};