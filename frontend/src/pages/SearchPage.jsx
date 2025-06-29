import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import SearchForm from '../components/SearchForm';

const SearchPage = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  const fetchResults = async (filters) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams(filters);
      const res = await fetch(`http://localhost:3000/api/decisions?${params.toString()}`);
      if (!res.ok) {
        throw new Error(`Erreur API: ${res.status}`);
      }
      const data = await res.json();
      setResults(data);
      setSuccessMessage(`✅ Nombre de décisions trouvées : ${data.length}`);
    } catch (err) {
      console.error('[❌] Search error:', err);
      setResults([]);
      setError('❌ Une erreur est survenue lors de la recherche.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (filters) => {
    setSearchParams(filters);
    fetchResults(filters);
  };

  useEffect(() => {
    const params = Object.fromEntries([...searchParams]);
    if (Object.keys(params).length > 0) {
      fetchResults(params);
    } else {
      setResults([]);
      setSuccessMessage('');
    }
  }, [searchParams]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  return (
    <div className="flex h-screen">
      <main className="flex-1 p-8">
        <SearchForm onSearch={handleSearch} />

        {loading && (
          <p className="mt-4 italic text-gray-600">⏳ Recherche en cours...</p>
        )}

        {error && (
          <p className="mt-4 font-semibold text-red-600">{error}</p>
        )}

        {successMessage && !loading && !error && (
          <p className="mt-4 font-semibold text-green-600">{successMessage}</p>
        )}

        {!loading && !error && results.length === 0 && (
          <p className="mt-4 italic text-gray-500">Aucun résultat trouvé.</p>
        )}

        {!loading && !error && results.length > 0 && (
          <div className="mt-6 space-y-4">
            {results.map((r, index) => (
              <div
                key={index}
                className="border rounded p-4 flex justify-between items-center bg-white shadow"
              >
                <div>
                  <p className="font-semibold text-gray-800">
                    📄 {r.city || r.jurisdiction} – {r.date}
                  </p>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {r.keywords?.map((kw, i) => (
                      <span
                        key={i}
                        className="bg-gray-200 text-sm px-2 py-1 rounded"
                      >
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => navigate(`/decision/${r.id}${location.search}`)}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Voir détails
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default SearchPage;
