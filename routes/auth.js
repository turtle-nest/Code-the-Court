// routes/auth.js
const express = require('express');
const router = express.Router();
const { login } = require('../controllers/authController');
const { registerUser } = require('../controllers/usersController');

router.post('/login', login);
router.post('/users/register', registerUser);
router.post('/users/register', registerUser);

module.exports = router;
