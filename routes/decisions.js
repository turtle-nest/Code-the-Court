// routes/decisions.js
const express = require('express');
const router = express.Router();
const { getAllDecisions } = require('../controllers/decisionsController');
const { importDecisionsFromJudilibre } = require('../controllers/decisionsController');

router.get('/', getAllDecisions);
router.get('/import', importDecisionsFromJudilibre);

module.exports = router;
