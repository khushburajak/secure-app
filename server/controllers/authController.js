const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const { generateAccessToken, generateRefreshToken } = require('../utils/jwtUtils');
const { checkPasswordComplexity } = require('../utils/passwordUtils');
const ActivityLog = require('../models/ActivityLog');

exports.register = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        const rawIp = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        const ip = rawIp.replace(/^::ffff:/, '');

        // Check password complexity
        if (!checkPasswordComplexity(password)) {
            return res.status(400).json({ message: 'Password does not meet complexity requirements' });
        }

        // Check existing user
        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // Create user
        const user = new User({
            username,
            email,
            passwordHash,
            passwordHistory: [passwordHash]
        });

        await user.save();

        // Log activity
        await ActivityLog.create({
            userId: user._id,
            action: 'register',
            details: 'User registered successfully',
            ipAddress: ip
        });

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const rawIp = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        const ip = rawIp.replace(/^::ffff:/, '');

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(403).json({ message: 'Invalid credentials' });
        }

        // Check account lock
        if (user.isAccountLocked()) {
            return res.status(403).json({ message: 'Account locked. Try again later' });
        }

        // Verify password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            await user.updateOne({ $inc: { failedLoginAttempts: 1 } });
            return res.status(403).json({ message: 'Invalid credentials' });
        }

        // Check MFA
        if (user.mfaSecret) {
            return res.json({
                requiresMFA: true,
                userId: user._id
            });
        }

        // Reset login attempts
        await user.updateOne({
            $set: {
                failedLoginAttempts: 0,
                lockUntil: null
            }
        });

        // Generate tokens
        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        // Log activity
        await ActivityLog.create({
            userId: user._id,
            action: 'login',
            details: 'User logged in',
            ipAddress: ip
        });

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.json({ accessToken });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.setupMFA = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user.mfaSecret) {
            const secret = speakeasy.generateSecret({ length: 20 });
            user.mfaSecret = secret.base32;
            await user.save();
        }

        const otpauthUrl = speakeasy.otpauthURL({
            secret: user.mfaSecret,
            encoding: 'base32',
            label: `SecureApp:${user.email}`,
            issuer: 'SecureApp'
        });

        res.json({
            qrCode: otpauthUrl,
            secret: user.mfaSecret
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.verifyMFA = async (req, res) => {
    try {
        const { userId, token } = req.body;


        if (!userId || !token) {
            return res.status(400).json({ message: 'UserId and token are required' });
        }

        if (!/^\d{6}$/.test(token)) {
            return res.status(400).json({ message: 'Token must be 6 digits' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (!user.mfaSecret) {
            return res.status(400).json({ message: 'MFA not setup for this user' });
        }

        const verified = speakeasy.totp.verify({
            secret: user.mfaSecret,
            encoding: 'base32',
            token: token,
            window: 1
        });

        if (!verified) {
            return res.status(403).json({ message: 'Invalid MFA token' });
        }

        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.json({
            accessToken,
            user: {
                id: user._id,
                email: user.email,
            }
        });
    } catch (error) {
        console.error('MFA Verification Error:', error);
        res.status(500).json({ message: 'Server error during MFA verification' });
    }
};
