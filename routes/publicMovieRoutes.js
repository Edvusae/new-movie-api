// routes/publicMovieRoutes.js
const express = require('express');
const router = express.Router();

// It's good practice to ensure dotenv is loaded if you access process.env
// directly in this file, though server.js loading it often suffices.
// require('dotenv').config(); // Uncomment if you face issues with TMDB_API_KEY being undefined here

const TMDB_API_KEY = process.env.TMDB_API_KEY; // <<< This is where the key is read
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

// Middleware to check for the TMDB API key before any route is hit
router.use((req, res, next) => {
    if (!TMDB_API_KEY) {
        console.error('SERVER ERROR: TMDB_API_KEY is not set in environment variables!');
        // Return a 500 error if the key is missing on the server side
        return res.status(500).json({ message: 'Server configuration error: TMDB API key is missing. Please check your .env file.' });
    }
    next(); // Proceed to the next middleware or route handler
});

// GET /api/public/movies/trending: Get trending movies from TMDB
router.get('/trending', async (req, res) => {
    try {
        const url = `${TMDB_BASE_URL}/trending/movie/week?api_key=${TMDB_API_KEY}`;
        console.log(`Backend fetching from: ${url}`); // <-- IMPORTANT: Check this URL in your server console!

        const response = await fetch(url);

        if (!response.ok) { // Check for non-2xx responses
            const errorBody = await response.text(); // Get the raw error response
            console.error(`TMDB API Error Response (Status ${response.status}): ${errorBody}`);
            // Respond to frontend with specific error
            return res.status(response.status).json({
                message: `Failed to fetch trending movies: TMDB returned status ${response.status}. Details: ${errorBody}`
            });
        }

        const data = await response.json();
        res.json(data.results); // TMDB trending always has a 'results' array

    } catch (error) {
        console.error('SERVER-SIDE NETWORK ERROR or unexpected issue:', error);
        res.status(500).json({ message: 'An unexpected server error occurred while contacting TMDB.' });
    }
});

// GET /api/public/movies/latest (Example, if you have this endpoint)
// Note: TMDB's /movie/latest endpoint usually returns a single movie, not a list.
router.get('/latest', async (req, res) => {
    try {
        const url = `${TMDB_BASE_URL}/movie/latest?api_key=${TMDB_API_KEY}`;
        console.log(`Attempting to fetch latest movie from: ${url}`);

        const response = await fetch(url);

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Error response from TMDB (Status: ${response.status}): ${errorText}`);
            return res.status(response.status).json({ message: `Failed to fetch latest movie: TMDB API returned an error (${response.status})` });
        }

        const data = await response.json();
        res.json(data); // Returns the movie object directly

    } catch (error) {
        console.error('Network or unexpected error fetching latest movie:', error.message);
        res.status(500).json({ message: 'Failed to fetch latest movie: An unexpected internal server error occurred.' });
    }
});


module.exports = router;