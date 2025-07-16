// middleware/errorHandler.js

const errorHandler = (err, req, res, next) => {
    console.error(err.stack); // Log the error stack for debugging purposes

    let statusCode = res.statusCode === 200 ? 500 : res.statusCode; // If a status code was already set (e.g., 404), use it, otherwise default to 500
    let message = 'An unexpected internal server error occurred.';
    let errors = [];

    // Mongoose specific errors
    if (err.name === 'CastError') {
        statusCode = 400; // Bad Request
        message = 'Invalid ID format.';
    } else if (err.name === 'ValidationError') {
        statusCode = 400; // Bad Request
        message = 'Validation failed.';
        // Extract specific Mongoose validation messages
        errors = Object.values(err.errors).map(el => ({ [el.path]: el.message }));
    }

    // You can add more specific error types here (e.g., custom errors)

    res.status(statusCode).json({
        message: message,
        errors: errors.length > 0 ? errors : undefined // Only include 'errors' array if there are specific errors
    });
};

module.exports = errorHandler;