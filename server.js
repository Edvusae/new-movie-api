// server.js (Simplified view, assuming other parts are already correct)

require('dotenv').config(); // Make sure this is at the very top

const express = require('express');
const mongoose = require('mongoose');
const app = express();
const port = process.env.PORT || 3000; // Good practice: use PORT from .env or default to 3000

// --- This is the key change in server.js: Import your movie routes ---
const movieRoutes = require('./routes/movieRoutes'); // Correct path to your new routes file

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('Error: MONGODB_URI is not defined in your .env file or environment variables.');
    process.exit(1);
}

app.use(express.json());
app.use(express.static('public'));

// --- Crucial Step: Tell Express to use your movie routes for the /movies base path ---
app.use('/movies', movieRoutes); // All requests starting with /movies will be handled by movieRoutes

// IMPORTANT: Ensure your Movie Schema and Model definition is removed from server.js
// if it's now defined exclusively in movieRoutes.js, to avoid re-declaration errors.
// If you still need the Movie model directly in server.js for some reason,
// you would typically define it in a separate 'models' folder and import it into both server.js and movieRoutes.js.
// For simplicity in this case, defining it in movieRoutes.js and removing it from server.js is fine.


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

// All your API route handlers should now be gone from server.js