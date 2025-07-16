// server.js

require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const app = express();
const port = process.env.PORT || 3000;

const movieRoutes = require('./routes/movieRoutes');
// --- Import your new error handling middleware ---
const errorHandler = require('./middleware/errorHandler');

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('Error: MONGODB_URI is not defined in your .env file or environment variables.');
    process.exit(1);
}

app.use(express.json());
app.use(express.static('public'));

app.use('/movies', movieRoutes);~

// --- IMPORTANT: Add error handling middleware LAST ---
app.use(errorHandler); // This will catch any errors passed via next(error)

// Establish MongoDB connection
mongoose.connect(MONGODB_URI)
    .then(() => {
        console.log('Connected to MongoDB!');
        app.listen(port, () => {
            console.log(`SERVER IS RUNNING: http://localhost:${port}`);
            console.log('Endpoints:');
            console.log(` - POST /movies: Create a new movie`);
            console.log(` - GET /movies: Get all movies`);
            console.log(` - GET /movies/:id: Get a movie by ID`);
            console.log(` - PUT /movies/:id: Update an existing movie`);
            console.log(` - DELETE /movies/:id: Delete a movie by ID`);
        });
    })
    .catch((error) => {
        console.error('Error connecting to MongoDB:', error);
        process.exit(1);
    });