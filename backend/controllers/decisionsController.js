// backend/controllers/decisionsController.js
const db = require('../config/db');
const {
  fetchDecisionsFromJudilibre,
  fetchDecisionById
} = require('../services/judilibreService');
const ApiError = require('../utils/apiError');
const { signArchiveLink } = require('../utils/signedLinks');
const path = require('path');
const fs = require('fs');

/**
 * Ensure we have the full decision text.
 */
async function ensureFullText(decisionRow) {
  try {
    const looksLikeOnlySummary =
      !decisionRow?.content || String(decisionRow.content).trim().length < 1500;

    if (
      decisionRow &&
      decisionRow.source === 'judilibre' &&
      decisionRow.external_id &&
      (looksLikeOnlySummary || decisionRow.forceRefresh === true)
    ) {
      const full = await fetchDecisionById(decisionRow.external_id);
      const fullText = (full && (full.text || full.summary || '')).trim();

      if (fullText) {
        await db.query(
          'UPDATE decisions SET content = $1 WHERE id = $2::uuid',
          [fullText, decisionRow.id]
        );
        decisionRow.content = fullText;
      }

      if (full?.zones) {
        decisionRow.zones = full.zones;
      }

      decisionRow.solution = decisionRow.solution || full.solution || '';
      decisionRow.formation = decisionRow.formation || full.formation || '';
    }
  } catch (e) {
    console.error('⚠️ ensureFullText fallback failed:', e.message || e);
  }
  return decisionRow;
}

/**
 * PUT /api/decisions/:id/keywords
 */
const updateDecisionKeywords = async (req, res, next) => {
  const { id } = req.params;

  if (!/^[0-9a-fA-F-]{36}$/.test(id)) {
    return next(new ApiError('Invalid decision ID format', 400));
  }

  const { keywords } = req.body;

  if (!Array.isArray(keywords)) {
    return next(new ApiError('Invalid keywords format', 400));
  }

  try {
    await db.query('DELETE FROM decision_tags WHERE decision_id = $1::uuid', [id]);

    for (const kw of keywords) {
      const label = String(kw || '').trim();
      if (!label) continue;

      const { rows } = await db.query('SELECT id FROM tags WHERE label = $1', [label]);

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
        'INSERT INTO decision_tags (decision_id, tag_id) VALUES ($1::uuid, $2) ON CONFLICT DO NOTHING',
        [id, tagId]
      );
    }

    const { rows: updated } = await db.query(
      `
      SELECT 
        d.id, d.external_id, d.ecli, d.title, d.content, d.date, d.jurisdiction, d.case_type, d.source, d.public,
        COALESCE(
          json_agg(t.label ORDER BY t.label) FILTER (WHERE t.label IS NOT NULL),
          '[]'::json
        ) AS keywords
      FROM decisions d
      LEFT JOIN decision_tags dt ON dt.decision_id = d.id
      LEFT JOIN tags t ON t.id = dt.tag_id
      WHERE d.id = $1::uuid
      GROUP BY d.id;
      `,
      [id]
    );

    if (updated.length === 0) return next(new ApiError('Decision not found', 404));

    res.status(200).json(updated[0]);
  } catch (error) {
    console.error('❌ Error updating keywords:', error);
    next(new ApiError('Failed to update keywords', 500));
  }
};

/**
 * GET /api/decisions
 */
const getAllDecisions = async (req, res, next) => {
  try {
    const q = req.query;

    const norm = {
      start_date: q.start_date || q.startDate || null,
      end_date: q.end_date || q.endDate || null,
      jurisdiction: q.jurisdiction || q.juridiction || null,
      case_type: q.case_type || q.type_affaire || q.typeAffaire || null,
      keywords: q.keywords || q.keyword || null,
      source: q.source,
      page: Number(q.page || 1),
      limit: Number(q.limit || 10),
      sortBy: (q.sortBy || 'date').toLowerCase(),
      order: (q.order || 'desc').toLowerCase(),
      exact_date: q.date || null,
    };

    if (!Number.isInteger(norm.page) || norm.page < 1) {
      return next(new ApiError('Invalid page number', 400));
    }
    if (!Number.isInteger(norm.limit) || norm.limit < 1 || norm.limit > 50) {
      return next(new ApiError('Invalid limit', 400));
    }

    const allowedSortBy = ['date', 'jurisdiction', 'case_type'];
    const allowedOrder = ['asc', 'desc'];
    if (!allowedSortBy.includes(norm.sortBy)) {
      return next(new ApiError('Invalid sortBy field', 400));
    }
    if (!allowedOrder.includes(norm.order)) {
      return next(new ApiError('Invalid order', 400));
    }

    const offset = (norm.page - 1) * norm.limit;

    let baseQuery = `
      FROM decisions d
      LEFT JOIN decision_tags dt ON dt.decision_id = d.id
      LEFT JOIN tags t ON t.id = dt.tag_id
      WHERE 1=1
    `;

    const values = [];
    const add = (cond) => baseQuery += ` AND ${cond}`;

    if (norm.exact_date) {
      values.push(norm.exact_date);
      add(`d.date::date = $${values.length}::date`);
    }
    if (norm.start_date) {
      values.push(norm.start_date);
      add(`d.date::date >= $${values.length}::date`);
    }
    if (norm.end_date) {
      values.push(norm.end_date);
      add(`d.date::date <= $${values.length}::date`);
    }

    if (norm.jurisdiction) {
      values.push(norm.jurisdiction);
      add(`d.jurisdiction = $${values.length}`);
    }
    if (norm.case_type) {
      values.push(norm.case_type);
      add(`d.case_type = $${values.length}`);
    }

    if (norm.keywords) {
      const terms = String(norm.keywords)
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);

      if (terms.length > 0) {
        const startIdx = values.length + 1;
        terms.forEach(term => values.push(`%${term}%`));
        const ors = terms
          .map((_, i) => `t2.label ILIKE $${startIdx + i}`)
          .join(' OR ');

        add(`
          EXISTS (
            SELECT 1
            FROM decision_tags dt2
            JOIN tags t2 ON t2.id = dt2.tag_id
            WHERE dt2.decision_id = d.id
              AND (${ors})
          )
        `);
      }
    }

    if (norm.source) {
      const sources = Array.isArray(norm.source)
        ? norm.source
        : String(norm.source).split(',').map(s => s.trim()).filter(Boolean);

      if (sources.length > 0) {
        const startIdx = values.length + 1;
        values.push(...sources);
        const placeholders = sources.map((_, i) => `$${startIdx + i}`).join(', ');
        add(`d.source IN (${placeholders})`);
      }
    }

    const countSql = `SELECT COUNT(DISTINCT d.id) AS totalCount ${baseQuery};`;
    const { rows: countRows } = await db.query(countSql, values);
    const totalCount = Number(countRows[0]?.totalcount || 0);

    const dataSql = `
      SELECT
        d.id, d.external_id, d.ecli, d.title, d.content, d.date,
        d.jurisdiction, d.case_type, d.source, d.public,
        COALESCE(
          json_agg(t.label) FILTER (WHERE t.label IS NOT NULL),
          '[]'::json
        ) AS keywords
      ${baseQuery}
      GROUP BY d.id
      ORDER BY d.${norm.sortBy} ${norm.order.toUpperCase()}
      LIMIT $${values.length + 1} OFFSET $${values.length + 2};
    `;
    const dataVals = [...values, norm.limit, offset];

    const { rows } = await db.query(dataSql, dataVals);

    res.status(200).json({ results: rows, totalCount });
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

    const results = Array.isArray(data.results) ? data.results : [];
    let inserted = 0;

    const buildJudilibreTitle = (decision) => {
      const parts = [];
      if (decision.number) parts.push(`Pourvoi n° ${decision.number}`);
      if (decision.solution) parts.push(`Solution : ${decision.solution}`);
      if (decision.ecli) parts.push(`ECLI: ${decision.ecli}`);
      if (decision.jurisdiction) parts.push(`Juridiction: ${decision.jurisdiction}`);
      if (decision.decision_date) parts.push(`du ${decision.decision_date}`);
      return parts.join(' - ').slice(0, 200).trim() || 'Sans titre';
    };

    for (const decision of results) {
      const {
        id,
        ecli,
        decision_date,
        jurisdiction,
        type,
        solution,
        formation,
        text
      } = decision;

      let contentToSave = (text || '').trim();
      if (!contentToSave && id) {
        try {
          const full = await fetchDecisionById(id);
          contentToSave = (full && (full.text || full.summary || '')).trim();
        } catch (e) {
          console.warn(`⚠️ Unable to fetch full text for ${id}:`, e.message || e);
        }
      }

      const insertQuery = `
        INSERT INTO decisions
          (external_id, ecli, title, content, date, jurisdiction, case_type, solution, formation, source, public, imported_at)
        VALUES
          ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'judilibre', true, NOW())
        ON CONFLICT (external_id) DO NOTHING
        RETURNING id;
      `;

      const values = [
        id || null,
        ecli || null,
        buildJudilibreTitle(decision),
        contentToSave || '',
        decision_date || null,
        jurisdiction || '',
        type || '',
        solution || '',
        formation || ''
      ];

      const { rowCount } = await db.query(insertQuery, values);
      if (rowCount > 0) inserted++;
    }

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
  const uuidRegex = /^[0-9a-fA-F-]{36}$/;

  try {
    let rows;

    if (uuidRegex.test(id)) {
      const result = await db.query(
        `
        SELECT d.id, d.external_id, d.ecli, d.title, d.content, d.date, d.jurisdiction, d.case_type, d.source, d.solution, d.formation, d.archive_id, a.file_path,
          COALESCE(
            json_agg(t.label ORDER BY t.label) FILTER (WHERE t.label IS NOT NULL),
            '[]'::json
          ) AS keywords
        FROM decisions d
        LEFT JOIN archives a ON a.id = d.archive_id
        LEFT JOIN decision_tags dt ON dt.decision_id = d.id
        LEFT JOIN tags t ON t.id = dt.tag_id
        WHERE d.id = $1::uuid OR d.external_id = $2
        GROUP BY d.id, a.file_path, d.archive_id;`,
        [id, id]
      );
      rows = result.rows;
    } else {
      const result = await db.query(
        `
        SELECT d.id, d.external_id, d.ecli, d.title, d.content, d.date, d.jurisdiction, d.case_type, d.source, d.solution, d.formation,
          COALESCE(
            json_agg(t.label ORDER BY t.label) FILTER (WHERE t.label IS NOT NULL),
            '[]'::json
          ) AS keywords
        FROM decisions d
        LEFT JOIN decision_tags dt ON dt.decision_id = d.id
        LEFT JOIN tags t ON t.id = dt.tag_id
        WHERE d.ecli = $1
        GROUP BY d.id;`,
        [id]
      );
      rows = result.rows;
    }

    if (!rows || rows.length === 0) {
      return res.status(404).json({ message: `Decision not found for ${id}` });
    }

    let row = rows[0];

    console.log('[DecisionDetail][before] contentLen:', (row.content || '').length, 'src:', row.source, 'extId:', row.external_id);

    const forceRefresh = req.query.refresh === '1';
    if (forceRefresh && row.source === 'judilibre' && row.external_id) {
      try {
        const full = await fetchDecisionById(row.external_id);
        const fullText = (full.text || full.summary || '').trim();
        if (fullText) {
          await db.query('UPDATE decisions SET content = $1 WHERE id = $2::uuid', [fullText, row.id]);
          row.content = fullText;
        }
        if (full?.zones) row.zones = full.zones;
        row.solution = row.solution || full.solution || '';
        row.formation = row.formation || full.formation || '';
      } catch (e) {
        console.warn('⚠️ forceRefresh failed:', e.message || e);
      }
      row.forceRefresh = true;
    }

    row = await ensureFullText(row);

    console.log('[DecisionDetail][after] contentLen:', (row.content || '').length, 'hasZones:', !!row.zones);

    const filePath = row.file_path || null;
    const isPdf = row.source === 'archive'
      && !!filePath
      && filePath.toLowerCase().endsWith('.pdf');

    const base =
      process.env.BACKEND_URL
      || `${req.protocol}://${req.get('host')}`;

    row.is_pdf = isPdf;

    if (isPdf && row.archive_id) {
      const fileTok = signArchiveLink(row.archive_id, 'file');
      const dlTok = signArchiveLink(row.archive_id, 'download');

      row.file_url = `${base}/api/archives/${row.archive_id}/file?token=${encodeURIComponent(fileTok)}`;
      row.download_url = `${base}/api/archives/${row.archive_id}/download?token=${encodeURIComponent(dlTok)}`;
    } else {
      row.file_url = null;
      row.download_url = null;
    }

    delete row.file_path;

    res.status(200).json(row);
  } catch (err) {
    console.error('❌ Error fetching decision by id:', err);
    next(new ApiError('Failed to fetch decision', 500));
  }
};

module.exports = {
  getAllDecisions,
  getDecisionById,
  importDecisionsFromJudilibre,
  updateDecisionKeywords,
  getDecisionsStats,
  getJurisdictions,
  getCaseTypes
};
