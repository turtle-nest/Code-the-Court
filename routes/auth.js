// routes/auth.js
const express = require('express');
const router = express.Router();
const { login } = require('../controllers/authController');
const { registerUser } = require('../controllers/usersController');
const { validateRegistration } = require('../middlewares/validateInput');

router.post('/login', login);
router.post('/users/register', validateRegistration, registerUser);

module.exports = router;
