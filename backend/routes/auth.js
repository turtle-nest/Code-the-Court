// backend/routes/auth.js
// Routes: authentication (login, register)

const express = require('express');
const router = express.Router();

const { login, registerUser } = require('../controllers/authController');
const { validateRegistration } = require('../middlewares/validateInput');

// Login (email + password)
router.post('/login', login);

// User registration (validated)
router.post('/users/register', validateRegistration, registerUser);

module.exports = router;
