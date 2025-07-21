// public/js/auth.js

// Import common functions (if common.js is set up as a module)
// For now, assuming common.js functions are globally available after script inclusion
// const { API_BASE, displayMessage, setAuthToken, parseJwt, checkAuthStatusHeader } = window; // Example if using global scope

// UI Elements specific to auth.html
let authFormsSection, authFormTitle, registerForm, loginForm, authMessage;
let registerUsernameInput, registerEmailInput, registerPasswordInput;
let loginEmailInput, loginPasswordInput;
let switchToLoginLink, switchToRegisterLink;


// --- Function to toggle between login and register forms ---
function showAuthForm(formType) {
    if (!authFormsSection || !registerForm || !loginForm) return;

    registerForm.classList.remove('active-form');
    loginForm.classList.remove('active-form');

    if (formType === 'register') {
        registerForm.classList.add('active-form');
        authFormTitle.textContent = 'Register';
    } else {
        loginForm.classList.add('active-form');
        authFormTitle.textContent = 'Login';
    }
    authMessage.style.display = 'none';
}

// --- Handle User Registration ---
async function handleRegister(event) {
    event.preventDefault();
    if (!authMessage) return;

    authMessage.style.display = 'none';

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
    if (!authMessage) return;

    authMessage.style.display = 'none';

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
            // Redirect to home page after successful login
            window.location.href = 'index.html';
        }
    } catch (error) {
        console.error('Error during login:', error);
        displayMessage(authMessage, 'An error occurred during login. Please try again later.', 'error');
    }
}

// --- Function to check authentication status and update auth.html UI ---
function checkAuthStatusAuthPage() {
    const token = getAuthToken();
    if (token) {
        // If user somehow lands on auth.html while logged in, redirect them
        window.location.href = 'index.html';
        return;
    }

    // Re-assign local vars for current page
    authFormsSection = document.getElementById('authForms');
    authFormTitle = document.getElementById('authFormTitle');
    registerForm = document.getElementById('registerForm');
    loginForm = document.getElementById('loginForm');
    authMessage = document.getElementById('authMessage');
    registerUsernameInput = document.getElementById('registerUsername');
    registerEmailInput = document.getElementById('registerEmail');
    registerPasswordInput = document.getElementById('registerPassword');
    loginEmailInput = document.getElementById('loginEmail');
    loginPasswordInput = document.getElementById('loginPassword');
    switchToLoginLink = document.getElementById('switchToLogin');
    switchToRegisterLink = document.getElementById('switchToRegister');

    // Determine which form to show based on URL query parameter
    const urlParams = new URLSearchParams(window.location.search);
    const formType = urlParams.get('form') || 'login'; // Default to login if no param
    showAuthForm(formType); // Call the specific function for auth forms
}

// --- Initial setup on auth.html load ---
document.addEventListener('DOMContentLoaded', () => {
    checkAuthStatusAuthPage(); // Update auth.html UI based on auth status

    // Add event listeners specific to auth.html
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    if (switchToLoginLink) {
        switchToLoginLink.addEventListener('click', (e) => {
            e.preventDefault();
            showAuthForm('login');
        });
    }
    if (switchToRegisterLink) {
        switchToRegisterLink.addEventListener('click', (e) => {
            e.preventDefault();
            showAuthForm('register');
        });
    }
});