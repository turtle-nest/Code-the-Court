// backend/routes/stats.js
const express = require('express');
const router = express.Router();
const { getUserStats } = require('../controllers/statsController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/', authMiddleware, getUserStats);

module.exports = router;
