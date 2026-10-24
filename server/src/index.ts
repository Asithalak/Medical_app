import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import apiRouter from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import { testConnection } from './config/db.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:8080';

// Middleware
app.use(
  cors({
    origin: [CORS_ORIGIN, 'http://localhost:8080', 'http://localhost:5173', 'http://127.0.0.1:8080'],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static uploads directory
const uploadsDir = path.join(__dirname, '../uploads');
app.use('/uploads', express.static(uploadsDir));

// API Routes
app.use('/api', apiRouter);

// Root route
app.get('/', (_req, res) => {
  res.json({
    name: 'Medi Lanka API Server',
    version: '1.0.0',
    database: 'PostgreSQL',
    status: 'Running',
  });
});

// Central Error Handler
app.use(errorHandler);

// Start Server
app.listen(PORT, async () => {
  console.log(`====================================================`);
  console.log(`Medi Lanka API Server running on port ${PORT}`);
  console.log(`Endpoint: http://localhost:${PORT}/api`);
  console.log(`====================================================`);
  
  // Test PostgreSQL connection
  await testConnection();
});

export default app;
