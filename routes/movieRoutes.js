// routes/movieRoutes.js

const express = require('express');
const router = express.Router();
const Movie = require('../models/Movie');
const {
    createMovieValidation,
    updateMovieValidation,
    movieIdValidation,
    validate
} = require('../validation/movieValidation');
// --- Import both from your authMiddleware ---
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware'); // Updated import

// --- API Routes for Movies ---

// POST /movies: Create a new movie (requires authentication)
router.post(
    '/',
    authenticateToken, // Authenticate first
    authorizeRoles('admin', 'super_admin'), // Then check role
    createMovieValidation,
    validate,
    async (req, res, next) => {
        try {
            // console.log already logs user ID and now also the role
            console.log(`POST /movies requested by user: ${req.user.username} (ID: ${req.user.id}, Role: ${req.user.role})`);
            const { title, director, year } = req.body;

            const newMovie = new Movie({ title, director, year });
            const savedMovie = await newMovie.save();
            res.status(201).json(savedMovie);

        } catch (error) {
            console.error('Error creating movie:', error);
            next(error);
        }
    }
);

// GET /movies: Get all movies (public)
router.get('/', async (req, res, next) => {
    // ... (unchanged)
});

// GET /movies/:id: Get a movie by ID (public)
router.get('/:id', movieIdValidation, validate, async (req, res, next) => {
    // ... (unchanged)
});

// PUT /movies/:id: Update an existing movie (requires admin or super_admin role)
router.put(
    '/:id',
    authenticateToken, // Authenticate first
    authorizeRoles('admin', 'super_admin'), // Then check role
    movieIdValidation,
    updateMovieValidation,
    validate,
    async (req, res, next) => {
        try {
            console.log(`PUT /movies/${req.params.id} requested by user: ${req.user.username} (ID: ${req.user.id}, Role: ${req.user.role})`);
            const { title, director, year } = req.body;

            const updatedMovie = await Movie.findByIdAndUpdate(
                req.params.id,
                { title, director, year },
                { new: true, runValidators: true }
            );

            if (!updatedMovie) {
                res.status(404).json({ message: 'Movie not found' });
            } else {
                res.json(updatedMovie);
            }
        } catch (error) {
            console.error('Error updating movie:', error);
            next(error);
        }
    }
);

// DELETE /movies/:id: Delete a movie by ID (requires super_admin role)
router.delete(
    '/:id',
    authenticateToken, // Authenticate first
    authorizeRoles('super_admin'), // Then check role
    movieIdValidation,
    validate,
    async (req, res, next) => {
        try {
            console.log(`DELETE /movies/${req.params.id} requested by user: ${req.user.username} (ID: ${req.user.id}, Role: ${req.user.role})`);
            const deletedMovie = await Movie.findByIdAndDelete(req.params.id);

            if (!deletedMovie) {
                res.status(404).json({ message: 'Movie not found' });
            } else {
                res.status(200).json({ message: 'Movie deleted successfully', deletedMovie });
            }
        } catch (error) {
            console.error('Error deleting movie:', error);
            next(error);
        }
    }
);

module.exports = router;