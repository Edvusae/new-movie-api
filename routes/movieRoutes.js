// routes/movieRoutes.js
const express = require('express');
const router = express.Router();
const Movie = require('../models/Movie');
const auth = require('../middleware/authMiddleware'); // Corrected name
const { check, validationResult } = require('express-validator');

// ... (other existing routes) ...

// @route   POST /api/movies/add-from-public
// @desc    Add a movie (from public list) to a user's collection
// @access  Private (User must be logged in)
router.post(
    '/add-from-public',
    auth, // Your authentication middleware
    [ // <--- This array is crucial for express-validator middleware
        check('title', 'Title is required').not().isEmpty(),
        check('director', 'Director is required').not().isEmpty(),
        check('year', 'Year is required and must be a number').isNumeric()
    ],
    // This is the actual route handler function. It must be here.
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { title, director, year } = req.body;
        const userId = req.user.id; // User ID from the auth middleware

        try {
            // Check if the movie already exists for this user
            let movie = await Movie.findOne({ title, director, year, user: userId });

            if (movie) {
                return res.status(409).json({ message: 'Movie already in your collection.' });
            }

            // Create new movie
            movie = new Movie({
                title,
                director,
                year,
                user: userId // Associate the movie with the logged-in user
            });

            await movie.save();
            res.status(201).json({ message: 'Movie added to your collection!', movie });
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server error.');
        }
    }
);

module.exports = router;