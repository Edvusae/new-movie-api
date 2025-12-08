// public/js/netflix-app.js - Main Application Logic

// ==================== DOM ELEMENTS ====================
let authModal, addMovieModal;
let loginForm, registerForm, loginFormElement, registerFormElement;
let loginMessage, registerMessage, addMovieMessage;
let heroSection, trendingSection, dashboardSection;
let trendingMovies, myMovies, emptyState;
let loginBtn, registerBtn, logoutBtn, userDisplay;
let searchInput, searchBtn, sortBy, sortOrder, applySortBtn;
let totalMoviesCount, recentlyAddedCount;
let addMovieBtn, addMovieFormElement;

// ==================== INITIALIZE APP ====================
document.addEventListener('DOMContentLoaded', () => {
    initializeElements();
    setupEventListeners();
    checkAuthAndRender();
    setupScrollEffects();
});

// ==================== INITIALIZE DOM ELEMENTS ====================
function initializeElements() {
    // Modals
    authModal = document.getElementById('authModal');
    addMovieModal = document.getElementById('addMovieModal');
    
    // Forms
    loginForm = document.getElementById('loginForm');
    registerForm = document.getElementById('registerForm');
    loginFormElement = document.getElementById('loginFormElement');
    registerFormElement = document.getElementById('registerFormElement');
    addMovieFormElement = document.getElementById('addMovieFormElement');
    
    // Messages
    loginMessage = document.getElementById('loginMessage');
    registerMessage = document.getElementById('registerMessage');
    addMovieMessage = document.getElementById('addMovieMessage');
    
    // Sections
    heroSection = document.getElementById('heroSection');
    trendingSection = document.getElementById('trendingSection');
    dashboardSection = document.getElementById('dashboardSection');
    
    // Content areas
    trendingMovies = document.getElementById('trendingMovies');
    myMovies = document.getElementById('myMovies');
    emptyState = document.getElementById('emptyState');
    
    // Buttons
    loginBtn = document.getElementById('loginBtn');
    registerBtn = document.getElementById('registerBtn');
    logoutBtn = document.getElementById('logoutBtn');
    addMovieBtn = document.getElementById('addMovieBtn');
    
    // User display
    userDisplay = document.getElementById('userDisplay');
    
    // Search/Filter
    searchInput = document.getElementById('searchInput');
    searchBtn = document.getElementById('searchBtn');
    sortBy = document.getElementById('sortBy');
    sortOrder = document.getElementById('sortOrder');
    applySortBtn = document.getElementById('applySortButton');
    
    // Stats
    totalMoviesCount = document.getElementById('totalMovies');
    recentlyAddedCount = document.getElementById('recentlyAdded');
}

// ==================== EVENT LISTENERS ====================
function setupEventListeners() {
    // Auth buttons
    loginBtn?.addEventListener('click', () => openAuthModal('login'));
    registerBtn?.addEventListener('click', () => openAuthModal('register'));
    document.getElementById('heroGetStartedBtn')?.addEventListener('click', () => openAuthModal('register'));
    logoutBtn?.addEventListener('click', handleLogout);
    
    // Modal controls
    document.getElementById('closeModal')?.addEventListener('click', closeAuthModal);
    document.getElementById('closeAddMovieModal')?.addEventListener('click', closeAddMovieModal);
    document.querySelector('.modal-overlay')?.addEventListener('click', closeAuthModal);
    
    // Form toggles
    document.getElementById('showRegisterLink')?.addEventListener('click', (e) => {
        e.preventDefault();
        toggleAuthForm('register');
    });
    document.getElementById('showLoginLink')?.addEventListener('click', (e) => {
        e.preventDefault();
        toggleAuthForm('login');
    });
    
    // Form submissions
    loginFormElement?.addEventListener('submit', handleLogin);
    registerFormElement?.addEventListener('submit', handleRegister);
    addMovieFormElement?.addEventListener('submit', handleAddMovie);
    
    // Search and filters
    searchBtn?.addEventListener('click', fetchUserMovies);
    searchInput?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') fetchUserMovies();
    });
    applySortBtn?.addEventListener('click', fetchUserMovies);
    
    // Add movie button
    addMovieBtn?.addEventListener('click', openAddMovieModal);
}

// ==================== AUTH MODAL MANAGEMENT ====================
function openAuthModal(type) {
    if (authModal) {
        authModal.classList.add('active');
        toggleAuthForm(type);
    }
}

function closeAuthModal() {
    if (authModal) {
        authModal.classList.remove('active');
    }
}

function toggleAuthForm(type) {
    if (type === 'login') {
        loginForm.style.display = 'block';
        registerForm.style.display = 'none';
    } else {
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
    }
}

function openAddMovieModal() {
    if (addMovieModal) {
        addMovieModal.classList.add('active');
        document.getElementById('movieId').value = '';
        document.getElementById('submitMovieBtn').textContent = 'Add Movie';
    }
}

function closeAddMovieModal() {
    if (addMovieModal) {
        addMovieModal.classList.remove('active');
        addMovieFormElement?.reset();
    }
}

// ==================== AUTHENTICATION ====================
async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    try {
        showMessage(loginMessage, 'Signing in...', 'info');
        
        const response = await fetch(`${App.API_BASE}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            showMessage(loginMessage, data.message || 'Login failed', 'error');
            return;
        }
        
        // Store auth data
        App.setAuthToken(data.token);
        const decoded = App.parseJwt(data.token);
        if (decoded?.user) {
            localStorage.setItem('loggedInUsername', decoded.user.username);
            localStorage.setItem('loggedInUserEmail', decoded.user.email || email);
            localStorage.setItem('loggedInUserRole', decoded.user.role);
        }
        
        showMessage(loginMessage, 'Login successful!', 'success');
        setTimeout(() => {
            closeAuthModal();
            checkAuthAndRender();
        }, 1000);
        
    } catch (error) {
        console.error('Login error:', error);
        showMessage(loginMessage, 'Network error. Please try again.', 'error');
    }
}

async function handleRegister(e) {
    e.preventDefault();
    const username = document.getElementById('registerUsername').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    
    try {
        showMessage(registerMessage, 'Creating account...', 'info');
        
        const response = await fetch(`${App.API_BASE}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            const errorMsg = data.errors ? data.errors.map(e => e.msg).join(', ') : data.message;
            showMessage(registerMessage, errorMsg, 'error');
            return;
        }
        
        showMessage(registerMessage, 'Account created! Please sign in.', 'success');
        setTimeout(() => {
            registerFormElement.reset();
            toggleAuthForm('login');
        }, 1500);
        
    } catch (error) {
        console.error('Register error:', error);
        showMessage(registerMessage, 'Network error. Please try again.', 'error');
    }
}

function handleLogout() {
    App.removeAuthToken();
    checkAuthAndRender();
}

// ==================== RENDER LOGIC ====================
function checkAuthAndRender() {
    const token = App.getAuthToken();
    const username = localStorage.getItem('loggedInUsername');
    const role = localStorage.getItem('loggedInUserRole');
    
    if (token && username) {
        // User is logged in
        showLoggedInUI(username, role);
        fetchUserMovies();
        fetchTrendingMovies(); // Still show trending for adding more
    } else {
        // User is logged out
        showLoggedOutUI();
        fetchTrendingMovies();
    }
}

function showLoggedInUI(username, role) {
    // Hide logged-out UI
    loginBtn.style.display = 'none';
    registerBtn.style.display = 'none';
    heroSection.style.display = 'none';
    
    // Show logged-in UI
    logoutBtn.style.display = 'block';
    userDisplay.textContent = `${username} (${role})`;
    userDisplay.style.display = 'block';
    dashboardSection.style.display = 'block';
    trendingSection.style.display = 'block';
    
    // Show add movie button for admins
    if (role === 'admin' || role === 'super_admin') {
        addMovieBtn.style.display = 'inline-block';
    }
}

function showLoggedOutUI() {
    // Show logged-out UI
    loginBtn.style.display = 'block';
    registerBtn.style.display = 'block';
    heroSection.style.display = 'flex';
    trendingSection.style.display = 'block';
    
    // Hide logged-in UI
    logoutBtn.style.display = 'none';
    userDisplay.style.display = 'none';
    dashboardSection.style.display = 'none';
    addMovieBtn.style.display = 'none';
}

// ==================== FETCH USER MOVIES ====================
async function fetchUserMovies() {
    const token = App.getAuthToken();
    if (!token) return;
    
    try {
        myMovies.innerHTML = '<div class="spinner"></div>';
        
        const searchTerm = searchInput?.value || '';
        const sortField = sortBy?.value || '';
        const sortDir = sortOrder?.value || 'asc';
        
        let url = `${App.API_BASE}/movies?`;
        if (searchTerm) url += `search=${encodeURIComponent(searchTerm)}&`;
        if (sortField) url += `sort=${sortField}&order=${sortDir}`;
        
        const response = await fetch(url, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!response.ok) {
            if (response.status === 401) {
                handleLogout();
                return;
            }
            throw new Error('Failed to fetch movies');
        }
        
        const movies = await response.json();
        renderUserMovies(movies);
        updateStats(movies);
        
    } catch (error) {
        console.error('Error fetching user movies:', error);
        myMovies.innerHTML = '<p class="error-message">Failed to load your collection.</p>';
    }
}

function renderUserMovies(movies) {
    if (movies.length === 0) {
        myMovies.innerHTML = '';
        emptyState.style.display = 'block';
        return;
    }
    
    emptyState.style.display = 'none';
    const role = localStorage.getItem('loggedInUserRole');
    
    myMovies.innerHTML = movies.map(movie => `
        <div class="movie-card">
            <div class="movie-poster skeleton-card" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center; color: white; font-size: 48px;">
                🎬
            </div>
            <div class="movie-info">
                <h3 class="movie-title">${movie.title}</h3>
                <p class="movie-meta">Director: ${movie.director}</p>
                <p class="movie-meta">Year: ${movie.year}</p>
                <div class="movie-actions">
                    ${role === 'admin' || role === 'super_admin' ? `
                        <button class="btn-edit" onclick="editMovie('${movie._id}')">Edit</button>
                    ` : ''}
                    ${role === 'super_admin' ? `
                        <button class="btn-delete" onclick="deleteMovie('${movie._id}')">Delete</button>
                    ` : ''}
                </div>
            </div>
        </div>
    `).join('');
}

function updateStats(movies) {
    totalMoviesCount.textContent = movies.length;
    
    // Calculate recently added (last 7 days)
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const recentCount = movies.filter(m => new Date(m.dateAdded) > oneWeekAgo).length;
    recentlyAddedCount.textContent = recentCount;
}

// ==================== FETCH TRENDING MOVIES ====================
async function fetchTrendingMovies() {
    try {
        trendingMovies.innerHTML = '<div class="spinner"></div>';
        
        const response = await fetch(`${App.API_BASE}/api/public/movies/trending`);
        if (!response.ok) throw new Error('Failed to fetch trending movies');
        
        const movies = await response.json();
        renderTrendingMovies(movies);
        
    } catch (error) {
        console.error('Error fetching trending movies:', error);
        trendingMovies.innerHTML = '<p class="error-message">Failed to load trending movies.</p>';
    }
}

function renderTrendingMovies(movies) {
    const isLoggedIn = !!App.getAuthToken();
    
    trendingMovies.innerHTML = movies.slice(0, 12).map(movie => {
        const posterUrl = movie.poster_path 
            ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
            : 'https://via.placeholder.com/500x750?text=No+Poster';
        
        const year = movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A';
        
        return `
            <div class="movie-card">
                <img src="${posterUrl}" alt="${movie.title}" class="movie-poster">
                <div class="movie-info">
                    <h3 class="movie-title">${movie.title}</h3>
                    <p class="movie-meta">Release: ${movie.release_date || 'N/A'}</p>
                    <p class="movie-meta">Rating: ${movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'}/10</p>
                    ${isLoggedIn ? `
                        <div class="movie-actions">
                            <button class="btn-add" onclick="addToCollection('${movie.title}', '${year}')">
                                + Add to Collection
                            </button>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }).join('');
}

// ==================== ADD TO COLLECTION ====================
window.addToCollection = async function(title, year) {
    const token = App.getAuthToken();
    if (!token) {
        openAuthModal('login');
        return;
    }
    
    try {
        const response = await fetch(`${App.API_BASE}/movies/add-from-public`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                title: title,
                director: 'Unknown',
                year: parseInt(year)
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            alert('Movie added to your collection!');
            fetchUserMovies(); // Refresh collection
        } else {
            alert(data.message || 'Failed to add movie');
        }
    } catch (error) {
        console.error('Error adding movie:', error);
        alert('Failed to add movie to collection');
    }
};

// ==================== EDIT/DELETE MOVIES ====================
window.editMovie = function(id) {
    // TODO: Implement edit functionality
    alert('Edit functionality coming soon!');
};

window.deleteMovie = async function(id) {
    if (!confirm('Are you sure you want to delete this movie?')) return;
    
    const token = App.getAuthToken();
    try {
        const response = await fetch(`${App.API_BASE}/movies/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
            alert('Movie deleted successfully!');
            fetchUserMovies();
        } else {
            alert('Failed to delete movie');
        }
    } catch (error) {
        console.error('Error deleting movie:', error);
        alert('Failed to delete movie');
    }
};

// ==================== ADD MOVIE (ADMIN) ====================
async function handleAddMovie(e) {
    e.preventDefault();
    const token = App.getAuthToken();
    
    const movieData = {
        title: document.getElementById('movieTitle').value,
        director: document.getElementById('movieDirector').value,
        year: parseInt(document.getElementById('movieYear').value)
    };
    
    try {
        const response = await fetch(`${App.API_BASE}/movies`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(movieData)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showMessage(addMovieMessage, 'Movie added successfully!', 'success');
            setTimeout(() => {
                closeAddMovieModal();
                fetchUserMovies();
            }, 1000);
        } else {
            showMessage(addMovieMessage, data.message || 'Failed to add movie', 'error');
        }
    } catch (error) {
        console.error('Error adding movie:', error);
        showMessage(addMovieMessage, 'Network error', 'error');
    }
}

// ==================== SCROLL EFFECTS ====================
function setupScrollEffects() {
    const header = document.querySelector('.main-header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
}

// ==================== HELPER FUNCTIONS ====================
function showMessage(element, message, type) {
    if (!element) return;
    element.textContent = message;
    element.className = `form-message ${type}`;
    element.style.display = 'block';
    
    setTimeout(() => {
        element.style.display = 'none';
    }, 5000);
}

