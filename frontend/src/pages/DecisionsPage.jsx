// src/pages/DecisionsPage.jsx
import React, { useState } from 'react';
import { importFromJudilibre } from '../services/decisions';

function DecisionsPage() {
  const [formData, setFormData] = useState({
    jurisdiction: '',
    caseType: '',
    startDate: '',
    endDate: '',
  });

  const [message, setMessage] = useState(null); // { type: 'success' | 'error', text: string }

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
    <div className="decisions-container">
      <h1>Imports Judilibre</h1>
      <p>
        <em>
          Utilisez les filtres ci-dessous pour importer des décisions depuis la
          base Judilibre.
        </em>
      </p>

      <form onSubmit={handleSubmit} className="import-form">
        <label>
          Juridiction :
          <select
            name="jurisdiction"
            value={formData.jurisdiction}
            onChange={handleChange}
            required
          >
            <option value="">-- Choisir --</option>
            <option value="Cour d'appel">Cour d'appel</option>
            <option value="Cour de cassation">Cour de cassation</option>
          </select>
        </label>

        <label>
          Type d’affaire :
          <select
            name="caseType"
            value={formData.caseType}
            onChange={handleChange}
            required
          >
            <option value="">-- Choisir --</option>
            <option value="Civil">Civil</option>
            <option value="Pénal">Pénal</option>
            <option value="Social">Social</option>
            <option value="Commercial">Commercial</option>
          </select>
        </label>

        <label>
          Date de début :
          <input
            type="date"
            name="startDate"
            value={formData.startDate}
            onChange={handleChange}
          />
        </label>

        <label>
          Date de fin :
          <input
            type="date"
            name="endDate"
            value={formData.endDate}
            onChange={handleChange}
          />
        </label>

        <button type="submit">Lancer l’import</button>
      </form>

      {message && (
        <div className={`import-message ${message.type}`}>
          {message.text}
        </div>
      )}
    </div>
  );
}

export default DecisionsPage;
