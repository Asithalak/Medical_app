import { Router } from 'express';
import { getDoctorStats, getAdminStats } from '../controllers/reportController.js';

const router = Router();

router.get('/doctor', getDoctorStats);
router.get('/admin', getAdminStats);

export default router;
