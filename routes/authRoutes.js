// routes/authRoutes.js

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    console.error('FATAL ERROR: JWT_SECRET is not defined!');
    process.exit(1);
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

// --- User Login Validation (existing) ---
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

// --- Login Route (POST /api/auth/login) (Refactored to include username in payload) ---
router.post('/login', loginValidation, async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials.' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials.' });
        }

        const payload = {
            user: {
                id: user.id,
                username: user.username, // <-- ADDED THIS LINE
                role: user.role
            }
        };

        jwt.sign(
            payload,
            JWT_SECRET,
            { expiresIn: '1h' },
            (err, token) => {
                if (err) throw err;
                res.json({ token, message: 'Logged in successfully!' });
            }
        );

    } catch (error) {
        console.error('Error during user login:', error);
        next(error);
    }
});

module.exports = router;