const express = require('express');
const router = express.Router();

const { login, registerUser, refreshToken } = require('../controllers/authController');
const { validateRegistration } = require('../middlewares/validateInput');

router.post('/login', login);
router.post('/users/register', validateRegistration, registerUser);
router.post('/refresh', refreshToken);

module.exports = router;
