const express = require('express');
const router  = express.Router();
const ctrl    = require('./users.controller');
const upload  = require('./upload.controller');
const { authenticate } = require('../../middleware/auth');

router.get('/profile',         authenticate, ctrl.getProfile);
router.patch('/profile',       authenticate, ctrl.updateProfile);
router.post('/change-password',authenticate, ctrl.changePassword);
router.delete('/account',      authenticate, ctrl.deleteAccount);
router.post('/avatar',         authenticate, upload.uploadAvatar);

module.exports = router;
