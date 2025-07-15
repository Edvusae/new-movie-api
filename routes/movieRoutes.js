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
router.post('/', async (req, res) => { // Changed app.post to router.post, and '/movies' to '/'
    try {
        console.log(`POST /movies requested.`);
        const { title, director, year } = req.body;

        if (!title || !director || !year) {
            return res.status(400).send('Title, director, and year are required');
        }

        const newMovie = new Movie({ title, director, year });
        const savedMovie = await newMovie.save();
        res.status(201).json(savedMovie);

    } catch (error) {
        console.error('Error creating movie:', error);
        res.status(500).send('An error occurred while creating the movie');
    }
});

// GET /movies: Get all movies
router.get('/', async (req, res) => { // Changed app.get to router.get, and '/movies' to '/'
    try {
        const allMovies = await Movie.find();
        console.log(`GET /movies requested: Sending ${allMovies.length} movies.`);
        res.json(allMovies);
    } catch (error) {
        console.error('Error fetching all movies:', error);
        res.status(500).send('An error occurred while fetching movies');
    }
});

// GET /movies/:id: Get a movie by ID
router.get('/:id', async (req, res) => { // Changed app.get to router.get, and '/movies/:id' to '/:id'
    try {
        console.log(`GET /movies/${req.params.id} requested.`);
        const foundMovie = await Movie.findById(req.params.id);

        if (foundMovie) {
            res.json(foundMovie);
        } else {
            res.status(404).send('Movie not found');
        }
    } catch (error) {
        console.error('Error fetching movie by ID:', error);
        res.status(500).send('An error occurred while fetching the movie');
    }
});

// PUT /movies/:id: Update an existing movie
router.put('/:id', async (req, res) => { // Changed app.put to router.put, and '/movies/:id' to '/:id'
    try {
        console.log(`PUT /movies/${req.params.id} requested.`);
        const { title, director, year } = req.body;

        if (!title || !director || !year) {
            return res.status(400).send('Title, director, and year are required');
        }

        const updatedMovie = await Movie.findByIdAndUpdate(
            req.params.id,
            { title, director, year },
            { new: true, runValidators: true }
        );

        if (!updatedMovie) {
            return res.status(404).send('Movie not found');
        }

        res.json(updatedMovie);
    } catch (error) {
        console.error('Error updating movie:', error);
        res.status(500).send('An error occurred while updating the movie');
    }
});

// DELETE /movies/:id: Delete a movie by ID
router.delete('/:id', async (req, res) => { // Changed app.delete to router.delete, and '/movies/:id' to '/:id'
    try {
        console.log(`DELETE /movies/${req.params.id} requested.`);
        const deletedMovie = await Movie.findByIdAndDelete(req.params.id);

        if (!deletedMovie) {
            return res.status(404).send('Movie not found');
        }

        res.json(deletedMovie);

    } catch (error) {
        console.error('Error deleting movie:', error);
        res.status(500).send('An error occurred while deleting the movie');
    }
});

// Export the router to be used in server.js
module.exports = router;