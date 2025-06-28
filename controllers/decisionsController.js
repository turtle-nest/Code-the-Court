// controllers/decisionsController.js
const db = require('../config/db');
const ApiError = require('../utils/apiError');
const { fetchDecisionsFromJudilibre } = require('../services/judilibreService');
const fs = require('fs');
const path = require('path');

// GET /api/decisions
const getAllDecisions = async (req, res, next) => {
  try {
    const { date, juridiction, type_affaire } = req.query;

    let query = 'SELECT * FROM decisions';
    const filters = [];
    const values = [];

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
    // ⚠️ Fallback vers le mock si USE_MOCK=true
    if (process.env.USE_MOCK === 'true') {
      const mockPath = path.join(__dirname, '../mock/mock_decisions.json');
      const raw = fs.readFileSync(mockPath, 'utf-8');
      const mockData = JSON.parse(raw);
      return res.status(200).json(mockData);
    }

    const { q, dateDecisionMin, dateDecisionMax, page } = req.query;

    const data = await fetchDecisionsFromJudilibre({ q, dateDecisionMin, dateDecisionMax, page });

    res.status(200).json(data);
  } catch (error) {
    console.error('❌ Error importing decisions from Judilibre:');
    console.error('📛 Message:', error.message);
    if (error.response) {
      console.error('📦 Response data:', error.response.data);
      console.error('📦 Response status:', error.response.status);
    }
    next(new ApiError('Failed to import from Judilibre', 500));
  }
};

// GET /api/decisions/stats
const getDecisionsStats = async (req, res, next) => {
  try {
    const { rows } = await db.query(`
      SELECT 
        COUNT(*) FILTER (WHERE source = 'judilibre')::int AS judilibre,
        COUNT(*) FILTER (WHERE source = 'archive')::int AS archive,
        COUNT(*)::int AS total
      FROM decisions
    `);
    res.status(200).json(rows[0]);
  } catch (error) {
    console.error('❌ Error fetching decisions stats:', error);
    next(new ApiError('Failed to fetch stats', 500));
  }
};

// GET /api/decisions/juridictions
const getJurisdictions = async (req, res, next) => {
  try {
    const result = await db.query(
      'SELECT DISTINCT jurisdiction FROM decisions ORDER BY jurisdiction;'
    );
    const jurisdictions = result.rows.map(row => row.jurisdiction);
    res.status(200).json(jurisdictions);
  } catch (error) {
    console.error('❌ Error fetching jurisdictions:', error);
    next(new ApiError('Failed to fetch jurisdictions', 500));
  }
};

// GET /api/decisions/case-types
const getCaseTypes = async (req, res, next) => {
  try {
    const result = await db.query(
      'SELECT DISTINCT case_type FROM decisions ORDER BY case_type;'
    );
    const caseTypes = result.rows.map(row => row.case_type);
    res.status(200).json(caseTypes);
  } catch (error) {
    console.error('❌ Error fetching case types:', error);
    next(new ApiError('Failed to fetch case types', 500));
  }
};

module.exports = {
  getAllDecisions,
  importDecisionsFromJudilibre,
  getDecisionsStats,
  getJurisdictions,
  getCaseTypes,
};
