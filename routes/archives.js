const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const upload = require('../middlewares/upload'); // Multer config
const { createArchive, getAllArchives } = require('../controllers/archivesController');
const { validateCreateArchive } = require('../middlewares/validateInput');

// 🔒 GET all archives (public)
router.get('/', getAllArchives);

// ✅ Route normale avec upload PDF obligatoire
router.post(
  '/',
  authMiddleware,
  upload.single('pdf'),
  validateCreateArchive,
  createArchive
);

// ✅ Route DEBUG : teste validation JSON sans upload
router.post(
  '/debug',
  authMiddleware,
  upload.none(), // 👈 aucun champ fichier traité ici
  validateCreateArchive,
  createArchive
);

module.exports = router;
