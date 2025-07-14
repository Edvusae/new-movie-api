// server.js
const express = require('express');
const mongoose = require('mongoose');
const app = express();
const port = 3000;

// Correct the MONGODB_URI
// 1. Remove the 'YOUR_FULL_MONGO_DB_ATLAS_CONNECTION_HERE' prefix.
// 2. Ensure you replace '<db_password>' with your actual password.
const MONGODB_URI = 'mongodb+srv://edwin:lMH142vD0BJ7pWR1@cluster0.rsn9cvd.mongodb.net/?retryWrites=true&w=majority'; // Added full query string

app.use(express.json());
app.use(express.static('public')); // Serves your static HTML, CSS, JS files

// Define Movie Schema and Model BEFORE connecting to the database
// This ensures the Movie model is available once the connection is established.
const movieSchema = new mongoose.Schema({
    title: { type: String, required: true },
    director: { type: String, required: true },
    year: { type: Number, required: true }
});
const Movie = mongoose.model('Movie', movieSchema);

// Establish MongoDB connection
// It's important to connect to the database before defining routes that use the Movie model.
mongoose.connect(MONGODB_URI)
    .then(() => {
        console.log('Connected to MongoDB!');
        // Start the Express server ONLY after a successful database connection
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
        // It's good practice to exit the process if the database connection fails
        process.exit(1);
    });

// --- POST /movies route (Create a new movie) ---

app.post('/movies', async (req, res) => {
    try {
        console.log(`POST /movies requested.`);
        const { title, director, year } = req.body;

        if (!title || !director || !year) {
            return res.status(400).send('Title, director, and year are required');
        }

        const newMovie = new Movie({
            title: title,
            director: director,
            year: year
        });

        const savedMovie = await newMovie.save();
        res.status(201).json(savedMovie);

    } catch (error) {
        console.error('Error creating movie:', error);
        res.status(500).send('An error occurred while creating the movie');
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
        res.status(500).send('An error occurred while fetching movies');
    }
});

// --- GET /movies/:id route (Get a movie by ID) ---
// This route allows you to fetch a specific movie by its ID.

app.get('/movies/:id', async (req, res) => {
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

// --- PUT /movies/:id route (Update an existing movie) ---
// This route allows you to update an existing movie by its ID.

app.put('/movies/:id', async (req, res) => {
    try {
        console.log(`PUT /movies/${req.params.id} requested.`);
        const { title, director, year } = req.body; // Destructure the request body

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

// This route allows you to delete a movie by its ID.
// It uses the DELETE HTTP method to remove a movie from the database.

app.delete('/movies/:id', async (req, res) => {
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