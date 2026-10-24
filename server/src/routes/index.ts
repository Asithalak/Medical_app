import { Router } from 'express';
import authRoutes from './authRoutes.js';
import patientRoutes from './patientRoutes.js';
import precheckRoutes from './precheckRoutes.js';
import consultationRoutes from './consultationRoutes.js';
import paymentRoutes from './paymentRoutes.js';
import reportRoutes from './reportRoutes.js';
import auditRoutes from './auditRoutes.js';
import { getConsultationTypes, updateConsultationType } from '../controllers/consultationController.js';
import { uploadFile } from '../controllers/precheckController.js';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, '../../uploads');

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

const router = Router();

// Health check
router.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Direct aliases matching frontend expectations
router.get('/consultation-types', getConsultationTypes);
router.put('/consultation-types/:id', updateConsultationType);
router.post('/upload', upload.single('file'), uploadFile);

// Modular Routes
router.use('/auth', authRoutes);
router.use('/patients', patientRoutes);
router.use('/prechecks', precheckRoutes);
router.use('/consultations', consultationRoutes);
router.use('/payments', paymentRoutes);
router.use('/reports', reportRoutes);
router.use('/audit-logs', auditRoutes);

export default router;
