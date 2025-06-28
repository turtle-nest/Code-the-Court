// src/components/Stat.jsx
import React from 'react';

const Stat = ({ totalDecisions, lastImportCount, lastImportDate }) => {
  const formattedDate = lastImportDate
    ? new Intl.DateTimeFormat('fr-FR').format(new Date(lastImportDate))
    : '';

  return (
    <div className="bg-gray-100 rounded-xl p-6 w-fit shadow-md">
      <p>Corpus total : {totalDecisions} décisions</p>
      <p>
        Dernier import : {lastImportCount} décisions
        {formattedDate && ` (le ${formattedDate})`}
      </p>
    </div>
  );
};

export default Stat;
