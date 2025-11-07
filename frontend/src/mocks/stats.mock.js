// Mock stats for demo day (French UI, code/comments in English)
const now = new Date();
const iso = (y, m = 1, d = 1) => `${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}T12:00:00.000Z`;

// Build last 12 months trend quickly
function buildMonthlySeries(base = 40) {
  const arr = [];
  const ref = new Date(now.getFullYear(), now.getMonth(), 1);
  for (let i = 11; i >= 0; i--) {
    const dt = new Date(ref.getFullYear(), ref.getMonth() - i, 1);
    const count = Math.max(5, Math.round(base + (Math.sin(i/2)*12)));
    arr.push({
      month: `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}-01`,
      count
    });
  }
  return arr;
}

const statsMock = {
  corpus: {
    total: 1280,
    judilibre: 1125,
    pdf: 155,
    lastImport: { count: 220, date: iso(now.getFullYear(), now.getMonth() + 1, Math.max(1, now.getDate()-2)) }
  },
  sources: [
    { label: 'Judilibre',   count: 1125, pct: 88 },
    { label: 'PDF manuels', count: 155,  pct: 12 }
  ],
  period: {
    by_year: [
      { year: 2025, count: 460 },
      { year: 2024, count: 520 },
      { year: 2023, count: 300 }
    ]
  },
  jurisdictions: [
    { label: 'Cour de cassation', count: 760, pct: 59 },
    { label: "Conseil d'État",    count: 230, pct: 18 },
    { label: 'CAA',               count: 160, pct: 12 },
    { label: 'TA',                count: 90,  pct: 7 },
    { label: 'Autres',            count: 40,  pct: 4 }
  ],
  topics: {
    top_keywords: [
      { label: 'travail',            count: 340 },
      { label: 'logement',           count: 280 },
      { label: 'famille',            count: 210 },
      { label: 'santé',              count: 150 },
      { label: 'discrimination',     count: 95 }
    ]
  },
  annotations: {
    notes_count: 178,
    decisions_with_notes: 142
  },
  archiving: {
    last_pdf_added_at: iso(now.getFullYear(), now.getMonth() + 1, Math.max(1, now.getDate()-1)),
    pdf_count: 155
  },
  trends: {
    monthly: buildMonthlySeries(35)
  }
};

export default statsMock;
