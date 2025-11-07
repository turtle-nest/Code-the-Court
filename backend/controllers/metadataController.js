// controllers/metadataController.js
exports.getMetadata = (req, res) => {
  // Minimal, can move to DB later
  const jurisdictions = [
    'Cour de cassation',
    "Cour d’appel",
    'Tribunal judiciaire',
    'Conseil d’État',
    'Tribunal administratif'
  ];

  const caseTypes = [
    'Civil',
    'Pénal',
    'Social',
    'Commercial',
    'Administratif',
    'Autre'
  ];

  res.json({ jurisdictions, caseTypes });
};
