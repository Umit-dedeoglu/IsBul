const express = require('express');
const router  = express.Router();
const ctrl    = require('./reviews.controller');
const { authenticate } = require('../../middleware/auth');

router.get('/:expertId',      ctrl.getReviews);   // herkese açık
router.post('/:expertId',     authenticate, ctrl.addReview);

module.exports = router;
