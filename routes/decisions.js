// routes/decisions.js
const express = require('express');
const router = express.Router();
const { getAllDecisions } = require('../controllers/decisionsController');

router.get('/', getAllDecisions);

module.exports = router;
