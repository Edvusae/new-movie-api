// public/js/index.js

// Import common functions (if common.js is set up as a module)
// For now, assuming common.js functions are globally available after script inclusion
// const { API_BASE, displayMessage, getAuthToken, removeAuthToken, handleLogout, checkAuthStatusHeader } = window; // Example if using global scope

// UI Elements specific to index.html
let movieManagementSection, movieListingSection, publicMoviesSection;
let publicMovieListDiv, publicMoviesMessage;
let movieForm, movieIdInput, titleInput, directorInput, yearInput, submitButton, movieListDiv, formMessage, listMessage;
let searchInput, searchButton, clearSearchButton;
let sortBySelect, sortOrderSelect, applySortButton;

// --- Function to Fetch and Display Public Movies from TMDB Proxy ---
async function fetchAndDisplayPublicMovies() {
    if (!publicMoviesMessage || !publicMovieListDiv) return;

    publicMoviesMessage.style.display = 'none';
    publicMovieListDiv.innerHTML = '';

    try {
        const response = await fetch(`${API_BASE}/api/public/movies/trending`);
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Unknown error from server.' }));
            throw new Error(`Failed to fetch trending movies: ${errorData.message || response.statusText}`);
        }
        const movies = await response.json();

        if (movies.length === 0) {
            publicMovieListDiv.innerHTML = '<p class="no-movies-message">No trending movies found at this time.</p>';
            return;
        }

        movies.forEach(movie => {
            const movieCard = document.createElement('div');
            movieCard.className = 'movie-card';
            const imageUrl = movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : 'https://via.placeholder.com/500x750?text=No+Poster';
            movieCard.innerHTML = `
                <img src="${imageUrl}" alt="${movie.title} Poster" style="width:100%; height:auto; border-radius: 4px; margin-bottom: 10px;">
                <h3>${movie.title}</h3>
                <p><strong>Release Date:</strong> ${movie.release_date || 'N/A'}</p>
                <p><strong>Rating:</strong> ${movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'}/10</p>
                <p class="overview">${movie.overview ? movie.overview.substring(0, 100) + '...' : 'No overview available.'}</p>
                <div class="actions" style="justify-content: center;">
                    <a href="https://www.themoviedb.org/movie/${movie.id}" target="_blank" class="auth-btn" style="background-color: #6c757d;">View Details</a>
                </div>
            `;
            publicMovieListDiv.appendChild(movieCard);
        });

    } catch (error) {
        console.error('Error fetching public movies:', error);
        displayMessage(publicMoviesMessage, `Failed to load trending movies: ${error.message}`, 'error');
    }
}

// --- Function to Fetch and Display Private Movies (GET) ---
async function fetchAndDisplayMovies() {
    if (!listMessage || !movieListDiv) return;

    listMessage.style.display = 'none';

    try {
        const searchTerm = searchInput.value.trim();
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

        const token = getAuthToken();
        const headers = {};
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(url, { headers });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Unknown error from server.' }));
            if (response.status === 401 && token) {
                handleLogout(); // Log out if token is invalid/expired
                displayMessage(listMessage, 'Session expired. Please log in again.', 'error');
                return;
            }
            throw new Error(`Failed to fetch movies: ${errorData.message || response.statusText}`);
        }
        const movies = await response.json();

        movieListDiv.innerHTML = '';
        if (movies.length === 0) {
            movieListDiv.innerHTML = '<p class="no-movies-message">No movies found in your collection. Try adding a new movie!</p>';
            return;
        }

        const userRole = localStorage.getItem('loggedInUserRole');

        movies.forEach(movie => {
            const movieCard = document.createElement('div');
            movieCard.className = 'movie-card';
            movieCard.innerHTML = `
                <h3>${movie.title}</h3>
                <p><strong>Director:</strong> ${movie.director}</p>
                <p><strong>Year:</strong> ${movie.year}</p>
                <div class="actions">
                    ${(userRole === 'admin' || userRole === 'super_admin') ?
                        `<button data-id="${movie._id}" class="edit-btn">Edit</button>` : ''
                    }
                    ${userRole === 'super_admin' ?
                        `<button data-id="${movie._id}" class="delete-btn">Delete</button>` : ''
                    }
                </div>
            `;
            movieListDiv.appendChild(movieCard);
        });

        // Attach event listeners after rendering
        if (userRole === 'admin' || userRole === 'super_admin') {
            document.querySelectorAll('.edit-btn').forEach(button => {
                button.addEventListener('click', handleEdit);
            });
        }
        if (userRole === 'super_admin') {
            document.querySelectorAll('.delete-btn').forEach(button => {
                button.addEventListener('click', handleDelete);
            });
        }

    } catch (error) {
        console.error('Error fetching and displaying movies:', error);
        displayMessage(listMessage, `Failed to load movies: ${error.message}`, 'error');
    }
}

// --- Function to Add or Update a Movie (POST / PUT) ---
async function handleAddMovie(event) {
    event.preventDefault();
    if (!formMessage) return;

    formMessage.style.display = 'none';

    const id = movieIdInput.value;
    const title = titleInput.value.trim();
    const director = directorInput.value.trim();
    const year = parseInt(yearInput.value, 10);

    const movieData = { title, director, year };

    let url = `${API_BASE}/movies`;
    let method = 'POST';

    if (id) {
        url = `${API_BASE}/movies/${id}`;
        method = 'PUT';
    }

    const token = getAuthToken();
    if (!token) {
        displayMessage(formMessage, 'You must be logged in to add/update movies.', 'error');
        window.location.href = 'auth.html?form=login';
        return;
    }

    try {
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(movieData)
        });

        const data = await response.json();

        if (!response.ok) {
            if (response.status === 401) {
                handleLogout();
                displayMessage(formMessage, 'Session expired or invalid. Please log in again.', 'error');
                return;
            }
            if (response.status === 403) {
                displayMessage(formMessage, data.message || 'You do not have permission to perform this action.', 'error');
                return;
            }

            let errorMessage = data.message || 'An error occurred.';
            if (data && data.errors && data.errors.length > 0) {
                const validationErrors = data.errors.map(err => err.msg || (typeof err === 'object' ? Object.values(err)[0] : 'Validation error')).join('\n- ');
                errorMessage += `\n\nValidation Errors:\n- ${validationErrors}`;
            }
            displayMessage(formMessage, errorMessage, 'error');
        } else {
            displayMessage(formMessage, id ? 'Movie updated successfully!' : 'Movie added successfully!', 'success');
            movieForm.reset();
            movieIdInput.value = '';
            submitButton.textContent = 'Add Movie';
            fetchAndDisplayMovies();
        }

    } catch (error) {
        console.error('Error adding/updating movie:', error);
        displayMessage(formMessage, 'An unexpected error occurred. Please check your network.', 'error');
    }
}

// --- Function to Handle Edit Button Click ---
async function handleEdit(event) {
    const id = event.target.dataset.id;
    if (!formMessage) return;

    formMessage.style.display = 'none';

    try {
        const response = await fetch(`${API_BASE}/movies/${id}`);
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Unknown error.' }));
            throw new Error(`Failed to fetch movie for edit: ${errorData.message || response.statusText}`);
        }
        const movie = await response.json();

        movieIdInput.value = movie._id;
        titleInput.value = movie.title;
        directorInput.value = movie.director;
        yearInput.value = movie.year;
        submitButton.textContent = 'Update Movie';

    } catch (error) {
        console.error('Error fetching movie for edit:', error);
        displayMessage(formMessage, error.message, 'error');
    }
}

// --- Function to Handle Delete Button Click ---
async function handleDelete(event) {
    const id = event.target.dataset.id;
    if (!listMessage) return;

    listMessage.style.display = 'none';

    if (!confirm('Are you sure you want to delete this movie?')) {
        return;
    }

    const token = getAuthToken();
    if (!token) {
        displayMessage(listMessage, 'You must be logged in to delete movies.', 'error');
        window.location.href = 'auth.html?form=login';
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/movies/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            if (response.status === 401) {
                handleLogout();
                displayMessage(listMessage, 'Session expired or invalid. Please log in again.', 'error');
                return;
            }
            if (response.status === 403) {
                displayMessage(listMessage, data.message || 'You do not have permission to perform this action.', 'error');
                return;
            }

            let errorMessage = data.message || 'An error occurred during deletion.';
            displayMessage(listMessage, errorMessage, 'error');
        } else {
            displayMessage(listMessage, 'Movie deleted successfully!', 'success');
            fetchAndDisplayMovies();
        }

    } catch (error) {
        console.error('Error deleting movie:', error);
        displayMessage(listMessage, 'An unexpected error occurred during deletion. Please check your network.', 'error');
    }
}

// --- Function to check authentication status and update index.html UI ---
function checkAuthStatusIndexPage() {
    const token = getAuthToken();
    const username = localStorage.getItem('loggedInUsername');
    const role = localStorage.getItem('loggedInUserRole');

    // Re-assign local vars for current page
    publicMoviesSection = document.getElementById('publicMoviesSection');
    movieManagementSection = document.getElementById('movieManagementSection');
    movieListingSection = document.getElementById('movieListingSection');
    publicMovieListDiv = document.getElementById('publicMovieList');
    publicMoviesMessage = document.getElementById('publicMoviesMessage');
    movieForm = document.getElementById('movieForm');
    movieIdInput = document.getElementById('movieId');
    titleInput = document.getElementById('title');
    directorInput = document.getElementById('director');
    yearInput = document.getElementById('year');
    submitButton = document.getElementById('submitButton');
    movieListDiv = document.getElementById('movieList');
    formMessage = document.getElementById('formMessage');
    listMessage = document.getElementById('listMessage');
    searchInput = document.getElementById('searchInput');
    searchButton = document.getElementById('searchButton');
    clearSearchButton = document.getElementById('clearSearchButton');
    sortBySelect = document.getElementById('sortBy');
    sortOrderSelect = document.getElementById('sortOrder');
    applySortButton = document.getElementById('applySortButton');

    if (token && username && role) {
        publicMoviesSection.style.display = 'none';
        movieListingSection.style.display = 'block';

        if (role === 'admin' || role === 'super_admin') {
            movieManagementSection.style.display = 'block';
        } else {
            movieManagementSection.style.display = 'none';
        }
        fetchAndDisplayMovies(); // Fetch user's private movies
    } else {
        publicMoviesSection.style.display = 'block';
        movieManagementSection.style.display = 'none';
        movieListingSection.style.display = 'none';
        fetchAndDisplayPublicMovies(); // Fetch public movies when logged out
    }
}


// --- Initial setup on index.html load ---
document.addEventListener('DOMContentLoaded', () => {
    checkAuthStatusIndexPage(); // Update index.html UI based on auth status

    // Add event listeners specific to index.html
    if (movieForm) {
        movieForm.addEventListener('submit', handleAddMovie);
    }
    if (searchButton) {
        searchButton.addEventListener('click', fetchAndDisplayMovies);
    }
    if (searchInput) {
        searchInput.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                fetchAndDisplayMovies();
            }
        });
    }
    if (clearSearchButton) {
        clearSearchButton.addEventListener('click', () => {
            searchInput.value = '';
            fetchAndDisplayMovies();
        });
    }
    if (applySortButton) {
        applySortButton.addEventListener('click', fetchAndDisplayMovies);
    }
});

// public/js/index.js

// ... existing code ...

// --- Function to Fetch and Display Public Movies from TMDB Proxy ---
async function fetchAndDisplayPublicMovies() {
    if (!publicMoviesMessage || !publicMovieListDiv) return;

    publicMoviesMessage.style.display = 'none';
    publicMovieListDiv.innerHTML = '';

    try {
        const response = await fetch(`${API_BASE}/api/public/movies/trending`);
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Unknown error from server.' }));
            throw new Error(`Failed to fetch trending movies: ${errorData.message || response.statusText}`);
        }
        const movies = await response.json();

        if (movies.length === 0) {
            publicMovieListDiv.innerHTML = '<p class="no-movies-message">No trending movies found at this time.</p>';
            return;
        }

        // Check if user is logged in
        const isLoggedIn = !!getAuthToken(); // getAuthToken is from common.js

        movies.forEach(movie => {
            const movieCard = document.createElement('div');
            movieCard.className = 'movie-card';
            const imageUrl = movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : 'https://via.placeholder.com/500x750?text=No+Poster';

            // Extract year safely
            const year = movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A';

            movieCard.innerHTML = `
                <img src="${imageUrl}" alt="${movie.title} Poster" style="width:100%; height:auto; border-radius: 4px; margin-bottom: 10px;">
                <h3>${movie.title}</h3>
                <p><strong>Release Date:</strong> ${movie.release_date || 'N/A'}</p>
                <p><strong>Rating:</strong> ${movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'}/10</p>
                <p class="overview">${movie.overview ? movie.overview.substring(0, 100) + '...' : 'No overview available.'}</p>
                <div class="actions" style="justify-content: center;">
                    <a href="https://www.themoviedb.org/movie/${movie.id}" target="_blank" class="auth-btn" style="background-color: #6c757d;">View Details</a>
                    ${isLoggedIn ? `
                        <button
                            data-title="${movie.title}"
                            data-director="Unknown" // TMDB trending movies usually don't have director directly in this endpoint
                            data-year="${year}"
                            class="add-to-collection-btn auth-btn"
                        >
                            Add to My Collection
                        </button>
                    ` : ''}
                </div>
            `;
            publicMovieListDiv.appendChild(movieCard);
        });

        // Attach event listeners for the new buttons if user is logged in
        if (isLoggedIn) {
            document.querySelectorAll('.add-to-collection-btn').forEach(button => {
                button.addEventListener('click', handleAddToCollection);
            });
        }

    } catch (error) {
        console.error('Error fetching public movies:', error);
        displayMessage(publicMoviesMessage, `Failed to load trending movies: ${error.message}`, 'error');
    }
}

// ... existing code ...

// --- Function to Handle Adding a Public Movie to User's Collection ---
async function handleAddToCollection(event) {
    const button = event.target;
    // Disable button to prevent multiple clicks
    button.disabled = true;
    button.textContent = 'Adding...';

    const title = button.dataset.title;
    const director = button.dataset.director; // This will likely be "Unknown" for TMDB trending
    const year = parseInt(button.dataset.year, 10);

    if (!title || !director || isNaN(year)) {
        displayMessage(publicMoviesMessage, 'Error: Missing movie data to add.', 'error');
        button.disabled = false;
        button.textContent = 'Add to My Collection';
        return;
    }

    const token = getAuthToken();
    if (!token) {
        displayMessage(publicMoviesMessage, 'You must be logged in to add movies.', 'error');
        button.disabled = false;
        button.textContent = 'Add to My Collection';
        window.location.href = 'auth.html?form=login';
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/movies/add-from-public`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ title, director, year })
        });

        const data = await response.json();

        if (!response.ok) {
            if (response.status === 401) {
                handleLogout();
                displayMessage(publicMoviesMessage, 'Session expired. Please log in again.', 'error');
                return;
            }
            displayMessage(publicMoviesMessage, data.message || 'Failed to add movie to collection.', 'error');
        } else {
            displayMessage(publicMoviesMessage, data.message, 'success');
            // Optional: You could update the button text to "Added!" or remove it
            button.textContent = 'Added!';
            button.style.backgroundColor = '#28a745'; // Green for added
            button.style.cursor = 'default';

            // If on index.html and logged in, refresh private movie list
            // This will only happen if the user logs in and then returns to index.html,
            // or if they navigate to index.html while logged in.
            if (movieListingSection && movieListingSection.style.display === 'block') {
                fetchAndDisplayMovies();
            }
        }
    } catch (error) {
        console.error('Error adding movie to collection:', error);
        displayMessage(publicMoviesMessage, 'An unexpected error occurred while adding movie.', 'error');
    } finally {
        // Re-enable button if it's not "Added!"
        if (button.textContent !== 'Added!') {
             button.disabled = false;
             button.textContent = 'Add to My Collection';
        }
    }
} 