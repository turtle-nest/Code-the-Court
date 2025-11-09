// backend/routes/notes.js
// Routes: notes linked to decisions or archives

const express = require('express');
const router = express.Router();

const {
  listNotes,
  createNote,
  updateNote,
  deleteNote,
} = require('../controllers/notesController');

const authMiddleware = require('../middlewares/authMiddleware');
const { validateUUIDParam } = require('../middlewares/validateInput');

const isDev = process.env.NODE_ENV === 'development';

// ---- Generic notes endpoints ----
router.get('/', authMiddleware, listNotes);
router.post('/', authMiddleware, createNote);
router.patch('/:id', authMiddleware, validateUUIDParam('id'), updateNote);
router.delete('/:id', authMiddleware, validateUUIDParam('id'), deleteNote);

// ---- Nested routes (under decisions) ----
router.get('/decision/:decisionId', authMiddleware, validateUUIDParam('decisionId'), listNotes);
router.post('/decision/:decisionId', authMiddleware, validateUUIDParam('decisionId'), createNote);

if (isDev) console.debug('[notes] routes loaded');

module.exports = router;
