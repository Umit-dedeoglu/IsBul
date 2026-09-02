/**
 * Category Requests Routes
 */

const express = require('express');
const router = express.Router();
const controller = require('./category-requests.controller');
const { authenticate, requireRole } = require('../../middleware/auth');
const requireAdmin = requireRole('admin');

// Public routes (none - tüm routes authentication gerektirir)

// Authenticated routes
router.post('/', authenticate, controller.createCategoryRequest);
router.get('/my', authenticate, controller.getMyRequests);

// Admin only routes
router.get('/', authenticate, requireAdmin, controller.getAllRequests);
router.get('/stats', authenticate, requireAdmin, controller.getStats);
router.patch('/:id', authenticate, requireAdmin, controller.reviewRequest);
router.delete('/:id', authenticate, requireAdmin, controller.deleteRequest);

module.exports = router;
