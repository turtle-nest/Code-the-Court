// backend/server.js
require('dotenv').config();

const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const db = require('./config/db');                    // keep your db pool/conn
const errorHandler = require('./middlewares/errorHandler'); // keep your error handler

// Routers (keep only what exists in your repo)
const notesRouter = require('./routes/notes');
const archivesRouter = require('./routes/archives');

const app = express();

/* ----------------------------- Env & constants ---------------------------- */
const PORT = process.env.PORT || 3000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const isDev = process.env.NODE_ENV !== 'production';

// Centralized uploads path (Docker-safe)
const uploadsRoot = path.resolve(process.cwd(), 'uploads');

/* --------------------------------- CORS ---------------------------------- */
// Allow Vite dev server with credentials during development only
if (isDev) {
  app.use(
    cors({
      origin: FRONTEND_URL,     // must exactly match your front dev origin
      credentials: true,        // send/receive cookies
      methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );
}

/* ------------------------------ Middlewares ------------------------------ */
app.use(cookieParser());
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

/* --------------------------- Ensure uploads dir --------------------------- */
try {
  fs.mkdirSync(uploadsRoot, { recursive: true });
} catch (err) {
  console.error('Failed to ensure uploads directory:', err);
}

// (Optional) expose uploads for local previews; disable if not desired
app.use('/uploads', express.static(uploadsRoot));

/* -------------------------------- Health --------------------------------- */
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

/* --------------------------------- Routes -------------------------------- */
app.use('/api/notes', notesRouter);
app.use('/api/archives', archivesRouter);
// Add your other routers here, e.g.:
// app.use('/api/decisions', decisionsRouter);
// app.use('/api/auth', authRouter);
// app.use('/api/users', usersRouter);

/* ------------------------------ 404 handler ------------------------------ */
app.use((req, res, next) => {
  if (res.headersSent) return next();
  res.status(404).json({ error: 'Not Found', path: req.originalUrl });
});

/* --------------------------- Error middleware ---------------------------- */
app.use(errorHandler);

/* ------------------------------- Start server ---------------------------- */
app.listen(PORT, async () => {
  console.log(`✅ API listening on http://localhost:${PORT}`);
  console.log(`🌐 CORS ${isDev ? 'enabled (dev)' : 'disabled (prod)'}; FRONTEND_URL=${FRONTEND_URL}`);
  console.log(`📁 uploads: ${uploadsRoot}`);

  // Optional DB ping for visibility (safe no-op if db.query not available)
  if (db && typeof db.query === 'function') {
    try {
      const r = await db.query('SELECT NOW() AS now');
      console.log('📅 DB Time:', r.rows?.[0]?.now);
    } catch (err) {
      console.error('❌ DB Error:', err?.message || err);
    }
  }
});
