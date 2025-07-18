// middleware/logger.js

const logger = (req, res, next) => {
    const timestamp = new Date().toISOString();
    const method = req.method;
    const url = req.originalUrl; // or req.url
    const ip = req.ip || req.connection.remoteAddress; // Get client IP

    // Log the request details
    console.log(`[${timestamp}] ${ip} ${method} ${url}`);

    // If there's a request body (for POST/PUT requests), log it too (be careful with sensitive data)
    // Check if req.body exists and is an object before trying to get its keys
    if (req.body && typeof req.body === 'object' && Object.keys(req.body).length > 0) {
        console.log('  Body:', req.body);
    }

    // Pass control to the next middleware or route handler
    next();
};

module.exports = logger;