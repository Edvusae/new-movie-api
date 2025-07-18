// routes/publicMovieRoutes.js

const express = require('express');
const router = express.Router();
const fetch = require('node-fetch'); // We'll need to install this

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500'; // Common size for posters

if (!TMDB_API_KEY) {
    console.error('FATAL ERROR: TMDB_API_KEY is not defined!');
    // In a real app, you might want to gracefully handle this rather than exit
    process.exit(1);
}

// GET /api/public/movies/latest (for a single latest movie or a few)
router.get('/latest', async (req, res, next) => {
    try {
        const response = await fetch(`${TMDB_BASE_URL}/movie/latest?api_key=${TMDB_API_KEY}`);
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`TMDB API error: ${response.status} - ${errorText}`);
        }
        const movie = await response.json();

        // Basic transformation to send only relevant data
        const transformedMovie = {
            id: movie.id,
            title: movie.title,
            overview: movie.overview,
            poster_path: movie.poster_path ? `${TMDB_IMAGE_BASE_URL}${movie.poster_path}` : null,
            backdrop_path: movie.backdrop_path ? `${TMDB_IMAGE_BASE_URL}${movie.backdrop_path}` : null,
            release_date: movie.release_date
        };

        res.json(transformedMovie);
    } catch (error) {
        console.error('Error fetching latest movie from TMDB:', error.message);
        next(error); // Pass to general error handler
    }
});

// GET /api/public/movies/trending (for a list of trending movies)
router.get('/trending', async (req, res, next) => {
    try {
        // You can specify time_window as 'day' or 'week'
        const response = await fetch(`${TMDB_BASE_URL}/trending/movie/week?api_key=${TMDB_API_KEY}`);
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`TMDB API error: ${response.status} - ${errorText}`);
        }
        const data = await response.json();
        const movies = data.results; // TMDB returns an array in 'results'

        // Map and transform to send only necessary data to frontend
        const transformedMovies = movies.map(movie => ({
            id: movie.id,
            title: movie.title,
            overview: movie.overview,
            poster_path: movie.poster_path ? `${TMDB_IMAGE_BASE_URL}${movie.poster_path}` : null,
            backdrop_path: movie.backdrop_path ? `${TMDB_IMAGE_BASE_URL}${movie.backdrop_path}` : null,
            release_date: movie.release_date,
            vote_average: movie.vote_average
        }));

        res.json(transformedMovies);
    } catch (error) {
        console.error('Error fetching trending movies from TMDB:', error.message);
        next(error);
    }
});

module.exports = router;