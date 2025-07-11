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

// public/script.js (add to the existing code)

async function handleAddMovie(event) {
    event.preventDefault(); // Prevent the default form submission behavior

    const title = titleInput.value;
    const director = directorInput.value;
    const year = parseInt(yearInput.value, 10); // Ensure year is a number

    if (!title || !director || isNaN(year)) {
        alert('Please fill in all fields correctly (Year must be a number).');
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/movies', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ title, director, year })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.message || response.statusText}`);
        }

        const newMovie = await response.json();
        console.log('Movie added:', newMovie);

        // Clear the form fields
        titleInput.value = '';
        directorInput.value = '';
        yearInput.value = '';

        // Re-fetch and display all movies to update the list
        fetchAndDisplayMovies();

    } catch (error) {
        console.error('Error adding movie:', error);
        alert(`Failed to add movie: ${error.message || 'Check console for details.'}`);
    }
}

// Attach event listener to the form
movieForm.addEventListener('submit', handleAddMovie);

// Add a function to handle deleting a movie by ID
/*async function deleteMovieById(movieId) {
    try {
        const response = await fetch(`http://localhost:3000/movies/${movieId}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.message || response.statusText}`);
        }

        console.log('Movie deleted:', movieId);
        // Re-fetch and display all movies to update the list
        fetchAndDisplayMovies();

    } catch (error) {
        console.error('Error deleting movie:', error);
        alert(`Failed to delete movie: ${error.message || 'Check console for details.'}`);
    }
}
*/

// public/script.js (add to the existing code)

async function handleDelete(event) {
    const movieId = event.target.dataset.id; // Get the movie ID from the data-id attribute

    if (!confirm('Are you sure you want to delete this movie?')) {
        return; // User cancelled the deletion
    }

    try {
        const response = await fetch(`http://localhost:3000/movies/${movieId}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        console.log(`Movie ${movieId} deleted successfully.`);
        fetchAndDisplayMovies(); // Refresh the list after deletion

    } catch (error) {
        console.error('Error deleting movie:', error);
        alert('Failed to delete movie. Check console for details.');
    }
}

// Add a function to handle updating a movie by ID
async function updateMovieById(movieId, updatedData) { 
    
}