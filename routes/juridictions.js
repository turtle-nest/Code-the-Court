// routes/juridictions.js
const express = require('express');
const router = express.Router();

// Mock list of jurisdictions (customize as needed)
const juridictions = [
  { id: 1, name: 'Cour d\'appel' },
  { id: 2, name: 'Tribunal judiciaire' },
  { id: 3, name: 'Conseil de prud\'hommes' },
];

router.get('/', (req, res) => {
  res.json(juridictions);
});

module.exports = router;
