// backend/controllers/decisionsController.js
const db = require('../config/db');
const ApiError = require('../utils/apiError');
const { fetchDecisionsFromJudilibre } = require('../services/judilibreService');
const fs = require('fs');
const path = require('path');

// GET /api/decisions
// backend/controllers/decisionsController.js

const getAllDecisions = async (req, res, next) => {
  try {
    const { date, juridiction, type_affaire, keyword, start_date, end_date } = req.query;

    let query = `
      SELECT 
        d.id, 
        d.external_id,
        d.title,
        d.content,
        d.date,
        d.jurisdiction,
        d.case_type,
        d.source,
        d.public,
        ARRAY_REMOVE(ARRAY_AGG(t.label), NULL) AS tags
      FROM decisions d
      LEFT JOIN decision_tags dt ON dt.decision_id = d.id
      LEFT JOIN tags t ON t.id = dt.tag_id
      WHERE 1=1
    `;

    const values = [];

    if (date) {
      values.push(date);
      query += ` AND d.date = $${values.length}`;
    }

    if (start_date) {
      values.push(start_date);
      query += ` AND d.date >= $${values.length}`;
    }

    if (end_date) {
      values.push(end_date);
      query += ` AND d.date <= $${values.length}`;
    }

    if (juridiction) {
      values.push(`%${juridiction}%`);
      query += ` AND d.jurisdiction ILIKE $${values.length}`;
    }

    if (type_affaire) {
      values.push(`%${type_affaire}%`);
      query += ` AND d.case_type ILIKE $${values.length}`;
    }

    if (keyword) {
      values.push(`%${keyword}%`);
      query += `
        AND EXISTS (
          SELECT 1 FROM decision_tags dt2
          JOIN tags t2 ON t2.id = dt2.tag_id
          WHERE dt2.decision_id = d.id
          AND t2.label ILIKE $${values.length}
        )
      `;
    }

    query += `
      GROUP BY d.id
      ORDER BY d.date DESC
      LIMIT 50;
    `;

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
    console.error('❌ Error importing decisions from Judilibre:', error);
    next(new ApiError('Failed to import from Judilibre', 500));
  }
};

// GET /api/decisions/stats
const getDecisionsStats = async (req, res, next) => {
  try {
    // 1️⃣ Total des décisions (avec source si tu veux)
    const { rows: totalRows } = await db.query(`
      SELECT 
        COUNT(*) FILTER (WHERE source = 'judilibre')::int AS judilibre,
        COUNT(*) FILTER (WHERE source = 'archive')::int AS archive,
        COUNT(*)::int AS total
      FROM decisions
    `);

    // 2️⃣ Dernier import (nombre + date)
    const { rows: lastImportRows } = await db.query(`
      SELECT 
        COUNT(*)::int AS count,
        MAX(date)::date AS date
      FROM decisions
      WHERE imported_at = (
        SELECT MAX(imported_at) FROM decisions
      )
    `);

    const stats = {
      total: totalRows[0].total,
      lastImport: {
        count: lastImportRows[0].count,
        date: lastImportRows[0].date || null
      }
    };

    res.status(200).json(stats);
  } catch (error) {
    console.error('❌ Error fetching stats:', error);
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

// ✅ EXPORT
module.exports = {
  getAllDecisions,
  importDecisionsFromJudilibre,
  getDecisionsStats,
  getJurisdictions,
  getCaseTypes,
};

