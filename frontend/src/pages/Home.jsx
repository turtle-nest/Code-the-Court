// src/pages/Home.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getDecisions } from '../services/api';
import DecisionList from '../components/DecisionList';
import SearchForm from '../components/SearchForm';

function Home() {
  const [decisions, setDecisions] = useState([]);

  const fetchDecisions = (filters = {}) => {
    getDecisions(filters)
      .then(data => setDecisions(data))
      .catch(err => console.error('API error:', err));
  };

  useEffect(() => {
    fetchDecisions();
  }, []);

  return (
    <div>
      <h1>Décisions</h1>

      {localStorage.getItem('role') === 'admin' && (
        <Link to="/add-archive">
          <button style={{ marginBottom: '1rem' }}>
            ➕ Ajouter une décision manuellement
          </button>
        </Link>
      )}

      <SearchForm onSearch={fetchDecisions} />
      <DecisionList decisions={decisions} />
    </div>
  );
}

export default Home;
