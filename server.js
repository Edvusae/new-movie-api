// server.js

require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const app = express();
const port = process.env.PORT || 3000;

// --- Import your new logger middleware ---
const logger = require('./middleware/logger');
const errorHandler = require('./middleware/errorHandler');
const movieRoutes = require('./routes/movieRoutes');

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('Error: MONGODB_URI is not defined in your .env file or environment variables.');
    process.exit(1);
}

// --- IMPORTANT: Use the logger middleware early ---
app.use(logger); // This will log every request

app.use(express.json()); // Body parser should come after logger if you want to log parsed body
app.use(express.static('public')); // Serve static files from the 'public' directory 

app.use('/movies', movieRoutes);

// Establish MongoDB connection
mongoose.connect(MONGODB_URI)
    .then(() => {
        console.log('Connected to MongoDB!');
        app.listen(port, () => {
            console.log(`SERVER IS RUNNING: http://localhost:${port}`);
            console.log('Endpoints:');
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

// Error handling middleware (must be last)
app.use(errorHandler);