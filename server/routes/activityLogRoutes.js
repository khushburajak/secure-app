const express = require('express');
const router = express.Router();
const activityLogController = require('../controllers/activityLogController');
const { verifyJWT } = require('../middleware/authMiddleware');
const { checkRole } = require('../middleware/roleMiddleware');

router.get('/', verifyJWT, checkRole('admin'), activityLogController.getActivityLogs);

module.exports = router;
