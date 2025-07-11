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
app.post('/movies', async (req, res) => {
    // ... your POST route logic
});

app.get('/movies', async (req, res) => {
    // ... your GET ALL route logic
});

app.get('/movies/:id', async (req, res) => {
    // ... your GET BY ID route logic
});

// ... and so on for PUT and DELETE
*/

// --- REMOVE THIS EXTRA app.listen CALL ---
// app.listen(port, () => {
//   console.log(`Server running at http://localhost:${port}/`);
// });
// --- END REMOVE ---