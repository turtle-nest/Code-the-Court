// backend/controllers/decisionsController.js

const db = require('../config/db');
const ApiError = require('../utils/apiError');
const { fetchDecisionsFromJudilibre } = require('../services/judilibreService');
const fs = require('fs');
const path = require('path');

/**
 * GET /api/decisions
 * Liste toutes les décisions avec pagination et tri
 */
const getAllDecisions = async (req, res, next) => {
  try {
    const {
      date, juridiction, type_affaire, keyword, start_date, end_date, source,
      page = 1, limit = 20, sortBy = 'date', order = 'desc'
    } = req.query;

    const pageInt = parseInt(page);
    const limitInt = parseInt(limit);

    if (isNaN(pageInt) || pageInt < 1) {
      return next(new ApiError('Invalid page number', 400));
    }

    if (isNaN(limitInt) || limitInt < 1 || limitInt > 100) {
      return next(new ApiError('Invalid limit', 400));
    }

    const allowedSortBy = ['date', 'jurisdiction', 'case_type'];
    const allowedOrder = ['asc', 'desc'];

    if (!allowedSortBy.includes(sortBy)) {
      return next(new ApiError('Invalid sortBy field', 400));
    }

    if (!allowedOrder.includes(order.toLowerCase())) {
      return next(new ApiError('Invalid order', 400));
    }

    const offset = (pageInt - 1) * limitInt;

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

    if (source) {
      if (Array.isArray(source)) {
        const placeholders = source.map((_, i) => `$${values.length + i + 1}`).join(', ');
        values.push(...source);
        query += ` AND d.source IN (${placeholders})`;
      } else {
        values.push(source);
        query += ` AND d.source = $${values.length}`;
      }
    }

    query += `
      GROUP BY d.id
      ORDER BY d.${sortBy} ${order.toUpperCase()}
      LIMIT $${values.length + 1} OFFSET $${values.length + 2};
    `;

    values.push(limitInt, offset);

    const result = await db.query(query, values);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('❌ Error fetching decisions:', error);
    next(new ApiError('Internal server error', 500));
  }
};

/**
 * GET /api/decisions/import
 * Importe des décisions depuis l'API Judilibre ou un mock local
 */
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

/**
 * GET /api/decisions/stats
 */
const getDecisionsStats = async (req, res, next) => {
  try {
    const { rows: totalRows } = await db.query(`
      SELECT 
        COUNT(*) FILTER (WHERE source = 'judilibre')::int AS judilibre,
        COUNT(*) FILTER (WHERE source = 'archive')::int AS archive,
        COUNT(*)::int AS total
      FROM decisions
    `);

    const { rows: lastImportRows } = await db.query(`
      SELECT 
        COUNT(*)::int AS count,
        MAX(date)::date AS date
      FROM decisions
      WHERE imported_at IS NOT NULL AND imported_at = (
        SELECT MAX(imported_at) FROM decisions WHERE imported_at IS NOT NULL
      )
    `);

    const stats = {
      total: totalRows[0]?.total || 0,
      archive: totalRows[0]?.archive || 0,
      judilibre: totalRows[0]?.judilibre || 0,
      lastImport: {
        count: lastImportRows[0]?.count || 0,
        date: lastImportRows[0]?.date || null
      }
    };

    res.status(200).json(stats);
  } catch (error) {
    console.error('❌ Error fetching stats:', error);
    next(new ApiError('Failed to fetch stats', 500));
  }
};

/**
 * GET /api/decisions/juridictions
 */
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

/**
 * GET /api/decisions/case-types
 */
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

/**
 * GET /api/decisions/:id
 */
const getDecisionById = async (req, res, next) => {
  const { id } = req.params;
  try {
    const { rows } = await db.query(
      `
      SELECT 
        d.id, 
        d.title,
        d.content,
        d.date,
        d.jurisdiction,
        d.case_type,
        d.source,
        d.public,
        ARRAY_REMOVE(ARRAY_AGG(t.label), NULL) AS keywords
      FROM decisions d
      LEFT JOIN decision_tags dt ON dt.decision_id = d.id
      LEFT JOIN tags t ON t.id = dt.tag_id
      WHERE d.id = $1
      GROUP BY d.id;
      `,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Decision not found' });
    }

    res.status(200).json(rows[0]);
  } catch (err) {
    console.error('❌ Error fetching decision by id:', err);
    next(new ApiError('Failed to fetch decision', 500));
  }
};

// ✅ EXPORT complet et propre
module.exports = {
  getAllDecisions,
  getDecisionById,
  importDecisionsFromJudilibre,
  getDecisionsStats,
  getJurisdictions,
  getCaseTypes,
};
