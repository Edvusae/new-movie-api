// public/js/common.js

// Initialize a global application namespace if it doesn't exist
// This object will hold all common functions and variables
window.App = window.App || {};

// --- API Base URL ---
window.App.API_BASE = 'http://localhost:3000'; // Expose API_BASE via App namespace

// --- Helper for UI Messages (reusable) ---
window.App.displayMessage = function(element, message, type) {
    if (!element) return;
    element.textContent = message;
    element.className = `message ${type}`;
    element.style.display = 'block';
    setTimeout(() => {
        if (element) {
            element.style.display = 'none';
            element.textContent = '';
            element.className = 'message';
        }
    }, 5000);
};

// --- Helper to get JWT from Local Storage (reusable) ---
window.App.getAuthToken = function() {
    return localStorage.getItem('jwtToken');
};

// --- Helper to set JWT to Local Storage (reusable) ---
window.App.setAuthToken = function(token) {
    localStorage.setItem('jwtToken', token);
};

// --- Helper to remove JWT from Local Storage (reusable) ---
window.App.removeAuthToken = function() {
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('loggedInUsername');
    localStorage.removeItem('loggedInUserRole');
};

// --- Helper to parse JWT (reusable) ---
window.App.parseJwt = function(token) {
    try {
        return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
        console.error("Error parsing JWT:", e);
        return null;
    }
};

// --- Function to handle user logout (reusable) ---
window.App.handleLogout = function() {
    window.App.removeAuthToken(); // Use App.removeAuthToken
    window.location.href = 'index.html'; // Always redirect to home page after logout
};

// --- Function to check authentication status and update GLOBAL UI (header) ---
window.App.checkAuthStatusHeader = function() {
    // Global header UI elements
    const showRegisterFormBtn = document.getElementById('showRegisterFormBtn');
    const showLoginFormBtn = document.getElementById('showLoginFormBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const loggedInUserSpan = document.getElementById('loggedInUser');

    const token = window.App.getAuthToken(); // Use App.getAuthToken
    const username = localStorage.getItem('loggedInUsername');
    const role = localStorage.getItem('loggedInUserRole');

    if (token && username && role) {
        if (showRegisterFormBtn) showRegisterFormBtn.style.display = 'none';
        if (showLoginFormBtn) showLoginFormBtn.style.display = 'none';
        if (logoutBtn) logoutBtn.style.display = 'inline-block';
        if (loggedInUserSpan) {
            loggedInUserSpan.textContent = `Logged in as: ${username} (${role})`;
            loggedInUserSpan.style.display = 'inline-block';
        }
    } else {
        if (showRegisterFormBtn) showRegisterFormBtn.style.display = 'inline-block';
        if (showLoginFormBtn) showLoginFormBtn.style.display = 'inline-block';
        if (logoutBtn) logoutBtn.style.display = 'none';
        if (loggedInUserSpan) {
            loggedInUserSpan.style.display = 'none';
            loggedInUserSpan.textContent = '';
        }
    }
};

// Attach event listeners for common elements on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    window.App.checkAuthStatusHeader(); // Call via App namespace

    const logoutBtn = document.getElementById('logoutBtn'); // Re-select here to ensure it's found
    if (logoutBtn) {
        logoutBtn.addEventListener('click', window.App.handleLogout); // Call via App namespace
    }
});