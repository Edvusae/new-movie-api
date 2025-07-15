// server.js

// Import necessary modules
require('dotenv').config(); // Load environment variables from .env file

const express = require('express');
const mongoose = require('mongoose');
const app = express();
const port = 3000; // You could even make this an env variable, e.g., process.env.PORT || 3000

// Now, get your MONGODB_URI from process.env
const MONGODB_URI = process.env.MONGODB_URI;

// Check if MONGODB_URI is loaded (good for debugging)
if (!MONGODB_URI) {
    console.error('Error: MONGODB_URI is not defined in your .env file or environment variables.');
    process.exit(1); // Exit the process if critical env variable is missing
}

app.use(express.json()); // Middleware to parse JSON bodies
app.use(express.static('public'));
// Define Movie Schema and Model
const movieSchema = new mongoose.Schema({ // Schema definition
    title: { type: String, required: true }, // Title of the movie
    director: { type: String, required: true }, //  Director of the movie
    year: { type: Number, required: true } // Year of release
});

// Create the Movie model using the schema
const Movie = mongoose.model('Movie', movieSchema); // Create the Movie model

// Establish MongoDB connection
mongoose.connect(MONGODB_URI) // Connect to MongoDB using the URI from environment variables
    .then(() => {
        console.log('Connected to MongoDB!');
        app.listen(port, () => {
            console.log(`SERVER IS RUNNING: http://localhost:${port}`);
            // ... (your existing endpoint logs)
        });
    })
    .catch((error) => {
        console.error('Error connecting to MongoDB:', error);
        process.exit(1);
    });

// --- POST /movies route (Create a new movie) ---
// This route handles the creation of a new movie

app.post('/movies', async (req, res) => {
    try {
        console.log(`POST /movies requested.`);
        const { title, director, year } = req.body; // Destructure the request body to get title, director, and year

        // Validation: match frontend
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

        const newMovie = new Movie({ title, director, year }); // Create a new movie instance using the Movie model
        const savedMovie = await newMovie.save();
        res.status(201).json(savedMovie);

    } catch (error) {
        console.error('Error creating movie:', error);
        res.status(500).json({ message: 'An error occurred while creating the movie' });
    }
});

// --- GET /movies route (Get all movies) ---
app.get('/movies', async (req, res) => {
    try {
        const allMovies = await Movie.find();
        console.log(`GET /movies requested: Sending ${allMovies.length} movies.`);
        res.json(allMovies);
    } catch (error) {
        console.error('Error fetching all movies:', error);
        res.status(500).json({ message: 'An error occurred while fetching movies' });
    }
});

// --- GET /movies/:id route (Get a movie by ID) ---
app.get('/movies/:id', async (req, res) => {
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
        res.status(500).json({ message: 'An error occurred while fetching the movie' });
    }
});

// --- PUT /movies/:id route (Update an existing movie) ---
app.put('/movies/:id', async (req, res) => {
    try {
        console.log(`PUT /movies/${req.params.id} requested.`);
        const { title, director, year } = req.body;

        // Validation: match frontend
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
        res.status(500).json({ message: 'An error occurred while updating the movie' });
    }
});

// --- DELETE /movies/:id route (Delete a movie by ID) ---
app.delete('/movies/:id', async (req, res) => {
    try {
        console.log(`DELETE /movies/${req.params.id} requested.`);
        const deletedMovie = await Movie.findByIdAndDelete(req.params.id);

        if (!deletedMovie) {
            return res.status(404).json({ message: 'Movie not found' });
        }

        res.json(deletedMovie);

    } catch (error) {
        console.error('Error deleting movie:', error);
        res.status(500).json({ message: 'An error occurred while deleting the movie' });
    }
});