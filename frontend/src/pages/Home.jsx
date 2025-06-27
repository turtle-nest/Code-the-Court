// src/pages/Home.jsx
import React from 'react';

const Home = () => {
  return (
    <div>
      <p className="italic text-lg mb-10">
        Bienvenue dans l’interface de gestion et d’analyse des décisions de justice.
      </p>

      <div className="bg-gray-100 rounded-xl p-6 w-fit shadow-md">
        <p>Corpus total : 280 décisions</p>
        <p>Dernier import : 15 décisions (le 12/06/2025)</p>
      </div>
    </div>
  );
};

export default Home;
