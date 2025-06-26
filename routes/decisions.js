// routes/decisions.js
const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
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

module.exports = router;
