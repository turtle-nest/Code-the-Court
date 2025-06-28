// src/pages/DecisionDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const DecisionDetailPage = () => {
  const { id } = useParams();
  const [decision, setDecision] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [keywords, setKeywords] = useState([]);
  const [newKeyword, setNewKeyword] = useState('');
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const fetchDecision = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`http://localhost:3000/api/decisions/${id}`);
        if (!res.ok) {
          throw new Error(`Erreur API: ${res.status}`);
        }
        const data = await res.json();
        setDecision(data);
        setKeywords(data.keywords || []);
      } catch (err) {
        console.error('[❌] Fetch decision error:', err);
        setError('❌ Erreur lors du chargement de la décision.');
      } finally {
        setLoading(false);
      }
    };
    fetchDecision();
  }, [id]);

  const handleAddKeyword = () => {
    if (newKeyword.trim() !== '') {
      setKeywords([...keywords, newKeyword.trim()]);
      setNewKeyword('');
    }
  };

  const handleRemoveKeyword = (kw) => {
    setKeywords(keywords.filter(k => k !== kw));
  };

  const handleSaveKeywords = async () => {
    try {
      await fetch(`http://localhost:3000/api/decisions/${id}/keywords`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keywords }),
      });
      setMessage('✅ Mots-clés mis à jour');
    } catch (err) {
      setMessage('❌ Erreur lors de la mise à jour');
    }
  };

  if (loading) return <div className="p-8 italic">⏳ Chargement en cours...</div>;
  if (error) return <div className="p-8 text-red-600 font-semibold">{error}</div>;

  return (
    <div className="flex h-screen">
      <main className="flex-1 p-8">

        <div className="mt-4">
          <h2 className="text-xl font-semibold mb-2">
            📄 {decision.jurisdiction} — {new Date(decision.date).toLocaleDateString('fr-FR')}
          </h2>

          <div className="border rounded p-4 mb-6">
            <h3 className="font-bold mb-2">Métadonnées</h3>
            <p>Type d’affaire : <strong>{decision.case_type}</strong></p>
            <p>Juridiction : <strong>{decision.jurisdiction}</strong></p>

            <div className="mt-2">
              <p className="font-semibold">Mots-clés :</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {keywords.map((kw, i) => (
                  <span
                    key={i}
                    className="bg-gray-200 px-2 py-1 rounded text-sm flex items-center"
                  >
                    {kw}
                    <button
                      type="button"
                      onClick={() => handleRemoveKeyword(kw)}
                      className="ml-1 text-red-600 font-bold"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>

              <div className="flex mt-2 gap-2">
                <input
                  type="text"
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  className="border px-2 py-1 rounded"
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
                <p className="mt-2 font-semibold text-sm text-green-600">
                  {message}
                </p>
              )}
            </div>
          </div>

          <div className="border rounded p-4 mb-4">
            <h3 className="font-bold mb-2">Contenu de la décision</h3>
            <p className="text-gray-700 whitespace-pre-wrap">{decision.content}</p>
          </div>

          <div className="flex gap-4">
            <a
              href={decision.pdf_url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Télécharger le fichier
            </a>
            <button
              onClick={() => alert('📝 Fenêtre pop-up à implémenter')}
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
            >
              Ajouter une note
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DecisionDetailPage;
