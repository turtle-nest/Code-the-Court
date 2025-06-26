// controllers/decisionsController.js
const db = require('../config/db');
const ApiError = require('../utils/apiError');
const { fetchDecisionsFromJudilibre } = require('../services/judilibreService');

// GET /api/decisions
const getAllDecisions = async (req, res, next) => {
  try {
    const { date, juridiction, type_affaire } = req.query;

    let query = 'SELECT * FROM decisions';
    let filters = [];
    let values = [];

    if (date) {
      filters.push(`date = $${values.length + 1}`);
      values.push(date);
    }
    if (juridiction) {
      filters.push(`jurisdiction = $${values.length + 1}`);
      values.push(juridiction);
    }
    if (type_affaire) {
      filters.push(`case_type = $${values.length + 1}`);
      values.push(type_affaire);
    }

    if (filters.length > 0) {
      query += ' WHERE ' + filters.join(' AND ');
    }
    query += ' ORDER BY date DESC LIMIT 20';

    const result = await db.query(query, values);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('❌ Error fetching decisions:', error);
    next(new ApiError('Internal server error', 500));
  }
};

// GET /api/decisions/import
const importDecisionsFromJudilibre = async (req, res, next) => {
  try {
    const { date, juridiction, type_affaire } = req.query;

    const data = await fetchDecisionsFromJudilibre({ date, juridiction, type_affaire });

    res.status(200).json(data);
  } catch (error) {
    console.error('❌ Error importing decisions from Judilibre:');
    console.error('📛 Message:', error.message);
    console.error('📦 Response data:', error.response?.data);
    console.error('📦 Response status:', error.response?.status);
    next(new ApiError('Failed to import from Judilibre', 500));
  }
};

module.exports = {
  getAllDecisions,
  importDecisionsFromJudilibre,
};
