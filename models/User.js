// models/User.js

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // Will use for password hashing

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true, // Ensures no two users have the same username
        trim: true,   // Removes leading/trailing whitespace
        minlength: 3  // Minimum length for username
    },
    email: {
        type: String,
        required: true,
        unique: true, // Ensures no two users have the same email
        trim: true,
        lowercase: true, // Store emails in lowercase for consistency
        match: /^\S+@\S+\.\S+$/ // Basic email regex validation
    },
    password: {
        type: String,
        required: true,
        minlength: 6 // Minimum length for password
    },
    // New: Role field for authorization
    role: {
        type: String,
        enum: ['user', 'admin', 'super_admin'], // Only these values are allowed
        default: 'user' // Default role for new users
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// --- Mongoose Middleware (Pre-save hook for password hashing) ---
// This function will run BEFORE a user document is saved to the database.
userSchema.pre('save', async function(next) {
    // Only hash the password if it has been modified (or is new)
    if (!this.isModified('password')) {
        return next();
    }

    try {
        // Generate a salt (random string) to hash the password with
        const salt = await bcrypt.genSalt(10); // 10 is a good default for salt rounds
        // Hash the password using the generated salt
        this.password = await bcrypt.hash(this.password, salt);
        next(); // Proceed with saving the user
    } catch (error) {
        next(error); // Pass any error to the error handler
    }
});

// --- Instance method to compare passwords ---
// This method will be available on user documents (e.g., user.comparePassword('plainTextPassword'))
userSchema.methods.comparePassword = async function(candidatePassword) {
    // Compare the provided plain text password with the hashed password in the database
    return await bcrypt.compare(candidatePassword, this.password);
};


module.exports = mongoose.model('User', userSchema);