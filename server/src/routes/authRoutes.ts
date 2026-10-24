import { Router } from 'express';
import { login, getCurrentUser, logout } from '../controllers/authController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/login', login);
router.post('/logout', logout);
router.get('/session', authenticate, getCurrentUser);

export default router;
