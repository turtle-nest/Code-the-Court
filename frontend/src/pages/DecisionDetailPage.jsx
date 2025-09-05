// src/pages/DecisionDetailPage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  readableJurisdiction,
  readableCaseType
} from '../config/judilibreConfig';
import { updateDecisionKeywords } from '../services/decisions';

const API_URL = import.meta.env.VITE_API_URL || '';

/**
 * Build an ordered list of text fragments from Judilibre "zones".
 * zones shape example:
 * {
 *   introduction: [{ start: 0, end: 123 }, ...],
 *   exposure: [{ start: 124, end: 456 }, ...],
 *   ...
 * }
 */
function linearizeZones(text, zones) {
  if (!text || !zones) return [{ zone: 'full', fragment: text }];

  const items = [];
  for (const zoneName of Object.keys(zones)) {
    const frags = zones[zoneName] || [];
    for (const frag of frags) {
      if (
        typeof frag?.start === 'number' &&
        typeof frag?.end === 'number' &&
        frag.end > frag.start &&
        frag.start >= 0 &&
        frag.end <= text.length
      ) {
        items.push({
          zone: zoneName,
          start: frag.start,
          end: frag.end
        });
      }
    }
  }

  if (!items.length) return [{ zone: 'full', fragment: text }];

  items.sort((a, b) => a.start - b.start);

  return items.map(({ zone, start, end }) => ({
    zone,
    fragment: text.substring(start, end)
  }));
}

/**
 * Optional: humanize raw zone keys into FR section titles.
 */
function labelForZone(zone) {
  const map = {
    introduction: 'Introduction',
    exposure: 'Exposé',
    claims: 'Moyens',
    grounds: 'Motifs',
    device: 'Dispositif',
    annexes: 'Annexes'
  };
  return map[zone] || zone;
}

const DecisionDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [decision, setDecision] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [newKeyword, setNewKeyword] = useState('');
  const [message, setMessage] = useState(null);
  const [sectionedView, setSectionedView] = useState(true); // default to sectioned if zones available
  // PDF (archives only)
  const [pdfInfo, setPdfInfo] = useState({ isPdf: false, fileUrl: null, downloadUrl: null });

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const fetchDecision = async (opts = { refresh: false }) => {
    try {
      if (opts.refresh) setRefreshing(true);
      setLoading(!opts.refresh);
      setError(null);

      const url = opts.refresh
        ? `/api/decisions/${id}?refresh=1`
        : `/api/decisions/${id}`;

      const res = await fetch(url);
      if (!res.ok) throw new Error(`Erreur API: ${res.status}`);
      const data = await res.json();
      setDecision(data);
    } catch (err) {
      console.error('[❌] Fetch decision error:', err);
      setError(`❌ Erreur lors du chargement de la décision (ID : ${id})`);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchDecision(); /* eslint-disable-next-line */ }, [id]);

  // Charge les URLs PDF si la décision est une archive
  useEffect(() => {
    async function loadPdf() {
      setPdfInfo({ isPdf: false, fileUrl: null, downloadUrl: null });
      if (!decision) return;
      // Deux stratégies :
      // 1) L’API decision renvoie déjà file_url/download_url/is_pdf (par ex.)
      if (decision.is_pdf && (decision.file_url || decision.download_url)) {
        setPdfInfo({
          isPdf: true,
          fileUrl: decision.file_url,
          downloadUrl: decision.download_url
        });
        return;
      }
      // 2) Sinon, si c’est une archive, on appelle /api/archives/:archive_id
      if (decision.source === 'archive' && decision.archive_id) {
        try {
          const res = await fetch(`${API_URL}/api/archives/${decision.archive_id}`, {
            credentials: 'include'
          });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const a = await res.json();
          if (a?.is_pdf && (a.file_url || a.download_url)) {
            setPdfInfo({
              isPdf: true,
              fileUrl: a.file_url,
              downloadUrl: a.download_url
            });
          }
        } catch (e) {
          console.warn('[i] No PDF available for this archive or fetch failed', e);
        }
      }
    }
    loadPdf();
  }, [decision]);

  const handleForceRefresh = () => {
    fetchDecision({ refresh: true });
  };

  const handleAddKeyword = () => {
    if (newKeyword.trim()) {
      setDecision(prev => ({
        ...prev,
        keywords: [...(prev.keywords || []), newKeyword.trim()]
      }));
      setNewKeyword('');
    }
  };

  const handleRemoveKeyword = (kw) => {
    setDecision(prev => ({
      ...prev,
      keywords: (prev.keywords || []).filter(k => k !== kw)
    }));
  };

  const handleSaveKeywords = async () => {
    try {
      const updated = await updateDecisionKeywords(id, decision.keywords || []);
      setDecision(updated);
      setMessage('✅ Mots-clés mis à jour');
      setTimeout(() => setMessage(null), 2500);
    } catch {
      setMessage('❌ Erreur lors de la mise à jour');
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const parts = useMemo(() => {
    if (!decision?.content) return [];
    return linearizeZones(decision.content, decision.zones);
  }, [decision]);

  const hasZones = Boolean(decision?.zones) && parts.length > 0 && parts[0].zone !== 'full';

  if (loading) return <div className="p-8 italic">⏳ Chargement en cours...</div>;
  if (error) return <div className="p-8 text-red-600 font-semibold">{error}</div>;
  if (!decision) return <div className="p-8">Décision introuvable.</div>;

  return (
    <>
      <div className="mb-6 flex flex-wrap gap-2 items-center">
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          ← Retour
        </button>

        <button
          onClick={handleForceRefresh}
          disabled={refreshing}
          className={`px-4 py-2 rounded ${refreshing ? 'bg-gray-300' : 'bg-blue-600 hover:bg-blue-700'} text-white`}
          title="Récupérer à nouveau depuis Judilibre (texte intégral + zones)"
        >
          {refreshing ? 'Rafraîchissement…' : 'Rafraîchir depuis Judilibre'}
        </button>

        {hasZones && (
          <label className="ml-auto flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={sectionedView}
              onChange={(e) => setSectionedView(e.target.checked)}
            />
            Affichage sectionné (zones)
          </label>
        )}
      </div>

      <h1 className="text-2xl font-bold mb-2">
        {decision.title || 'Sans titre'}
      </h1>

      <h2 className="text-xl italic mb-4">
        {readableJurisdiction(decision.jurisdiction)} —{' '}
        <span className="text-gray-500">{formatDate(decision.date)}</span>
      </h2>

      {/* DEBUG (temporaire) */}
      <pre className="text-xs bg-gray-50 p-2 rounded border overflow-auto">
        {JSON.stringify({
          id: decision.id,
          source: decision.source,
          archive_id: decision.archive_id,
          is_pdf_from_decision: decision.is_pdf,
          file_url_from_decision: decision.file_url,
          download_url_from_decision: decision.download_url,
          pdfInfo
        }, null, 2)}
      </pre>

      <p className="italic mb-2">
        Type d’affaire : {readableCaseType(decision.case_type)}
      </p>

      {decision.solution && (
        <p className="italic mb-2">Solution : {decision.solution}</p>
      )}
      {decision.formation && (
        <p className="italic mb-4">Formation : {decision.formation}</p>
      )}

      {/* === PDF preview & download — archives only === */}
      {pdfInfo.isPdf && (
        <div className="border rounded p-4 mb-6 bg-white">
          <h3 className="font-bold mb-3">Fichier PDF (archive) :</h3>
          <div className="flex gap-3 mb-4">
            {pdfInfo?.downloadUrl && (
              <a
                href={pdfInfo.downloadUrl}
                className="inline-flex items-center rounded px-4 py-2 border shadow-sm hover:shadow-md transition"
              >
                Télécharger le PDF
              </a>
            )}
          </div>
          {pdfInfo.fileUrl && (
            <div className="w-full h-[75vh] border rounded-xl shadow-sm overflow-hidden">
              <iframe title="Aperçu PDF" src={pdfInfo.fileUrl} className="w-full h-full" />
            </div>
          )}
          {!pdfInfo.fileUrl && (
            <p className="text-sm text-gray-500">
              Aucun aperçu disponible. Utilisez le bouton “Télécharger”.
            </p>
          )}
        </div>
      )}
      {/* === /PDF === */}

      <div className="border rounded p-4 mb-6 bg-white">
        <h3 className="font-bold mb-3">Contenu de la décision :</h3>

        {/* Sectioned view if zones are provided; fallback to full text */}
        {hasZones && sectionedView ? (
          <div>
            {parts.map((p, i) => (
              <section key={`${p.zone}-${i}`} className="mb-6">
                <h4 className="font-semibold mb-2">{labelForZone(p.zone)}</h4>
                <pre className="whitespace-pre-wrap leading-relaxed">{p.fragment}</pre>
              </section>
            ))}
          </div>
        ) : (
          <pre className="whitespace-pre-wrap leading-relaxed">
            {decision.content || 'Aucun contenu disponible.'}
          </pre>
        )}
      </div>

      <div className="border rounded p-4 mb-6 bg-white">
        <h3 className="font-bold mb-2">Mots-clés :</h3>
        <div className="flex flex-wrap gap-2 mt-1">
          {decision.keywords?.length > 0 ? (
            decision.keywords.map((kw, i) => (
              <span
                key={`${kw}-${i}`}
                className="bg-gray-200 px-2 py-1 rounded text-sm flex items-center"
              >
                {kw}
                <button
                  type="button"
                  onClick={() => handleRemoveKeyword(kw)}
                  className="ml-1 text-red-600 font-bold"
                  title="Supprimer"
                >
                  ×
                </button>
              </span>
            ))
          ) : (
            <span className="text-gray-400 text-sm">Aucun mot-clé</span>
          )}
        </div>

        <div className="flex mt-2 gap-2">
          <input
            type="text"
            value={newKeyword}
            onChange={(e) => setNewKeyword(e.target.value)}
            className="border px-2 py-1 rounded"
            placeholder="Nouveau mot-clé"
          />
          <button
            type="button"
            onClick={handleAddKeyword}
            className="px-3 py-1 bg-gray-300 rounded"
          >
            + Ajouter
          </button>
        </div>

        <button
          onClick={handleSaveKeywords}
          className="mt-3 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Enregistrer
        </button>

        {message && (
          <p className="mt-2 font-semibold text-sm text-green-600">{message}</p>
        )}
      </div>
    </>
  );
};

export default DecisionDetailPage;
