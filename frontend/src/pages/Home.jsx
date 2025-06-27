// src/pages/Home.jsx
import React, { useEffect, useState } from 'react';

const Home = () => {
  const [stats, setStats] = useState({ total: 0, archive: 0, judilibre: 0 });
  const userEmail = localStorage.getItem('userEmail');
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) return;

    const fetchStats = async () => {
      try {
        const response = await fetch('/api/decisions/stats', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        setStats(data);
      } catch (err) {
        console.error('Failed to fetch stats:', err);
      }
    };

    fetchStats();
  }, [token]);

  return (
    <main className="home-container">
      <h1 className="text-4xl text-green-600 text-center mt-10">
        ✅ Tailwind fonctionne !
      </h1>
      <h1 className="home-title">
        Bonjour, {userEmail || 'visiteur'} !
      </h1>

      {!token ? (
        <p className="home-message">
          Connectez-vous pour accéder aux statistiques et aux fonctionnalités.
          <br />
          <a href="/login" className="login-link">Se connecter</a>
        </p>
      ) : (
        <>
          <section className="stat-grid">
            <div className="stat-card">
              <h2>Décisions totales</h2>
              <p>{stats.total}</p>
            </div>
            <div className="stat-card">
              <h2>Ajouts manuels</h2>
              <p>{stats.archive}</p>
            </div>
            <div className="stat-card">
              <h2>Import Judilibre</h2>
              <p>{stats.judilibre}</p>
            </div>
          </section>

          <section className="action-grid">
            <button onClick={() => (window.location.href = '/decisions')}>Importer depuis Judilibre</button>
            <button onClick={() => (window.location.href = '/archives/new')}>Ajouter une décision manuellement</button>
            <button onClick={() => (window.location.href = '/details')}>Consulter les décisions</button>
            <button onClick={() => (window.location.href = '/search')}>Rechercher des décisions</button>
          </section>
        </>
      )}
    </main>
  );
};

export default Home;
