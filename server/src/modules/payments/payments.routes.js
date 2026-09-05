const express = require('express');
const router  = express.Router();
const ctrl    = require('./payments.controller');
const { authenticate } = require('../../middleware/auth');

// Ödeme başlat (giriş gerekli)
router.post('/initialize',  authenticate, ctrl.initializePayment);

// İyzico callback — auth yok, iyzico POST eder
router.post('/callback',    ctrl.paymentCallback);

// Ödeme durumu sorgula
router.get('/:bookingId',   authenticate, ctrl.getPaymentStatus);

module.exports = router;
