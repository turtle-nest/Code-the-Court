// backend/routes/metadata.js
// Static metadata for Judilibre-compatible codes (backward compatible)

const express = require('express');
const router = express.Router();

const isDev = process.env.NODE_ENV === 'development';

// GET /api/metadata
router.get('/', (req, res) => {
  // Judilibre codes
  const jurisdictions = [
    'CC',  // Cour de cassation
    'CA',  // Cour d'appel
    'TJ',  // Tribunal judiciaire
    'CPH', // Conseil de prud'hommes
  ];

  const caseTypes = [
    'CIV', // Civil
    'PEN', // Pénal
    'SOC', // Social
    'ADM', // Administratif
  ];

  if (isDev) console.debug('[metadata] served metadata codes');
  res.set('Cache-Control', 'public, max-age=3600');

  // ✅ Compat: expose camelCase ET snake_case
  return res.status(200).json({
    jurisdictions,
    caseTypes,            // attendu par le front
    case_types: caseTypes // compat alternative
  });
});

module.exports = router;
