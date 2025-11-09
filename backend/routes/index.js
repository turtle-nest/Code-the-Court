// backend/routes/index.js
// API root router: mounts public endpoints and sub-routers

const { Router } = require('express');
const db = require('../config/db');

const usersRouter = require('./users');
const statsRouter = require('./stats');
const metadataRouter = require('./metadata');
const decisionsRouter = require('./decisions');
const archivesRouter = require('./archives');

const { login, refreshToken, registerUser } = require('../controllers/authController');
// ^ Use authController for register to keep a single source of truth.

const api = Router();
const isDev = process.env.NODE_ENV === 'development';

/* ----------------------------- Public endpoints ---------------------------- */
api.post('/login', login);
api.post('/refresh', refreshToken);
api.post('/register', registerUser); // prefer this over usersController.registerUser

/* --------------------------------- /stats ---------------------------------- */
/**
 * Lightweight summary counters for dashboard tiles (kept here for convenience).
 * Note: moved to /stats/summary to avoid ambiguity with statsRouter (/stats/*).
 */
api.get('/stats/summary', async (req, res) => {
  try {
    const { rows: d } = await db.query('SELECT COUNT(*)::int AS c FROM decisions');
    const decisions_count = d[0]?.c || 0;

    const { rows: a } = await db.query('SELECT COUNT(*)::int AS c FROM archives');
    const archives_count = a[0]?.c || 0;

    const { rows: md } = await db.query('SELECT MAX(created_at) AS dt FROM decisions');
    const lastImportDate = md[0]?.dt || null;

    let lastImportCount = 0;
    if (lastImportDate) {
      const { rows: lc } = await db.query(
        `SELECT COUNT(*)::int AS c
         FROM decisions
         WHERE created_at::date = $1::date`,
        [lastImportDate]
      );
      lastImportCount = lc[0]?.c || 0;
    }

    return res.status(200).json({
      decisions_count,
      archives_count,
      lastImportCount,
      lastImportDate,
    });
  } catch (e) {
    if (isDev) console.warn('[api] /stats/summary failed:', e.message || e);
    return res.status(200).json({
      decisions_count: 0,
      archives_count: 0,
      lastImportCount: 0,
      lastImportDate: null,
    });
  }
});

/* -------------------------------- Sub-routers ------------------------------ */
api.use('/metadata', metadataRouter);   // -> /api/metadata/*
api.use('/users', usersRouter);         // -> /api/users/*
api.use('/stats', statsRouter);         // -> /api/stats/*
api.use('/decisions', decisionsRouter); // -> /api/decisions/*
api.use('/archives', archivesRouter);   // -> /api/archives/*

module.exports = api;
