// src/App.jsx
import { useEffect, useState } from 'react';
import { getDecisions } from './services/api';
import DecisionList from './components/DecisionList';
import SearchForm from './components/SearchForm';

function App() {
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
      <SearchForm onSearch={fetchDecisions} />
      <DecisionList decisions={decisions} />
    </div>
  );
}

export default App;
