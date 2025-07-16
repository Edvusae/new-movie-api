// routes/movieRoutes.js

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Import your validation rules and the validation middleware
const {
    createMovieValidation,
    updateMovieValidation,
    movieIdValidation,
    validate
} = require('../validation/movieValidation'); // Adjust path as needed

const movieSchema = new mongoose.Schema({
    title: { type: String, required: true },
    director: { type: String, required: true },
    year: { type: Number, required: true }
});
const Movie = mongoose.model('Movie', movieSchema);


// --- API Routes for Movies ---

// POST /movies: Create a new movie
router.post('/', createMovieValidation, validate, async (req, res) => {
    try {
        console.log(`POST /movies requested.`);
        // Data is already validated by createMovieValidation and validate middleware
        const { title, director, year } = req.body;

        const newMovie = new Movie({ title, director, year });
        const savedMovie = await newMovie.save(); // Mongoose will still do final validation
        res.status(201).json(savedMovie);

    } catch (error) {
        console.error('Error creating movie:', error);
        // This catch block will now mostly catch database-related errors (e.g., connection issues)
        // or unexpected Mongoose errors, as basic validation is handled earlier.
        res.status(500).json({ message: 'An internal server error occurred while creating the movie' });
    }
});

// GET /movies: Get all movies
router.get('/', async (req, res) => {
    try {
        const allMovies = await Movie.find();
        console.log(`GET /movies requested: Sending ${allMovies.length} movies.`);
        res.json(allMovies);
    } catch (error) {
        console.error('Error fetching all movies:', error);
        res.status(500).json({ message: 'An internal server error occurred while fetching movies' });
    }
});

// GET /movies/:id: Get a movie by ID
router.get('/:id', movieIdValidation, validate, async (req, res) => {
    try {
        console.log(`GET /movies/${req.params.id} requested.`);
        // ID is already validated by movieIdValidation and validate middleware
        const foundMovie = await Movie.findById(req.params.id);

        if (foundMovie) {
            res.json(foundMovie);
        } else {
            res.status(404).json({ message: 'Movie not found' });
        }
    } catch (error) {
        console.error('Error fetching movie by ID:', error);
        // This catch block will now only catch very unexpected errors,
        // as CastError is now handled by express-validator.
        res.status(500).json({ message: 'An internal server error occurred while fetching the movie' });
    }
});

// PUT /movies/:id: Update an existing movie
router.put('/:id', movieIdValidation, updateMovieValidation, validate, async (req, res) => {
    try {
        console.log(`PUT /movies/${req.params.id} requested.`);
        // ID and body data are already validated
        const { title, director, year } = req.body;

        const updatedMovie = await Movie.findByIdAndUpdate(
            req.params.id,
            { title, director, year },
            { new: true, runValidators: true } // runValidators true still good for edge cases/schema-specific rules
        );

        if (!updatedMovie) {
            return res.status(404).json({ message: 'Movie not found' });
        }

        res.json(updatedMovie);
    } catch (error) {
        console.error('Error updating movie:', error);
        res.status(500).json({ message: 'An internal server error occurred while updating the movie' });
    }
});

// DELETE /movies/:id: Delete a movie by ID
router.delete('/:id', movieIdValidation, validate, async (req, res) => {
    try {
        console.log(`DELETE /movies/${req.params.id} requested.`);
        // ID is already validated
        const deletedMovie = await Movie.findByIdAndDelete(req.params.id);

        if (!deletedMovie) {
            return res.status(404).json({ message: 'Movie not found' });
        }

        res.status(200).json({ message: 'Movie deleted successfully', deletedMovie });

    } catch (error) {
        console.error('Error deleting movie:', error);
        res.status(500).json({ message: 'An internal server error occurred while deleting the movie' });
    }
});

module.exports = router;