const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyJWT } = require('../middleware/authMiddleware');

router.get('/profile', verifyJWT, userController.getProfile);
router.put('/profile', verifyJWT, userController.updateProfile);

module.exports = router;
