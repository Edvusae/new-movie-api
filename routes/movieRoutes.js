// routes/movieRoutes.js
const express = require('express');
const router = express.Router();
const Movie = require('../models/Movie');
const auth = require('../middleware/authMiddleware');
const { check, validationResult } = require('express-validator');

// @route   GET /movies
// @desc    Get all movies for the logged-in user (with search & sort)
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        const { search, sort, order } = req.query;
        const userId = req.user.id;

        // Build query
        let query = { user: userId };

        // Add search filter if provided
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { director: { $regex: search, $options: 'i' } }
            ];
        }

        // Build sort options
        let sortOptions = {};
        if (sort) {
            sortOptions[sort] = order === 'desc' ? -1 : 1;
        } else {
            sortOptions.dateAdded = -1; // Default: newest first
        }

        // Execute query
        const movies = await Movie.find(query).sort(sortOptions);

        res.json(movies);
    } catch (err) {
        console.error('Error fetching movies:', err.message);
        res.status(500).json({ message: 'Server error while fetching movies.' });
    }
});

// @route   GET /movies/:id
// @desc    Get a single movie by ID
// @access  Public (or Private if you want)
router.get('/:id', async (req, res) => {
    try {
        const movie = await Movie.findById(req.params.id);

        if (!movie) {
            return res.status(404).json({ message: 'Movie not found.' });
        }

        res.json(movie);
    } catch (err) {
        console.error('Error fetching movie by ID:', err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Movie not found.' });
        }
        res.status(500).json({ message: 'Server error.' });
    }
});

// @route   POST /movies
// @desc    Create a new movie (Admin/SuperAdmin only)
// @access  Private
router.post(
    '/',
    auth,
    [
        check('title', 'Title is required').not().isEmpty(),
        check('director', 'Director is required').not().isEmpty(),
        check('year', 'Year must be a valid number').isNumeric()
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { title, director, year } = req.body;
        const userRole = req.user.role;

        // Check if user has permission (admin or super_admin)
        if (userRole !== 'admin' && userRole !== 'super_admin') {
            return res.status(403).json({ message: 'Access denied. Only admins can create movies.' });
        }

        try {
            const newMovie = new Movie({
                title,
                director,
                year,
                user: req.user.id
            });

            const movie = await newMovie.save();
            res.status(201).json(movie);
        } catch (err) {
            console.error('Error creating movie:', err.message);
            res.status(500).json({ message: 'Server error while creating movie.' });
        }
    }
);

// @route   PUT /movies/:id
// @desc    Update a movie (Admin/SuperAdmin only)
// @access  Private
router.put(
    '/:id',
    auth,
    [
        check('title', 'Title is required').optional().not().isEmpty(),
        check('director', 'Director is required').optional().not().isEmpty(),
        check('year', 'Year must be a valid number').optional().isNumeric()
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const userRole = req.user.role;

        // Check if user has permission
        if (userRole !== 'admin' && userRole !== 'super_admin') {
            return res.status(403).json({ message: 'Access denied. Only admins can update movies.' });
        }

        const { title, director, year } = req.body;

        try {
            let movie = await Movie.findById(req.params.id);

            if (!movie) {
                return res.status(404).json({ message: 'Movie not found.' });
            }

            // Update fields
            if (title) movie.title = title;
            if (director) movie.director = director;
            if (year) movie.year = year;

            await movie.save();
            res.json(movie);
        } catch (err) {
            console.error('Error updating movie:', err.message);
            if (err.kind === 'ObjectId') {
                return res.status(404).json({ message: 'Movie not found.' });
            }
            res.status(500).json({ message: 'Server error while updating movie.' });
        }
    }
);

// @route   DELETE /movies/:id
// @desc    Delete a movie (SuperAdmin only)
// @access  Private
router.delete('/:id', auth, async (req, res) => {
    const userRole = req.user.role;

    // Check if user is super_admin
    if (userRole !== 'super_admin') {
        return res.status(403).json({ message: 'Access denied. Only super admins can delete movies.' });
    }

    try {
        const movie = await Movie.findById(req.params.id);

        if (!movie) {
            return res.status(404).json({ message: 'Movie not found.' });
        }

        await Movie.findByIdAndDelete(req.params.id);
        res.json({ message: 'Movie removed successfully.' });
    } catch (err) {
        console.error('Error deleting movie:', err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Movie not found.' });
        }
        res.status(500).json({ message: 'Server error while deleting movie.' });
    }
});

// @route   POST /movies/add-from-public
// @desc    Add a movie (from public TMDB list) to user's collection
// @access  Private
router.post(
    '/add-from-public',
    auth,
    [
        check('title', 'Title is required').not().isEmpty(),
        check('director', 'Director is required').not().isEmpty(),
        check('year', 'Year is required and must be a number').isNumeric()
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { title, director, year } = req.body;
        const userId = req.user.id;

        try {
            // Check if movie already exists in user's collection
            let movie = await Movie.findOne({ title, director, year, user: userId });

            if (movie) {
                return res.status(409).json({ message: 'Movie already in your collection.' });
            }

            // Create new movie
            movie = new Movie({
                title,
                director,
                year,
                user: userId
            });

            await movie.save();
            res.status(201).json({ message: 'Movie added to your collection!', movie });
        } catch (err) {
            console.error('Error adding movie from public:', err.message);
            res.status(500).json({ message: 'Server error.' });
        }
    }
);

module.exports = router;