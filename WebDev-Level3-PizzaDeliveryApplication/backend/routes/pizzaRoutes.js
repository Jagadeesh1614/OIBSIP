const router = require('express').Router();
const pizzaCtrl = require('../controllers/pizzaController');
const invCtrl = require('../controllers/inventoryController');

router.get('/menu', pizzaCtrl.list);       // preset pizza varieties for the dashboard
router.get('/options', invCtrl.getOptions); // builder options: bases/sauces/cheeses/vegetables

module.exports = router;
