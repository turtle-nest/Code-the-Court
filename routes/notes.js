// routes/notes.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const { createNote } = require('../controllers/notesController');
const { validateCreateNote } = require('../middlewares/validateInput');

router.post('/', authMiddleware, validateCreateNote, createNote);

module.exports = router;
