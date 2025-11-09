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
} = require('../middlewares/validateInput');

const isDev = process.env.NODE_ENV === 'development';

/* --------------------------- ID validator (local) -------------------------- */
/**
 * Accepts either a UUID (xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx) or a plain integer.
 * This avoids hard-coupling to DB type for archives.id.
 */
function validateIdParam(paramName = 'id') {
  const reUuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
  const reInt = /^\d+$/;
  return (req, res, next) => {
    const val = req.params[paramName];
    if (!val || (!reUuid.test(val) && !reInt.test(val))) {
      return res.status(400).json({ error: `Invalid ${paramName} format` });
    }
    next();
  };
}

/* --------------------------------- Routes --------------------------------- */

// List archives
router.get('/', getAllArchives);

// Archive metadata (+ file_url, download_url)
router.get('/:id', validateIdParam('id'), getArchiveMeta);

// File streaming (inline or download with ?download=1)
router.get('/:id/file', validateIdParam('id'), getArchiveFile);

// Backward-compat: redirect /download -> /file?download=1
router.get('/:id/download', validateIdParam('id'), (req, res) => {
  res.redirect(302, `/api/archives/${req.params.id}/file?download=1`);
});

// Create archive (PDF upload) + mirror decision
router.post(
  '/',
  // 1) Auth first → rejette tôt sans parser un upload inutile
  authMiddleware,

  // 2) Multer : accepte 'pdf' ou 'file' depuis le front
  upload.fields([
    { name: 'pdf',  maxCount: 1 },
    { name: 'file', maxCount: 1 },
  ]),

  // 3) Normalisation : expose unifiés en req.file (compat avec controller)
  (req, res, next) => {
    const f =
      (req.files && req.files.pdf  && req.files.pdf[0]) ||
      (req.files && req.files.file && req.files.file[0]) ||
      null;

    if (!f) {
      return res
        .status(400)
        .json({ error: "No file provided (expected field 'pdf' or 'file')." });
    }

    if (isDev) {
      console.debug('[archives] fieldname:', f.fieldname);
      console.debug('[archives] originalname:', f.originalname);
    }

    req.file = f;
    next();
  },

  // 4) Validation des champs textuels (req.body est maintenant peuplé par Multer)
  validateCreateArchive,

  // 5) Contrôleur
  createArchive
);

// Delete archive
router.delete('/:id', authMiddleware, validateIdParam('id'), deleteArchive);

module.exports = router;
