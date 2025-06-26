// src/components/ArchiveList.jsx
import React from 'react';

const ArchiveList = ({ archives }) => {
  if (archives.length === 0) {
    return <p>Aucune archive disponible.</p>;
  }

  return (
    <div className="archive-list">
      {archives.map((archive) => (
        <div key={archive.id} className="archive-card">
          <h3>{archive.title}</h3>
          <p><strong>Date :</strong> {new Date(archive.date).toLocaleDateString()}</p>
          <p><strong>Juridiction :</strong> {archive.jurisdiction}</p>
          <p><strong>Type d'affaire :</strong> {archive.content}</p>
          <p><strong>Ajouté par :</strong> {archive.user_email}</p>
          {archive.file_path && (
            <a
              href={`http://localhost:3000/${archive.file_path}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Voir le PDF
            </a>
          )}
        </div>
      ))}
    </div>
  );
};

export default ArchiveList;
