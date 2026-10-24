import { Router } from 'express';
import { processPayment, getPayments } from '../controllers/paymentController.js';
import { authenticate, requireRole } from '../middleware/authMiddleware.js';

const router = Router();

// Public payment endpoint (protected with rate limiting & server-side price authority)
router.post('/', processPayment);

// Restricted to authenticated Doctors & Admins
router.get('/', authenticate, requireRole(['admin', 'doctor']), getPayments);

export default router;
