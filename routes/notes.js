// routes/notes.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware, (req, res) => {
  const user_id = req.user.id;
  const { target_id, target_type, content } = req.body;

  res.json({
    message: 'Note created (fake)',
    note: {
      user_id,
      target_id,
      target_type,
      content
    }
  });
});

module.exports = router;
