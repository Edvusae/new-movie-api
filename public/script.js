// public/script.js

const API_BASE = 'http://localhost:3000';

const movieForm = document.getElementById('movieForm');
const movieIdInput = document.getElementById('movieId');
const titleInput = document.getElementById('title');
const directorInput = document.getElementById('director');
const yearInput = document.getElementById('year');
const submitButton = document.getElementById('submitButton');
const movieListDiv = document.getElementById('movieList');

// --- Search Elements ---
const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');
const clearSearchButton = document.getElementById('clearSearchButton');

// --- New Sort Elements ---
const sortBySelect = document.getElementById('sortBy');
const sortOrderSelect = document.getElementById('sortOrder');
const applySortButton = document.getElementById('applySortButton');


// --- 1. Function to Fetch and Display Movies (GET) ---
async function fetchAndDisplayMovies() {
    try {
        const searchTerm = searchInput.value;
        const sortBy = sortBySelect.value;   // Get the selected sort field
        const sortOrder = sortOrderSelect.value; // Get the selected sort order

        let url = `${API_BASE}/movies`;
        const params = new URLSearchParams(); // Use URLSearchParams for easier query building

        if (searchTerm) {
            params.append('search', searchTerm);
        }
        if (sortBy) {
            params.append('sort', sortBy);
        }
        if (sortOrder) {
            params.append('order', sortOrder);
        }

        // Add parameters to the URL if any exist
        if (params.toString()) {
            url += `?${params.toString()}`;
        }

        const response = await fetch(url);
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Unknown error from server.' }));
            throw new Error(`Failed to fetch movies: ${errorData.message || response.statusText}`);
        }
        const movies = await response.json();

        movieListDiv.innerHTML = ''; // Clear existing list
        if (movies.length === 0) {
            movieListDiv.innerHTML = '<p class="no-movies-message">No movies found. Try a different search, sort, or add a new movie!</p>';
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

    movieForm.addEventListener('submit', handleAddMovie);

    // Search Event Listeners
    searchButton.addEventListener('click', fetchAndDisplayMovies);
    searchInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            fetchAndDisplayMovies();
        }
    });
    clearSearchButton.addEventListener('click', () => {
        searchInput.value = '';
        fetchAndDisplayMovies();
    });

    // --- New Sort Event Listeners ---
    applySortButton.addEventListener('click', fetchAndDisplayMovies); // Apply sort on button click
    // Optional: Auto-apply sort when dropdown selection changes
    // sortBySelect.addEventListener('change', fetchAndDisplayMovies);
    // sortOrderSelect.addEventListener('change', fetchAndDisplayMovies);
});