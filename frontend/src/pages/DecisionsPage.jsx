// src/pages/DecisionsPage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { importFromJudilibre } from '../services/decisions';
import {
  fetchJudilibreConfig,
  getJurisdictions,
  getCaseTypes,
  readableJurisdiction,
  readableCaseType,
  formatDecisionTitle
} from '../config/judilibreConfig'; // ✅ utilise ton module unique

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
  const [decisions, setDecisions] = useState([]);

  useEffect(() => {
    // ✅ Charge la config Judilibre avant d’afficher les filtres
    async function initConfig() {
      await fetchJudilibreConfig();
      setJurisdictions(getJurisdictions());
      setCaseTypes(getCaseTypes());
    }
    initConfig();

    // ✅ Charger déjà les décisions existantes
    fetch('http://localhost:3000/api/decisions?source=judilibre&limit=20')
      .then(res => res.json())
      .then(data => {
        console.log('🎯 Fetched decisions:', data.results);
        setDecisions(data.results || []);
      })
      .catch(err => console.error('[❌] Decisions fetch error:', err));
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
      query: 'brevet'
    };
    if (formData.jurisdiction) payload.jurisdiction = formData.jurisdiction;
    if (formData.caseType) payload.caseType = formData.caseType;

    try {
      const result = await importFromJudilibre(payload);
      const count = result.count ?? result.total ?? (result.results?.length || 0);
      setMessage(`${count} décisions importées le ${new Date().toLocaleString()}`);

      // ✅ Recharge la liste
      const res = await fetch('http://localhost:3000/api/decisions?source=judilibre&limit=20');
      const data = await res.json();
      console.log('🎯 Refreshed decisions:', data.results);
      setDecisions(data.results || []);
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
    <div className="p-8">
      <h1 className="text-lg font-semibold mb-4">Importer depuis Judilibre</h1>

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
              <option key={j} value={j}>
                {readableJurisdiction(j)}
              </option>
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
              <option key={t} value={t}>
                {readableCaseType(t)}
              </option>
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

      {error && <p className="mt-4 font-semibold text-red-600">{error}</p>}
      {message && <p className="mt-4 font-semibold text-green-600">{message}</p>}

      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Décisions importées</h2>
        {decisions.length === 0 ? (
          <p className="italic">Aucune décision disponible.</p>
        ) : (
          <div className="space-y-4">
            {decisions.map(decision => (
              <div
                key={decision.id}
                className="border rounded p-4 bg-white shadow flex justify-between items-center"
              >
                {console.log('🎯 Decision render:', decision)}
                <div>
                  <h3 className="font-bold">{formatDecisionTitle(decision)}</h3>
                  <p className="text-sm italic text-gray-600">
                    {readableJurisdiction(decision.jurisdiction)} —{' '}
                    {new Date(decision.date).toLocaleDateString('fr-FR')}
                  </p>
                  <p className="text-sm italic">
                    Type d’affaire : {readableCaseType(decision.case_type)}
                  </p>
                  <p className="text-sm text-gray-500">
                    {decision.keywords?.length > 0 ? decision.keywords.join(', ') : 'Aucun mot-clé'}
                  </p>
                </div>
                <Link
                  to={`/decisions/${decision.id}`}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Voir détails →
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default DecisionsPage;
