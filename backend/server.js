// backend/server.js
require('dotenv').config();

const path = require('path');
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const isDev = process.env.NODE_ENV === 'development';

// Optional modules (kept resilient if missing)
let db, errorHandler;
try { db = require('./config/db'); } catch (_) {}
try { errorHandler = require('./middlewares/errorHandler'); } catch (_) {}

const { uploadsRoot } = require('./utils/paths'); // single source of truth

const app = express();

/* ----------------------------- Core Middlewares ---------------------------- */
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
app.disable('x-powered-by');

// ✅ CORS global configuration (no app.options('*'))
app.use(cors({
  origin: FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 204,
}));

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Trust proxy when behind reverse proxies (docker/nginx)
if (process.env.TRUST_PROXY === '1') {
  app.set('trust proxy', 1);
  if (isDev) console.debug('[server] trust proxy enabled');
}

/* --------------------------------- Health --------------------------------- */
// Kept lenient: process up == 200 even if DB is down (good for container orchestration)
app.get('/health', async (req, res) => {
  if (db?.query) {
    try {
      const r = await db.query('SELECT NOW() AS now');
      return res.status(200).json({ status: 'ok', dbTime: r.rows?.[0]?.now });
    } catch {
      return res.status(200).json({ status: 'ok', db: 'unreachable' });
    }
  }
  return res.sendStatus(200);
});

/* --------------------------------- Static --------------------------------- */
const publicRoot = path.resolve(process.cwd(), 'public');
app.use('/public', express.static(publicRoot));
app.use('/uploads', express.static(uploadsRoot));

/* --------------------------------- Routes --------------------------------- */
function safeMount(routePath, routerPath) {
  try {
    const router = require(routerPath);
    app.use(routePath, router);
    if (isDev) console.debug(`[server] mounted ${routePath} -> ${routerPath}`);
  } catch (e) {
    if (isDev) console.warn(`[server] route "${routePath}" not mounted: ${e.message}`);
  }
}

safeMount('/api/notes', './routes/notes');
safeMount('/api/metadata', './routes/metadata');
safeMount('/api/archives', './routes/archives');
safeMount('/api/decisions', './routes/decisions');
safeMount('/api/users', './routes/users');
safeMount('/api', './routes/index'); // optional aggregator if present

/* ------------------------------- 404 handler ------------------------------- */
app.use((req, res) => {
  if (req.path === '/' || req.path === '/index.html') {
    return res
      .status(200)
      .send('<html><body><h1>SocioJustice API</h1><p>OK</p></body></html>');
  }
  return res.status(404).json({ error: 'Not found' });
});

/* ------------------------------ Error handler ------------------------------ */
if (typeof errorHandler === 'function') {
  app.use(errorHandler);
} else {
  // Minimal fallback error handler (kept small and consistent)
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    const status = err.statusCode || err.status || err.code || 500;
    const message = err.message || 'Internal Server Error';
    if (isDev) console.error('[server] Unhandled error:', err);
    return res.status(status).json({ status, error: message });
  });
}

/* ------------------------------- Export/Run -------------------------------- */
module.exports = app;

// Start only when run directly (not when imported by tests)
if (require.main === module) {
  const PORT = Number(process.env.PORT) || 3000;
  app.listen(PORT, async () => {
    console.log(`API listening on port ${PORT}`);
    if (isDev) {
      console.log(`Static:  /public  -> ${publicRoot}`);
      console.log(`Uploads: /uploads -> ${uploadsRoot}`);
    }
    if (db?.query) {
      try {
        const r = await db.query('SELECT NOW() AS now');
        if (isDev) console.log('DB Time:', r.rows?.[0]?.now);
      } catch (err) {
        if (isDev) console.error('DB Error at startup:', err?.message || err);
      }
    }
  });
}
