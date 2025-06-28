const express = require('express');
const router = express.Router();

const { approveUser } = require('../controllers/adminController');
const authMiddleware = require('../middlewares/authMiddleware');
const adminOnly = require('../middlewares/adminOnly');
const { validateApproveUser } = require('../middlewares/validateInput');

router.post('/approve', authMiddleware, adminOnly, validateApproveUser, approveUser);

module.exports = router;
