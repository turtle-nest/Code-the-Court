// backend/routes/index.js
const { Router } = require('express');
const db = require('../config/db');

const usersRouter = require('./users');
const { login, refreshToken } = require('../controllers/authController');
const { registerUser } = require('../controllers/usersController');

const api = Router();

/* ----------------------------- Public endpoints ---------------------------- */

// Compatibility: frontend calls /api/login
api.post('/login', login);
api.post('/refresh', refreshToken);
// (optional) alias if frontend ever calls /api/register directly
api.post('/register', registerUser);

/* --------------------------------- /api/stats --------------------------------
 * Returns dashboard counters for Home.jsx:
 * - decisions_count
 * - archives_count
 * - lastImportCount (number of decisions on last import date)
 * - lastImportDate
 */
api.get('/stats', async (req, res) => {
  try {
    // decisions total
    const { rows: d } = await db.query('SELECT COUNT(*)::int AS c FROM decisions');
    const decisions_count = d[0]?.c || 0;

    // archives total
    const { rows: a } = await db.query('SELECT COUNT(*)::int AS c FROM archives');
    const archives_count = a[0]?.c || 0;

    // last import date from decisions
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

    return res.json({
      decisions_count,
      archives_count,
      lastImportCount,
      lastImportDate,
    });
  } catch (e) {
    // Graceful fallback so the UI doesn't break if tables are missing
    return res.json({
      decisions_count: 0,
      archives_count: 0,
      lastImportCount: 0,
      lastImportDate: null,
    });
  }
});

/* -------------------------------- Sub-routers ------------------------------- */
api.use('/users', usersRouter);

module.exports = api;
