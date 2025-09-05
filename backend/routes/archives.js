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
  upload.single('pdf'), // input name="pdf"
  // if you have input validation, keep it here (e.g., validateCreateArchive)
  createArchive
);

module.exports = router;
