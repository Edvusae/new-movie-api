// routes/movieRoutes.js

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// routes/movieRoutes.js
const {
    createMovieValidation,
    updateMovieValidation,
    movieIdValidation,
    validate
} = require('C:\\Users\\HomePC\\Desktop\\new-movie-api\\validation\\movieValidation'); // Use your actual full path

const movieSchema = new mongoose.Schema({
    title: { type: String, required: true },
    director: { type: String, required: true },
    year: { type: Number, required: true }
});
const Movie = mongoose.model('Movie', movieSchema);


// --- API Routes for Movies ---

// POST /movies: Create a new movie
router.post('/', createMovieValidation, validate, async (req, res, next) => { // Add 'next' here
    try {
        console.log(`POST /movies requested.`);
        const { title, director, year } = req.body;

        const newMovie = new Movie({ title, director, year });
        const savedMovie = await newMovie.save();
        res.status(201).json(savedMovie);

    } catch (error) {
        console.error('Error creating movie:', error); // Keep logging for server-side visibility
        next(error); // Pass the error to the centralized error handler
    }
});

// GET /movies: Get all movies
router.get('/', async (req, res, next) => { // Add 'next' here
    try {
        const allMovies = await Movie.find();
        console.log(`GET /movies requested: Sending ${allMovies.length} movies.`);
        res.json(allMovies);
    } catch (error) {
        console.error('Error fetching all movies:', error);
        next(error); // Pass the error
    }
});

// GET /movies/:id: Get a movie by ID
router.get('/:id', movieIdValidation, validate, async (req, res, next) => { // Add 'next' here
    try {
        console.log(`GET /movies/${req.params.id} requested.`);
        const foundMovie = await Movie.findById(req.params.id);

        if (foundMovie) {
            res.json(foundMovie);
        } else {
            // It's a 404, not an error to be handled by error middleware.
            // Just send the 404 directly as it's an expected outcome.
            res.status(404).json({ message: 'Movie not found' });
        }
    } catch (error) {
        console.error('Error fetching movie by ID:', error);
        next(error); // Pass the error (e.g., if it's a DB connection error)
    }
});

// PUT /movies/:id: Update an existing movie
router.put('/:id', movieIdValidation, updateMovieValidation, validate, async (req, res, next) => { // Add 'next' here
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
        next(error); // Pass the error
    }
});

// DELETE /movies/:id: Delete a movie by ID
router.delete('/:id', movieIdValidation, validate, async (req, res, next) => { // Add 'next' here
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
        next(error); // Pass the error
    }
});

module.exports = router;