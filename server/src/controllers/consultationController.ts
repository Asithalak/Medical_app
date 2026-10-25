import type { Request, Response } from 'express';
import { query, isDbConnected } from '../config/db.js';
import { sendConsultationSummaryEmail, sendConsultationLinkEmail } from '../services/emailService.js';

export async function getConsultationTypes(req: Request, res: Response): Promise<void> {
  try {
    if (isDbConnected()) {
      const result = await query(
        `SELECT * FROM consultation_types WHERE is_active = true ORDER BY priority_score DESC`
      );
      res.json({ data: result.rows });
      return;
    }

    // Default types if database is not yet connected
    res.json({
      data: [
        {
          id: '11111111-1111-1111-1111-111111111111',
          name: 'priority',
          display_name: 'Priority Consultation',
          description: 'Urgent medical consultation with highest queue priority. Ideal for time-sensitive conditions.',
          price_cents: 15000,
          duration_minutes: 30,
          priority_score: 100,
          is_active: true,
        },
        {
          id: '22222222-2222-2222-2222-222222222222',
          name: 'standard',
          display_name: 'Standard Consultation',
          description: 'Regular medical consultation for non-urgent conditions. Comprehensive assessment and advice.',
          price_cents: 10000,
          duration_minutes: 20,
          priority_score: 50,
          is_active: true,
        },
        {
          id: '33333333-3333-3333-3333-333333333333',
          name: 'short',
          display_name: 'Short Consultation',
          description: 'Quick consultation for simple medical queries, prescription renewals, or follow-ups.',
          price_cents: 5000,
          duration_minutes: 10,
          priority_score: 10,
          is_active: true,
        },
      ],
    });
  } catch (err: any) {
    res.status(500).json({ message: 'Error fetching consultation types', error: err.message });
  }
}

export async function updateConsultationType(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const { display_name, description, price_cents, duration_minutes } = req.body;

  try {
    if (isDbConnected()) {
      const sql = `
        UPDATE consultation_types
        SET display_name = COALESCE($1, display_name),
            description = COALESCE($2, description),
            price_cents = COALESCE($3, price_cents),
            duration_minutes = COALESCE($4, duration_minutes),
            updated_at = NOW()
        WHERE id::text = $5 OR name = $5
        RETURNING *
      `;
      const result = await query(sql, [display_name, description, price_cents, duration_minutes, id]);
      res.json({ data: result.rows[0] });
      return;
    }

    res.json({ data: { id, display_name, description, price_cents, duration_minutes } });
  } catch (err: any) {
    res.status(500).json({ message: 'Error updating consultation type', error: err.message });
  }
}

export async function createConsultation(req: Request, res: Response): Promise<void> {
  const {
    _patient_id, patient_id,
    _consultation_type_id, consultation_type_id,
    _medical_precheck_id, medical_precheck_id,
    _priority_score, priority_score,
  } = req.body;

  const pId = _patient_id || patient_id;
  const tId = _consultation_type_id || consultation_type_id;
  const preId = _medical_precheck_id || medical_precheck_id || null;
  const score = _priority_score !== undefined ? _priority_score : (priority_score !== undefined ? priority_score : 0);

  try {
    if (isDbConnected()) {
      const sql = `
        INSERT INTO consultations (
          patient_id, consultation_type_id, medical_precheck_id, priority_score, status
        ) VALUES ($1, $2, $3, $4, 'pending')
        RETURNING id
      `;
      const result = await query(sql, [pId, tId, preId, score]);
      res.status(201).json({ data: { id: result.rows[0].id } });
      return;
    }

    const id = `cns_${Date.now()}`;
    res.status(201).json({ data: { id } });
  } catch (err: any) {
    res.status(500).json({ message: 'Error creating consultation', error: err.message });
  }
}

export async function getConsultations(req: Request, res: Response): Promise<void> {
  const isQueue = req.query.queue === 'true';

  try {
    if (isDbConnected()) {
      let sql = `
        SELECT 
          c.*,
          row_to_json(p.*) as patients,
          json_build_object('display_name', ct.display_name, 'name', ct.name) as consultation_types,
          row_to_json(mp.*) as medical_prechecks
        FROM consultations c
        JOIN patients p ON p.id = c.patient_id
        JOIN consultation_types ct ON ct.id = c.consultation_type_id
        LEFT JOIN medical_prechecks mp ON mp.id = c.medical_precheck_id
      `;

      if (isQueue) {
        sql += ` WHERE c.status IN ('pending', 'paid', 'scheduled', 'in_progress') ORDER BY c.priority_score DESC, c.created_at ASC`;
      } else {
        sql += ` ORDER BY c.created_at DESC`;
      }

      const result = await query(sql);
      res.json({ data: result.rows });
      return;
    }

    res.json({ data: [] });
  } catch (err: any) {
    res.status(500).json({ message: 'Error retrieving consultations', error: err.message });
  }
}

export async function updateConsultation(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const updates = req.body;
  const shouldSendEmail = updates.sendEmail ?? updates.send_email;

  try {
    if (isDbConnected()) {
      const setClauses: string[] = [];
      const values: any[] = [];
      let idx = 1;

      for (const [key, val] of Object.entries(updates)) {
        // Safe key check
        if (['status', 'consultation_link', 'diagnosis', 'prescription', 'recommendations', 'follow_up_notes', 'started_at', 'completed_at'].includes(key)) {
          setClauses.push(`${key} = $${idx}`);
          values.push(val);
          idx++;
        }
      }

      if (setClauses.length === 0) {
        res.json({ data: null });
        return;
      }

      values.push(id);
      const sql = `UPDATE consultations SET ${setClauses.join(', ')} WHERE id = $${idx} RETURNING *`;
      const result = await query(sql, values);
      const updatedConsultation = result.rows[0];

      // Check if we should trigger an email to patient
      let emailResult = null;
      const isDiagnosisUpdate =
        updates.diagnosis !== undefined ||
        updates.prescription !== undefined ||
        updates.recommendations !== undefined ||
        updates.follow_up_notes !== undefined;
      const isLinkOnlyUpdate = updates.consultation_link !== undefined && !isDiagnosisUpdate;

      // If doctor updated diagnosis fields or explicitly requested sendEmail
      if (isDiagnosisUpdate || shouldSendEmail) {
        const patientRes = await query(
          `SELECT c.*, p.full_name as patient_name, p.email as patient_email, p.tracking_code,
                  ct.display_name as consultation_type
           FROM consultations c
           JOIN patients p ON p.id = c.patient_id
           JOIN consultation_types ct ON ct.id = c.consultation_type_id
           WHERE c.id = $1`,
          [id]
        );

        if (patientRes.rows.length > 0) {
          const row = patientRes.rows[0];
          if (row.patient_email) {
            emailResult = await sendConsultationSummaryEmail({
              patientEmail: row.patient_email,
              patientName: row.patient_name,
              trackingCode: row.tracking_code,
              consultationType: row.consultation_type,
              diagnosis: updatedConsultation.diagnosis,
              prescription: updatedConsultation.prescription,
              recommendations: updatedConsultation.recommendations,
              followUpNotes: updatedConsultation.follow_up_notes,
              consultationLink: updatedConsultation.consultation_link,
            });
          }
        }
      } else if (isLinkOnlyUpdate && updates.consultation_link) {
        // Only link was updated - notify patient of meeting link
        const patientRes = await query(
          `SELECT c.*, p.full_name as patient_name, p.email as patient_email, p.tracking_code,
                  ct.display_name as consultation_type
           FROM consultations c
           JOIN patients p ON p.id = c.patient_id
           JOIN consultation_types ct ON ct.id = c.consultation_type_id
           WHERE c.id = $1`,
          [id]
        );

        if (patientRes.rows.length > 0 && patientRes.rows[0].patient_email) {
          const row = patientRes.rows[0];
          emailResult = await sendConsultationLinkEmail({
            patientEmail: row.patient_email,
            patientName: row.patient_name,
            trackingCode: row.tracking_code,
            consultationType: row.consultation_type,
            consultationLink: updates.consultation_link,
          });
        }
      }

      res.json({ data: updatedConsultation, emailResult });
      return;
    }

    res.json({ data: { id, ...updates } });
  } catch (err: any) {
    res.status(500).json({ message: 'Error updating consultation', error: err.message });
  }
}

export async function sendConsultationEmail(req: Request, res: Response): Promise<void> {
  const { id } = req.params;

  try {
    if (!isDbConnected()) {
      res.status(503).json({ message: 'Database not connected' });
      return;
    }

    const patientRes = await query(
      `SELECT c.*, p.full_name as patient_name, p.email as patient_email, p.tracking_code,
              ct.display_name as consultation_type
       FROM consultations c
       JOIN patients p ON p.id = c.patient_id
       JOIN consultation_types ct ON ct.id = c.consultation_type_id
       WHERE c.id = $1`,
      [id]
    );

    if (patientRes.rows.length === 0) {
      res.status(404).json({ message: 'Consultation not found' });
      return;
    }

    const row = patientRes.rows[0];
    if (!row.patient_email) {
      res.status(400).json({ message: 'Patient has no email address recorded' });
      return;
    }

    const emailResult = await sendConsultationSummaryEmail({
      patientEmail: row.patient_email,
      patientName: row.patient_name,
      trackingCode: row.tracking_code,
      consultationType: row.consultation_type,
      diagnosis: row.diagnosis,
      prescription: row.prescription,
      recommendations: row.recommendations,
      followUpNotes: row.follow_up_notes,
      consultationLink: row.consultation_link,
    });

    res.json({ success: emailResult.success, emailResult });
  } catch (err: any) {
    res.status(500).json({ message: 'Error sending consultation email', error: err.message });
  }
}

export async function getByTrackingCode(req: Request, res: Response): Promise<void> {
  const code = String(req.params.code || '');

  try {
    if (isDbConnected()) {
      const sql = `
        SELECT 
          c.id as consultation_id,
          c.status,
          c.consultation_link,
          ct.display_name as consultation_type,
          p.full_name as patient_name,
          c.created_at,
          c.scheduled_at
        FROM consultations c
        JOIN patients p ON p.id = c.patient_id
        JOIN consultation_types ct ON ct.id = c.consultation_type_id
        WHERE UPPER(p.tracking_code) = UPPER($1)
        ORDER BY c.created_at DESC
        LIMIT 1
      `;

      const result = await query(sql, [code.trim()]);
      res.json({ data: result.rows });
      return;
    }

    res.json({ data: [] });
  } catch (err: any) {
    res.status(500).json({ message: 'Error searching tracking code', error: err.message });
  }
}
