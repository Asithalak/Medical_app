import type { Request, Response } from 'express';
import { query, isDbConnected } from '../config/db.js';

export async function getDoctorStats(req: Request, res: Response): Promise<void> {
  try {
    if (isDbConnected()) {
      const consultsRes = await query(`SELECT id, status, created_at, started_at FROM consultations`);
      const paymentsRes = await query(`SELECT amount_cents, status FROM payments WHERE status = 'completed'`);

      const consults = consultsRes.rows;
      const payments = paymentsRes.rows;

      const total = consults.length;
      const completed = consults.filter((c) => c.status === 'completed').length;
      const revenue = payments.reduce((sum, p) => sum + p.amount_cents, 0);

      const waits = consults
        .filter((c) => c.started_at && c.created_at)
        .map((c) => (new Date(c.started_at).getTime() - new Date(c.created_at).getTime()) / 60000);
      const avgWait = waits.length ? Math.round(waits.reduce((a, b) => a + b, 0) / waits.length) : 0;

      res.json({ data: { total, completed, revenue, avgWait } });
      return;
    }

    res.json({ data: { total: 0, completed: 0, revenue: 0, avgWait: 0 } });
  } catch (err: any) {
    res.status(500).json({ message: 'Error generating doctor stats', error: err.message });
  }
}

export async function getAdminStats(req: Request, res: Response): Promise<void> {
  try {
    if (isDbConnected()) {
      const consultsSql = `
        SELECT 
          c.*,
          json_build_object('full_name', p.full_name) as patients,
          json_build_object('display_name', ct.display_name) as consultation_types
        FROM consultations c
        JOIN patients p ON p.id = c.patient_id
        JOIN consultation_types ct ON ct.id = c.consultation_type_id
        ORDER BY c.created_at DESC
      `;

      const [consultsRes, paymentsRes] = await Promise.all([
        query(consultsSql),
        query(`SELECT amount_cents FROM payments WHERE status = 'completed'`),
      ]);

      const all = consultsRes.rows;
      const payments = paymentsRes.rows;

      const total = all.length;
      const completed = all.filter((c) => c.status === 'completed').length;
      const cancelled = all.filter((c) => c.status === 'cancelled').length;
      const revenue = payments.reduce((sum, p) => sum + p.amount_cents, 0);

      res.json({
        data: {
          total,
          completed,
          cancelled,
          revenue,
          consultations: all,
        },
      });
      return;
    }

    res.json({
      data: {
        total: 0,
        completed: 0,
        cancelled: 0,
        revenue: 0,
        consultations: [],
      },
    });
  } catch (err: any) {
    res.status(500).json({ message: 'Error generating admin stats', error: err.message });
  }
}
