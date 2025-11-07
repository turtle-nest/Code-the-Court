// backend/controllers/statsController.js
const db = require('../config/db');

// Helper: run query safely; return [] on error (keeps dashboard alive)
async function safeQuery(sql, params = []) {
  try {
    const { rows } = await db.query(sql, params);
    return rows || [];
  } catch {
    return [];
  }
}

const getUserStats = async (req, res, next) => {
  try {
    // --- Corpus de base ---
    const decisions = await safeQuery('SELECT COUNT(*)::int AS c FROM decisions');
    const archives  = await safeQuery('SELECT COUNT(*)::int AS c FROM archives');
    const decisionsCount = decisions[0]?.c || 0;
    const archivesCount  = archives[0]?.c || 0;

    // last import (décisions) si imported_at existe, sinon tente created_at
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
    // Si la colonne "source" existe côté decisions, on la groupe.
    // Sinon on approxime: Judilibre ≈ decisionsCount, PDF = archivesCount
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
        { label: 'Judilibre',   count: decisionsCount, pct: total ? Math.round(decisionsCount * 100 / total) : 0 },
        { label: 'PDF manuels', count: archivesCount,  pct: total ? Math.round(archivesCount  * 100 / total) : 0 }
      ];
    }

    // --- Période (par année) si decision_date existe ---
    const byYear = await safeQuery(`
      SELECT EXTRACT(YEAR FROM decision_date)::int AS year, COUNT(*)::int AS count
      FROM decisions
      WHERE decision_date IS NOT NULL
      GROUP BY 1
      ORDER BY 1 DESC
      LIMIT 8
    `);

    // --- Juridictions si colonne existe ---
    const jurisdictions = await safeQuery(`
      SELECT jurisdiction AS label, COUNT(*)::int AS count
      FROM decisions
      WHERE jurisdiction IS NOT NULL AND jurisdiction <> ''
      GROUP BY jurisdiction
      ORDER BY count DESC
      LIMIT 6
    `);
    const jurTotal = jurisdictions.reduce((s,r)=>s+r.count,0) || 0;
    const jurisdictionsPct = jurisdictions.map(j => ({
      ...j,
      pct: jurTotal ? Math.round(j.count * 100 / jurTotal) : 0
    }));

    // --- Thématiques (mots-clés) si table/colonne existe ---
    // 1) table decision_keywords(decision_id, keyword) OU
    // 2) colonne keywords (text[]) sur decisions
    let topKeywords = await safeQuery(`
      SELECT keyword AS label, COUNT(*)::int AS count
      FROM decision_keywords
      GROUP BY keyword
      ORDER BY count DESC
      LIMIT 5
    `);
    if (topKeywords.length === 0) {
      // tentative fallback si colonne "keywords" (text[]) existe
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

    // --- Annotations (notes) si table notes existe ---
    const notesCountRows = await safeQuery('SELECT COUNT(*)::int AS c FROM notes');
    const notesCount = notesCountRows[0]?.c || 0;

    const decisionsWithNotesRows = await safeQuery(`
      SELECT COUNT(DISTINCT decision_id)::int AS c FROM notes
    `);
    const decisionsWithNotes = decisionsWithNotesRows[0]?.c || 0;

    // --- Archivage ---
    const lastPdf = await safeQuery(`
      SELECT MAX(created_at) AS last_pdf_added_at
      FROM archives
    `);

    // --- Tendances (12 derniers mois) si decision_date existe ---
    const monthly = await safeQuery(`
      SELECT to_char(date_trunc('month', decision_date), 'YYYY-MM-01') AS month,
             COUNT(*)::int AS count
      FROM decisions
      WHERE decision_date IS NOT NULL
        AND decision_date >= (CURRENT_DATE - INTERVAL '12 months')
      GROUP BY 1
      ORDER BY 1
    `);

    res.json({
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
    next(err);
  }
};

module.exports = { getUserStats };
