// public/script.js

// 1. Get a reference to the container where movies will be displayed
const moviesContainer = document.getElementById('movies-container');
const movieForm = document.getElementById('movie-form'); // We'll use this later for adding movies

// Function to fetch and display movies
async function fetchAndDisplayMovies() {
    // Clear any previous content (like "Loading movies...")
    moviesContainer.innerHTML = '';

    try {
        // Make a GET request to your backend API
        const response = await fetch('http://localhost:3000/movies');

        // Check if the request was successful
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Parse the JSON response
        const movies = await response.json();

        // If no movies are found, display a message
        if (movies.length === 0) {
            moviesContainer.innerHTML = '<p>No movies found. Add some using the form above!</p>';
            return; // Exit the function
        }

        // Iterate over each movie and create a card for it
        movies.forEach(movie => {
            const movieCard = document.createElement('div');
            movieCard.classList.add('movie-card'); // Use the CSS class we defined

            movieCard.innerHTML = `
                <h3>${movie.title}</h3>
                <p><strong>Director:</strong> ${movie.director}</p>
                <p><strong>Year:</strong> ${movie.year}</p>
                <p><small>ID: ${movie._id}</small></p>
                `;
            moviesContainer.appendChild(movieCard); // Add the card to the container
        });

    } catch (error) {
        console.error('Error fetching movies:', error);
        moviesContainer.innerHTML = '<p style="color: red;">Failed to load movies. Please check the server.</p>';
    }
}

// Call the function to fetch and display movies when the page first loads
fetchAndDisplayMovies();

// (We'll add event listeners for the form and other actions in the next steps)