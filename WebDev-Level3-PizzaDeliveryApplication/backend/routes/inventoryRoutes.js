const router = require('express').Router();
const requireAdmin = require('../middleware/adminAuth');
const ctrl = require('../controllers/inventoryController');

router.get('/', requireAdmin, ctrl.getAllInventory);
router.post('/', requireAdmin, ctrl.createItem);
router.patch('/:id', requireAdmin, ctrl.updateStock);

module.exports = router;
