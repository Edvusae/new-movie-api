// middleware/authMiddleware.js

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    console.error('FATAL ERROR: JWT_SECRET is not defined in authMiddleware.js!');
    process.exit(1);
}

// Authentication Middleware (existing)
const authenticateToken = (req, res, next) => { // Renamed for clarity
    const authHeader = req.header('Authorization');

    if (!authHeader) {
        return res.status(401).json({ message: 'No token, authorization denied.' });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'No token, authorization denied.' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded.user; // Contains { id: ..., role: ... }
        next();

    } catch (error) {
        console.error('Token verification failed:', error.message);
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token has expired.' });
        }
        res.status(401).json({ message: 'Token is not valid.' });
    }
};

// --- New: Authorization Middleware Factory ---
// This function returns a middleware that checks if the user has one of the allowed roles
const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        // If the authentication middleware hasn't run, or req.user is not set
        if (!req.user || !req.user.role) {
            return res.status(403).json({ message: 'Access denied: User role not found.' });
        }

        // Check if the user's role is included in the allowedRoles array
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Access denied: Insufficient permissions.' });
        }

        // If the user has an allowed role, proceed
        next();
    };
};

module.exports = { authenticateToken, authorizeRoles }; // Export both