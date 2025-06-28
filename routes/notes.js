// routes/notes.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const { createNote } = require('../controllers/notesController');

router.post('/', authMiddleware, createNote);

module.exports = router;
