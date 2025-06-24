// routes/types.js
const express = require('express');
const router = express.Router();

// Mock list of case types (customize as needed)
const types = [
  { id: 1, label: 'Pénal' },
  { id: 2, label: 'Civil' },
  { id: 3, label: 'Social' },
  { id: 4, label: 'Commercial' },
];

router.get('/', (req, res) => {
  res.json(types);
});

module.exports = router;
