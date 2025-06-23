// routes/archives.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');
const { createArchive } = require('../controllers/archivesController');

router.post('/', authMiddleware, upload.single('pdf'), createArchive);

module.exports = router;
