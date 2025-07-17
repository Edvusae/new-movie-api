// routes/authRoutes.js

const express = require('express');
const router = express.Router();
const User = require('../models/User'); // Import the User model
const { body, validationResult } = require('express-validator'); // For input validation

// --- User Registration Validation ---
const registerValidation = [
    body('username')
        .isLength({ min: 3 }).withMessage('Username must be at least 3 characters long')
        .trim()
        .escape(), // Sanitize input
    body('email')
        .isEmail().withMessage('Please enter a valid email address')
        .normalizeEmail(), // Standardize email format
    body('password')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
];

// --- Registration Route (POST /api/register) ---
router.post('/register', registerValidation, async (req, res, next) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // Return 400 Bad Request with validation errors
        return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password } = req.body;

    try {
        // Check if user already exists by username or email
        let user = await User.findOne({ $or: [{ username }, { email }] });
        if (user) {
            return res.status(400).json({ message: 'User with that username or email already exists.' });
        }

        // Create a new user instance (password will be hashed by the pre-save hook)
        user = new User({
            username,
            email,
            password,
            // role will default to 'user' as defined in the schema
        });

        await user.save(); // Save the new user to the database

        // For now, we'll just send a success message.
        // Later, we'll generate a JWT here.
        res.status(201).json({ message: 'User registered successfully!', userId: user._id });

    } catch (error) {
        console.error('Error during user registration:', error);
        next(error); // Pass the error to the centralized error handler
    }
});

module.exports = router;