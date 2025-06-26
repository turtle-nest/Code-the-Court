// routes/test.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/protected', authMiddleware, (req, res) => {
  res.json({ message: 'Accès autorisé', user: req.user });
});

module.exports = router;
