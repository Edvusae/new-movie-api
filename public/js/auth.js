// public/js/auth.js
// UI Elements specific to auth.html
// These elements are used to handle user authentication (login/register)
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
            // Constructing error message from backend response
            const errorMessage = data.errors ? data.errors.map(err => err.msg).join('\n') : data.message || 'Registration failed.';
            App.displayMessage(authMessage, errorMessage, 'error'); // Using App.displayMessage
        } else {
            App.displayMessage(authMessage, data.message, 'success'); // Using App.displayMessage
            registerForm.reset(); // Clearing form fields
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
        // Validate user input
        if (!email || !password) {
            App.displayMessage(authMessage, 'Please enter both email and password.', 'error'); // Use App.displayMessage
            return;
        }
        // Send login request
        const response = await fetch(`${App.API_BASE}/api/auth/login`, { // Use App.API_BASE
            method: 'POST', // Send a POST request
            headers: {
                'Content-Type': 'application/json' // Set content type to JSON
            },
            // Set the request body
            body: JSON.stringify({ email, password })
        });

        // Parse the JSON response
        const data = await response.json();

        // Check if response is okay
        if (!response.ok) {
            App.displayMessage(authMessage, data.message || 'Login failed. Invalid credentials.', 'error'); // Use App.displayMessage
        } else {
            // If login is successful
            // Set the authentication token
            App.setAuthToken(data.token);

            // Decode the JWT to get user information
            const decodedPayload = App.parseJwt(data.token); // Use App.parseJwt

            // If user information is present in the token, store it
            if (decodedPayload && decodedPayload.user) {
                // Store user information in localStorage
                localStorage.setItem('loggedInUsername', decodedPayload.user.username);
                // Store user email
                localStorage.setItem('loggedInUserEmail', decodedPayload.user.email);
                // Store user role
                localStorage.setItem('loggedInUserRole', decodedPayload.user.role);
            }

            // Display success message
            App.displayMessage(authMessage, data.message, 'success'); // Use App.displayMessage
            // Clear form fields
            loginForm.reset();
            // Redirect to home page after successful login
            window.location.href = 'index.html';
        }
        // If user somehow lands on auth.html while logged in, redirect them
    } catch (error) {
        console.error('Error during login:', error);
        App.displayMessage(authMessage, 'An error occurred during login. Please try again later.', 'error'); // Use App.displayMessage
    }
}

// --- Function to check authentication status and update auth.html UI ---
// This runs when auth.html loads. If already logged in, it redirects.
function checkAuthStatusAuthPage() {
    // Get the authentication token
    const token = App.getAuthToken();

    // If token exists, user is already logged in
    // If user somehow lands on auth.html while logged in, redirect them
    if (token) {
        window.location.href = 'index.html';
        return;
    }

    // Assigning UI elements specific to auth.html once DOM is ready
    // These assignments will happen after DOMContentLoaded
    authFormsSection = document.getElementById('authForms');
    // Assigning the title element
    authFormTitle = document.getElementById('authFormTitle');
    // Assigning the form elements
    registerForm = document.getElementById('registerForm');
    // Assigning the login form element
    loginForm = document.getElementById('loginForm');
    // Assigning the message element
    authMessage = document.getElementById('authMessage');
    // Assigning the input elements
    registerUsernameInput = document.getElementById('registerUsername');
    // Assigning the email input element
    registerEmailInput = document.getElementById('registerEmail');
    // Assigning the password input element
    registerPasswordInput = document.getElementById('registerPassword');
    // Assigning the login input elements
    loginEmailInput = document.getElementById('loginEmail');
    // Assigning the login password input element
    loginPasswordInput = document.getElementById('loginPassword');
    // Assigning the switch links
    switchToLoginLink = document.getElementById('switchToLogin');
    // Assigning the switch to register link
    switchToRegisterLink = document.getElementById('switchToRegister');

    // Determine which form to show based on URL query parameter
    const urlParams = new URLSearchParams(window.location.search);

    // Getting the form type from the query parameter
    const formType = urlParams.get('form') || 'login'; // Default to login if no param

    // Showing the appropriate auth form
    showAuthForm(formType); 
// Calling the specific function for auth forms
}

// --- Initial setup on auth.html load ---
document.addEventListener('DOMContentLoaded', () => {
    // Calling the function to check auth status
    checkAuthStatusAuthPage();

    // Attaching event listeners specific to auth.html after elements are assigned
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
    // Adding event listener for login form
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    // Adding event listener for switch to login link
    if (switchToLoginLink) {
        switchToLoginLink.addEventListener('click', (e) => {
            e.preventDefault(); // Prevent default link behavior
            showAuthForm('login');
        });
    }
    // Adding event listener for switch to register link
    if (switchToRegisterLink) {
        switchToRegisterLink.addEventListener('click', (e) => {
            e.preventDefault(); // Prevent default link behavior
            showAuthForm('register');
        });
    }
});