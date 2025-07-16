// models/Movie.js

const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
    title: { type: String, required: true },
    director: { type: String, required: true },
    year: { type: Number, required: true }
});

// Export the Movie model
module.exports = mongoose.model('Movie', movieSchema);