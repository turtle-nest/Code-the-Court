// backend/controllers/metadataController.js
// Controller: serve static metadata (jurisdictions & case types)
// Note: kept in-memory for MVP; can be moved to DB/config later.

const getMetadata = (req, res) => {
  // UI labels are intentionally in French (site language).
  const jurisdictions = [
    'Cour de cassation',
    "Cour d’appel",
    'Tribunal judiciaire',
    'Conseil d’État',
    'Tribunal administratif',
  ];

  const caseTypes = [
    'Civil',
    'Pénal',
    'Social',
    'Commercial',
    'Administratif',
    'Autre',
  ];

  return res.status(200).json({ jurisdictions, caseTypes });
};

module.exports = { getMetadata };
