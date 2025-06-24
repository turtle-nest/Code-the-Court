// src/App.jsx
import { useEffect, useState } from 'react';
import { getDecisions } from './services/api';
import DecisionList from './components/DecisionList';

function App() {
  const [decisions, setDecisions] = useState([]);

  useEffect(() => {
    getDecisions()
      .then(data => setDecisions(data))
      .catch(err => console.error('API error:', err));
  }, []);

  return (
    <div>
      <h1>Decisions</h1>
      <DecisionList decisions={decisions} />
    </div>
  );
}

export default App;

