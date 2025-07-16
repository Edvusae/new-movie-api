// routes/movieRoutes.js

// routes/movieRoutes.js

const express = require('express');
// Create a new router object
const router = express.Router(); // Create a new router object
// Import your Movie model
// You also need access to your Movie model here
const mongoose = require('mongoose'); // Import mongoose if you haven't already
// Define Movie Schema and Model (copy these from server.js if not already separate)
// Note: In a larger app, you might put models in their own 'models' directory
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

        // Frontend handles basic validation, but backend should always re-validate
        if (!title || !director || !year) {
            return res.status(400).json({ message: 'Title, director, and year are required' });
        }

        const newMovie = new Movie({ title, director, year });
        const savedMovie = await newMovie.save();
        res.status(201).json(savedMovie);

    } catch (error) {
        console.error('Error creating movie:', error);
        // Check for Mongoose validation errors
        if (error.name === 'ValidationError') {
            // Extract specific error messages from Mongoose validation error
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ message: 'Validation failed', errors: messages });
        }
        res.status(500).json({ message: 'An error occurred while creating the movie' });
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
        res.status(500).json({ message: 'An error occurred while fetching movies' });
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
        // Check for Mongoose CastError (invalid ID format)
        if (error.name === 'CastError') {
            return res.status(400).json({ message: 'Invalid movie ID format' });
        }
        res.status(500).json({ message: 'An error occurred while fetching the movie' });
    }
});

// PUT /movies/:id: Update an existing movie
router.put('/:id', async (req, res) => {
    try {
        console.log(`PUT /movies/${req.params.id} requested.`);
        const { title, director, year } = req.body;

        // Frontend handles basic validation, but backend should always re-validate
        if (!title || !director || !year) {
            return res.status(400).json({ message: 'Title, director, and year are required' });
        }

        // Add runValidators: true to ensure schema validations run on update
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
        if (error.name === 'CastError') {
            return res.status(400).json({ message: 'Invalid movie ID format' });
        }
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ message: 'Validation failed', errors: messages });
        }
        res.status(500).json({ message: 'An error occurred while updating the movie' });
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

        res.status(200).json({ message: 'Movie deleted successfully', deletedMovie }); // Send success message and deleted movie

    } catch (error) {
        console.error('Error deleting movie:', error);
        if (error.name === 'CastError') {
            return res.status(400).json({ message: 'Invalid movie ID format' });
        }
        res.status(500).json({ message: 'An error occurred while deleting the movie' });
    }
});

module.exports = router;