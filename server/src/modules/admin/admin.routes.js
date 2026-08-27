const express = require('express');
const router  = express.Router();
const ctrl    = require('./admin.controller');
const { authenticate, requireRole } = require('../../middleware/auth');

// Admin hesabı oluştur — sadece ADMIN_SETUP_KEY ile erişilebilir
router.post('/create-admin', (req, res, next) => {
  const setupKey = req.headers['x-admin-setup-key'] || req.body.setupKey;
  if (!process.env.ADMIN_SETUP_KEY || setupKey !== process.env.ADMIN_SETUP_KEY) {
    return res.status(403).json({ success: false, error: 'Geçersiz setup key.' });
  }
  next();
}, ctrl.createAdmin);

// Tüm diğer admin route'ları korumalı
router.use(authenticate, requireRole('admin'));

router.get('/stats',                    ctrl.getStats);
router.get('/users',                    ctrl.getUsers);
router.get('/users/:id',                ctrl.getUser);
router.patch('/users/:id/role',         ctrl.setUserRole);
router.patch('/users/:id/toggle-active',ctrl.toggleUserActive);
router.delete('/users/:id',             ctrl.deleteUser);
router.get('/bookings',                 ctrl.getBookings);

// Uzman başvuruları
router.get('/applications',             ctrl.getApplications);
router.patch('/applications/:id/approve', ctrl.approveApplication);
router.patch('/applications/:id/reject',  ctrl.rejectApplication);

module.exports = router;
