// routes/authRoutes.js

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken'); // Import jsonwebtoken
const bcrypt = require('bcryptjs'); // Re-import bcryptjs for password comparison

// Ensure you have JWT_SECRET in your .env file!
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    console.error('FATAL ERROR: JWT_SECRET is not defined!');
    process.exit(1); // Exit if essential secret is missing
}

// --- User Registration Validation (existing) ---
const registerValidation = [
    body('username')
        .isLength({ min: 3 }).withMessage('Username must be at least 3 characters long')
        .trim()
        .escape(),
    body('email')
        .isEmail().withMessage('Please enter a valid email address')
        .normalizeEmail(),
    body('password')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
];

// --- User Login Validation (New) ---
const loginValidation = [
    body('email').isEmail().withMessage('Please enter a valid email address').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required')
];

// --- Registration Route (POST /api/auth/register) (existing) ---
router.post('/register', registerValidation, async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password } = req.body;

    try {
        let user = await User.findOne({ $or: [{ username }, { email }] });
        if (user) {
            return res.status(400).json({ message: 'User with that username or email already exists.' });
        }

        user = new User({ username, email, password });
        await user.save();

        res.status(201).json({ message: 'User registered successfully!', userId: user._id });

    } catch (error) {
        console.error('Error during user registration:', error);
        next(error);
    }
});

// --- Login Route (POST /api/auth/login) (New) ---
router.post('/login', loginValidation, async (req, res, next) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
        // 1. Check if user exists by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials.' });
        }

        // 2. Compare provided password with hashed password in DB
        const isMatch = await user.comparePassword(password); // Using the custom method on the User model
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials.' });
        }

        // 3. Generate JWT if credentials are valid
        // Payload for the JWT: Include user ID and role
        const payload = {
            user: {
                id: user.id, // Mongoose creates an 'id' virtual getter for _id
                role: user.role // Include the user's role here for authorization checks
            }
        };

        // Sign the token
        // expiresIn: '1h' means the token will expire in 1 hour
        jwt.sign(
            payload,
            JWT_SECRET, // Your secret key from .env
            { expiresIn: '1h' },
            (err, token) => {
                if (err) throw err; // Pass error to catch block
                res.json({ token, message: 'Logged in successfully!' }); // Send the token back to the client
            }
        );

    } catch (error) {
        console.error('Error during user login:', error);
        next(error); // Pass the error to the centralized error handler
    }
});

module.exports = router;