// src/pages/DecisionDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  readableJurisdiction,
  readableCaseType
} from '../config/judilibreConfig'; // ✅ Nouveau chemin !
import { updateDecisionKeywords } from '../services/decisions';

const DecisionDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [decision, setDecision] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newKeyword, setNewKeyword] = useState('');
  const [message, setMessage] = useState(null);

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const fetchDecision = async () => {
    try {
      const res = await fetch(`http://localhost:3000/api/decisions/${id}`);
      if (!res.ok) throw new Error(`Erreur API: ${res.status}`);
      const data = await res.json();
      setDecision(data);
    } catch (err) {
      console.error('[❌] Fetch decision error:', err);
      setError(`❌ Erreur lors du chargement de la décision (ID : ${id})`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDecision(); }, [id]);

  const handleAddKeyword = () => {
    if (newKeyword.trim()) {
      setDecision({ ...decision, keywords: [...decision.keywords, newKeyword.trim()] });
      setNewKeyword('');
    }
  };

  const handleRemoveKeyword = (kw) => {
    setDecision({ ...decision, keywords: decision.keywords.filter(k => k !== kw) });
  };

  const handleSaveKeywords = async () => {
    try {
      const updated = await updateDecisionKeywords(id, decision.keywords);
      setDecision(updated);
      setMessage('✅ Mots-clés mis à jour');
    } catch {
      setMessage('❌ Erreur lors de la mise à jour');
    }
  };

  if (loading) return <div className="p-8 italic">⏳ Chargement en cours...</div>;
  if (error) return <div className="p-8 text-red-600 font-semibold">{error}</div>;

  return (
    <>
      <button onClick={() => navigate(-1)} className="mb-6 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">← Retour</button>
      <h1 className="text-2xl font-bold mb-2">{decision.title || 'Sans titre'}</h1>
      <h2 className="text-xl italic mb-4">
        {readableJurisdiction(decision.jurisdiction)} — <span className="text-gray-500">{formatDate(decision.date)}</span>
      </h2>
      <p className="italic mb-4">
        Type d’affaire : {readableCaseType(decision.case_type)}
      </p>
      {decision.solution && (
        <p className="italic mb-2">
          Solution : {decision.solution}
        </p>
      )}
      {decision.formation && (
        <p className="italic mb-4">
          Formation : {decision.formation}
        </p>
      )}

      <div className="border rounded p-4 mb-6 bg-white">
        <h3 className="font-bold mb-2">Contenu de la décision :</h3>
        <p className="whitespace-pre-wrap">{decision.content || 'Aucun contenu disponible.'}</p>
      </div>

      <div className="border rounded p-4 mb-6 bg-white">
        <h3 className="font-bold mb-2">Mots-clés :</h3>
        <div className="flex flex-wrap gap-2 mt-1">
          {decision.keywords?.length > 0 ? (
            decision.keywords.map((kw, i) => (
              <span key={i} className="bg-gray-200 px-2 py-1 rounded text-sm flex items-center">
                {kw}
                <button type="button" onClick={() => handleRemoveKeyword(kw)} className="ml-1 text-red-600 font-bold">×</button>
              </span>
            ))
          ) : <span className="text-gray-400 text-sm">Aucun mot-clé</span>}
        </div>

        <div className="flex mt-2 gap-2">
          <input type="text" value={newKeyword} onChange={(e) => setNewKeyword(e.target.value)} className="border px-2 py-1 rounded" />
          <button type="button" onClick={handleAddKeyword} className="px-3 py-1 bg-gray-300 rounded">+ Ajouter</button>
        </div>

        <button onClick={handleSaveKeywords} className="mt-3 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Enregistrer</button>
        {message && <p className="mt-2 font-semibold text-sm text-green-600">{message}</p>}
      </div>
    </>
  );
};

export default DecisionDetailPage;
