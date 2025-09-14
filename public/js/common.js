// public/js/common.js
// This object will hold all common functions and variables
window.App = window.App || {};

// --- API Base URL ---
window.App.API_BASE = 'https://new-movie-api.onrender.com'; // Expose API_BASE via App namespace

// --- Helper for UI Messages (reusable) ---
// A generic function to display messages to the user
window.App.displayMessage = function(element, message, type) {
    // Check if element exists
    if (!element) return;
    // Set message and style
    element.textContent = message;
    // Set class based on type (e.g., 'error', 'success')
    element.className = `message ${type}`;
    // Make sure the message is visible
    element.style.display = 'block';
    // Clear message after timeout
    setTimeout(() => {
        // Ensure element still exists before modifying
        if (element) {
            element.style.display = 'none';
            element.textContent = '';
            element.className = 'message';
        }
    }, 5000);
};

// --- Helper to get JWT from Local Storage (reusable) ---
// A generic function to get items from Local Storage
window.App.getItem = function(key) {
    // Check if key is valid
    return localStorage.getItem(key);
};

// --- Helper to set JWT to Local Storage (reusable) ---
window.App.setItem = function(key, value) {
    // Check if key and value are valid
    if (key && value) {
        localStorage.setItem(key, value);
    }
};

// --- Helper to remove JWT from Local Storage (reusable) ---
window.App.removeItem = function(key) {
    // Check if key is valid
    if (key) {
        localStorage.removeItem(key);
    }
    // Optionally clear all auth-related items
    localStorage.removeItem('authToken');
    // Clear user-related items
    localStorage.removeItem('loggedInUsername');
    // Clear role-related items
    localStorage.removeItem('loggedInUserRole');
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
    // Re-select here to ensure it's found
    const showLoginFormBtn = document.getElementById('showLoginFormBtn');
    // Re-select here to ensure it's found
    const logoutBtn = document.getElementById('logoutBtn');
    // Re-select here to ensure it's found
    const loggedInUserSpan = document.getElementById('loggedInUser');

    // Get auth token, username, and role from Local Storage
    const token = window.App.getAuthToken(); // Use App.getAuthToken
    // Re-select here to ensure it's found
    const username = localStorage.getItem('loggedInUsername');
    // Re-select here to ensure it's found
    const role = localStorage.getItem('loggedInUserRole');

    // Update UI based on auth status
    if (token && username && role) {
        // User is logged in
        if (showRegisterFormBtn) showRegisterFormBtn.style.display = 'none';
        // Re-select here to ensure it's found
        if (showLoginFormBtn) showLoginFormBtn.style.display = 'none';
        // Re-select here to ensure it's found
        if (logoutBtn) logoutBtn.style.display = 'inline-block';
        // Re-select here to ensure it's found
        if (loggedInUserSpan) {
            loggedInUserSpan.textContent = `Logged in as: ${username} (${role})`;
            loggedInUserSpan.style.display = 'inline-block';
        }
        // Optionally, you can add role-based UI changes here
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
    // Check auth status and update header UI
    window.App.checkAuthStatusHeader(); // Call via App namespace
    // Attach logout event listener
    const logoutBtn = document.getElementById('logoutBtn'); // Re-select here to ensure it's found
    // Re-select here to ensure it's found
    if (logoutBtn) {
        // Attach click event listener
        logoutBtn.addEventListener('click', window.App.handleLogout); // Call via App namespace
    }
});