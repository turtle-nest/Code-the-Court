// backend/routes/profile.js
// Routes: user profile and account operations (auth required)

const express = require('express');
const router = express.Router();

const authMiddleware = require('../middlewares/authMiddleware');

const isDev = process.env.NODE_ENV === 'development';

// GET /api/users -> returns current user profile from JWT
router.get('/', authMiddleware, (req, res) => {
  if (isDev) console.debug('[users] profile fetched for user:', req.user?.id);
  return res.status(200).json({ profile: req.user });
});

module.exports = router;
