import type { Request, Response } from 'express';
import { query, isDbConnected } from '../config/db.js';

export async function getAuditLogs(req: Request, res: Response): Promise<void> {
  try {
    if (isDbConnected()) {
      const result = await query(
        `SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 100`
      );
      res.json({ data: result.rows });
      return;
    }

    res.json({ data: [] });
  } catch (err: any) {
    res.status(500).json({ message: 'Error retrieving audit logs', error: err.message });
  }
}

export async function createAuditLog(req: Request, res: Response): Promise<void> {
  const { user_id, action, table_name, record_id, details } = req.body;
  const ip = req.ip || req.socket.remoteAddress || null;

  try {
    if (isDbConnected()) {
      const sql = `
        INSERT INTO audit_logs (user_id, action, table_name, record_id, details, ip_address)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `;
      const result = await query(sql, [user_id || null, action, table_name || null, record_id || null, details || null, ip]);
      res.status(201).json({ data: result.rows[0] });
      return;
    }

    res.status(201).json({ data: { id: `log_${Date.now()}` } });
  } catch (err: any) {
    res.status(500).json({ message: 'Error creating audit log', error: err.message });
  }
}
