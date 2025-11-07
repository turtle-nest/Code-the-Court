// backend/routes/index.js
const { Router } = require('express');
const usersRouter = require('./users');
const { login, refreshToken } = require('../controllers/authController');
const { registerUser } = require('../controllers/usersController');

const api = Router();

// Compatibilité: le front appelle /api/login
api.post('/login', login);
api.post('/refresh', refreshToken);
// (optionnel) alias si un jour le front appelle /api/register
api.post('/register', registerUser);

// Groupe /api/users (reste inchangé)
api.use('/users', usersRouter);

module.exports = api;
