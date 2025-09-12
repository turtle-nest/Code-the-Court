// backend/server.js
require('dotenv').config();

const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

// Optional: your db pool/conn & error handler if you have them
const db = require('./config/db'); // safe if exists
const errorHandler = require('./middlewares/errorHandler'); // safe if exists

// Routers (must exist in your repo)
const notesRouter = require('./routes/notes');
const archivesRouter = require('./routes/archives');

const app = express();

// ---- Config & constants
const isDev = process.env.NODE_ENV !== 'production';
const PORT = Number(process.env.PORT) || 3000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Ensure uploads dir
const uploadsRoot = path.resolve(process.cwd(), 'uploads');
fs.mkdirSync(uploadsRoot, { recursive: true });

// ---- Middlewares
app.use(cors({ origin: FRONTEND_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Static files (PDF archives, etc.)
app.use('/uploads', express.static(uploadsRoot));

// ---- Health check (used by `make health`)
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// ---- API routes
app.use('/api/notes', notesRouter);
app.use('/api/archives', archivesRouter);

// 404 fallback for API
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// ---- Error handler (if present)
if (typeof errorHandler === 'function') {
  app.use(errorHandler);
}

// ---- Start server
app.listen(PORT, async () => {
  console.log(`✅ API listening on http://localhost:${PORT}`);
  console.log(`🌐 CORS ${isDev ? 'enabled (dev)' : 'disabled (prod)'}; FRONTEND_URL=${FRONTEND_URL}`);
  console.log(`📁 uploads: ${uploadsRoot}`);

  // Optional DB ping for visibility
  if (db && typeof db.query === 'function') {
    try {
      const r = await db.query('SELECT NOW() AS now');
      console.log('📅 DB Time:', r.rows?.[0]?.now);
    } catch (err) {
      console.error('❌ DB Error:', err?.message || err);
    }
  }
});

module.exports = app; // optional (useful for tests)
