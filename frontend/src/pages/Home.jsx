// frontend/src/pages/Home.jsx
import React, { useEffect, useState } from 'react';
import Stat from '../components/Stat';
import { apiFetch } from '../utils/apiFetch';

const Home = () => {
  const [totalDecisions, setTotalDecisions] = useState(0);
  const [totalArchives, setTotalArchives] = useState(0);
  const [lastImportCount, setLastImportCount] = useState(0); // ✅ ajouté
  const [lastImportDate, setLastImportDate] = useState('');  // ✅ ajouté
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    apiFetch('/api/stats')
      .then((data) => {
        setTotalDecisions(data.decisions_count || 0);
        setTotalArchives(data.archives_count || 0);
        setLastImportCount(data.lastImportCount || 0);  // ✅ sécurisé
        setLastImportDate(data.lastImportDate || '');   // ✅ sécurisé
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError('Impossible de récupérer les statistiques.');
        setLoading(false);
      });
  }, []);

  return (
    <div className="flex flex-col justify-between h-[calc(100vh-8rem)] px-8">
      <div>
        <p className="italic text-lg mb-10">
          Bienvenue dans l’interface de gestion et d’analyse des décisions de justice.
        </p>

        {loading && <p>Chargement des statistiques…</p>}
        {error && <p className="text-red-600">{error}</p>}
      </div>

      {!loading && !error && (
        <div className="mb-10">
          <Stat
            totalDecisions={totalDecisions}
            totalArchives={totalArchives}
            lastImportCount={lastImportCount}
            lastImportDate={lastImportDate}
          />
        </div>
      )}
    </div>
  );
};

export default Home;
