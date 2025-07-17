// server.js

require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const app = express();
const port = process.env.PORT || 3000;

const logger = require('./middleware/logger');
const errorHandler = require('./middleware/errorHandler');
const movieRoutes = require('./routes/movieRoutes');
// --- Import your new authRoutes ---
const authRoutes = require('./routes/authRoutes'); // Assuming it's in the same directory as movieRoutes

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('Error: MONGODB_URI is not defined in your .env file or environment variables.');
    process.exit(1);
}

app.use(logger);
app.use(express.json());
app.use(express.static('public'));

// --- Register your new auth routes ---
// It's common to prefix auth routes with /api/auth or just /auth
app.use('/api/auth', authRoutes); // All routes in authRoutes will be prefixed with /api/auth
app.use('/movies', movieRoutes); // Your existing movie routes

// Establish MongoDB connection
mongoose.connect(MONGODB_URI)
    .then(() => {
        console.log('Connected to MongoDB!');
        app.listen(port, () => {
            console.log(`SERVER IS RUNNING: http://localhost:${port}`);
            console.log('Endpoints:');
            console.log(` - POST /api/auth/register: Register a new user`); // New endpoint
            console.log(` - POST /movies: Create a new movie`);
            console.log(` - GET /movies: Get all movies (with search/sort)`);
            console.log(` - GET /movies/:id: Get a movie by ID`);
            console.log(` - PUT /movies/:id: Update an existing movie`);
            console.log(` - DELETE /movies/:id: Delete a movie by ID`);
        });
    })
    .catch((error) => {
        console.error('Error connecting to MongoDB:', error);
        process.exit(1);
    });
app.use(errorHandler);