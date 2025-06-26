// routes/profile.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/', authMiddleware, (req, res) => {
  // req.user is defined by the middleware, from the decoded JWT
  res.json({ profile: req.user });
});

module.exports = router;

