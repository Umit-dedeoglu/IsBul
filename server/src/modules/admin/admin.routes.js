const express = require('express');
const router  = express.Router();
const ctrl    = require('./admin.controller');
const { authenticate, requireRole } = require('../../middleware/auth');

// Admin hesabı oluştur — ilk kurulumda kullanılır, auth gerektirmez
router.post('/create-admin', ctrl.createAdmin);

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
