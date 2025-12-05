// server.js

require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); // <<< ADDED: Import CORS
const app = express();
const port = process.env.PORT || 3000;

const logger = require('./middleware/logger');
const errorHandler = require('./middleware/errorHandler');
const movieRoutes = require('./routes/movieRoutes');
const authRoutes = require('./routes/authRoutes');
const publicMovieRoutes = require('./routes/publicMovieRoutes');

// Ensure MONGODB_URI is defined in your .env file
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('Error: MONGODB_URI is not defined in your .env file or environment variables.');
    process.exit(1);
}

// --- CORS Configuration (ADDED) ---
// This allows your frontend to make requests to your backend
const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        const allowedOrigins = [
            'http://localhost:3000',
            'http://localhost:5500',
            'http://127.0.0.1:3000',
            'http://127.0.0.1:5500',
            'https://new-movie-api.onrender.com'
        ];
        
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            console.log(`CORS blocked origin: ${origin}`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token']
};

// Apply CORS middleware BEFORE other middleware
app.use(cors(corsOptions)); // <<< ADDED

// Apply other middleware
app.use(logger);
app.use(express.json());
app.use(express.static('public'));

// Register routes
app.use('/api/auth', authRoutes);
app.use('/movies', movieRoutes);
app.use('/api/public/movies', publicMovieRoutes);

// Establish MongoDB connection
mongoose.connect(MONGODB_URI)
    .then(() => {
        console.log('✅ Connected to MongoDB!');
        app.listen(port, () => {
            console.log(`🚀 SERVER IS RUNNING: http://localhost:${port}`);
            console.log('📡 Available Endpoints:');
            console.log('   PUBLIC:');
            console.log('   - GET  /api/public/movies/trending   : Get trending movies from TMDB');
            console.log('   - GET  /api/public/movies/latest     : Get latest movie from TMDB');
            console.log('');
            console.log('   AUTHENTICATION:');
            console.log('   - POST /api/auth/register            : Register a new user');
            console.log('   - POST /api/auth/login               : Login user and get JWT');
            console.log('');
            console.log('   MOVIES (Protected):');
            console.log('   - POST /movies                       : Create a new movie (Admin/SuperAdmin)');
            console.log('   - GET  /movies                       : Get all movies (with search/sort)');
            console.log('   - GET  /movies/:id                   : Get a movie by ID');
            console.log('   - PUT  /movies/:id                   : Update a movie (Admin/SuperAdmin)');
            console.log('   - DELETE /movies/:id                 : Delete a movie (SuperAdmin)');
            console.log('   - POST /movies/add-from-public       : Add TMDB movie to collection');
            console.log('');
            console.log('✅ CORS is enabled for localhost and production domains');
        });
    })
    .catch((error) => {
        console.error('❌ Error connecting to MongoDB:', error);
        process.exit(1);
    });

// Error handler should be last
app.use(errorHandler);

