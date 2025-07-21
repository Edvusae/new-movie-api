// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // Make sure bcryptjs is imported

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: { // Added for role-based access control
        type: String,
        enum: ['user', 'admin', 'super_admin'], // Define possible roles
        default: 'user'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// --- Pre-save hook to hash password before saving ---
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// --- Method to compare entered password with hashed password in DB ---
UserSchema.methods.comparePassword = async function (enteredPassword) {
    // 'this.password' refers to the hashed password stored in the database
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);