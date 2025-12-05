// public/js/common.js
// This object will hold all common functions and variables
window.App = window.App || {};

// --- API Base URL ---
window.App.API_BASE = 'http://localhost:3000'; // Change to production URL when deploying

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

// --- JWT Token Management ---
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

// --- Parse JWT Token ---
window.App.parseJwt = function(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (e) {
        console.error('Error parsing JWT:', e);
        return null;
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

// --- Loading Spinner Helper ---
window.App.showLoading = function(element) {
    if (!element) return;
    element.innerHTML = '<div class="loading-spinner"></div>';
};

window.App.hideLoading = function(element) {
    if (!element) return;
    element.innerHTML = '';
};

// --- Toast Notification System ---
window.App.showToast = function(message, type = 'info', duration = 3000) {
    const toastContainer = document.getElementById('toast-container') || createToastContainer();
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type} toast-enter`;
    toast.innerHTML = `
        <div class="toast-content">
            <span class="toast-icon">${getToastIcon(type)}</span>
            <span class="toast-message">${message}</span>
        </div>
    `;
    
    toastContainer.appendChild(toast);
    
    setTimeout(() => toast.classList.add('toast-show'), 10);
    
    setTimeout(() => {
        toast.classList.remove('toast-show');
        toast.classList.add('toast-exit');
        setTimeout(() => toast.remove(), 300);
    }, duration);
};

function createToastContainer() {
    const container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
    return container;
}

function getToastIcon(type) {
    const icons = {
        success: '✓',
        error: '✕',
        warning: '⚠',
        info: 'ℹ'
    };
    return icons[type] || icons.info;
}

// --- Initialize on DOM Load ---
document.addEventListener('DOMContentLoaded', () => {
    window.App.checkAuthStatusHeader();
    
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', window.App.handleLogout);
    }
});

// server.js