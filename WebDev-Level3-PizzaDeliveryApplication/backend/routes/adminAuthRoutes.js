const router = require('express').Router();
const ctrl = require('../controllers/adminAuthController');

router.post('/login', ctrl.login);

module.exports = router;
