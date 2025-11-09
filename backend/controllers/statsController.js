// backend/controllers/statsController.js
// Controller: aggregate lightweight stats for the dashboard (resilient to schema changes)

const db = require('../config/db');
const ApiError = require('../utils/apiError');

const isDev = process.env.NODE_ENV === 'development';

// Helper: run query safely; return [] on error (keeps dashboard alive)
async function safeQuery(sql, params = []) {
  try {
    const { rows } = await db.query(sql, params);
    return rows || [];
  } catch (err) {
    if (isDev) console.warn('[stats] safeQuery failed:', err.message || err);
    return [];
  }
}

const getUserStats = async (req, res, next) => {
  try {
    // --- Corpus ---
    const decisions = await safeQuery('SELECT COUNT(*)::int AS c FROM decisions');
    const archives  = await safeQuery('SELECT COUNT(*)::int AS c FROM archives');
    const decisionsCount = decisions[0]?.c || 0;
    const archivesCount  = archives[0]?.c || 0;

    // last import (prefer imported_at, fallback created_at)
    const lastImport = await safeQuery(`
      SELECT COUNT(*)::int AS count, MAX(tstamp) AS date
      FROM (
        SELECT COALESCE(imported_at, created_at) AS tstamp
        FROM decisions
      ) s
    `);
    const lastImportCount = lastImport[0]?.count || 0;
    const lastImportDate  = lastImport[0]?.date || null;

    // --- Sources ---
    const bySource = await safeQuery(`
      SELECT source, COUNT(*)::int AS count
      FROM decisions
      GROUP BY source
      ORDER BY count DESC
    `);
    let sources;
    if (bySource.length > 0) {
      const total = bySource.reduce((s, r) => s + r.count, 0);
      sources = bySource.map(r => ({
        label: r.source || 'Inconnu',
        count: r.count,
        pct: total ? Math.round((r.count * 100) / total) : 0
      }));
    } else {
      const total = decisionsCount + archivesCount;
      sources = [
        { label: 'Judilibre',   count: decisionsCount, pct: total ? Math.round((decisionsCount * 100) / total) : 0 },
        { label: 'PDF manuels', count: archivesCount,  pct: total ? Math.round((archivesCount  * 100) / total) : 0 }
      ];
    }

    // --- Period by year (prefer `date`, fallback `decision_date`)
    let byYear = await safeQuery(`
      SELECT EXTRACT(YEAR FROM date)::int AS year, COUNT(*)::int AS count
      FROM decisions
      WHERE date IS NOT NULL
      GROUP BY 1
      ORDER BY 1 DESC
      LIMIT 8
    `);
    if (byYear.length === 0) {
      byYear = await safeQuery(`
        SELECT EXTRACT(YEAR FROM decision_date)::int AS year, COUNT(*)::int AS count
        FROM decisions
        WHERE decision_date IS NOT NULL
        GROUP BY 1
        ORDER BY 1 DESC
        LIMIT 8
      `);
    }

    // --- Jurisdictions
    const jurisdictions = await safeQuery(`
      SELECT jurisdiction AS label, COUNT(*)::int AS count
      FROM decisions
      WHERE jurisdiction IS NOT NULL AND jurisdiction <> ''
      GROUP BY jurisdiction
      ORDER BY count DESC
      LIMIT 6
    `);
    const jurTotal = jurisdictions.reduce((s, r) => s + r.count, 0) || 0;
    const jurisdictionsPct = jurisdictions.map(j => ({
      ...j,
      pct: jurTotal ? Math.round((j.count * 100) / jurTotal) : 0
    }));

    // --- Topics (keywords/tags)
    // 1) Preferred schema: decision_tags + tags
    let topKeywords = await safeQuery(`
      SELECT t.label, COUNT(*)::int AS count
      FROM decision_tags dt
      JOIN tags t ON t.id = dt.tag_id
      GROUP BY t.label
      ORDER BY count DESC
      LIMIT 5
    `);
    // 2) Legacy table: decision_keywords(decision_id, keyword)
    if (topKeywords.length === 0) {
      topKeywords = await safeQuery(`
        SELECT keyword AS label, COUNT(*)::int AS count
        FROM decision_keywords
        GROUP BY keyword
        ORDER BY count DESC
        LIMIT 5
      `);
    }
    // 3) Legacy column: decisions.keywords (text[])
    if (topKeywords.length === 0) {
      topKeywords = await safeQuery(`
        WITH all_kw AS (
          SELECT unnest(keywords)::text AS label
          FROM decisions
          WHERE keywords IS NOT NULL
        )
        SELECT label, COUNT(*)::int AS count
        FROM all_kw
        GROUP BY label
        ORDER BY count DESC
        LIMIT 5
      `);
    }

    // --- Notes (handle both schemas)
    const notesCountRows = await safeQuery('SELECT COUNT(*)::int AS c FROM notes');
    const notesCount = notesCountRows[0]?.c || 0;

    // A) Some schemas: notes(decision_id, ...)
    let decisionsWithNotesRows = await safeQuery(`
      SELECT COUNT(DISTINCT decision_id)::int AS c FROM notes
    `);
    // B) Current schema: notes(target_id UUID, target_type TEXT)
    if (decisionsWithNotesRows.length === 0 || decisionsWithNotesRows[0]?.c === 0) {
      decisionsWithNotesRows = await safeQuery(`
        SELECT COUNT(DISTINCT target_id)::int AS c
        FROM notes
        WHERE target_type = 'decision'
      `);
    }
    const decisionsWithNotes = decisionsWithNotesRows[0]?.c || 0;

    // --- Archiving (last PDF added)
    const lastPdf = await safeQuery(`
      SELECT MAX(created_at) AS last_pdf_added_at
      FROM archives
    `);

    // --- Trends (last 12 months) prefer `date`, fallback `decision_date`
    let monthly = await safeQuery(`
      SELECT to_char(date_trunc('month', date), 'YYYY-MM-01') AS month,
             COUNT(*)::int AS count
      FROM decisions
      WHERE date IS NOT NULL
        AND date >= (CURRENT_DATE - INTERVAL '12 months')
      GROUP BY 1
      ORDER BY 1
    `);
    if (monthly.length === 0) {
      monthly = await safeQuery(`
        SELECT to_char(date_trunc('month', decision_date), 'YYYY-MM-01') AS month,
               COUNT(*)::int AS count
        FROM decisions
        WHERE decision_date IS NOT NULL
          AND decision_date >= (CURRENT_DATE - INTERVAL '12 months')
        GROUP BY 1
        ORDER BY 1
      `);
    }

    return res.status(200).json({
      corpus: {
        total: decisionsCount + archivesCount,
        judilibre: decisionsCount,
        pdf: archivesCount,
        lastImport: { count: lastImportCount, date: lastImportDate }
      },
      sources,
      period: { by_year: byYear },
      jurisdictions: jurisdictionsPct,
      topics: { top_keywords: topKeywords },
      annotations: {
        notes_count: notesCount,
        decisions_with_notes: decisionsWithNotes
      },
      archiving: {
        last_pdf_added_at: lastPdf[0]?.last_pdf_added_at || null,
        pdf_count: archivesCount
      },
      trends: { monthly }
    });
  } catch (err) {
    if (isDev) console.error('[stats] getUserStats error:', err);
    return next(new ApiError('Failed to compute stats', 500));
  }
};

module.exports = { getUserStats };
