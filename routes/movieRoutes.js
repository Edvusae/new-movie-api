// routes/movieRoutes.js

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
// --- Import the new authentication middleware ---
const authMiddleware = require('../middleware/authMiddleware');

// ... (rest of your movieRoutes.js)

// --- API Routes for Movies ---

// POST /movies: Create a new movie (requires authentication)
router.post('/', authMiddleware, createMovieValidation, validate, async (req, res, next) => { // Added authMiddleware
    try {
        console.log(`POST /movies requested by user ID: ${req.user.id}`); // Now you can access req.user
        const { title, director, year } = req.body;

        const newMovie = new Movie({ title, director, year });
        const savedMovie = await newMovie.save();
        res.status(201).json(savedMovie);

    } catch (error) {
        console.error('Error creating movie:', error);
        next(error);
    }
});

// GET /movies: Get all movies with optional search/filter/sort (public/no authentication needed here)
router.get('/', async (req, res, next) => {
    try {
        const { search, sort, order } = req.query;

        let filter = {};
        let sortOptions = {};

        if (search) {
            filter = {
                $or: [
                    { title: { $regex: search, $options: 'i' } },
                    { director: { $regex: search, $options: 'i' } }
                ]
            };
        }

        if (sort) {
            const sortDirection = (order && order.toLowerCase() === 'desc') ? -1 : 1;
            sortOptions[sort] = sortDirection;
        } else {
            sortOptions.title = 1;
        }

        const allMovies = await Movie.find(filter).sort(sortOptions);
        console.log(`GET /movies requested: Sending ${allMovies.length} movies (filtered by "${search || 'none'}", sorted by ${sort || 'title'} ${order || 'asc'}).`);
        res.json(allMovies);
    } catch (error) {
        console.error('Error fetching all movies:', error);
        next(error);
    }
});

// GET /movies/:id: Get a movie by ID (public/no authentication needed here)
router.get('/:id', movieIdValidation, validate, async (req, res, next) => {
    try {
        console.log(`GET /movies/${req.params.id} requested.`);
        const foundMovie = await Movie.findById(req.params.id);

        if (foundMovie) {
            res.json(foundMovie);
        } else {
            res.status(404).json({ message: 'Movie not found' });
        }
    } catch (error) {
        console.error('Error fetching movie by ID:', error);
        next(error);
    }
});

// PUT /movies/:id: Update an existing movie (requires authentication)
router.put('/:id', authMiddleware, movieIdValidation, updateMovieValidation, validate, async (req, res, next) => { // Added authMiddleware
    try {
        console.log(`PUT /movies/${req.params.id} requested by user ID: ${req.user.id}`); // Access req.user
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
});

// DELETE /movies/:id: Delete a movie by ID (requires authentication)
router.delete('/:id', authMiddleware, movieIdValidation, validate, async (req, res, next) => { // Added authMiddleware
    try {
        console.log(`DELETE /movies/${req.params.id} requested by user ID: ${req.user.id}`); // Access req.user
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
});

module.exports = router;