// public/script.js

const API_BASE = 'http://localhost:3000'; // Make sure this matches your backend port

const movieForm = document.getElementById('movieForm');
const movieIdInput = document.getElementById('movieId');
const titleInput = document.getElementById('title');
const directorInput = document.getElementById('director');
const yearInput = document.getElementById('year');
const submitButton = document.getElementById('submitButton');
const movieListDiv = document.getElementById('movieList');

// --- New Search Elements ---
const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');
const clearSearchButton = document.getElementById('clearSearchButton');

// --- 1. Function to Fetch and Display Movies (GET) ---
async function fetchAndDisplayMovies() {
    try {
        const searchTerm = searchInput.value; // Get the current value from the search input

        let url = `${API_BASE}/movies`;
        if (searchTerm) {
            // Add the search query parameter if searchTerm is not empty
            url += `?search=${encodeURIComponent(searchTerm)}`;
        }

        const response = await fetch(url);
        if (!response.ok) {
            // Use existing error handling logic
            const errorData = await response.json().catch(() => ({ message: 'Unknown error from server.' }));
            throw new Error(`Failed to fetch movies: ${errorData.message || response.statusText}`);
        }
        const movies = await response.json();

        movieListDiv.innerHTML = ''; // Clear existing list
        if (movies.length === 0) {
            movieListDiv.innerHTML = '<p class="no-movies-message">No movies found. Try a different search or add a new movie!</p>';
            return;
        }

        movies.forEach(movie => {
            const movieCard = document.createElement('div');
            movieCard.className = 'movie-card';
            movieCard.innerHTML = `
                <h3>${movie.title}</h3>
                <p><strong>Director:</strong> ${movie.director}</p>
                <p><strong>Year:</strong> ${movie.year}</p>
                <div class="actions">
                    <button data-id="${movie._id}" class="edit-btn">Edit</button>
                    <button data-id="${movie._id}" class="delete-btn">Delete</button>
                </div>
            `;
            movieListDiv.appendChild(movieCard);
        });

        // Add event listeners for new edit/delete buttons
        document.querySelectorAll('.edit-btn').forEach(button => {
            button.addEventListener('click', handleEdit);
        });
        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', handleDelete);
        });

    } catch (error) {
        console.error('Error fetching and displaying movies:', error);
        alert(error.message);
        movieListDiv.innerHTML = `<p class="error-message">Failed to load movies: ${error.message}</p>`;
    }
}

// ... (Rest of your handleAddMovie, handleDelete, handleEdit, handleUpdateMovie functions unchanged)

// --- Initial setup on page load ---
document.addEventListener('DOMContentLoaded', () => {
    fetchAndDisplayMovies(); // Load all movies on initial page load

    // Add event listener for the Add/Update form
    movieForm.addEventListener('submit', handleAddMovie);

    // --- New Event Listeners for Search ---
    searchButton.addEventListener('click', fetchAndDisplayMovies); // Trigger search on button click
    searchInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') { // Allow searching on Enter key press
            fetchAndDisplayMovies();
        }
    });
    clearSearchButton.addEventListener('click', () => {
        searchInput.value = ''; // Clear the search input
        fetchAndDisplayMovies(); // Fetch all movies again
    });
});