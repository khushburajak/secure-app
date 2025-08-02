const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

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
    passwordHash: {
        type: String,
        required: true
    },
    passwordHistory: [{
        type: String
    }],
    mfaSecret: String,
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    failedLoginAttempts: {
        type: Number,
        default: 0
    },
    lockUntil: Date,
    passwordChangedAt: Date,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

UserSchema.path('passwordHash').validate({
    validator: function (v) {
        // Check minimum length
        if (v.length < 8) return false;

        // Check for at least one lowercase
        if (!/[a-z]/.test(v)) return false;

        // Check for at least one uppercase
        if (!/[A-Z]/.test(v)) return false;

        // Check for at least one digit
        if (!/\d/.test(v)) return false;

        // Check for at least one special character
        if (!/[@$!%*?&]/.test(v)) return false;

        return true;
    },
    message: 'Password must be at least 8 characters and contain uppercase, lowercase, number, and special character (@$!%*?&)'
});


// Password history check
UserSchema.pre('save', async function (next) {
    if (this.isModified('passwordHash')) {
        const passwordHistory = this.passwordHistory || [];

        // Check password reuse (last 5 passwords)
        if (passwordHistory.length >= 5) {
            passwordHistory.shift();
        }

        const isReused = passwordHistory.some(hash =>
            bcrypt.compareSync(this.passwordHash, hash)
        );

        if (isReused) {
            const error = new Error('Password has been used recently');
            return next(error);
        }

        // Add current password to history
        passwordHistory.push(this.passwordHash);
        this.passwordHistory = passwordHistory;
        this.passwordChangedAt = Date.now();
    }
    next();
});

UserSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.passwordHash);
};

UserSchema.methods.isAccountLocked = function () {
    return this.lockUntil && this.lockUntil > new Date();
};

module.exports = mongoose.model('User', UserSchema);
