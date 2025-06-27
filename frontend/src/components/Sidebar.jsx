// src/components/Sidebar.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  const location = useLocation();

  return (
    <aside className="bg-gray-200 w-64 p-6 flex flex-col gap-4">
      {/* Tableau de bord : visible sauf si déjà sur / */}
      {location.pathname !== '/' && (
        <Link to="/">
          <button className="w-full bg-white rounded-lg shadow px-4 py-2 text-left hover:bg-gray-100">
            Tableau de bord
          </button>
        </Link>
      )}

      {/* Boutons protégés : visible uniquement si connecté */}
      {token && (
        <>
          {location.pathname !== '/add-archive' && (
            <Link to="/add-archive">
              <button className="w-full bg-white rounded-lg shadow px-4 py-2 text-left hover:bg-gray-100">
                Importer une archive PDF
              </button>
            </Link>
          )}

          {role === 'admin' && location.pathname !== '/archives' && (
            <Link to="/archives">
              <button className="w-full bg-white rounded-lg shadow px-4 py-2 text-left hover:bg-gray-100">
                Importer des décisions depuis Judilibre
              </button>
            </Link>
          )}
        </>
      )}

      {/* Toujours visible sauf si déjà sur /search */}
      {location.pathname !== '/search' && (
        <Link to="/search">
          <button className="w-full bg-white rounded-lg shadow px-4 py-2 text-left hover:bg-gray-100">
            Rechercher dans le corpus
          </button>
        </Link>
      )}
    </aside>
  );
};

export default Sidebar;
