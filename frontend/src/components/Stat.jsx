// frontend/src/components/Stat.jsx
import React from 'react';

const nf = new Intl.NumberFormat('fr-FR');
const df = new Intl.DateTimeFormat('fr-FR', { year: 'numeric', month: 'short', day: '2-digit' });

function Section({ title, children }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <h4 className="text-sm font-semibold text-gray-800 mb-3">{title}</h4>
      {children}
    </div>
  );
}

function Pill({ label, value, sub }) {
  return (
    <div className="rounded-xl bg-gray-50 px-3 py-2 text-sm flex items-center justify-between">
      <span className="text-gray-600">{label}</span>
      <span className="font-semibold text-gray-900">
        {typeof value === 'number' ? nf.format(value) : value}
        {sub ? <span className="ml-2 text-gray-500 font-normal">{sub}</span> : null}
      </span>
    </div>
  );
}

/**
 * Stats dashboard block.
 * Expects "stats" prop shaped like the /api/stats response.
 * Shows graceful fallbacks if sections are missing.
 */
const Stat = ({ stats }) => {
  const corpus = stats?.corpus || { total: 0, judilibre: 0, pdf: 0, lastImport: { count: 0, date: null } };
  const sources = stats?.sources || [];
  const period = stats?.period?.by_year || [];
  const jurisdictions = stats?.jurisdictions || [];
  const topics = stats?.topics?.top_keywords || [];
  const annotations = stats?.annotations || { notes_count: 0, decisions_with_notes: 0 };
  const archiving = stats?.archiving || { last_pdf_added_at: null, pdf_count: 0 };
  const monthly = stats?.trends?.monthly || [];

  return (
    <div className="w-full max-w-5xl">
      <h3 className="text-xl font-bold mb-4">Statistiques</h3>

      {/* Row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <Section title="Corpus global">
          <div className="space-y-2">
            <Pill label="Total décisions" value={corpus.total} />
            <Pill label="Judilibre" value={corpus.judilibre} />
            <Pill label="PDF manuels" value={corpus.pdf} />
            {corpus.lastImport?.count > 0 && (
              <Pill
                label="Dernier import"
                value={corpus.lastImport.count}
                sub={corpus.lastImport.date ? `le ${df.format(new Date(corpus.lastImport.date))}` : null}
              />
            )}
          </div>
        </Section>

        <Section title="Sources">
          <div className="space-y-2">
            {(sources.length ? sources : [
              { label: 'Judilibre', count: corpus.judilibre, pct: corpus.total ? Math.round(corpus.judilibre * 100 / corpus.total) : 0 },
              { label: 'PDF manuels', count: corpus.pdf, pct: corpus.total ? Math.round(corpus.pdf * 100 / corpus.total) : 0 }
            ]).map((s, idx) => (
              <div key={idx} className="flex items-center justify-between text-sm">
                <span className="text-gray-600">{s.label}</span>
                <span className="font-semibold text-gray-900">{nf.format(s.count)} <span className="text-gray-500">({s.pct}%)</span></span>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Période (par année)">
          <div className="space-y-2">
            {(period.length ? period : [{ year: new Date().getFullYear(), count: corpus.total }]).map((y, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span className="text-gray-600">{y.year}</span>
                <span className="font-semibold text-gray-900">{nf.format(y.count)}</span>
              </div>
            ))}
          </div>
        </Section>
      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <Section title="Juridictions (top)">
          <div className="space-y-2">
            {(jurisdictions.length ? jurisdictions : []).map((j, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span className="text-gray-600">{j.label}</span>
                <span className="font-semibold text-gray-900">{nf.format(j.count)} <span className="text-gray-500">({j.pct}%)</span></span>
              </div>
            ))}
            {!jurisdictions.length && <p className="text-sm text-gray-500">Aucune répartition disponible.</p>}
          </div>
        </Section>

        <Section title="Thématiques (mots-clés)">
          <div className="flex flex-wrap gap-2">
            {(topics.length ? topics : []).map((t, i) => (
              <span key={i} className="rounded-full bg-blue-50 text-blue-700 text-xs px-3 py-1">
                {t.label} · {nf.format(t.count)}
              </span>
            ))}
            {!topics.length && <p className="text-sm text-gray-500">Pas encore de mots-clés.</p>}
          </div>
        </Section>

        <Section title="Annotations">
          <div className="space-y-2">
            <Pill label="Notes totales" value={annotations.notes_count || 0} />
            <Pill label="Décisions annotées" value={annotations.decisions_with_notes || 0} />
          </div>
        </Section>
      </div>

      {/* Row 3 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Section title="Archivage">
          <div className="space-y-2">
            <Pill label="PDF en base" value={archiving.pdf_count || 0} />
            <Pill
              label="Dernier PDF ajouté"
              value={archiving.last_pdf_added_at ? df.format(new Date(archiving.last_pdf_added_at)) : '—'}
            />
          </div>
        </Section>

        <Section title="Tendances (12 mois)">
          <div className="space-y-2">
            {monthly.length ? (
              <div className="flex items-end gap-1 h-24">
                {monthly.map((m, i) => {
                  const max = Math.max(...monthly.map(x => x.count)) || 1;
                  const h = Math.max(4, Math.round((m.count / max) * 88));
                  return (
                    <div key={i} className="flex flex-col items-center">
                      <div className="w-4 rounded-t bg-blue-500" style={{ height: `${h}px` }} />
                      <div className="text-[10px] text-gray-500 mt-1">{m.month.slice(5,7)}</div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-gray-500">Pas assez de données temporelles.</p>
            )}
          </div>
        </Section>
      </div>
    </div>
  );
};

export default Stat;
