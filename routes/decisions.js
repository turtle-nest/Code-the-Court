const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const path = require('path');
const fs = require('fs');
const ApiError = require('../utils/apiError');

const {
  getAllDecisions,
  importDecisionsFromJudilibre,
  getJurisdictions,
  getCaseTypes,
  getDecisionsStats
} = require('../controllers/decisionsController');

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

// Auxiliary roads
router.get('/stats', authMiddleware, getDecisionsStats);
router.get('/juridictions', getJurisdictions);
router.get('/case-types', getCaseTypes);

module.exports = router;
