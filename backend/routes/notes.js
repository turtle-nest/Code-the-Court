// backend/routes/notes.js
const express = require('express');
const router = express.Router();
const { listNotes, createNote, updateNote, deleteNote } = require('../controllers/notesController');
const auth = require('../middlewares/authMiddleware'); // must set req.user

// Generic notes endpoints
router.get('/', auth, listNotes);
router.post('/', auth, createNote);
router.patch('/:id', auth, updateNote);
router.delete('/:id', auth, deleteNote);

// Nested under decisions (convenience)
router.get('/decision/:decisionId', auth, listNotes);
router.post('/decision/:decisionId', auth, createNote);

module.exports = router;
