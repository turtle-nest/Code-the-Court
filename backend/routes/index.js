const { Router } = require('express');
const db = require('../config/db');

const usersRouter = require('./users');
const metadataRouter = require('./metadata'); // NEW ✅
const { login, refreshToken } = require('../controllers/authController');
const { registerUser } = require('../controllers/usersController');

const api = Router();

/* ----------------------------- Public endpoints ---------------------------- */
api.post('/login', login);
api.post('/refresh', refreshToken);
api.post('/register', registerUser);

/* --------------------------------- /api/stats ------------------------------ */
api.get('/stats', async (req, res) => {
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

    return res.json({ decisions_count, archives_count, lastImportCount, lastImportDate });
  } catch (e) {
    return res.json({ decisions_count: 0, archives_count: 0, lastImportCount: 0, lastImportDate: null });
  }
});

/* -------------------------------- Sub-routers ------------------------------- */
api.use('/metadata', metadataRouter); // NEW ✅  -> /api/metadata
api.use('/users', usersRouter);

module.exports = api;
