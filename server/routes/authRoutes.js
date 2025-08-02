const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyJWT } = require('../middleware/authMiddleware');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/setup-mfa', verifyJWT, authController.setupMFA);
router.post('/verify-mfa', authController.verifyMFA);

module.exports = router;
