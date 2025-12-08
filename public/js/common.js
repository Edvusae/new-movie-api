// public/js/common.js
// This object will hold all common functions and variables
window.App = window.App || {};

// --- API Base URL ---
window.App.API_BASE = 'http://localhost:3000'; // Change to production URL when deployed

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

// --- Authentication Token Helpers ---
window.App.getAuthToken = function() {
    return localStorage.getItem('authToken');
};

window.App.setAuthToken = function(token) {
    if (token) {
        localStorage.setItem('authToken', token);
    }
};

window.App.removeAuthToken = function() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('loggedInUsername');
    localStorage.removeItem('loggedInUserEmail');
    localStorage.removeItem('loggedInUserRole');
};

// --- JWT Parser Helper ---
window.App.parseJwt = function(token) {
    try {
        return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
        console.error('Failed to parse JWT:', e);
        return null;
    }
};

// --- Generic localStorage Helpers ---
window.App.getItem = function(key) {
    return localStorage.getItem(key);
};

window.App.setItem = function(key, value) {
    if (key && value) {
        localStorage.setItem(key, value);
    }
};

window.App.removeItem = function(key) {
    if (key) {
        localStorage.removeItem(key);
    }
};

// --- Handle User Logout ---
window.App.handleLogout = function() {
    window.App.removeAuthToken();
    window.location.href = 'index.html';
};

// --- Check Authentication Status and Update Header UI ---
window.App.checkAuthStatusHeader = function() {
    const showRegisterFormBtn = document.getElementById('showRegisterFormBtn');
    const showLoginFormBtn = document.getElementById('showLoginFormBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const loggedInUserSpan = document.getElementById('loggedInUser');

    const token = window.App.getAuthToken();
    const username = localStorage.getItem('loggedInUsername');
    const role = localStorage.getItem('loggedInUserRole');

    if (token && username && role) {
        // User is logged in
        if (showRegisterFormBtn) showRegisterFormBtn.style.display = 'none';
        if (showLoginFormBtn) showLoginFormBtn.style.display = 'none';
        if (logoutBtn) logoutBtn.style.display = 'inline-block';
        if (loggedInUserSpan) {
            loggedInUserSpan.textContent = `${username} (${role})`;
            loggedInUserSpan.style.display = 'inline-block';
        }
    } else {
        // User is not logged in
        if (showRegisterFormBtn) showRegisterFormBtn.style.display = 'inline-block';
        if (showLoginFormBtn) showLoginFormBtn.style.display = 'inline-block';
        if (logoutBtn) logoutBtn.style.display = 'none';
        if (loggedInUserSpan) {
            loggedInUserSpan.style.display = 'none';
            loggedInUserSpan.textContent = '';
        }
    }
};

// --- Initialize on Page Load ---
document.addEventListener('DOMContentLoaded', () => {
    window.App.checkAuthStatusHeader();

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', window.App.handleLogout);
    }
});

