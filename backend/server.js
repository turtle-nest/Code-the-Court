// backend/server.js
require('dotenv').config();

const path = require('path');
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

// Optional: only if these files exist in your repo
let db, errorHandler;
try { db = require('./config/db'); } catch (_) {}
try { errorHandler = require('./middlewares/errorHandler'); } catch (_) {}

const app = express();

/* ----------------------------- Core Middlewares ---------------------------- */
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
app.use(cors({
  origin: FRONTEND_URL,
  credentials: true
}));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Trust proxy if you are behind reverse proxies (docker/nginx)
if (process.env.TRUST_PROXY === '1') {
  app.set('trust proxy', 1);
}

/* --------------------------------- Health --------------------------------- */
// Must exist for CI/Makefile/Newman smoke tests
app.get('/health', async (req, res) => {
  // Optional DB ping if available, but never fail health because of DB
  if (db && typeof db.query === 'function') {
    try {
      const r = await db.query('SELECT NOW() AS now');
      return res.status(200).json({ status: 'ok', dbTime: r.rows?.[0]?.now });
    } catch (_) {
      // If DB fails, still return 200 to indicate the process is up
      return res.status(200).json({ status: 'ok', db: 'unreachable' });
    }
  }
  return res.sendStatus(200);
});

/* --------------------------------- Static --------------------------------- */
const publicRoot = path.resolve(process.cwd(), 'public');
app.use('/public', express.static(publicRoot));

const uploadsRoot = path.resolve(process.cwd(), 'uploads');
app.use('/uploads', express.static(uploadsRoot));

/* --------------------------------- Routes --------------------------------- */
// Mount only if the route modules exist — keeps the file resilient
function safeMount(routePath, routerPath) {
  try {
    const router = require(routerPath);
    app.use(routePath, router);
  } catch (e) {
    // Silent skip if router file does not exist yet
    if (process.env.NODE_ENV !== 'test') {
      console.warn(`Route "${routePath}" not mounted: ${e.message}`);
    }
  }
}

safeMount('/api/notes', './routes/notes');
safeMount('/api/archives', './routes/archives');
safeMount('/api/decisions', './routes/decisions');
safeMount('/api/users', './routes/users');
safeMount('/api', './routes/index'); // optional aggregator if you have one

/* ------------------------------- 404 handler ------------------------------- */
app.use((req, res, next) => {
  if (req.path === '/' || req.path === '/index.html') {
    // Optional: serve a very small default index if needed
    return res
      .status(200)
      .send(`<html><body><h1>SocioJustice API</h1><p>OK</p></body></html>`);
  }
  return res.status(404).json({ error: 'Not found' });
});

/* ------------------------------ Error handler ------------------------------ */
if (typeof errorHandler === 'function') {
  app.use(errorHandler);
} else {
  // Minimal fallback error handler
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    const status = err.status || err.code || 500;
    const message = err.message || 'Internal Server Error';
    if (process.env.NODE_ENV !== 'test') {
      console.error('Unhandled error:', err);
    }
    res.status(status).json({ error: message });
  });
}

/* ------------------------------- Export/Run -------------------------------- */
module.exports = app; // Export for Jest/Supertest

// Only start the server if this file is run directly (not when imported by tests)
if (require.main === module) {
  const PORT = Number(process.env.PORT) || 3000;
  app.listen(PORT, async () => {
    console.log(`API listening on port ${PORT}`);
    console.log(`Static: /public -> ${publicRoot}`);
    console.log(`Uploads: /uploads -> ${uploadsRoot}`);

    // Optional visibility on DB connectivity at boot
    if (db && typeof db.query === 'function') {
      try {
        const r = await db.query('SELECT NOW() AS now');
        console.log('DB Time:', r.rows?.[0]?.now);
      } catch (err) {
        console.error('DB Error at startup:', err?.message || err);
      }
    }
  });
}
