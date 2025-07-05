// routes/metadata.js
const express = require('express');
const router = express.Router();

// Codes corrects pour Judilibre
router.get('/', (req, res) => {
  res.json({
    jurisdictions: [
      "CC",  // Cour de cassation
      "CA",  // Cour d'appel
      "TJ",  // Tribunal judiciaire
      "CPH"  // Conseil des prud'hommes
    ],
    caseTypes: [
      "CIV",  // Civil
      "PEN",  // Pénal
      "SOC",  // Social
      "ADM"   // Administratif
    ]
  });
});

module.exports = router;
