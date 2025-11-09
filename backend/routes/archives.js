// backend/routes/archives.js
// Routes: archives (list, meta, file streaming, create with PDF upload, delete)

const express = require('express');
const router = express.Router();

const authMiddleware = require('../middlewares/authMiddleware');
const upload = require('../middlewares/upload');
const {
  createArchive,
  getAllArchives,
  getArchiveMeta,
  getArchiveFile,
  deleteArchive,
} = require('../controllers/archivesController');
const {
  validateCreateArchive,
  validateUUIDParam,
} = require('../middlewares/validateInput');

const isDev = process.env.NODE_ENV === 'development';

// List archives
router.get('/', getAllArchives);

// Archive metadata (+ file_url, download_url)
router.get('/:id', validateUUIDParam('id'), getArchiveMeta);

// File streaming (inline or download with ?download=1)
router.get('/:id/file', validateUUIDParam('id'), getArchiveFile);

// Backward-compat: redirect /download -> /file?download=1
router.get('/:id/download', validateUUIDParam('id'), (req, res) => {
  res.redirect(302, `/api/archives/${req.params.id}/file?download=1`);
});

// Create archive (PDF upload) + mirror decision
router.post(
  '/',
  // Validate basic fields first
  validateCreateArchive,
  // Auth after we know payload is minimally valid
  authMiddleware,
  // Accept both 'pdf' and 'file' field names from the frontend
  upload.fields([
    { name: 'pdf', maxCount: 1 },
    { name: 'file', maxCount: 1 },
  ]),
  // Normalize to req.file so controllers can keep using req.file like single()
  (req, res, next) => {
    const f =
      (req.files?.pdf && req.files.pdf[0]) ||
      (req.files?.file && req.files.file[0]) ||
      null;

    if (!f) {
      return res
        .status(400)
        .json({ error: "No file provided (expected 'pdf' or 'file')." });
    }

    if (isDev) {
      console.debug('[archives] fieldname:', f.fieldname);
      console.debug('[archives] originalname:', f.originalname);
    }

    req.file = f;
    return next();
  },
  createArchive
);

// Delete archive
router.delete('/:id', authMiddleware, validateUUIDParam('id'), deleteArchive);

module.exports = router;
