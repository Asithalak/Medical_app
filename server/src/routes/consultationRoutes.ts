import { Router } from 'express';
import {
  getConsultationTypes,
  updateConsultationType,
  createConsultationType,
  deleteConsultationType,
  createConsultation,
  getConsultations,
  updateConsultation,
  sendConsultationEmail,
  getByTrackingCode,
} from '../controllers/consultationController.js';

const router = Router();

// Consultation Types
router.get('/types', getConsultationTypes);
router.post('/types', createConsultationType);
router.put('/types/:id', updateConsultationType);
router.delete('/types/:id', deleteConsultationType);

// Consultations
router.get('/', getConsultations);
router.post('/', createConsultation);
router.patch('/:id', updateConsultation);
router.post('/:id/send-email', sendConsultationEmail);
router.get('/tracking/:code', getByTrackingCode);

export default router;
