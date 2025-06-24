// controllers/decisionsController.js
const db = require('../config/db');
const ApiError = require('../utils/apiError');
const fetch = require('node-fetch'); // Install with: npm install node-fetch

// GET /api/decisions
const getAllDecisions = async (req, res, next) => {
  try {
    const result = await db.query(
      'SELECT * FROM decisions ORDER BY date DESC LIMIT 20'
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('❌ Error fetching decisions:', error);
    next(new ApiError('Internal server error', 500));
  }
};

// GET /api/decisions/import
const importDecisionsFromJudilibre = async (req, res, next) => {
  try {
    // Build query params from frontend (optional: req.query)
    // Example: filter by date, jurisdiction, type
    // You can adapt params as needed
    const { date, jurisdiction, type_affaire } = req.query;
    let apiUrl = 'https://www.judilibre.io/api/v1/decisions?';

    if (date) apiUrl += `date_start=${date}&`; // or adapt param name
    if (jurisdiction) apiUrl += `jurisdiction=${jurisdiction}&`;
    if (type_affaire) apiUrl += `type_affaire=${type_affaire}&`;
    apiUrl += 'page_size=20';

    // Fetch decisions from Judilibre
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new ApiError('Failed to fetch Judilibre', response.status);
    }
    const data = await response.json();

    // You could insert data into DB here if you want to persist

    res.status(200).json(data);
  } catch (error) {
    console.error('❌ Error importing decisions from Judilibre:', error);
    next(new ApiError('Failed to import from Judilibre', 500));
  }
};

module.exports = {
  getAllDecisions,
  importDecisionsFromJudilibre,
};
