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

// --- Sort Elements ---
const sortBySelect = document.getElementById('sortBy');
const sortOrderSelect = document.getElementById('sortOrder');
const applySortButton = document.getElementById('applySortButton');


// --- 1. Function to Fetch and Display Movies (GET) ---
// (Your current fetchAndDisplayMovies function goes here, exactly as you provided it)
async function fetchAndDisplayMovies() {
    try {
        const searchTerm = searchInput.value;
        const sortBy = sortBySelect.value;
        const sortOrder = sortOrderSelect.value;

        let url = `${API_BASE}/movies`;
        const params = new URLSearchParams();

        if (searchTerm) {
            params.append('search', searchTerm);
        }
        if (sortBy) {
            params.append('sort', sortBy);
        }
        if (sortOrder) {
            params.append('order', sortOrder);
        }

        if (params.toString()) {
            url += `?${params.toString()}`;
        }

        const response = await fetch(url);
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Unknown error from server.' }));
            throw new Error(`Failed to fetch movies: ${errorData.message || response.statusText}`);
        }
        const movies = await response.json();

        movieListDiv.innerHTML = '';
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

// --- 2. Function to Add or Update a Movie (POST / PUT) ---
async function handleAddMovie(event) {
    event.preventDefault(); // Prevent default form submission

    const id = movieIdInput.value;
    const title = titleInput.value;
    const director = directorInput.value;
    const year = parseInt(yearInput.value, 10); // Ensure year is a number

    const movieData = { title, director, year };

    let url = `${API_BASE}/movies`;
    let method = 'POST';

    // If movieIdInput has a value, we're updating an existing movie
    if (id) {
        url = `${API_BASE}/movies/${id}`;
        method = 'PUT';
    }

    try {
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(movieData)
        });

        const data = await response.json();

        if (!response.ok) {
            let errorMessage = 'An error occurred.';
            if (data && data.message) {
                errorMessage = data.message;
            }
            if (data && data.errors && data.errors.length > 0) {
                // Format validation errors nicely
                const validationErrors = data.errors.map(err => Object.values(err)[0]).join('\n- ');
                errorMessage += `\n\nValidation Errors:\n- ${validationErrors}`;
            }
            throw new Error(errorMessage);
        } else {
            alert(id ? 'Movie updated successfully!' : 'Movie added successfully!');
            movieForm.reset(); // Clear the form
            movieIdInput.value = ''; // Clear hidden ID field
            submitButton.textContent = 'Add Movie'; // Reset button text to 'Add Movie'
            fetchAndDisplayMovies(); // Refresh the list
        }

    } catch (error) {
        console.error('Error adding/updating movie:', error);
        alert(error.message);
    }
}

// --- 3. Function to Handle Edit Button Click ---
async function handleEdit(event) {
    const id = event.target.dataset.id; // Get the movie ID from the data-id attribute

    try {
        const response = await fetch(`${API_BASE}/movies/${id}`);
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Unknown error.' }));
            throw new Error(`Failed to fetch movie for edit: ${errorData.message || response.statusText}`);
        }
        const movie = await response.json();

        // Populate the form with the movie's data
        movieIdInput.value = movie._id;
        titleInput.value = movie.title;
        directorInput.value = movie.director;
        yearInput.value = movie.year;
        submitButton.textContent = 'Update Movie'; // Change button text to indicate update mode

    } catch (error) {
        console.error('Error fetching movie for edit:', error);
        alert(error.message);
    }
}

// --- 4. Function to Handle Delete Button Click ---
async function handleDelete(event) {
    const id = event.target.dataset.id;

    if (!confirm('Are you sure you want to delete this movie?')) {
        return; // User cancelled
    }

    try {
        const response = await fetch(`${API_BASE}/movies/${id}`, {
            method: 'DELETE'
        });

        const data = await response.json();

        if (!response.ok) {
            let errorMessage = 'An error occurred during deletion.';
            if (data && data.message) {
                errorMessage = data.message;
            }
            throw new Error(errorMessage);
        } else {
            alert('Movie deleted successfully!');
            fetchAndDisplayMovies(); // Refresh the list
        }

    } catch (error) {
        console.error('Error deleting movie:', error);
        alert(error.message);
    }
}


// --- Initial setup on page load ---
document.addEventListener('DOMContentLoaded', () => {
    fetchAndDisplayMovies(); // Load all movies on initial page load

    // Add event listener for the Add/Update form
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

    // Sort Event Listeners
    applySortButton.addEventListener('click', fetchAndDisplayMovies);
    // sortBySelect.addEventListener('change', fetchAndDisplayMovies); // Optional: uncomment for auto-sort on change
    // sortOrderSelect.addEventListener('change', fetchAndDisplayMovies); // Optional: uncomment for auto-sort on change
});