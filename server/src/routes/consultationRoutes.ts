import { Router } from 'express';
import {
  getConsultationTypes,
  updateConsultationType,
  createConsultation,
  getConsultations,
  updateConsultation,
  getByTrackingCode,
} from '../controllers/consultationController.js';

const router = Router();

// Consultation Types
router.get('/types', getConsultationTypes);
router.put('/types/:id', updateConsultationType);

// Consultations
router.get('/', getConsultations);
router.post('/', createConsultation);
router.patch('/:id', updateConsultation);
router.get('/tracking/:code', getByTrackingCode);

export default router;
