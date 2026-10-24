import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool, testConnection } from '../config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function initDatabase() {
  console.log('[PostgreSQL] Initializing Database Schema...');
  const connected = await testConnection();

  if (!connected) {
    console.error('[PostgreSQL Error] Unable to connect to the PostgreSQL server. Please check your credentials in server/.env');
    process.exit(1);
  }

  try {
    const schemaPath = path.join(__dirname, 'schema.sql');
    const sql = fs.readFileSync(schemaPath, 'utf8');

    console.log('[PostgreSQL] Executing schema.sql...');
    await pool.query(sql);
    console.log('[PostgreSQL] Database schema & seed data initialized successfully!');
    process.exit(0);
  } catch (err: any) {
    console.error('[PostgreSQL Error] Failed to initialize schema:', err.message);
    process.exit(1);
  }
}

initDatabase();
