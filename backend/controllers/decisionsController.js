// backend/controllers/decisionsController.js
const db = require('../config/db');
const { fetchDecisionsFromJudilibre } = require('../services/judilibreService');
const ApiError = require('../utils/apiError');
const path = require('path');
const fs = require('fs');

/**
 * PUT /api/decisions/:id/keywords
 * Met à jour les mots-clés pour une décision
 */
const updateDecisionKeywords = async (req, res, next) => {
  const { id } = req.params;
  const { keywords } = req.body;

  if (!Array.isArray(keywords)) {
    return next(new ApiError('Invalid keywords format', 400));
  }

  try {
    // 1) Supprimer les liens existants
    await db.query('DELETE FROM decision_tags WHERE decision_id = $1', [id]);

    for (const kw of keywords) {
      const label = kw.trim();
      if (!label) continue;

      // Vérifier si le tag existe déjà
      const { rows } = await db.query(
        'SELECT id FROM tags WHERE label = $1',
        [label]
      );

      let tagId;
      if (rows.length > 0) {
        tagId = rows[0].id;
      } else {
        const insertResult = await db.query(
          'INSERT INTO tags (label) VALUES ($1) RETURNING id',
          [label]
        );
        tagId = insertResult.rows[0].id;
      }

      await db.query(
        'INSERT INTO decision_tags (decision_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [id, tagId]
      );
    }

    // 2) Retourner la décision mise à jour avec ses mots-clés
    const { rows: updated } = await db.query(
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
        COALESCE(json_agg(t.label ORDER BY t.label) FILTER (WHERE t.label IS NOT NULL), '[]') AS keywords
      FROM decisions d
      LEFT JOIN decision_tags dt ON dt.decision_id = d.id
      LEFT JOIN tags t ON t.id = dt.tag_id
      WHERE d.id = $1
      GROUP BY d.id;
      `,
      [id]
    );

    if (updated.length === 0) {
      return next(new ApiError('Decision not found', 404));
    }

    res.status(200).json(updated[0]);
  } catch (error) {
    console.error('❌ Error updating keywords:', error);
    next(new ApiError('Failed to update keywords', 500));
  }
};

/**
 * GET /api/decisions
 * Liste toutes les décisions avec pagination et tri
 */
const getAllDecisions = async (req, res, next) => {
  try {
    const {
      date, juridiction, type_affaire, keyword, start_date, end_date, source,
      page = 1, limit = 10, sortBy = 'date', order = 'desc'
    } = req.query;

    const pageInt = parseInt(page);
    const limitInt = parseInt(limit) || 10;

    if (isNaN(pageInt) || pageInt < 1) {
      return next(new ApiError('Invalid page number', 400));
    }

    if (isNaN(limitInt) || limitInt < 1 || limitInt > 10) {
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

    let baseQuery = `
      FROM decisions d
      LEFT JOIN decision_tags dt ON dt.decision_id = d.id
      LEFT JOIN tags t ON t.id = dt.tag_id
      WHERE 1=1
    `;

    const filters = [];
    if (date) {
      filters.push(date);
      baseQuery += ` AND d.date = $${filters.length}`;
    }
    if (start_date) {
      filters.push(start_date);
      baseQuery += ` AND d.date >= $${filters.length}`;
    }
    if (end_date) {
      filters.push(end_date);
      baseQuery += ` AND d.date <= $${filters.length}`;
    }
    if (juridiction) {
      filters.push(`%${juridiction}%`);
      baseQuery += ` AND d.jurisdiction ILIKE $${filters.length}`;
    }
    if (type_affaire) {
      filters.push(`%${type_affaire}%`);
      baseQuery += ` AND d.case_type ILIKE $${filters.length}`;
    }
    if (keyword) {
      filters.push(`%${keyword}%`);
      baseQuery += `
        AND EXISTS (
          SELECT 1 FROM decision_tags dt2
          JOIN tags t2 ON t2.id = dt2.tag_id
          WHERE dt2.decision_id = d.id
          AND t2.label ILIKE $${filters.length}
        )
      `;
    }
    if (source) {
      if (Array.isArray(source)) {
        const placeholders = source.map((_, i) => `$${filters.length + i + 1}`).join(', ');
        filters.push(...source);
        baseQuery += ` AND d.source IN (${placeholders})`;
      } else {
        filters.push(source);
        baseQuery += ` AND d.source = $${filters.length}`;
      }
    }

    // ✅ Requête COUNT pour le total
    const countQuery = `
      SELECT COUNT(DISTINCT d.id) AS totalCount
      ${baseQuery};
    `;
    const countResult = await db.query(countQuery, filters);
    const totalCount = parseInt(countResult.rows[0].totalcount) || 0;

    // ✅ Requête résultats paginés
    const dataQuery = `
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
        COALESCE(json_agg(t.label) FILTER (WHERE t.label IS NOT NULL), '[]') AS keywords
      ${baseQuery}
      GROUP BY d.id
      ORDER BY d.${sortBy} ${order.toUpperCase()}
      LIMIT $${filters.length + 1} OFFSET $${filters.length + 2};
    `;

    const dataValues = [...filters, limitInt, offset];
    const result = await db.query(dataQuery, dataValues);

    res.status(200).json({
      results: result.rows,
      totalCount
    });

  } catch (error) {
    console.error('❌ Error fetching decisions:', error);
    next(new ApiError('Internal server error', 500));
  }
};

/**
 * POST /api/decisions/import
 */
const importDecisionsFromJudilibre = async (req, res, next) => {
  try {
    if (process.env.USE_MOCK === 'true') {
      const mockPath = path.join(__dirname, '../mock/mock_decisions.json');
      const raw = fs.readFileSync(mockPath, 'utf-8');
      const mockData = JSON.parse(raw);
      return res.status(200).json({
        count: mockData.length,
        timestamp: new Date().toISOString(),
        results: mockData
      });
    }

    console.log('[DEBUG] Payload reçu:', req.body);

    const {
      dateDecisionMin,
      dateDecisionMax,
      jurisdiction,
      caseType,
      query
    } = req.body;

    if (!dateDecisionMin || !dateDecisionMax) {
      return next(new ApiError('dateDecisionMin and dateDecisionMax are required', 400));
    }

    const data = await fetchDecisionsFromJudilibre({
      dateDecisionMin,
      dateDecisionMax,
      jurisdiction,
      caseType,
      query
    });

    console.log('[DEBUG] Judilibre raw response:', data);

    const results = Array.isArray(data) ? data : (data.results || []);
    let inserted = 0;

    // ✅ INSÉRER dans la DB
    for (const decision of results) {
      const {
        id, // Judilibre id
        title,
        decision_date,
        jurisdiction,
        type,
        body
      } = decision;

      const insertQuery = `
        INSERT INTO decisions
          (external_id, title, content, date, jurisdiction, case_type, source, public, imported_at)
        VALUES
          ($1, $2, $3, $4, $5, $6, 'judilibre', true, NOW())
        ON CONFLICT (external_id) DO NOTHING
        RETURNING id;
      `;

      const values = [
        id || null,
        title || 'Sans titre',
        body || '',
        decision_date || null,
        jurisdiction || '',
        type || ''
      ];

      const { rowCount } = await db.query(insertQuery, values);
      if (rowCount > 0) inserted++;
    }

    console.log(`[DEBUG] Nombre de décisions insérées en DB : ${inserted}`);

    res.status(200).json({
      imported: inserted,
      fetched: results.length,
      timestamp: new Date().toISOString(),
      results
    });
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
 * Récupère une décision par ID OU external_id
 */
const getDecisionById = async (req, res, next) => {
  const { id } = req.params;

  // Vérifie UUID valide
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) {
    return next(new ApiError(`Invalid UUID format for id: ${id}`, 400));
  }

  try {
    const { rows } = await db.query(
      `
      SELECT 
        d.id,
        d.external_id,
        d.title,
        d.content,
        d.date,
        d.jurisdiction,
        d.case_type,
        d.source,
        d.pdf_link,
        COALESCE(json_agg(t.label ORDER BY t.label) FILTER (WHERE t.label IS NOT NULL), '[]') AS keywords
      FROM decisions d
      LEFT JOIN decision_tags dt ON dt.decision_id = d.id
      LEFT JOIN tags t ON t.id = dt.tag_id
      WHERE d.id = $1 OR d.external_id = $1
      GROUP BY d.id;
      `,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: `Decision not found for id or external_id ${id}` });
    }

    res.status(200).json(rows[0]);
  } catch (err) {
    console.error('❌ Error fetching decision by id:', err);
    next(new ApiError('Failed to fetch decision', 500));
  }
};

module.exports = {
  getAllDecisions,
  getDecisionById,
  importDecisionsFromJudilibre,
  getDecisionsStats,
  getJurisdictions,
  getCaseTypes,
  updateDecisionKeywords,
};
