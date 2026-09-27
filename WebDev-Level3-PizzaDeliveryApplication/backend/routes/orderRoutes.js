const router = require('express').Router();
const requireAuth = require('../middleware/auth');
const requireAdmin = require('../middleware/adminAuth');
const ctrl = require('../controllers/orderController');

// User routes
router.post('/', requireAuth, ctrl.createOrder);
router.post('/verify', requireAuth, ctrl.verifyPayment);
router.get('/mine', requireAuth, ctrl.myOrders);

// Admin routes
router.get('/', requireAdmin, ctrl.allOrders);
router.patch('/:id/status', requireAdmin, ctrl.updateStatus);

module.exports = router;
