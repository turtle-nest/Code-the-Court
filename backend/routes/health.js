// backend/routes/health.js
const { Router } = require('express');
const router = Router();

// Simple health check route compatible with Render / monitoring tools
// It always returns 200 (OK) to signal that the app is up
router.get('/', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'SocioJustice API running',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
