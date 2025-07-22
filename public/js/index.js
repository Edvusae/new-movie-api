// public/js/index.js

// Ensure window.App is available from common.js
// If common.js is not loaded first, this script will fail.
// No direct 'import' or 'const { ... } = window;' needed at the top,
// as we will directly use App.functionName throughout.

// UI Elements specific to index.html
// These are declared globally within this file, but assigned their DOM references
// inside checkAuthStatusIndexPage, which runs on DOMContentLoaded.
let movieManagementSection, movieListingSection, publicMoviesSection;
let publicMovieListDiv, publicMoviesMessage;
let movieForm, movieIdInput, titleInput, directorInput, yearInput, submitButton, movieListDiv, formMessage, listMessage;
let searchInput, searchButton, clearSearchButton;
let sortBySelect, sortOrderSelect, applySortButton;

// --- Function to Fetch and Display Public Movies from TMDB Proxy ---
async function fetchAndDisplayPublicMovies() {
    // Guard against elements not being found (should be assigned in checkAuthStatusIndexPage)
    if (!publicMoviesMessage || !publicMovieListDiv) {
        console.error("Public movie display elements not found on index.html.");
        return;
    }

    publicMoviesMessage.style.display = 'none'; // Hide any previous messages
    publicMovieListDiv.innerHTML = ''; // Clear existing movie cards

    try {
        const response = await fetch(`${App.API_BASE}/api/public/movies/trending`); // Use App.API_BASE
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Unknown error from server.' }));
            throw new Error(`Failed to fetch trending movies: ${errorData.message || response.statusText}`);
        }
        const movies = await response.json();

        if (movies.length === 0) {
            publicMovieListDiv.innerHTML = '<p class="no-movies-message">No trending movies found at this time.</p>';
            return;
        }

        // Check if user is logged in using the common App helper
        const isLoggedIn = !!App.getAuthToken(); // Use App.getAuthToken

        movies.forEach(movie => {
            const movieCard = document.createElement('div');
            movieCard.className = 'movie-card';
            const imageUrl = movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : 'https://via.placeholder.com/500x750?text=No+Poster';

            // Extract year safely from release_date
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

        // Attach event listeners for the new "Add to My Collection" buttons if user is logged in
        if (isLoggedIn) {
            document.querySelectorAll('.add-to-collection-btn').forEach(button => {
                button.addEventListener('click', handleAddToCollection);
            });
        }

    } catch (error) {
        console.error('Error fetching public movies:', error);
        App.displayMessage(publicMoviesMessage, `Failed to load trending movies: ${error.message}`, 'error'); // Use App.displayMessage
    }
}

// --- Function to Fetch and Display Private Movies (GET) ---
async function fetchAndDisplayMovies() {
    // Guard against elements not being found
    if (!listMessage || !movieListDiv || !searchInput || !sortBySelect || !sortOrderSelect) {
        console.error("Private movie list elements not found on index.html.");
        return;
    }

    listMessage.style.display = 'none'; // Hide previous messages
    movieListDiv.innerHTML = ''; // Clear existing movie cards

    try {
        const searchTerm = searchInput.value.trim();
        const sortBy = sortBySelect.value;
        const sortOrder = sortOrderSelect.value;

        let url = `${App.API_BASE}/movies`; // Use App.API_BASE
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

        const token = App.getAuthToken(); // Use App.getAuthToken
        const headers = {};
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(url, { headers });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Unknown error from server.' }));
            if (response.status === 401 && token) {
                App.handleLogout(); // Use App.handleLogout (redirects to index.html)
                App.displayMessage(listMessage, 'Session expired. Please log in again.', 'error'); // Use App.displayMessage
                return;
            }
            throw new Error(`Failed to fetch movies: ${errorData.message || response.statusText}`);
        }
        const movies = await response.json();

        if (movies.length === 0) {
            movieListDiv.innerHTML = '<p class="no-movies-message">No movies found in your collection. Try adding a new movie!</p>';
            return;
        }

        const userRole = localStorage.getItem('loggedInUserRole'); // This is fine as it's directly from localStorage

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
        App.displayMessage(listMessage, `Failed to load movies: ${error.message}`, 'error'); // Use App.displayMessage
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

    let url = `${App.API_BASE}/movies`; // Use App.API_BASE
    let method = 'POST';

    if (id) {
        url = `${App.API_BASE}/movies/${id}`; // Use App.API_BASE
        method = 'PUT';
    }

    const token = App.getAuthToken(); // Use App.getAuthToken
    if (!token) {
        App.displayMessage(formMessage, 'You must be logged in to add/update movies.', 'error'); // Use App.displayMessage
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
                App.handleLogout(); // Use App.handleLogout
                App.displayMessage(formMessage, 'Session expired or invalid. Please log in again.', 'error'); // Use App.displayMessage
                return;
            }
            if (response.status === 403) {
                App.displayMessage(formMessage, data.message || 'You do not have permission to perform this action.', 'error'); // Use App.displayMessage
                return;
            }

            let errorMessage = data.message || 'An error occurred.';
            if (data && data.errors && data.errors.length > 0) {
                const validationErrors = data.errors.map(err => err.msg || (typeof err === 'object' ? Object.values(err)[0] : 'Validation error')).join('\n- ');
                errorMessage += `\n\nValidation Errors:\n- ${validationErrors}`;
            }
            App.displayMessage(formMessage, errorMessage, 'error'); // Use App.displayMessage
        } else {
            App.displayMessage(formMessage, id ? 'Movie updated successfully!' : 'Movie added successfully!', 'success'); // Use App.displayMessage
            movieForm.reset();
            movieIdInput.value = '';
            submitButton.textContent = 'Add Movie';
            fetchAndDisplayMovies(); // Refresh the movie list
        }

    } catch (error) {
        console.error('Error adding/updating movie:', error);
        App.displayMessage(formMessage, 'An unexpected error occurred. Please check your network.', 'error'); // Use App.displayMessage
    }
}

// --- Function to Handle Edit Button Click ---
async function handleEdit(event) {
    const id = event.target.dataset.id;
    if (!formMessage) return;

    formMessage.style.display = 'none';

    try {
        const response = await fetch(`${App.API_BASE}/movies/${id}`); // Use App.API_BASE
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
        App.displayMessage(formMessage, error.message, 'error'); // Use App.displayMessage
    }
}

// --- Function to Handle Delete Button Click ---
async function handleDelete(event) {
    const id = event.target.dataset.id;
    if (!listMessage) return;

    listMessage.style.display = 'none';

    // IMPORTANT: Replace confirm() with a custom modal for better UX and consistency
    if (!confirm('Are you sure you want to delete this movie?')) {
        return;
    }

    const token = App.getAuthToken(); // Use App.getAuthToken
    if (!token) {
        App.displayMessage(listMessage, 'You must be logged in to delete movies.', 'error'); // Use App.displayMessage
        window.location.href = 'auth.html?form=login';
        return;
    }

    try {
        const response = await fetch(`${App.API_BASE}/movies/${id}`, { // Use App.API_BASE
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            if (response.status === 401) {
                App.handleLogout(); // Use App.handleLogout
                App.displayMessage(listMessage, 'Session expired or invalid. Please log in again.', 'error'); // Use App.displayMessage
                return;
            }
            if (response.status === 403) {
                App.displayMessage(listMessage, data.message || 'You do not have permission to perform this action.', 'error'); // Use App.displayMessage
                return;
            }

            let errorMessage = data.message || 'An error occurred during deletion.';
            App.displayMessage(listMessage, errorMessage, 'error'); // Use App.displayMessage
        } else {
            App.displayMessage(listMessage, 'Movie deleted successfully!', 'success'); // Use App.displayMessage
            fetchAndDisplayMovies(); // Refresh the movie list
        }

    } catch (error) {
        console.error('Error deleting movie:', error);
        App.displayMessage(listMessage, 'An unexpected error occurred during deletion. Please check your network.', 'error'); // Use App.displayMessage
    } finally {
        // Re-enable button if it's not "Added!" (if you add an 'Added!' state for delete)
        // For delete, usually the card is removed, so no re-enable needed.
    }
}

// --- Function to Handle Adding a Public Movie to User's Collection ---
// This function was added in a previous step, ensuring it uses App. helpers
async function handleAddToCollection(event) {
    const button = event.target;
    // Disable button to prevent multiple clicks
    button.disabled = true;
    button.textContent = 'Adding...';

    const title = button.dataset.title;
    const director = button.dataset.director; // This will likely be "Unknown" for TMDB trending
    const year = parseInt(button.dataset.year, 10);

    if (!title || !director || isNaN(year)) {
        App.displayMessage(publicMoviesMessage, 'Error: Missing movie data to add.', 'error'); // Use App.displayMessage
        button.disabled = false;
        button.textContent = 'Add to My Collection';
        return;
    }

    const token = App.getAuthToken(); // Use App.getAuthToken
    if (!token) {
        App.displayMessage(publicMoviesMessage, 'You must be logged in to add movies.', 'error'); // Use App.displayMessage
        button.disabled = false;
        button.textContent = 'Add to My Collection';
        window.location.href = 'auth.html?form=login';
        return;
    }

    try {
        const response = await fetch(`${App.API_BASE}/movies/add-from-public`, { // Use App.API_BASE
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
                App.handleLogout(); // Use App.handleLogout
                App.displayMessage(publicMoviesMessage, 'Session expired. Please log in again.', 'error'); // Use App.displayMessage
                return;
            }
            App.displayMessage(publicMoviesMessage, data.message || 'Failed to add movie to collection.', 'error'); // Use App.displayMessage
        } else {
            App.displayMessage(publicMoviesMessage, data.message, 'success'); // Use App.displayMessage
            button.textContent = 'Added!';
            button.style.backgroundColor = '#28a745'; // Green for added
            button.style.cursor = 'default';

            // If on index.html and logged in, refresh private movie list
            if (movieListingSection && movieListingSection.style.display === 'block') {
                fetchAndDisplayMovies();
            }
        }
    } catch (error) {
        console.error('Error adding movie to collection:', error);
        App.displayMessage(publicMoviesMessage, 'An unexpected error occurred while adding movie.', 'error'); // Use App.displayMessage
    } finally {
        if (button.textContent !== 'Added!') {
             button.disabled = false;
             button.textContent = 'Add to My Collection';
        }
    }
}

// --- Function to check authentication status and update index.html UI ---
// This function assigns DOM elements and controls section visibility.
function checkAuthStatusIndexPage() {
    // Assign UI elements specific to index.html once DOM is ready
    // These assignments MUST happen after DOMContentLoaded
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

    const token = App.getAuthToken(); // Use App.getAuthToken
    const username = localStorage.getItem('loggedInUsername');
    const role = localStorage.getItem('loggedInUserRole');

    // Control section visibility based on login status
    if (token && username && role) {
        // User is logged in on index.html
        if (publicMoviesSection) publicMoviesSection.style.display = 'none'; // Hide public movies
        if (movieListingSection) movieListingSection.style.display = 'block'; // Show user's movie list

        if (role === 'admin' || role === 'super_admin') {
            if (movieManagementSection) movieManagementSection.style.display = 'block'; // Show add/edit form for admins
        } else {
            if (movieManagementSection) movieManagementSection.style.display = 'none'; // Hide for regular users
        }
        fetchAndDisplayMovies(); // Fetch user's private movies
    } else {
        // User is not logged in on index.html
        if (publicMoviesSection) publicMoviesSection.style.display = 'block'; // Show public trending movies
        if (movieManagementSection) movieManagementSection.style.display = 'none';
        if (movieListingSection) movieListingSection.style.display = 'none';
        fetchAndDisplayPublicMovies(); // Fetch public movies when logged out
    }
}


// --- Initial setup on index.html load ---
document.addEventListener('DOMContentLoaded', () => {
    // Call the page-specific auth status check to assign elements and set initial visibility
    checkAuthStatusIndexPage();

    // Add event listeners specific to index.html after elements are assigned
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