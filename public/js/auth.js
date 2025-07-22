// public/js/auth.js

// UI Elements specific to auth.html
// These are still 'let' because they are assigned inside DOMContentLoaded
// and are specific to this page's DOM.
let authFormsSection, authFormTitle, registerForm, loginForm, authMessage;
let registerUsernameInput, registerEmailInput, registerPasswordInput;
let loginEmailInput, loginPasswordInput;
let switchToLoginLink, switchToRegisterLink;


// --- Function to toggle between login and register forms ---
// This function is specific to auth.html, so it remains local to this file.
function showAuthForm(formType) {
    // Use App.displayMessage for any messages here if needed,
    // though this function primarily controls form visibility.
    if (!authFormsSection || !registerForm || !loginForm) {
        console.error("Auth form elements not found. Cannot show form.");
        return;
    }

    registerForm.classList.remove('active-form');
    loginForm.classList.remove('active-form');

    if (formType === 'register') {
        registerForm.classList.add('active-form');
        authFormTitle.textContent = 'Register';
    } else { // Default to 'login'
        loginForm.classList.add('active-form');
        authFormTitle.textContent = 'Login';
    }
    authMessage.style.display = 'none'; // Clear any previous auth messages when switching forms
}

// --- Handle User Registration ---
async function handleRegister(event) {
    event.preventDefault(); // Prevent default form submission
    if (!authMessage) return;

    authMessage.style.display = 'none'; // Hide previous messages

    const username = registerUsernameInput.value.trim();
    const email = registerEmailInput.value.trim();
    const password = registerPasswordInput.value;

    try {
        const response = await fetch(`${App.API_BASE}/api/auth/register`, { // Use App.API_BASE
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            // Construct error message from backend response
            const errorMessage = data.errors ? data.errors.map(err => err.msg).join('\n') : data.message || 'Registration failed.';
            App.displayMessage(authMessage, errorMessage, 'error'); // Use App.displayMessage
        } else {
            App.displayMessage(authMessage, data.message, 'success'); // Use App.displayMessage
            registerForm.reset(); // Clear form fields
            showAuthForm('login'); // Switch to login form after successful registration
        }
    } catch (error) {
        console.error('Error during registration:', error);
        App.displayMessage(authMessage, 'An error occurred during registration. Please try again later.', 'error'); // Use App.displayMessage
    }
}

// --- Handle User Login ---
async function handleLogin(event) {
    event.preventDefault(); // Prevent default form submission
    if (!authMessage) return;

    authMessage.style.display = 'none'; // Hide previous messages

    const email = loginEmailInput.value.trim();
    const password = loginPasswordInput.value;

    try {
        const response = await fetch(`${App.API_BASE}/api/auth/login`, { // Use App.API_BASE
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            App.displayMessage(authMessage, data.message || 'Login failed. Invalid credentials.', 'error'); // Use App.displayMessage
        } else {
            App.setAuthToken(data.token); // Use App.setAuthToken
            const decodedPayload = App.parseJwt(data.token); // Use App.parseJwt
            if (decodedPayload && decodedPayload.user) {
                localStorage.setItem('loggedInUsername', decodedPayload.user.username);
                localStorage.setItem('loggedInUserRole', decodedPayload.user.role);
            }

            App.displayMessage(authMessage, data.message, 'success'); // Use App.displayMessage
            loginForm.reset(); // Clear form fields
            // Redirect to home page after successful login
            window.location.href = 'index.html';
        }
    } catch (error) {
        console.error('Error during login:', error);
        App.displayMessage(authMessage, 'An error occurred during login. Please try again later.', 'error'); // Use App.displayMessage
    }
}

// --- Function to check authentication status and update auth.html UI ---
// This runs when auth.html loads. If already logged in, it redirects.
function checkAuthStatusAuthPage() {
    const token = App.getAuthToken(); // Use App.getAuthToken
    if (token) {
        // If user somehow lands on auth.html while logged in, redirect them
        window.location.href = 'index.html';
        return;
    }

    // Assign UI elements specific to auth.html once DOM is ready
    // These assignments MUST happen after DOMContentLoaded
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
    // Call the page-specific auth status check
    checkAuthStatusAuthPage();

    // Attach event listeners specific to auth.html after elements are assigned
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    if (switchToLoginLink) {
        switchToLoginLink.addEventListener('click', (e) => {
            e.preventDefault(); // Prevent default link behavior
            showAuthForm('login');
        });
    }
    if (switchToRegisterLink) {
        switchToRegisterLink.addEventListener('click', (e) => {
            e.preventDefault(); // Prevent default link behavior
            showAuthForm('register');
        });
    }
});