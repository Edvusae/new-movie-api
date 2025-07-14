// server.js
const express = require('express');
const mongoose = require('mongoose');
const app = express();
const port = 3000;

// MongoDB connection string (make sure credentials are correct and not exposed in production)
const MONGODB_URI = 'mongodb+srv://edwin:lMH142vD0BJ7pWR1@cluster0.rsn9cvd.mongodb.net/?retryWrites=true&w=majority';

app.use(express.json());
app.use(express.static('public')); // Serves your static HTML, CSS, JS files

// Define Movie Schema and Model
const movieSchema = new mongoose.Schema({
    title: { type: String, required: true },
    director: { type: String, required: true },
    year: { type: Number, required: true }
});
const Movie = mongoose.model('Movie', movieSchema);

// Establish MongoDB connection
mongoose.connect(MONGODB_URI)
    .then(() => {
        console.log('Connected to MongoDB!');
        app.listen(port, () => {
            console.log(`SERVER IS RUNNING: http://localhost:${port}`);
            console.log('Endpoints:');
            console.log(` - POST /movies: Create a new movie`);
            console.log(` - GET /movies: Get all movies`);
            console.log(` - GET /movies/:id: Get a movie by ID`);
            console.log(` - PUT /movies/:id: Update an existing movie`);
            console.log(` - DELETE /movies/:id: Delete a movie by ID`);
        });
    })
    .catch((error) => {
        console.error('Error connecting to MongoDB:', error);
        process.exit(1);
    });

// --- POST /movies route (Create a new movie) ---
app.post('/movies', async (req, res) => {
    try {
        console.log(`POST /movies requested.`);
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

        const newMovie = new Movie({ title, director, year });
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