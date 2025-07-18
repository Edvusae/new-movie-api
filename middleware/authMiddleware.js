// middleware/authMiddleware.js

const jwt = require('jsonwebtoken'); // Import jsonwebtoken

// Ensure JWT_SECRET is loaded from .env
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    console.error('FATAL ERROR: JWT_SECRET is not defined in authMiddleware.js!');
    process.exit(1); // Exit if essential secret is missing
}

const authMiddleware = (req, res, next) => {
    // 1. Get token from header
    // Bearer TOKEN_STRING_HERE
    const authHeader = req.header('Authorization');

    if (!authHeader) {
        return res.status(401).json({ message: 'No token, authorization denied.' });
    }

    const token = authHeader.split(' ')[1]; // Extract the token string after "Bearer"

    if (!token) {
        return res.status(401).json({ message: 'No token, authorization denied.' });
    }

    // 2. Verify token
    try {
        // Verify the token using the secret key
        const decoded = jwt.verify(token, JWT_SECRET);

        // Attach the decoded user payload to the request object
        // This makes user info (like user.id and user.role) available in subsequent route handlers
        req.user = decoded.user;
        next(); // Proceed to the next middleware/route handler

    } catch (error) {
        console.error('Token verification failed:', error.message);
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token has expired.' });
        }
        res.status(401).json({ message: 'Token is not valid.' });
    }
};

module.exports = authMiddleware;