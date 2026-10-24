import { Router } from 'express';
import { login, getCurrentUser, logout, updateUserRole } from '../controllers/authController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/login', login);
router.post('/logout', logout);
router.post('/update-role', updateUserRole);
router.get('/session', authenticate, getCurrentUser);

export default router;
