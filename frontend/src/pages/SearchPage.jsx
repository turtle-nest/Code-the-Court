// src/pages/SearchPage.jsx
import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import SearchForm from '../components/SearchForm';
import Pagination from '../components/Pagination';
import {
  fetchJudilibreConfig,
  getJurisdictions,
  getCaseTypes,
  formatDecisionTitle
} from '../config/judilibreConfig';

const SearchPage = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [totalCount, setTotalCount] = useState(0);

  const [searchParams, setSearchParams] = useSearchParams();

  const [jurisdictions, setJurisdictions] = useState([]);
  const [caseTypes, setCaseTypes] = useState([]);

  // --- UI helpers ---
  const formatDate = (dateString) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
  };

  const decodeHTML = (str) => {
    if (!str) return '';
    const parser = new DOMParser();
    return parser.parseFromString(`<!doctype html><body>${str}`, 'text/html').body.textContent;
  };

  // --- Fetch search results with robust query building (arrays supported) ---
  const fetchResults = async (filters) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([k, v]) => {
        if (v === undefined || v === null || v === '') return;
        if (Array.isArray(v)) v.forEach(val => params.append(k, val));
        else params.set(k, v);
      });

      const res = await fetch(`http://localhost:3000/api/decisions?${params.toString()}`);
      if (!res.ok) throw new Error(`Erreur API: ${res.status}`);
      const data = await res.json();

      setResults(data.results || []);
      setTotalCount(data.totalCount || (data.results ? data.results.length : 0) || 0);
      setSuccessMessage(`✅ Nombre de décisions trouvées : ${data.totalCount ?? (data.results ? data.results.length : 0)}`);
    } catch (err) {
      console.error('[❌] Search error:', err);
      setResults([]);
      setError('❌ Une erreur est survenue lors de la recherche.');
    } finally {
      setLoading(false);
    }
  };

  // --- Called by the form ---
  const handleSearch = (filters) => {
    const paramsWithPagination = { ...filters, page: 1, limit: 10 };
    setSearchParams(paramsWithPagination);
    fetchResults(paramsWithPagination);
  };

  // --- Load dropdown lists: backend first, fallback to judilibre config ---
  useEffect(() => {
    (async () => {
      try {
        const [jRes, cRes] = await Promise.all([
          fetch('http://localhost:3000/api/decisions/juridictions'),
          fetch('http://localhost:3000/api/decisions/case-types'),
        ]);

        const [jList, cList] = await Promise.all([jRes.json(), cRes.json()]);
        const jFinal = Array.isArray(jList) ? jList.filter(Boolean) : [];
        const cFinal = Array.isArray(cList) ? cList.filter(Boolean) : [];

        if (jFinal.length > 0) setJurisdictions(jFinal);
        if (cFinal.length > 0) setCaseTypes(cFinal);

        if (jFinal.length === 0 || cFinal.length === 0) {
          await fetchJudilibreConfig();
          if (jFinal.length === 0) setJurisdictions(getJurisdictions());
          if (cFinal.length === 0) setCaseTypes(getCaseTypes());
        }
      } catch (e) {
        console.warn('[SearchPage] Backend lists failed, falling back to config:', e);
        await fetchJudilibreConfig();
        setJurisdictions(getJurisdictions());
        setCaseTypes(getCaseTypes());
      }
    })();
  }, []);

  // --- Sync results with URL ---
  useEffect(() => {
    const obj = Object.fromEntries([...searchParams]);
    const sources = searchParams.getAll('source');
    if (sources.length > 0) obj.source = sources;

    if (Object.keys(obj).length > 0) {
      obj.page = Number(obj.page) || 1;
      obj.limit = Number(obj.limit) || 10;
      fetchResults(obj);
    } else {
      setResults([]);
      setSuccessMessage('');
    }
  }, [searchParams]);

  // --- Auto-hide success message ---
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const currentPage = parseInt(searchParams.get('page') || 1, 10);

  return (
    <div className="flex h-screen">
      <main className="flex-1 p-8">
        <SearchForm
          onSearch={handleSearch}
          jurisdictions={jurisdictions}
          caseTypes={caseTypes}
        />

        {loading && <p className="mt-4 italic text-gray-600">⏳ Recherche en cours...</p>}
        {error && <p className="mt-4 font-semibold text-red-600">{error}</p>}
        {successMessage && !loading && !error && (
          <p className="mt-4 font-semibold text-green-600">{successMessage}</p>
        )}
        {!loading && !error && results.length === 0 && (
          <p className="mt-4 italic text-gray-500">Aucun résultat trouvé.</p>
        )}

        {!loading && !error && results.length > 0 && (
          <>
            <div className="mt-6 space-y-4">
              {results.map((r, index) => (
                <div
                  key={r.id || r.external_id || index}
                  className="border rounded p-4 flex justify-between items-start bg-white shadow"
                >
                  <div className="flex-1">
                    <h3 className="text-lg font-bold mb-1">{formatDecisionTitle(r)}</h3>
                    <p className="font-semibold text-gray-800">
                      📄 {decodeHTML(r.jurisdiction)} –{' '}
                      <span className="text-gray-500 text-sm">{formatDate(r.date)}</span>
                    </p>
                    <p className="italic text-blue-800 text-sm mt-1">
                      Type d’affaire : {r.case_type || 'N/A'}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {r.keywords?.length > 0 ? (
                        r.keywords.map((kw, i) => (
                          <span key={i} className="bg-gray-200 text-sm px-2 py-1 rounded">
                            {kw}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-400 text-sm">Aucun mot-clé</span>
                      )}
                    </div>
                  </div>
                  <Link
                    to={`/decisions/${r.id || r.external_id}`}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    Voir détails →
                  </Link>
                </div>
              ))}
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={Math.ceil(totalCount / 10)}
              onPageChange={(newPage) => {
                const obj = Object.fromEntries([...searchParams]);
                const sources = searchParams.getAll('source');
                if (sources.length > 0) obj.source = sources;

                obj.page = newPage;
                obj.limit = 10;
                setSearchParams(obj);
              }}
            />
          </>
        )}
      </main>
    </div>
  );
};

export default SearchPage;
