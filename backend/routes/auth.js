// backend/routes/auth.js
const express = require('express');
const router = express.Router();

const { login, registerUser } = require('../controllers/authController');
const { validateRegistration } = require('../middlewares/validateInput');

router.post('/login', login);
router.post('/users/register', validateRegistration, registerUser);

module.exports = router;
