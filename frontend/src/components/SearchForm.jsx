// src/components/SearchForm.jsx
import React, { useState, useEffect } from 'react';

export default function SearchForm({ onSearch }) {
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');
  const [juridiction, setJuridiction] = useState('');
  const [typeAffaire, setTypeAffaire] = useState('');
  const [keyword, setKeyword] = useState('');
  const [juridictions, setJuridictions] = useState([]);
  const [types, setTypes] = useState([]);

  useEffect(() => {
    fetch('http://localhost:3000/api/juridictions')
      .then(res => res.json())
      .then(setJuridictions)
      .catch(() => setJuridictions([]));

    fetch('http://localhost:3000/api/types')
      .then(res => res.json())
      .then(setTypes)
      .catch(() => setTypes([]));
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch({
      startDate: dateStart,
      endDate: dateEnd,
      juridiction,
      type_affaire: typeAffaire,
      keywords: keyword
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-3xl">
      <p className="italic mb-2">
        Rechercher dans le corpus selon les critères suivants :
      </p>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <select
          value={juridiction}
          onChange={e => setJuridiction(e.target.value)}
          className="border px-3 py-2 rounded"
        >
          <option value="">-- Juridiction --</option>
          {juridictions.map(j => (
            <option key={j.id} value={j.name}>{j.name}</option>
          ))}
        </select>

        <select
          value={typeAffaire}
          onChange={e => setTypeAffaire(e.target.value)}
          className="border px-3 py-2 rounded"
        >
          <option value="">-- Type d'affaire --</option>
          {types.map(t => (
            <option key={t.id} value={t.label}>{t.label}</option>
          ))}
        </select>

        <input
          type="text"
          value={keyword}
          onChange={e => setKeyword(e.target.value)}
          placeholder="Mots-clés"
          className="border px-3 py-2 rounded"
        />
      </div>

      <div className="flex gap-4">
        <input
          type="date"
          value={dateStart}
          onChange={e => setDateStart(e.target.value)}
          className="border px-3 py-2 rounded"
        />
        <input
          type="date"
          value={dateEnd}
          onChange={e => setDateEnd(e.target.value)}
          className="border px-3 py-2 rounded"
        />
      </div>

      <button
        type="submit"
        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Lancer la recherche
      </button>
    </form>
  );
}
