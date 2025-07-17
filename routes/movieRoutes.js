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

// --- API Routes for Movies ---

// POST /movies: Create a new movie
router.post('/', createMovieValidation, validate, async (req, res, next) => {
    try {
        console.log(`POST /movies requested.`);
        const { title, director, year } = req.body; // Destructure the request body

        const newMovie = new Movie({ title, director, year }); // Create a new Movie instance
        const savedMovie = await newMovie.save(); // Save the movie to the database
        res.status(201).json(savedMovie); // Respond with the created movie

    } catch (error) {
        console.error('Error creating movie:', error);
        next(error);
    }
});

// GET /movies: Get all movies with optional search/filter/sort
router.get('/', async (req, res, next) => {
    try {
        const { search, sort, order } = req.query; // Extract search, sort, and order parameters

        let filter = {}; // Initialize an empty filter object
        let sortOptions = {}; // Initialize an empty sort options object

        // Build the filter based on 'search'
        if (search) {
            filter = {
                $or: [
                    { title: { $regex: search, $options: 'i' } },
                    { director: { $regex: search, $options: 'i' } }
                ]
            };
        }

        // Build the sort options based on 'sort' and 'order'
        if (sort) {
            // Determine sort direction: 1 for ascending (default), -1 for descending
            const sortDirection = (order && order.toLowerCase() === 'desc') ? -1 : 1;
            // Set the sort field and direction
            sortOptions[sort] = sortDirection;
        } else {
            // Default sort if no sort parameter is provided (e.g., by title ascending)
            sortOptions.title = 1; // You can change this default as desired
        }

        const allMovies = await Movie.find(filter).sort(sortOptions); // Apply filter AND sort options
        console.log(`GET /movies requested: Sending ${allMovies.length} movies (filtered by "${search || 'none'}", sorted by ${sort || 'title'} ${order || 'asc'}).`);
        res.json(allMovies);
    } catch (error) {
        console.error('Error fetching all movies:', error);
        next(error);
    }
});

// GET /movies/:id: Get a movie by ID
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

// PUT /movies/:id: Update an existing movie
router.put('/:id', movieIdValidation, updateMovieValidation, validate, async (req, res, next) => {
    try {
        console.log(`PUT /movies/${req.params.id} requested.`);
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

// DELETE /movies/:id: Delete a movie by ID
router.delete('/:id', movieIdValidation, validate, async (req, res, next) => {
    try {
        console.log(`DELETE /movies/${req.params.id} requested.`);
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