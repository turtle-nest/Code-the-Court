// src/App.jsx
import React, { useEffect, useState } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { getDecisions } from './services/api';
import DecisionList from './components/DecisionList';
import SearchForm from './components/SearchForm';
import AddArchivePage from './pages/AddArchivePage';
import ArchivesPage from './pages/ArchivesPage';
import LoginForm from './components/LoginForm';

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
      <h1>Decisions</h1>

      <Link to="/add-archive">
        <button style={{ marginBottom: '1rem' }}>➕ Ajouter une décision manuellement</button>
      </Link>

      <SearchForm onSearch={fetchDecisions} />
      <DecisionList decisions={decisions} />
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/add-archive" element={<AddArchivePage />} />
      <Route path="/archives" element={<ArchivesPage />} />
      <Route path="/login" element={<LoginForm />} /> {/* ✅ ROUTE AJOUTÉE */}
    </Routes>
  );
}

export default App;
