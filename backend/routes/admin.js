// backend/routes/admin.js
// Routes: admin operations (approval workflow)

const express = require('express');
const router = express.Router();

const { approveUser } = require('../controllers/adminController');
const authMiddleware = require('../middlewares/authMiddleware');
const adminOnly = require('../middlewares/adminOnly');
const { validateApproveUser } = require('../middlewares/validateInput');

// Approve a user (admin only)
// Validate body -> then auth -> then role check -> controller
router.post(
  '/approve',
  validateApproveUser,
  authMiddleware,
  adminOnly,
  approveUser
);

module.exports = router;
