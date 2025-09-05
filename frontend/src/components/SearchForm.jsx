// src/components/SearchForm.jsx
import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { readableJurisdiction, readableCaseType } from '../config/judilibreConfig';

export default function SearchForm({ onSearch, jurisdictions, caseTypes }) {
  const [searchParams] = useSearchParams();

  // Support both new & old param names (compat), prefer snake_case
  const [startDate, setStartDate] = useState(
    searchParams.get('start_date') || searchParams.get('startDate') || ''
  );
  const [endDate, setEndDate] = useState(
    searchParams.get('end_date') || searchParams.get('endDate') || ''
  );
  const [jurisdiction, setJurisdiction] = useState(
    searchParams.get('jurisdiction') || searchParams.get('juridiction') || ''
  );
  const [caseType, setCaseType] = useState(
    searchParams.get('case_type') || searchParams.get('type_affaire') || ''
  );
  const [keyword, setKeyword] = useState(
    searchParams.get('keywords') || searchParams.get('keyword') || ''
  );
  const [source, setSource] = useState(searchParams.getAll('source') || []);

  const handleSourceChange = (e) => {
    const { value, checked } = e.target;
    setSource((prev) => (checked ? [...prev, value] : prev.filter((v) => v !== value)));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Only send non-empty filters; backend accepts these keys
    const filters = { page: 1, limit: 10 };
    if (startDate) filters.start_date = startDate;
    if (endDate) filters.end_date = endDate;
    if (jurisdiction) filters.jurisdiction = jurisdiction;
    if (caseType) filters.case_type = caseType;
    if (keyword) filters.keywords = keyword;
    if (source.length > 0) filters.source = source;

    onSearch(filters);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-3xl">
      <p className="italic mb-2">Rechercher dans le corpus selon les critères suivants :</p>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <select
          value={jurisdiction}
          onChange={(e) => setJurisdiction(e.target.value)}
          className="border px-3 py-2 rounded"
        >
          <option value="">-- Juridiction --</option>
          {jurisdictions.map((j) => (
            <option key={j} value={j}>
              {readableJurisdiction(j)}
            </option>
          ))}
        </select>

        <select
          value={caseType}
          onChange={(e) => setCaseType(e.target.value)}
          className="border px-3 py-2 rounded"
        >
          <option value="">-- Type d'affaire --</option>
          {caseTypes.map((t) => (
            <option key={t} value={t}>
              {readableCaseType(t)}
            </option>
          ))}
        </select>

        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="Mots-clés"
          className="border px-3 py-2 rounded"
        />
      </div>

      <div className="flex gap-4">
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="border px-3 py-2 rounded"
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
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
