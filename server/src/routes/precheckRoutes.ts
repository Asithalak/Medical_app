import { Router } from 'express';
import { createPrecheck, uploadFile } from '../controllers/precheckController.js';
import { documentUpload } from '../middleware/uploadMiddleware.js';

const router = Router();

router.post('/', createPrecheck);
router.post('/upload', documentUpload.single('file'), uploadFile);

export default router;
