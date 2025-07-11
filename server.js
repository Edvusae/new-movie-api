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

// Your API Routes (POST, GET, PUT, DELETE) will go here after the Mongoose model is defined
// and before the app.listen if it's placed outside the .then() block.
// However, in this corrected version, app.listen is inside .then(), so routes
// should logically follow the model definition.
/*
// (Rest of your server.js, including mongoose connection and Movie Schema/Model definitions)

app.post('/movies', async (req, res) => { // Made async - Correct!
    try {
        // Correction 1: Uncomment and ensure req.body destructuring is active
        const { title, director, year } = req.body;

        // Keep your validation - Correct!
        if (!title || !director || !year) {
            return res.status(400).send('Title, director, and year are required');
        }

        // Correction 2: Create a new instance of your Movie Model
        // The 'Movie' model was defined earlier (const Movie = mongoose.model(...))
        const newMovie = new Movie({
            title: title,
            director: director,
            year: year
        });

        // Correction 3: Await the saving of the new movie document to the database
        const savedMovie = await newMovie.save(); // This persists the movie!

        // Correction 4: Send a 201 Created status with the newly saved movie object as JSON
        res.status(201).json(savedMovie);

    } catch (error) {
        // Error handling - Correct!
        console.error('Error creating movie:', error); // More specific error message
        res.status(500).send('An error occurred while creating the movie'); // More specific message for client
    }
});

// (Rest of your server.js, including mongoose connection, Movie Schema/Model definitions, and the refactored POST route)

/* --- Corrected GET /movies route ---
app.get('/movies', async (req, res) => { // Made async - Correct!
    try {
        // Correction 1: Movie.find() should be called without arguments to get all movies.
        // It returns a query that needs to be awaited.
        const allMovies = await Movie.find(); // This will fetch ALL movie documents from MongoDB

        console.log(`GET /movies requested: Sending ${allMovies.length} movies.`); // Good logging, now accurate!

        // Correction 2: Send the fetched movies as JSON response
        res.json(allMovies); // Send the 'allMovies' array

    } catch (error) {
        // Error handling - Correct!
        console.error('Error fetching all movies:', error); // More specific error message
        res.status(500).send('An error occurred while fetching movies'); // More specific message for client
    }
});

// (Your existing GET /movies/:id, PUT, and DELETE routes are below this and will be refactored later)

// (Rest of your server.js, including mongoose connection, Movie Schema/Model definitions, and the refactored POST and GET /movies routes)

// --- Corrected GET /movies/:id route ---
app.get('/movies/:id', async (req, res) => {
    try {
        console.log(`GET /movies/${req.params.id} requested.`);

        // Correction 1: Use Movie.findById() to fetch the movie from MongoDB
        // Mongoose automatically handles parsing req.params.id as a MongoDB ObjectId
        const foundMovie = await Movie.findById(req.params.id);

        // Correction 2: Conditional response based on whether the movie was found
        if (foundMovie) { // If the movie was found
            res.json(foundMovie); // Send the movie object as JSON
        } else { // If no movie was found with that ID
            res.status(404).send('Movie not found'); // Send 404 Not Found status
        }

    } catch (error) {
        // Correction 3: Handle actual server/database errors
        // This catch block will trigger if, for example, the ID format is invalid
        console.error('Error fetching movie by ID:', error); // More specific error message
        res.status(500).send('An error occurred while fetching the movie'); // Send 500 Internal Server Error for actual errors
    }
});

// (Your existing PUT and DELETE routes are below this and will be refactored later)

// ... and so on for PUT and DELETE
*/

// --- REMOVE THIS EXTRA app.listen CALL ---
// app.listen(port, () => {
//   console.log(`Server running at http://localhost:${port}/`);
// });
// --- END REMOVE ---