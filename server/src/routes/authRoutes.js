const express = require('express');
const router = express.Router();
const { register, login, getMe, getLeads } = require('../controllers/authController');
const { protect, authorize } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.get('/leads', protect, authorize('sales_executive', 'admin'), getLeads);

module.exports = router;
