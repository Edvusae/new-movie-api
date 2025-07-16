// public/script.js

// --- 1. Global Variable Declarations ---
// Get references to your HTML elements using their IDs.
// Ensure your index.html has elements with these exact IDs.
const moviesContainer = document.getElementById('movies-container');
const movieForm = document.getElementById('movie-form');

// Input fields for the form (for both adding and editing)
const titleInput = document.getElementById('title');
const directorInput = document.getElementById('director');
const yearInput = document.getElementById('year');
const API_BASE = location.origin;

// Elements specifically for the edit functionality
const submitButton = document.getElementById('submit-btn'); // The form's submit button
const movieIdInput = document.getElementById('movie-id');   // Hidden input to store movie ID during edit

// --- 2. Function to Fetch and Display All Movies (GET) ---
// This function fetches movies from the backend and dynamically displays them.
async function fetchAndDisplayMovies() {
    moviesContainer.innerHTML = '<p>Loading movies...</p>'; // Show a loading message

    try {
        const response = await fetch(`${API_BASE}/movies`); // Make GET request to your API
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const movies = await response.json(); // Parse the JSON response

        moviesContainer.innerHTML = ''; // Clear loading message and previous content

        if (movies.length === 0) {
            moviesContainer.innerHTML = '<p>No movies found. Add some using the form above!</p>';
            return;
        }

        // Iterate over each movie and create a card for it
        movies.forEach(movie => {
            const movieCard = document.createElement('div');
            movieCard.classList.add('movie-card'); // Apply CSS styling

            // Populate the card with movie data and add Edit/Delete buttons
            movieCard.innerHTML = `
                <h3>${movie.title}</h3>
                <p><strong>Director:</strong> ${movie.director}</p>
                <p><strong>Year:</strong> ${movie.year}</p>
                <p><small>ID: ${movie._id}</small></p>
                <button class="edit-btn" data-id="${movie._id}">Edit</button>
                <button class="delete-btn" data-id="${movie._id}">Delete</button>
            `;
            moviesContainer.appendChild(movieCard);
        });

        // --- Attach Event Listeners to Dynamically Created Buttons ---
        // This is crucial: after new movie cards are added, their buttons need listeners.
        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', handleDelete);
        });
        document.querySelectorAll('.edit-btn').forEach(button => {
            button.addEventListener('click', handleEdit);
        });

    } catch (error) {
        console.error('Error fetching movies:', error);
        moviesContainer.innerHTML = '<p style="color: red;">Failed to load movies. Please check the server and network.</p>';
    }};

// --- 3. Function to Handle Adding a New Movie (POST) ---
async function handleAddMovie(event) {
    event.preventDefault();

    const title = titleInput.value;
    const director = directorInput.value;
    const year = parseInt(yearInput.value, 10);

    if (!title || !director || isNaN(year) || year < 1800 || year > new Date().getFullYear() + 5) {
        alert('Please fill in all fields correctly: Title and Director are required, Year must be a valid number.');
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/movies`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, director, year })
        });

        if (!response.ok) {
            // Attempt to parse structured error message from backend
            const errorData = await response.json().catch(() => ({ message: 'Unknown error from server.' }));
            // Construct a user-friendly message
            let errorMessage = errorData.message || response.statusText || 'An unexpected error occurred.';
            if (errorData.errors && Array.isArray(errorData.errors)) {
                errorMessage += '\nDetails: ' + errorData.errors.join(', ');
            }
            throw new Error(`Failed to add movie: ${errorMessage}`);
        }

        const newMovie = await response.json();
        console.log('Movie added:', newMovie);
        movieForm.reset();
        fetchAndDisplayMovies();

    } catch (error) {
        console.error('Error adding movie:', error);
        alert(error.message); // Display the more detailed error message
    }
}

// --- 4. Function to Handle Deleting a Movie (DELETE) ---
async function handleDelete(event) {
    const movieId = event.target.dataset.id;
    if (!confirm('Are you sure you want to delete this movie? This action cannot be undone.')) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/movies/${movieId}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Unknown error from server.' }));
            throw new Error(`Failed to delete movie: ${errorData.message || response.statusText}`);
        }

        // Backend now sends { message: 'Movie deleted successfully', deletedMovie }
        const result = await response.json();
        console.log(result.message, result.deletedMovie); // Log the success message
        fetchAndDisplayMovies();

    } catch (error) {
        console.error('Error deleting movie:', error);
        alert(error.message); // Display the more detailed error message
    }
}

// --- 5. Function to Handle 'Edit' Button Click (Prepares form for PUT) ---
async function handleEdit(event) {
    const movieId = event.target.dataset.id;

    try {
        const response = await fetch(`${API_BASE}/movies/${movieId}`);
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Unknown error from server.' }));
            throw new Error(`Failed to fetch movie for edit: ${errorData.message || response.statusText}`);
        }
        const movieToEdit = await response.json();

        titleInput.value = movieToEdit.title;
        directorInput.value = movieToEdit.director;
        yearInput.value = movieToEdit.year;
        movieIdInput.value = movieToEdit._id;

        submitButton.textContent = 'Update Movie';
        movieForm.removeEventListener('submit', handleAddMovie);
        movieForm.addEventListener('submit', handleUpdateMovie);

        movieForm.scrollIntoView({ behavior: 'smooth', block: 'start' });

    } catch (error) {
        console.error('Error fetching movie for edit:', error);
        alert(error.message); // Display the more detailed error message
    }
}

// --- 6. Function to Handle Updating an Existing Movie (PUT) ---
async function handleUpdateMovie(event) {
    event.preventDefault();

    const movieId = movieIdInput.value;
    const title = titleInput.value;
    const director = directorInput.value;
    const year = parseInt(yearInput.value, 10);

    if (!title || !director || isNaN(year) || year < 1800 || year > new Date().getFullYear() + 5) {
        alert('Please fill in all fields correctly: Title and Director are required, Year must be a valid number.');
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/movies/${movieId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, director, year })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Unknown error from server.' }));
            let errorMessage = errorData.message || response.statusText || 'An unexpected error occurred.';
            if (errorData.errors && Array.isArray(errorData.errors)) {
                errorMessage += '\nDetails: ' + errorData.errors.join(', ');
            }
            throw new Error(`Failed to update movie: ${errorMessage}`);
        }

        const updatedMovie = await response.json();
        console.log('Movie updated:', updatedMovie);

        movieForm.reset();
        submitButton.textContent = 'Add Movie';
        movieIdInput.value = '';
        movieForm.removeEventListener('submit', handleUpdateMovie);
        movieForm.addEventListener('submit', handleAddMovie);

        fetchAndDisplayMovies();

    } catch (error) {
        console.error('Error updating movie:', error);
        alert(error.message); // Display the more detailed error message
    }
}
// --- 7. Event Listeners for Form Submission and Initial Fetch ---