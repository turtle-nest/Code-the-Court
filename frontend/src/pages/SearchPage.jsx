// src/pages/SearchPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SearchForm from '../components/SearchForm';
// import ResultsList from '../components/ResultsList'; // à faire plus tard

const SearchPage = () => {
  const [results, setResults] = useState([]);
  const [message, setMessage] = useState(null);
  const navigate = useNavigate();


  const handleSearch = async (filters) => {
    try {
      const params = new URLSearchParams(filters);
      const res = await fetch(`http://localhost:3000/api/decisions?${params.toString()}`);
      const data = await res.json();
      setResults(data);
      setMessage(`✅ Nombre de décisions trouvées : ${data.length}`);
    } catch (err) {
      setResults([]);
      setMessage('❌ Une erreur est survenue lors de la recherche');
    }
  };

  return (
    <div className="flex h-screen">
      <main className="flex-1 p-8">
        <SearchForm onSearch={handleSearch} />

        {message && (
          <p className={`mt-4 font-semibold ${message.startsWith('✅') ? 'text-green-600' : 'text-red-600'}`}>
            {message}
          </p>
        )}

        {/* Affichage conditionnel des résultats (à styliser ensuite) */}
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
                onClick={() => navigate(`/decision/${r.id}`)}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Voir détails
              </button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default SearchPage;
