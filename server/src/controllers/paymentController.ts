import type { Request, Response } from 'express';
import { query, isDbConnected } from '../config/db.js';

export async function processPayment(req: Request, res: Response): Promise<void> {
  const {
    _consultation_id, consultation_id,
    _amount_cents, amount_cents,
    _currency, currency,
    _stripe_payment_id, stripe_payment_id,
  } = req.body;

  const cId = _consultation_id || consultation_id;
  const amount = _amount_cents !== undefined ? _amount_cents : amount_cents;
  const curr = _currency || currency || 'usd';
  const stripeId = _stripe_payment_id || stripe_payment_id || `sim_${Date.now()}`;

  try {
    if (isDbConnected()) {
      // Insert payment
      await query(
        `INSERT INTO payments (consultation_id, amount_cents, currency, status, stripe_payment_id)
         VALUES ($1, $2, $3, 'completed', $4)`,
        [cId, amount, curr, stripeId]
      );

      // Update consultation status to 'paid'
      await query(
        `UPDATE consultations SET status = 'paid' WHERE id = $1`,
        [cId]
      );

      res.json({ success: true });
      return;
    }

    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ message: 'Error processing payment', error: err.message });
  }
}

export async function getPayments(req: Request, res: Response): Promise<void> {
  try {
    if (isDbConnected()) {
      const sql = `
        SELECT 
          pay.*,
          json_build_object(
            'patients', json_build_object('full_name', p.full_name, 'email', p.email),
            'consultation_types', json_build_object('display_name', ct.display_name)
          ) as consultations
        FROM payments pay
        JOIN consultations c ON c.id = pay.consultation_id
        JOIN patients p ON p.id = c.patient_id
        JOIN consultation_types ct ON ct.id = c.consultation_type_id
        ORDER BY pay.created_at DESC
      `;

      const result = await query(sql);
      res.json({ data: result.rows });
      return;
    }

    res.json({ data: [] });
  } catch (err: any) {
    res.status(500).json({ message: 'Error fetching payments', error: err.message });
  }
}
