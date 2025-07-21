// public/js/common.js

// API Base URL (adjust if your backend is not on localhost:3000 in production)
const API_BASE = 'http://localhost:3000';

// Global header UI elements (present on all pages)
const showRegisterFormBtn = document.getElementById('showRegisterFormBtn');
const showLoginFormBtn = document.getElementById('showLoginFormBtn');
const logoutBtn = document.getElementById('logoutBtn');
const loggedInUserSpan = document.getElementById('loggedInUser');

// --- Helper for UI Messages (reusable) ---
function displayMessage(element, message, type) {
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
}

// --- Helper to get JWT from Local Storage (reusable) ---
function getAuthToken() {
    return localStorage.getItem('jwtToken');
}

// --- Helper to set JWT to Local Storage (reusable) ---
function setAuthToken(token) {
    localStorage.setItem('jwtToken', token);
}

// --- Helper to remove JWT from Local Storage (reusable) ---
function removeAuthToken() {
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('loggedInUsername');
    localStorage.removeItem('loggedInUserRole');
}

// --- Helper to parse JWT (reusable) ---
function parseJwt(token) {
    try {
        return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
        console.error("Error parsing JWT:", e);
        return null;
    }
}

// --- Function to handle user logout (reusable) ---
function handleLogout() {
    removeAuthToken(); // Clears localStorage
    // No need to call checkAuthStatus here directly to update specific page content.
    // The redirect will cause the new page's script to run checkAuthStatus.
    window.location.href = 'index.html'; // Always redirect to home page after logout
}

// --- Function to check authentication status and update GLOBAL UI (header) ---
function checkAuthStatusHeader() {
    const token = getAuthToken();
    const username = localStorage.getItem('loggedInUsername');
    const role = localStorage.getItem('loggedInUserRole');

    if (token && username && role) {
        showRegisterFormBtn.style.display = 'none';
        showLoginFormBtn.style.display = 'none';
        logoutBtn.style.display = 'inline-block';
        loggedInUserSpan.textContent = `Logged in as: ${username} (${role})`;
        loggedInUserSpan.style.display = 'inline-block';
    } else {
        showRegisterFormBtn.style.display = 'inline-block';
        showLoginFormBtn.style.display = 'inline-block';
        logoutBtn.style.display = 'none';
        loggedInUserSpan.style.display = 'none';
        loggedInUserSpan.textContent = '';
    }
}

// Attach event listeners for common elements
document.addEventListener('DOMContentLoaded', () => {
    checkAuthStatusHeader(); // Update header on every page load
    if (logoutBtn) { // Ensure button exists before adding listener
        logoutBtn.addEventListener('click', handleLogout);
    }
    // showRegisterFormBtn and showLoginFormBtn are likely <a> tags that navigate
    // so no need for explicit click listeners here unless they do more than navigate.
});

// Export functions for use in other modules (if using type="module")
// For now, let's keep them globally accessible by just declaring them.
// If you transition to ES Modules later, you'd add:
// export { API_BASE, displayMessage, getAuthToken, setAuthToken, removeAuthToken, parseJwt, handleLogout, checkAuthStatusHeader };