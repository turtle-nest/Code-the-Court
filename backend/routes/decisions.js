// backend/routes/decisions.js
// Routes: decisions listing, import, metadata, stats, detail & keywords

const express = require('express');
const router = express.Router();
const path = require('path');
const fsp = require('fs/promises');

const authMiddleware = require('../middlewares/authMiddleware');
const ApiError = require('../utils/apiError');

const {
  getAllDecisions,
  getDecisionById,
  importDecisionsFromJudilibre,
  getJurisdictions,
  getCaseTypes,
  getDecisionsStats,
  updateDecisionKeywords,
} = require('../controllers/decisionsController');

const {
  validateDecisionsQuery,
  validateUUIDParam,
} = require('../middlewares/validateInput');

const isDev = process.env.NODE_ENV === 'development';

// ---- Fixed routes before dynamics ----
router.get('/', validateDecisionsQuery, getAllDecisions);

router.post('/import', importDecisionsFromJudilibre);

router.get('/import/mock', async (req, res, next) => {
  try {
    const filePath = path.resolve(__dirname, '../mock/mock_decisions.json');
    const raw = await fsp.readFile(filePath, 'utf8');
    const decisions = JSON.parse(raw);

    return res.status(200).json({
      count: decisions.length,
      timestamp: new Date().toISOString(),
      results: decisions,
    });
  } catch (err) {
    if (isDev) console.error('[decisions] /import/mock error:', err);
    if (err.code === 'ENOENT') {
      return next(new ApiError('Mock file not found', 404));
    }
    if (err.name === 'SyntaxError') {
      return next(new ApiError('Invalid mock data format', 500));
    }
    return next(new ApiError('Failed to load mock decisions', 500));
  }
});

router.get('/stats', getDecisionsStats);
router.get('/jurisdictions', getJurisdictions);
router.get('/case-types', getCaseTypes);

// ---- Dynamic routes at the end ----
router.put('/:id/keywords', validateUUIDParam('id'), authMiddleware, updateDecisionKeywords);
router.get('/:id', validateUUIDParam('id'), getDecisionById);

module.exports = router;
