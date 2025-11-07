// backend/routes/archives.js
const express = require('express');
const router = express.Router();

const authMiddleware = require('../middlewares/authMiddleware');
const upload = require('../middlewares/upload');
const {
  createArchive,
  getAllArchives,
  getArchiveMeta,
  getArchiveFile,
} = require('../controllers/archivesController');

// List archives (optional)
router.get('/', getAllArchives);

// Archive metadata (+ file_url, download_url)
router.get('/:id', getArchiveMeta);

// File streaming (inline or download with ?download=1)
router.get('/:id/file', getArchiveFile);

// Backward-compat: redirect /download -> /file?download=1
router.get('/:id/download', (req, res) => {
  res.redirect(302, `/api/archives/${req.params.id}/file?download=1`);
});

// Create archive (PDF upload) + mirror decision
router.post(
  '/',
  authMiddleware,
  // Accept both 'pdf' and 'file' field names from the frontend
  upload.fields([
    { name: 'pdf', maxCount: 1 },
    { name: 'file', maxCount: 1 },
  ]),
  // Normalize to req.file so controllers can keep using req.file as with single()
  (req, res, next) => {
    const f =
      (req.files && req.files.pdf && req.files.pdf[0]) ||
      (req.files && req.files.file && req.files.file[0]) ||
      null;

    if (!f) {
      return res
        .status(400)
        .json({ error: "No file provided (expected 'pdf' or 'file')." });
    }

    // Debug logs (safe to keep during dev)
    console.log('✅ Multer fieldname:', f.fieldname);
    console.log('✅ Multer originalname:', f.originalname);

    // Make it behave like upload.single(...)
    req.file = f;
    next();
  },
  // If you have input validation, keep it here (e.g., validateCreateArchive)
  createArchive
);

module.exports = router;
