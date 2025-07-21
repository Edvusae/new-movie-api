// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

// Ensure JWT_SECRET is loaded from .env
// It's good practice to load dotenv in server.js, but if this file
// is ever run standalone or needs it, you can uncomment this:
// require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;

// Middleware function
module.exports = (req, res, next) => {
    // Get token from header
    const token = req.header('x-auth-token') || req.header('Authorization')?.replace('Bearer ', '');

    // Check if not token
    if (!token) {
        return res.status(401).json({ message: 'No token, authorization denied.' });
    }

    // Verify token
    try {
        if (!JWT_SECRET) {
            console.error('JWT_SECRET is not defined!');
            return res.status(500).json({ message: 'Server configuration error: JWT secret missing.' });
        }

        const decoded = jwt.verify(token, JWT_SECRET); // Verify the token using your secret

        // Attach user from token payload to the request object
        req.user = decoded.user; // Assuming your JWT payload has a 'user' object/ID
        next(); // Call next middleware/route handler
    } catch (err) {
        console.error('Token verification failed:', err.message);
        res.status(401).json({ message: 'Token is not valid.' });
    }
};