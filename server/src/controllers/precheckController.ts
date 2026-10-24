import type { Request, Response } from 'express';
import { query, isDbConnected } from '../config/db.js';

export async function createPrecheck(req: Request, res: Response): Promise<void> {
  const {
    _patient_id, patient_id,
    _chief_complaint, chief_complaint,
    _symptoms, symptoms,
    _symptom_duration, symptom_duration,
    _allergies, allergies,
    _current_medications, current_medications,
    _medical_history, medical_history,
    _has_chronic_conditions, has_chronic_conditions,
    _chronic_conditions_detail, chronic_conditions_detail,
    _file_urls, file_urls,
  } = req.body;

  const pId = _patient_id || patient_id;
  const cc = _chief_complaint || chief_complaint;
  const sym = _symptoms || symptoms || [];
  const duration = _symptom_duration || symptom_duration || null;
  const alg = _allergies || allergies || null;
  const meds = _current_medications || current_medications || null;
  const history = _medical_history || medical_history || null;
  const chronic = _has_chronic_conditions !== undefined ? _has_chronic_conditions : has_chronic_conditions || false;
  const chronicDetail = _chronic_conditions_detail || chronic_conditions_detail || null;
  const urls = _file_urls || file_urls || [];

  try {
    if (isDbConnected()) {
      const sql = `
        INSERT INTO medical_prechecks (
          patient_id, chief_complaint, symptoms, symptom_duration,
          allergies, current_medications, medical_history,
          has_chronic_conditions, chronic_conditions_detail, file_urls
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING id
      `;

      const result = await query(sql, [
        pId, cc, sym, duration, alg, meds, history, chronic, chronicDetail, urls
      ]);

      res.status(201).json({ data: { id: result.rows[0].id } });
      return;
    }

    const id = `chk_${Date.now()}`;
    res.status(201).json({ data: { id } });
  } catch (err: any) {
    res.status(500).json({ message: 'Failed to create precheck', error: err.message });
  }
}

export async function uploadFile(req: Request, res: Response): Promise<void> {
  if (!req.file) {
    res.status(400).json({ message: 'No file uploaded' });
    return;
  }
  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({ path: fileUrl });
}
