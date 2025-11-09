// backend/routes/test.js
// Route: example protected endpoint (auth required)

const express = require('express');
const router = express.Router();

const authMiddleware = require('../middlewares/authMiddleware');

const isDev = process.env.NODE_ENV === 'development';

// GET /api/protected -> test authentication and token validity
router.get('/protected', authMiddleware, (req, res) => {
  if (isDev) console.debug('[protected] user verified:', req.user?.id);
  return res.status(200).json({
    message: 'Accès autorisé',
    user: req.user,
  });
});

module.exports = router;
