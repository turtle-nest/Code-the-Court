import { useState, useEffect } from 'react';

export default function SearchForm({ onSearch }) {
  const [date, setDate] = useState('');
  const [juridiction, setJuridiction] = useState('');
  const [typeAffaire, setTypeAffaire] = useState('');
  const [juridictions, setJuridictions] = useState([]);
  const [types, setTypes] = useState([]);

  // Fetch juridictions and types on mount
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
      date,
      juridiction,
      type_affaire: typeAffaire
    });
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: 24 }}>
      <input
        type="date"
        value={date}
        onChange={e => setDate(e.target.value)}
        placeholder="Date"
      />

      <select
        value={juridiction}
        onChange={e => setJuridiction(e.target.value)}
        style={{ marginLeft: 8 }}
      >
        <option value="">-- Juridiction --</option>
        {juridictions.map(j => (
          <option key={j.id} value={j.name}>{j.name}</option>
        ))}
      </select>

      <select
        value={typeAffaire}
        onChange={e => setTypeAffaire(e.target.value)}
        style={{ marginLeft: 8 }}
      >
        <option value="">-- Type d'affaire --</option>
        {types.map(t => (
          <option key={t.id} value={t.label}>{t.label}</option>
        ))}
      </select>

      <button type="submit" style={{ marginLeft: 8 }}>
        Rechercher
      </button>
    </form>
  );
}
