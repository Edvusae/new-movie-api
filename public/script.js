// public/script.js

const API_BASE = 'http://localhost:3000'; // Make sure this matches your backend port

// --- Global UI Elements ---
const authFormsSection = document.getElementById('authForms');
const movieManagementSection = document.getElementById('movieManagementSection');
const movieListingSection = document.getElementById('movieListingSection');
const publicMoviesSection = document.getElementById('publicMoviesSection');
const publicMovieListDiv = document.getElementById('publicMovieList');
const publicMoviesMessage = document.getElementById('publicMoviesMessage');

const authFormTitle = document.getElementById('authFormTitle');
const registerForm = document.getElementById('registerForm');
const loginForm = document.getElementById('loginForm');
const authMessage = document.getElementById('authMessage');

const registerUsernameInput = document.getElementById('registerUsername');
const registerEmailInput = document.getElementById('registerEmail');
const registerPasswordInput = document.getElementById('registerPassword');

const loginEmailInput = document.getElementById('loginEmail');
const loginPasswordInput = document.getElementById('loginPassword');

const switchToLoginLink = document.getElementById('switchToLogin');
const switchToRegisterLink = document.getElementById('switchToRegister');

const showRegisterFormBtn = document.getElementById('showRegisterFormBtn');
const showLoginFormBtn = document.getElementById('showLoginFormBtn');
const logoutBtn = document.getElementById('logoutBtn');
const loggedInUserSpan = document.getElementById('loggedInUser');

// --- Movie Management UI Elements ---
const movieForm = document.getElementById('movieForm');
const movieIdInput = document.getElementById('movieId');
const titleInput = document.getElementById('title');
const directorInput = document.getElementById('director');
const yearInput = document.getElementById('year');
const submitButton = document.getElementById('submitButton');
const movieListDiv = document.getElementById('movieList');
const formMessage = document.getElementById('formMessage'); // For movie form messages
const listMessage = document.getElementById('listMessage'); // For movie list messages

// --- Search Elements ---
const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');
const clearSearchButton = document.getElementById('clearSearchButton');

// --- Sort Elements ---
const sortBySelect = document.getElementById('sortBy');
const sortOrderSelect = document.getElementById('sortOrder');
const applySortButton = document.getElementById('applySortButton');

// --- Helper for UI Messages ---
function displayMessage(element, message, type) {
    element.textContent = message;
    element.className = `message ${type}`;
    element.style.display = 'block';
    // Clear message after 5 seconds
    setTimeout(() => {
        element.style.display = 'none';
        element.textContent = '';
        element.className = 'message';
    }, 5000);
}

// --- Helper to get JWT from Local Storage ---
function getAuthToken() {
    return localStorage.getItem('jwtToken');
}

// --- Helper to set JWT to Local Storage ---
function setAuthToken(token) {
    localStorage.setItem('jwtToken', token);
}

// --- Helper to remove JWT from Local Storage ---
function removeAuthToken() {
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('loggedInUsername');
    localStorage.removeItem('loggedInUserRole');
}

// --- Helper to parse JWT ---
function parseJwt(token) {
    try {
        return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
        console.error("Error parsing JWT:", e);
        return null;
    }
}

// --- Function to toggle between login and register forms ---
function showAuthForm(formType) {
    // Ensure the entire authFormsSection is visible when a form is explicitly requested
    authFormsSection.style.display = 'block';

    registerForm.classList.remove('active-form');
    loginForm.classList.remove('active-form');

    if (formType === 'register') {
        registerForm.classList.add('active-form');
        authFormTitle.textContent = 'Register';
    } else {
        loginForm.classList.add('active-form');
        authFormTitle.textContent = 'Login';
    }
    authMessage.style.display = 'none'; // Clear any previous auth messages when switching forms
}

// --- Function to Fetch and Display Public Movies from TMDB Proxy ---
async function fetchAndDisplayPublicMovies() {
    publicMoviesMessage.style.display = 'none'; // Clear any previous messages
    publicMovieListDiv.innerHTML = ''; // Clear existing list

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
            const imageUrl = movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : 'https://via.placeholder.com/500x750?text=No+Poster'; // Added full TMDB image path
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

// --- Function to Fetch and Display Movies (GET) (private collection) ---
async function fetchAndDisplayMovies() {
    listMessage.style.display = 'none'; // Clear previous messages for the private list

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

        const token = getAuthToken();
        const headers = {};
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(url, { headers });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Unknown error from server.' }));
            if (response.status === 401 && token) {
                // If token exists but is invalid/expired, log out
                handleLogout();
                displayMessage(listMessage, 'Session expired. Please log in again.', 'error');
                return;
            }
            throw new Error(`Failed to fetch movies: ${errorData.message || response.statusText}`);
        }
        const movies = await response.json();

        movieListDiv.innerHTML = ''; // Clear private movie list
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

// --- Function to check authentication status and update UI ---
// This function is called on page load and after login/logout actions
// It determines whether to show the auth forms or the movie management section
function checkAuthStatus() {
    const token = getAuthToken();
    const username = localStorage.getItem('loggedInUsername');
    const role = localStorage.getItem('loggedInUserRole');

    if (token && username && role) {
        // User is logged in
        authFormsSection.style.display = 'none'; // Hide auth forms
        publicMoviesSection.style.display = 'none'; // Hide public movies
        movieListingSection.style.display = 'block'; // Show user's movie list

        showRegisterFormBtn.style.display = 'none';
        showLoginFormBtn.style.display = 'none';
        logoutBtn.style.display = 'inline-block';
        loggedInUserSpan.textContent = `Logged in as: ${username} (${role})`;
        loggedInUserSpan.style.display = 'inline-block';

        fetchAndDisplayMovies(); // Fetch user's private movies

        // --- Role-based UI adjustments ---
        if (role === 'admin' || role === 'super_admin') {
            movieManagementSection.style.display = 'block'; // Show add/edit form for admins
        } else {
            movieManagementSection.style.display = 'none'; // Hide for regular users
        }

    } else {
        // User is not logged in
        authFormsSection.style.display = 'none'; // Keep hidden initially (will be shown by showAuthForm if clicked)
        publicMoviesSection.style.display = 'block'; // Show public trending movies
        movieManagementSection.style.display = 'none';
        movieListingSection.style.display = 'none';

        showRegisterFormBtn.style.display = 'inline-block';
        showLoginFormBtn.style.display = 'inline-block';
        logoutBtn.style.display = 'none';
        loggedInUserSpan.style.display = 'none';
        loggedInUserSpan.textContent = '';

        fetchAndDisplayPublicMovies(); // Fetch public movies when logged out
    }
}


// --- Handle User Registration ---
async function handleRegister(event) {
    event.preventDefault();
    formMessage.style.display = 'none'; // Clear message from movie form if visible
    authMessage.style.display = 'none'; // Clear previous auth messages

    const username = registerUsernameInput.value.trim();
    const email = registerEmailInput.value.trim();
    const password = registerPasswordInput.value;

    try {
        const response = await fetch(`${API_BASE}/api/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            const errorMessage = data.errors ? data.errors.map(err => err.msg).join('\n') : data.message || 'Registration failed.';
            displayMessage(authMessage, errorMessage, 'error');
        } else {
            displayMessage(authMessage, data.message, 'success');
            registerForm.reset();
            showAuthForm('login'); // Switch to login form after successful registration
        }
    } catch (error) {
        console.error('Error during registration:', error);
        displayMessage(authMessage, 'An error occurred during registration. Please try again later.', 'error');
    }
}

// --- Handle User Login ---
async function handleLogin(event) {
    event.preventDefault();
    formMessage.style.display = 'none'; // Clear message from movie form if visible
    authMessage.style.display = 'none'; // Clear previous auth messages

    const email = loginEmailInput.value.trim();
    const password = loginPasswordInput.value;

    try {
        const response = await fetch(`${API_BASE}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            displayMessage(authMessage, data.message || 'Login failed. Invalid credentials.', 'error');
        } else {
            setAuthToken(data.token);
            const decodedPayload = parseJwt(data.token);
            if (decodedPayload && decodedPayload.user) {
                localStorage.setItem('loggedInUsername', decodedPayload.user.username);
                localStorage.setItem('loggedInUserRole', decodedPayload.user.role);
            }

            displayMessage(authMessage, data.message, 'success');
            loginForm.reset();
            checkAuthStatus(); // Update UI after successful login
        }
    } catch (error) {
        console.error('Error during login:', error);
        displayMessage(authMessage, 'An error occurred during login. Please try again later.', 'error');
    }
}

// --- Handle Logout ---
function handleLogout() {
    removeAuthToken();
    displayMessage(authMessage, 'You have been logged out.', 'info');
    checkAuthStatus(); // Update UI to show unauthenticated view
}

// --- Function to Add or Update a Movie (POST / PUT) ---
async function handleAddMovie(event) {
    event.preventDefault();
    formMessage.style.display = 'none'; // Clear any previous messages on the movie form

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
        checkAuthStatus(); // Re-check auth status to show login if token is missing
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
                handleLogout(); // Log out if token is invalid/expired
                displayMessage(formMessage, 'Session expired or invalid. Please log in again.', 'error');
                return;
            }
            if (response.status === 403) {
                displayMessage(formMessage, data.message || 'You do not have permission to perform this action.', 'error');
                return;
            }

            let errorMessage = data.message || 'An error occurred.';
            if (data && data.errors && data.errors.length > 0) {
                // Assuming validation errors come as { field: "message" } or similar
                const validationErrors = data.errors.map(err => err.msg || (typeof err === 'object' ? Object.values(err)[0] : 'Validation error')).join('\n- ');
                errorMessage += `\n\nValidation Errors:\n- ${validationErrors}`;
            }
            displayMessage(formMessage, errorMessage, 'error');
        } else {
            displayMessage(formMessage, id ? 'Movie updated successfully!' : 'Movie added successfully!', 'success');
            movieForm.reset();
            movieIdInput.value = '';
            submitButton.textContent = 'Add Movie';
            fetchAndDisplayMovies(); // Refresh the movie list
        }

    } catch (error) {
        console.error('Error adding/updating movie:', error);
        displayMessage(formMessage, 'An unexpected error occurred. Please check your network.', 'error');
    }
}

// --- Function to Handle Edit Button Click ---
async function handleEdit(event) {
    const id = event.target.dataset.id;
    formMessage.style.display = 'none'; // Clear messages

    try {
        const response = await fetch(`${API_BASE}/movies/${id}`); // Assuming public read access or that auth is handled on server for specific user's movie
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
    listMessage.style.display = 'none'; // Clear messages

    if (!confirm('Are you sure you want to delete this movie?')) {
        return;
    }

    const token = getAuthToken();
    if (!token) {
        displayMessage(listMessage, 'You must be logged in to delete movies.', 'error');
        checkAuthStatus();
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
            fetchAndDisplayMovies(); // Refresh the movie list
        }

    } catch (error) {
        console.error('Error deleting movie:', error);
        displayMessage(listMessage, 'An unexpected error occurred during deletion. Please check your network.', 'error');
    }
}


// --- Initial setup on page load ---
document.addEventListener('DOMContentLoaded', () => {
    checkAuthStatus(); // Check auth status and update UI on page load

    // Auth Form Event Listeners
    registerForm.addEventListener('submit', handleRegister);
    loginForm.addEventListener('submit', handleLogin);
    switchToLoginLink.addEventListener('click', (e) => {
        e.preventDefault();
        showAuthForm('login');
    });
    switchToRegisterLink.addEventListener('click', (e) => {
        e.preventDefault();
        showAuthForm('register');
    });
    showRegisterFormBtn.addEventListener('click', () => showAuthForm('register'));
    showLoginFormBtn.addEventListener('click', () => showAuthForm('login'));
    logoutBtn.addEventListener('click', handleLogout);

    // Movie Form Event Listener
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
});