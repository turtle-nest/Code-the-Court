// routes/decisions.js
const authMiddleware = require('../middlewares/authMiddleware');
const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const db = require('../config/db');
const { getAllDecisions } = require('../controllers/decisionsController');
const { importDecisionsFromJudilibre } = require('../controllers/decisionsController');
const ApiError = require('../utils/apiError');

router.get('/', getAllDecisions);
router.get('/import', importDecisionsFromJudilibre);

// MOCK route
router.get('/import/mock', (req, res, next) => {
  const filePath = path.join(__dirname, '../mock/mock_decisions.json');

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      return next(new ApiError('Failed to load mock decisions', 500));
    }

    try {
      const decisions = JSON.parse(data);
      res.status(200).json(decisions);
    } catch (parseError) {
      return next(new ApiError('Invalid mock data format', 500));
    }
  });
});

router.get('/stats', authMiddleware, async (req, res) => {
  const { rows } = await db.query(`
    SELECT 
      COUNT(*) FILTER (WHERE source = 'judilibre')::int AS judilibre,
      COUNT(*) FILTER (WHERE source = 'archive')::int AS archive,
      COUNT(*)::int AS total
    FROM decisions
  `);
  res.json(rows[0]);
});

module.exports = router;
