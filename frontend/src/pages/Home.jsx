// frontend/src/pages/Home.jsx
import React, { useEffect, useState } from 'react';
import Stat from '../components/Stat';
import { apiFetch } from '../utils/apiFetch';

const Home = () => {
  const [totalDecisions, setTotalDecisions] = useState(0);
  const [lastImportCount, setLastImportCount] = useState(0);
  const [lastImportDate, setLastImportDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    apiFetch('/api/decisions/stats')
      .then((data) => {
        setTotalDecisions(data.total || 0);
        setLastImportCount(data.lastImport.count || 0);
        setLastImportDate(data.lastImport.date || '');
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError('Impossible de récupérer les statistiques.');
        setLoading(false);
      });
  }, []);

  return (
    <div>
      <p className="italic text-lg mb-10">
        Bienvenue dans l’interface de gestion et d’analyse des décisions de justice.
      </p>

      {loading && <p>Chargement des statistiques…</p>}
      {error && <p className="text-red-600">{error}</p>}

      {!loading && !error && (
        <Stat
          totalDecisions={totalDecisions}
          lastImportCount={lastImportCount}
          lastImportDate={lastImportDate}
        />
      )}
    </div>
  );
};

export default Home;
