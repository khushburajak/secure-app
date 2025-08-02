const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const { verifyJWT } = require('../middleware/authMiddleware');

router.post('/', verifyJWT, transactionController.createTransaction);
router.get('/history', verifyJWT, transactionController.getTransactionHistory);

module.exports = router;
