const express = require('express');
const router = express.Router();

const authMiddleware = require('../middlewares/authMiddleware');

router.get('/', authMiddleware, (req, res) => {
  res.json({ profile: req.user });
});

module.exports = router;
