// src/pages/ArchivesPage.jsx
import React, { useEffect, useState } from 'react';
import ArchiveList from '../components/ArchiveList';

const ArchivesPage = () => {
  const [archives, setArchives] = useState([]);

  useEffect(() => {
    fetch('/api/archives')
      .then((res) => res.json())
      .then((data) => setArchives(data))
      .catch((err) => console.error('Erreur de chargement des archives :', err));
  }, []);

  return (
    <div>
      <h1>Archives disponibles</h1>
      <ArchiveList archives={archives} />
    </div>
  );
};

export default ArchivesPage;
