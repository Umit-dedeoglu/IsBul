const express = require('express');
const router  = express.Router();
const ctrl    = require('./bookings.controller');
const { authenticate } = require('../../middleware/auth');

router.post('/',              authenticate, ctrl.createBooking);
router.get('/my',             authenticate, ctrl.getMyBookings);
router.get('/expert',         authenticate, ctrl.getExpertBookings);
router.patch('/:id/status',   authenticate, ctrl.updateStatus);

module.exports = router;
