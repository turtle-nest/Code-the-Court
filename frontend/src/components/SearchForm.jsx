// ✅ src/components/SearchForm.jsx
import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { readableJurisdiction, readableCaseType } from '../config/judilibreConfig'; // ✅ Nouveau chemin !

export default function SearchForm({
  onSearch,
  jurisdictions,
  caseTypes
}) {
  const [searchParams] = useSearchParams();

  const [dateStart, setDateStart] = useState(searchParams.get('startDate') || '');
  const [dateEnd, setDateEnd] = useState(searchParams.get('endDate') || '');
  const [juridiction, setJuridiction] = useState(searchParams.get('juridiction') || '');
  const [typeAffaire, setTypeAffaire] = useState(searchParams.get('type_affaire') || '');
  const [keyword, setKeyword] = useState(searchParams.get('keywords') || '');
  const [source, setSource] = useState(searchParams.getAll('source') || []);

  const handleSourceChange = (e) => {
    const { value, checked } = e.target;
    if (checked) {
      setSource(prev => [...prev, value]);
    } else {
      setSource(prev => prev.filter(v => v !== value));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const filters = {
      startDate: dateStart,
      endDate: dateEnd,
      juridiction,
      type_affaire: typeAffaire,
      keywords: keyword,
      page: 1,
      limit: 10
    };

    if (source.length > 0) {
      filters.source = source;
    }

    onSearch(filters);
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
          {jurisdictions.map(j => (
            <option key={j} value={j}>
              {readableJurisdiction(j)}
            </option>
          ))}
        </select>

        <select
          value={typeAffaire}
          onChange={e => setTypeAffaire(e.target.value)}
          className="border px-3 py-2 rounded"
        >
          <option value="">-- Type d'affaire --</option>
          {caseTypes.map(t => (
            <option key={t} value={t}>
              {readableCaseType(t)}
            </option>
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

      <div className="flex gap-4 items-center">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            value="judilibre"
            checked={source.includes('judilibre')}
            onChange={handleSourceChange}
          />
          Judilibre
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            value="archive"
            checked={source.includes('archive')}
            onChange={handleSourceChange}
          />
          Archive
        </label>
      </div>

      <button
        type="submit"
        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Lancer la recherche
      </button>

      <p className="text-xs text-gray-500 italic mt-2">
        🔍 Filtrage basé sur les métadonnées officielles Judilibre.
      </p>
    </form>
  );
}
