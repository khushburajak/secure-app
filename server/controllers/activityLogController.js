const ActivityLog = require('../models/ActivityLog');

exports.getActivityLogs = async (req, res) => {
    try {
        // Ensure the user has admin role
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Forbidden' });
        }

        const logs = await ActivityLog.find()
            .populate('userId', 'username email')
            .sort({ timestamp: -1 })
            .limit(100);
        res.json(logs);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
