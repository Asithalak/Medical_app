import { Router } from 'express';
import { getAuditLogs, createAuditLog } from '../controllers/auditController.js';

const router = Router();

router.get('/', getAuditLogs);
router.post('/', createAuditLog);

export default router;
