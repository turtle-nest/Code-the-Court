// routes/admin.js
const express = require('express');
const router = express.Router();
const { approveUser } = require('../controllers/adminController');
const authMiddleware = require('../middlewares/authMiddleware');
const adminOnly = require('../middlewares/adminOnly');

router.post('/approve', authMiddleware, adminOnly, approveUser);

module.exports = router;
