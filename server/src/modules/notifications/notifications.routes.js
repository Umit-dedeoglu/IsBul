const express = require('express');
const router  = express.Router();
const ctrl    = require('./notifications.controller');
const { authenticate } = require('../../middleware/auth');

router.get('/',      authenticate, ctrl.getNotifications);
router.get('/stats', authenticate, ctrl.getUserStats);

module.exports = router;
