// frontend/src/components/Stat.jsx
import React from 'react';

const Stat = ({ totalDecisions, totalArchives, lastImportCount, lastImportDate }) => {
  const formattedDate = lastImportDate
    ? new Intl.DateTimeFormat('fr-FR').format(new Date(lastImportDate))
    : '';

  return (
    <div className="bg-gray-100 rounded-xl p-6 w-fit shadow-md">
      <h3 className="text-xl font-bold mb-4">Statistiques</h3>

      <p className="mb-2">Corpus total : <strong>{totalDecisions}</strong> décisions Judilibre</p>

      <p className="mb-2">Archives PDF : <strong>{totalArchives}</strong> saisies manuellement</p>

      {lastImportCount > 0 && (
        <p>
          Dernier import : <strong>{lastImportCount}</strong> décisions
          {formattedDate && ` (le ${formattedDate})`}
        </p>
      )}
    </div>
  );
};

export default Stat;
