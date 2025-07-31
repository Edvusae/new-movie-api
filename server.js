/// server.js

require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const app = express();
const port = process.env.PORT || 3000;

const logger = require('./middleware/logger');
const errorHandler = require('./middleware/errorHandler');
const movieRoutes = require('./routes/movieRoutes');
const authRoutes = require('./routes/authRoutes');

// --- Import your new publicMovieRoutes ---
const publicMovieRoutes = require('./routes/publicMovieRoutes'); // NEW IMPORT
// Ensure MONGODB_URI is defined in your .env file
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('Error: MONGODB_URI is not defined in your .env file or environment variables.');
    process.exit(1);
}

app.use(logger);
app.use(express.json());
app.use(express.static('public'));

app.use('/api/auth', authRoutes);
app.use('/movies', movieRoutes);
// --- Register your new public movie routes ---
app.use('/api/public/movies', publicMovieRoutes); // NEW ROUTE REGISTRATION

// Establish MongoDB connection
mongoose.connect(MONGODB_URI)
    .then(() => {
        console.log('Connected to MongoDB!');
        app.listen(port, () => {
            console.log(`SERVER IS RUNNING: http://localhost:${port}`);
            console.log('Endpoints:');
            console.log(` - GET /api/public/movies/latest: Get latest movie from TMDB (Public)`); // NEW
            console.log(` - GET /api/public/movies/trending: Get trending movies from TMDB (Public)`); // NEW
            console.log(` - POST /api/auth/register: Register a new user`);
            console.log(` - POST /api/auth/login: Login user and get JWT`);
            console.log(` - POST /movies: Create a new movie (Auth/Admin/SuperAdmin)`);
            console.log(` - GET /movies: Get all movies (Public, with search/sort)`);
            console.log(` - GET /movies/:id: Get a movie by ID (Public)`);
            console.log(` - PUT /movies/:id: Update an existing movie (Auth/Admin/SuperAdmin)`);
            console.log(` - DELETE /movies/:id: Delete a movie by ID (Auth/SuperAdmin)`);
        });
    })
    .catch((error) => {
        console.error('Error connecting to MongoDB:', error);
        process.exit(1);
    });

app.use(errorHandler);