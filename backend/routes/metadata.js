// routes/metadata.js
const express = require('express');
const router = express.Router();

// Valeurs centralisées pour ton MVP
router.get('/', (req, res) => {
  res.json({
    jurisdictions: [
      "Cour de cassation",
      "Cour d'appel",
      "Tribunal judiciaire",
      "Conseil des prud'hommes"
    ],
    caseTypes: [
      "Civil",
      "Pénal",
      "Social",
      "Administratif"
    ]
  });
});

module.exports = router;
