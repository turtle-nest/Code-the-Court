// src/pages/DecisionsPage.jsx
import React, { useState } from 'react';
import { importFromJudilibre } from '../services/decisions';
import Sidebar from '../components/Sidebar'; // si tu l’as
import Header from '../components/Header';   // à créer si besoin

function DecisionsPage() {
  const [formData, setFormData] = useState({
    jurisdiction: '',
    caseType: '',
    startDate: '',
    endDate: '',
  });
  const [message, setMessage] = useState(null);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const result = await importFromJudilibre(formData);
      setMessage({
        type: 'success',
        text: `${result.count} décisions importées le ${result.timestamp}`,
      });
    } catch (err) {
      setMessage({
        type: 'error',
        text: `Une erreur est survenue : ${err.message}`,
      });
    }
  };

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
              required
            >
              <option value="">-- Choisir --</option>
              <option value="Cour d'appel">Cour d'appel</option>
              <option value="Cour de cassation">Cour de cassation</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold">Type d’affaire :</label>
            <select
              name="caseType"
              value={formData.caseType}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              required
            >
              <option value="">-- Choisir --</option>
              <option value="Civil">Civil</option>
              <option value="Pénal">Pénal</option>
              <option value="Social">Social</option>
              <option value="Commercial">Commercial</option>
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
            />
          </div>

          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Lancer l’import
          </button>
        </form>

        {message && (
          <div className={`mt-4 font-semibold ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
            {message.text}
          </div>
        )}
      </div>
    </div>
  );
}

export default DecisionsPage;
