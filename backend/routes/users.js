// backend/routes/users.js
const { Router } = require('express');
const { registerUser } = require('../controllers/usersController');
const { login, refreshToken } = require('../controllers/authController');

const router = Router();

/* --------------------------- AUTHENTICATION --------------------------- */

// ➜ Inscription utilisateur (demande de compte)
router.post('/register', registerUser);

// ➜ Connexion utilisateur
router.post('/login', login);

// ➜ Rafraîchissement du token JWT
router.post('/refresh', refreshToken);

/* ------------------------------- TEST -------------------------------- */
router.get('/', (req, res) => res.json({ ok: true }));

module.exports = router;
