import express from 'express';
const router = express.Router();
import { register, login, getMe, getLeads } from '../controllers/authController';
import { protect, authorize } from '../middleware/auth';

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.get('/leads', protect, authorize('sales_executive', 'admin'), getLeads);

export default router;
