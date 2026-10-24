import { Router } from 'express';
import { processPayment, getPayments } from '../controllers/paymentController.js';

const router = Router();

router.post('/', processPayment);
router.get('/', getPayments);

export default router;
