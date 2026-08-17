const express = require('express');
const router  = express.Router();
const ctrl    = require('./calendar.controller');

router.get('/:expertId/slots',   ctrl.getSlots);
router.post('/:expertId/check',  ctrl.checkSlots);

module.exports = router;
