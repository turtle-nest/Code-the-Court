// ✅ src/pages/DecisionsPage.jsx

import React, { useState, useEffect } from 'react';
import { importFromJudilibre } from '../services/decisions';

function DecisionsPage() {
  const [formData, setFormData] = useState({
    jurisdiction: '',
    caseType: '',
    startDate: '',
    endDate: '',
  });

  const [jurisdictions, setJurisdictions] = useState([]);
  const [caseTypes, setCaseTypes] = useState([]);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('http://localhost:3000/api/metadata')
      .then(res => res.json())
      .then(data => {
        setJurisdictions(data.jurisdictions || []);
        setCaseTypes(data.caseTypes || []);
      })
      .catch(err => console.error('[❌] Metadata fetch error:', err));
  }, []);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const payload = {
      dateDecisionMin: formData.startDate,
      dateDecisionMax: formData.endDate,
      query: 'brevet' // Mot-clé de test — change ou mets '' pour tout
    };
    if (formData.jurisdiction) payload.jurisdiction = formData.jurisdiction;
    if (formData.caseType) payload.caseType = formData.caseType;

    console.log('[DEBUG] Payload envoyé:', payload);

    try {
      const result = await importFromJudilibre(payload);
      console.log('[DEBUG] API response:', result);

      // ✅ Prends `count` en priorité, sinon fallback total, sinon longueur brute
      const count = result.count ?? result.total ?? (result.results?.length || 0);

      setMessage(`${count} décisions importées le ${new Date().toLocaleString()}`);
    } catch (err) {
      console.error('[❌] Import error:', err);
      setError(`Une erreur est survenue : ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  return (
    <div className="flex h-screen">
      <div className="flex-1 p-8">
        <p className="italic mb-4">
          Utilisez les filtres ci-dessous pour importer des décisions depuis la base Judilibre.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
          <div>
            <label className="block font-semibold">Juridiction :</label>
            <select
              name="jurisdiction"
              value={formData.jurisdiction}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            >
              <option value="">-- Choisir (optionnel) --</option>
              {jurisdictions.map(j => (
                <option key={j} value={j}>{j}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold">Type d’affaire :</label>
            <select
              name="caseType"
              value={formData.caseType}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            >
              <option value="">-- Choisir (optionnel) --</option>
              {caseTypes.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold">Date de début :</label>
            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block font-semibold">Date de fin :</label>
            <input
              type="date"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Import en cours...' : 'Lancer l’import'}
          </button>
        </form>

        {error && (
          <p className="mt-4 font-semibold text-red-600">{error}</p>
        )}

        {message && (
          <p className="mt-4 font-semibold text-green-600">{message}</p>
        )}
      </div>
    </div>
  );
}

export default DecisionsPage;
