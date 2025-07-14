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
    }
}

// --- 3. Function to Handle Adding a New Movie (POST) ---
async function handleAddMovie(event) {
    event.preventDefault(); // Stop the default form submission (which would refresh the page)

    const title = titleInput.value;
    const director = directorInput.value;
    const year = parseInt(yearInput.value, 10); // Convert year to a number

    // Basic client-side validation
    if (!title || !director || isNaN(year) || year < 1800 || year > new Date().getFullYear() + 5) {
        alert('Please fill in all fields correctly: Title and Director are required, Year must be a valid number.');
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/movies`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json' // Tell the server we're sending JSON
            },
            body: JSON.stringify({ title, director, year }) // Convert JS object to JSON string
        });

        if (!response.ok) {
            // Attempt to parse error message from server
            const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.message || response.statusText}`);
        }

        const newMovie = await response.json(); // Get the newly created movie from the response
        console.log('Movie added:', newMovie);

        // Clear the form fields after successful submission
        movieForm.reset(); // A handy method to clear all form fields

        // Re-fetch and display all movies to update the list in the UI
        fetchAndDisplayMovies();

    } catch (error) {
        console.error('Error adding movie:', error);
        alert(`Failed to add movie: ${error.message || 'Check console for more details.'}`);
    }
}

// --- 4. Function to Handle Deleting a Movie (DELETE) ---
async function handleDelete(event) {
    // Get the movie ID from the 'data-id' attribute of the clicked button
    const movieId = event.target.dataset.id;

    // Ask for user confirmation before deleting
    if (!confirm('Are you sure you want to delete this movie? This action cannot be undone.')) {
        return; // If user cancels, stop the function
    }

    try {
        const response = await fetch(`${API_BASE}/movies/${movieId}`, {
            method: 'DELETE' // Specify the HTTP DELETE method
        });

        if (!response.ok) {
            // Attempt to parse error message from server
            const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.message || response.statusText}`);
        }

        console.log(`Movie ${movieId} deleted successfully.`);
        // Re-fetch and display all movies to update the list (remove the deleted one)
        fetchAndDisplayMovies();

    } catch (error) {
        console.error('Error deleting movie:', error);
        alert(`Failed to delete movie: ${error.message || 'Check console for more details.'}`);
    }
}

// --- 5. Function to Handle 'Edit' Button Click (Prepares form for PUT) ---
async function handleEdit(event) {
    const movieId = event.target.dataset.id; // Get the ID of the movie to edit

    try {
        // Fetch the specific movie's data from the backend to populate the form
        const response = await fetch(`${API_BASE}/movies/${movieId}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const movieToEdit = await response.json();

        // Populate the form fields with the fetched movie's data
        titleInput.value = movieToEdit.title;
        directorInput.value = movieToEdit.director;
        yearInput.value = movieToEdit.year;
        movieIdInput.value = movieToEdit._id; // Store the movie's _id in the hidden input

        // Change the submit button's text and re-configure form submission for updating
        submitButton.textContent = 'Update Movie';
        // Remove the 'add' listener to prevent it from firing when updating
        movieForm.removeEventListener('submit', handleAddMovie);
        // Add the 'update' listener for the next form submission
        movieForm.addEventListener('submit', handleUpdateMovie);

        // Optional: Scroll to the form for better user experience
        movieForm.scrollIntoView({ behavior: 'smooth', block: 'start' });

    } catch (error) {
        console.error('Error fetching movie for edit:', error);
        alert('Failed to load movie data for editing. Check console for details.');
    }
}

// --- 6. Function to Handle Updating an Existing Movie (PUT) ---
async function handleUpdateMovie(event) {
    event.preventDefault(); // Prevent default form submission

    const movieId = movieIdInput.value; // Get the movie ID from the hidden input
    const title = titleInput.value;
    const director = directorInput.value;
    const year = parseInt(yearInput.value, 10);

    // Basic client-side validation
    if (!title || !director || isNaN(year) || year < 1800 || year > new Date().getFullYear() + 5) {
        alert('Please fill in all fields correctly: Title and Director are required, Year must be a valid number.');
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/movies/${movieId}`, {
            method: 'PUT', // Specify the HTTP PUT method
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ title, director, year })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.message || response.statusText}`);
        }

        const updatedMovie = await response.json();
        console.log('Movie updated:', updatedMovie);

        // --- Reset Form to 'Add Movie' Mode After Update ---
        movieForm.reset(); // Clear all form fields
        submitButton.textContent = 'Add Movie'; // Change button text back
        movieIdInput.value = ''; // Clear the hidden ID

        // Re-configure form submission: remove 'update' listener, add 'add' listener back
        movieForm.removeEventListener('submit', handleUpdateMovie);
        movieForm.addEventListener('submit', handleAddMovie);

        // Re-fetch and display all movies to show the updated list
        fetchAndDisplayMovies();

    } catch (error) {
        console.error('Error updating movie:', error);
        alert(`Failed to update movie: ${error.message || 'Check console for more details.'}`);
    }
}


// --- 7. Initial Setup / Event Listeners on Page Load ---
// This ensures that when the page first loads,
// the initial movie list is fetched and the form is ready for adding.
// Attach the initial event listener for adding movies to the form.
// This will be swapped with handleUpdateMovie when editing.
movieForm.addEventListener('submit', handleAddMovie);

// Fetch and display movies when the script first runs (page loads)
fetchAndDisplayMovies();