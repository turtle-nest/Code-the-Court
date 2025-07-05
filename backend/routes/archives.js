// backend/routes/archives.js

const express = require('express');
const router = express.Router();

const authMiddleware = require('../middlewares/authMiddleware');
const upload = require('../middlewares/upload');
const { createArchive, getAllArchives } = require('../controllers/archivesController');
const { validateCreateArchive } = require('../middlewares/validateInput');

// ✅ GET all archives (public ou auth si tu veux)
router.get('/', getAllArchives);

// ✅ POST archive avec upload PDF
router.post(
  '/',
  authMiddleware,
  upload.single('pdf'),   // ✅ MULTER gère le parsing du form-data ici
  validateCreateArchive,  // ✅ Ta vérif custom du body
  createArchive
);

module.exports = router;
