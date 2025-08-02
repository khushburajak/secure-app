const Transaction = require('../models/Transaction');
const { encryptData } = require('../utils/encryptionUtils');
const ActivityLog = require('../models/ActivityLog');

exports.createTransaction = async (req, res) => {
    try {
        const { amount, details } = req.body;
        const userId = req.user.id;

        const rawIp = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        const ip = rawIp.replace(/^::ffff:/, '');

        // Encrypt transaction details
        const encryptionKey = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');
        const encryptedDetails = encryptData(details, encryptionKey);

        const transaction = new Transaction({
            userId,
            amount,
            details: details,
            iv: encryptedDetails.iv,
            status: 'pending'
        });

        await transaction.save();

        // Log activity
        await ActivityLog.create({
            userId,
            action: 'create_transaction',
            details: `Transaction created: $${amount}`,
            ipAddress: ip
        });

        res.status(201).json({
            message: 'Transaction created',
            transactionId: transaction._id
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getTransactionHistory = async (req, res) => {
    try {
        const transactions = await Transaction.find({ userId: req.user.id })
            .sort({ timestamp: -1 })
            .limit(50);
        res.json(transactions);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
