// routes/archives.js
const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { createArchive } = require('../controllers/archivesController');

router.post('/', upload.single('pdf'), createArchive);

module.exports = router;
