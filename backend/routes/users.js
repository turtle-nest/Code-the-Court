// backend/routes/users.js
// Routes: user authentication & account endpoints

const { Router } = require('express');
const router = Router();

const { login, refreshToken, registerUser } = require('../controllers/authController');
const isDev = process.env.NODE_ENV === 'development';

/* --------------------------- AUTHENTICATION --------------------------- */

// ➜ User registration request
router.post('/register', registerUser);

// ➜ User login
router.post('/login', login);

// ➜ JWT refresh token
router.post('/refresh', refreshToken);

/* ------------------------------- TEST -------------------------------- */
// Simple health check or dev test endpoint
router.get('/', (req, res) => {
  if (isDev) console.debug('[users] health check OK');
  return res.status(200).json({ ok: true });
});

module.exports = router;
