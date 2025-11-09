// backend/routes/metadata.js
// Routes: static metadata for Judilibre-compatible jurisdiction & case type codes

const express = require('express');
const router = express.Router();

const isDev = process.env.NODE_ENV === 'development';

// GET /api/metadata
router.get('/', (req, res) => {
  const data = {
    jurisdictions: [
      'CC',  // Cour de cassation
      'CA',  // Cour d'appel
      'TJ',  // Tribunal judiciaire
      'CPH', // Conseil des prud'hommes
    ],
    case_types: [
      'CIV', // Civil
      'PEN', // Pénal
      'SOC', // Social
      'ADM', // Administratif
    ],
  };

  if (isDev) console.debug('[metadata] served metadata codes');

  return res.status(200).json(data);
});

module.exports = router;
