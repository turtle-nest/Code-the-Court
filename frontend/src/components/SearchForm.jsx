// src/components/SearchForm.jsx
import { useState } from 'react';

export default function SearchForm({ onSearch }) {
  const [date, setDate] = useState('');
  const [juridiction, setJuridiction] = useState('');
  const [typeAffaire, setTypeAffaire] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch({
      date,
      juridiction,
      type_affaire: typeAffaire
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="date"
        value={date}
        onChange={e => setDate(e.target.value)}
        placeholder="Date"
      />
      <input
        type="text"
        value={juridiction}
        onChange={e => setJuridiction(e.target.value)}
        placeholder="Juridiction"
      />
      <input
        type="text"
        value={typeAffaire}
        onChange={e => setTypeAffaire(e.target.value)}
        placeholder="Type d'affaire"
      />
      <button type="submit">Rechercher</button>
    </form>
  );
}
