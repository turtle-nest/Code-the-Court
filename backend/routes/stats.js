// backend/routes/stats.js
// Routes: user and system statistics (dashboard metrics)

const express = require('express');
const router = express.Router();

const { getUserStats } = require('../controllers/statsController');
const authMiddleware = require('../middlewares/authMiddleware');

const isDev = process.env.NODE_ENV === 'development';

// GET /api/stats -> secured user stats
router.get('/', authMiddleware, getUserStats);

if (isDev) console.debug('[stats] routes loaded');

module.exports = router;
