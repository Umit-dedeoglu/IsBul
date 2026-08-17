const express = require('express');
const router  = express.Router();
const ctrl    = require('./experts.controller');
const { authenticate, requireRole } = require('../../middleware/auth');

router.get('/',        ctrl.listExperts);
router.get('/:id',     ctrl.getExpert);
router.patch('/profile', authenticate, requireRole('expert','admin'), ctrl.updateExpertProfile);

module.exports = router;
