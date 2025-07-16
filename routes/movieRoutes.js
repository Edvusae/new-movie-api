// routes/movieRoutes.js

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// --- Movie Schema and Model ---
const movieSchema = new mongoose.Schema({
    title: { type: String, required: true },
    director: { type: String, required: true },
    year: { type: Number, required: true }
});
const Movie = mongoose.model('Movie', movieSchema);

// --- API Routes for Movies ---

// POST /movies: Create a new movie
router.post('/', async (req, res) => {
    try {
        console.log(`POST /movies requested.`);
        const { title, director, year } = req.body;

        // Validation (same as frontend)
        if (
            !title ||
            !director ||
            typeof year !== 'number' ||
            isNaN(year) ||
            year < 1800 ||
            year > new Date().getFullYear() + 5
        ) {
            return res.status(400).json({ message: 'Title and director are required, year must be a valid number.' });
        }

        const newMovie = new Movie({ title, director, year });
        const savedMovie = await newMovie.save();
        res.status(201).json(savedMovie);

    } catch (error) {
        console.error('Error creating movie:', error);
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
router.get('/:id', async (req, res) => {
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
        res.status(500).json({ message: 'An internal server error occurred while fetching the movie' });
    }
});

// PUT /movies/:id: Update an existing movie
router.put('/:id', async (req, res) => {
    try {
        console.log(`PUT /movies/${req.params.id} requested.`);
        const { title, director, year } = req.body;

        // Validation (same as frontend)
        if (
            !title ||
            !director ||
            typeof year !== 'number' ||
            isNaN(year) ||
            year < 1800 ||
            year > new Date().getFullYear() + 5
        ) {
            return res.status(400).json({ message: 'Title and director are required, year must be a valid number.' });
        }

        const updatedMovie = await Movie.findByIdAndUpdate(
            req.params.id,
            { title, director, year },
            { new: true, runValidators: true }
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
router.delete('/:id', async (req, res) => {
    try {
        console.log(`DELETE /movies/${req.params.id} requested.`);
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