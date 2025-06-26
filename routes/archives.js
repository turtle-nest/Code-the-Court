// routes/archives.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const upload = require('../middlewares/upload');
const { createArchive, getAllArchives } = require('../controllers/archivesController');

router.get('/', getAllArchives);

router.post(
  '/',
  authMiddleware,
  upload.single('pdf'),
  createArchive
);

module.exports = router;
