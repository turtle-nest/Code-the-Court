// src/pages/DecisionDetailPage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  readableJurisdiction,
  readableCaseType
} from '../config/judilibreConfig';
import { updateDecisionKeywords } from '../services/decisions';
import {
  fetchNotesForDecision,
  createNoteForDecision,
  updateNote,
  deleteNote
} from '../services/notes';

const API_URL = import.meta.env.VITE_API_URL || '';

/**
 * Build an ordered list of text fragments from Judilibre "zones".
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
        items.push({ zone: zoneName, start: frag.start, end: frag.end });
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
    dispositif: 'Dispositif',
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
  const [messageType, setMessageType] = useState('success'); // 'success' | 'error'
  const [sectionedView, setSectionedView] = useState(true);
  const [notes, setNotes] = useState([]);
  const [notesLoading, setNotesLoading] = useState(true);
  const [newNote, setNewNote] = useState('');
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editingContent, setEditingContent] = useState('');

  // PDF (archives only)
  const [pdfInfo, setPdfInfo] = useState({
    isPdf: false,
    fileUrl: null,
    downloadUrl: null
  });

  const isArchive = decision?.source === 'archive';

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  // ---- helpers: normalize keywords safely everywhere ----
  const normalizeKeywords = (kw) => {
    if (Array.isArray(kw)) return kw.filter(Boolean).map(String);
    if (typeof kw === 'string') {
      try {
        const parsed = JSON.parse(kw);
        return Array.isArray(parsed) ? parsed.filter(Boolean).map(String) : [];
      } catch {
        return [];
      }
    }
    return [];
  };

  const fetchDecision = async (opts = { refresh: false }) => {
    try {
      if (opts.refresh) setRefreshing(true);
      setLoading(!opts.refresh);
      setError(null);

      const url = opts.refresh
        ? `/api/decisions/${id}?refresh=1`
        : `/api/decisions/${id}`;

      const res = await fetch(url, { credentials: 'include' });
      if (!res.ok) throw new Error(`Erreur API: ${res.status}`);
      const data = await res.json();

      // normalize keywords
      const normalizedKeywords = normalizeKeywords(data.keywords);
      setDecision({ ...data, keywords: normalizedKeywords });
    } catch (err) {
      console.error('[❌] Fetch decision error:', err);
      setError(`❌ Erreur lors du chargement de la décision (ID : ${id})`);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchDecision(); /* eslint-disable-next-line */ }, [id]);

  useEffect(() => {
    async function loadNotes() {
      if (!id) return;
      try {
        setNotesLoading(true);
        const data = await fetchNotesForDecision(id);
        setNotes(data);
      } catch (e) {
        console.warn('[notes] load failed', e);
        setNotes([]);
      } finally {
        setNotesLoading(false);
      }
    }
    loadNotes();
  }, [id]);

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    try {
      const created = await createNoteForDecision(id, newNote.trim());
      setNotes(prev => [created, ...prev]);
      setNewNote('');
    } catch (e) {
      alert('Erreur lors de la création de la note.');
    }
  };

  const startEditNote = (note) => {
    setEditingNoteId(note.id);
    setEditingContent(note.content);
  };

  const cancelEditNote = () => {
    setEditingNoteId(null);
    setEditingContent('');
  };

  const handleSaveEditNote = async () => {
    if (!editingNoteId || !editingContent.trim()) return;
    try {
      const updated = await updateNote(editingNoteId, editingContent.trim());
      setNotes(prev => prev.map(n => n.id === updated.id ? updated : n));
      cancelEditNote();
    } catch (e) {
      alert('Erreur lors de la mise à jour de la note.');
    }
  };

  const handleDeleteNote = async (noteId) => {
    if (!confirm('Supprimer cette note ?')) return;
    try {
      await deleteNote(noteId);
      setNotes(prev => prev.filter(n => n.id !== noteId));
    } catch (e) {
      alert('Erreur lors de la suppression de la note.');
    }
  };

  // Charge les URLs PDF si la décision est une archive
  useEffect(() => {
    async function loadPdf() {
      setPdfInfo({ isPdf: false, fileUrl: null, downloadUrl: null });
      if (!decision) return;

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
    const k = newKeyword.trim();
    if (!k) return;
    setDecision(prev => {
      const current = Array.isArray(prev?.keywords) ? prev.keywords : [];
      if (current.includes(k)) return prev;
      return { ...prev, keywords: [...current, k] };
    });
    setNewKeyword('');
  };

  const handleRemoveKeyword = (kw) => {
    setDecision(prev => {
      const current = Array.isArray(prev?.keywords) ? prev.keywords : [];
      return { ...prev, keywords: current.filter(k => k !== kw) };
    });
  };

  const handleSaveKeywords = async () => {
    try {
      const payload = Array.from(
        new Set(
          (Array.isArray(decision?.keywords) ? decision.keywords : [])
            .map(k => String(k).trim())
            .filter(Boolean)
        )
      );
      const updated = await updateDecisionKeywords(id, payload);
      const clean = normalizeKeywords(updated.keywords);
      setDecision(prev => ({ ...prev, ...updated, keywords: clean }));
      setMessageType('success');
      setMessage('✅ Mots-clés mis à jour');
      setTimeout(() => setMessage(null), 2500);
    } catch (e) {
      setMessageType('error');
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

        {/* Hide "Rafraîchir depuis Judilibre" for archives */}
        {!isArchive && (
          <button
            onClick={handleForceRefresh}
            disabled={refreshing}
            className={`px-4 py-2 rounded ${refreshing ? 'bg-gray-300' : 'bg-blue-600 hover:bg-blue-700'} text-white`}
            title="Récupérer à nouveau depuis Judilibre (texte intégral + zones)"
          >
            {refreshing ? 'Rafraîchissement…' : 'Rafraîchir depuis Judilibre'}
          </button>
        )}

        {/* Hide zone toggle for archives */}
        {!isArchive && hasZones && (
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

      {/* Hide whole textual content block for archives */}
      {!isArchive && (
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
      )}

      <div className="border rounded p-4 mb-6 bg-white">
        <h3 className="font-bold mb-2">Mots-clés :</h3>
        <div className="flex flex-wrap gap-2 mt-1">
          {Array.isArray(decision.keywords) && decision.keywords.length > 0 ? (
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
          <p
            className={`mt-2 font-semibold text-sm ${
              messageType === 'success' ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {message}
          </p>
        )}
      </div>

      <div className="border rounded p-4 mb-6 bg-white">
        <h3 className="font-bold mb-3">Mes notes :</h3>

        {/* Create */}
        <div className="flex flex-col gap-2 mb-4">
          <textarea
            className="border rounded px-2 py-1"
            rows={3}
            placeholder="Ajouter une note (privée)…"
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
          />
          <div>
            <button
              type="button"
              onClick={handleAddNote}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              + Ajouter la note
            </button>
          </div>
        </div>

        {/* List */}
        {notesLoading ? (
          <p className="text-sm italic">Chargement des notes…</p>
        ) : notes.length === 0 ? (
          <p className="text-sm text-gray-500">Aucune note pour l’instant.</p>
        ) : (
          <ul className="space-y-3">
            {notes.map((note) => (
              <li key={note.id} className="border rounded p-3">
                {editingNoteId === note.id ? (
                  <>
                    <textarea
                      className="w-full border rounded px-2 py-1 mb-2"
                      rows={3}
                      value={editingContent}
                      onChange={(e) => setEditingContent(e.target.value)}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleSaveEditNote}
                        className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                      >
                        Enregistrer
                      </button>
                      <button
                        onClick={cancelEditNote}
                        className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
                      >
                        Annuler
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <pre className="whitespace-pre-wrap leading-relaxed mb-2">
                      {note.content}
                    </pre>
                    <div className="flex gap-2 text-sm">
                      <button
                        onClick={() => startEditNote(note)}
                        className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
                      >
                        Éditer
                      </button>
                      <button
                        onClick={() => handleDeleteNote(note.id)}
                        className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                      >
                        Supprimer
                      </button>
                      <span className="ml-auto text-gray-500">
                        {new Date(note.created_at).toLocaleString('fr-FR')}
                      </span>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
};

export default DecisionDetailPage;
