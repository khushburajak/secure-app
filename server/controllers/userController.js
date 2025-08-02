const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');

exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-passwordHash -passwordHistory -mfaSecret');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const { username, email } = req.body;

        const rawIp = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        const ip = rawIp.replace(/^::ffff:/, '');
        
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (username && username !== user.username) {
            const existingUser = await User.findOne({ username });
            if (existingUser) return res.status(400).json({ message: 'Username already taken' });
            user.username = username;
        }

        if (email && email !== user.email) {
            const existingUser = await User.findOne({ email });
            if (existingUser) return res.status(400).json({ message: 'Email already taken' });
            user.email = email;
        }

        await user.save();

        await ActivityLog.create({
            userId: user._id,
            action: 'update_profile',
            details: 'User updated profile',
            ipAddress: ip
        });

        res.json({ message: 'Profile updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Add to userController.js
exports.getAllUsers = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Forbidden' });
        }
        const users = await User.find().select('-passwordHash -passwordHistory -mfaSecret');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
