// src/components/Sidebar.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const location = useLocation();
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  // Page actuelle
  const pathname = location.pathname;

  // Auth pages → sidebar personnalisée
  if (pathname === '/login') {
    return (
      <aside className="bg-gray-200 w-64 p-6 flex flex-col gap-4">
        <Link to="/register">
          <button className="w-full bg-white rounded-lg shadow px-4 py-2 text-left hover:bg-gray-100">
            Créer un compte
          </button>
        </Link>
        <Link to="/">
          <button className="w-full bg-white rounded-lg shadow px-4 py-2 text-left hover:bg-gray-100">
            Retour au tableau de bord
          </button>
        </Link>
      </aside>
    );
  }

  if (pathname === '/register') {
    return (
      <aside className="bg-gray-200 w-64 p-6 flex flex-col gap-4">
        <Link to="/login">
          <button className="w-full bg-white rounded-lg shadow px-4 py-2 text-left hover:bg-gray-100">
            Déjà inscrit ? Se connecter
          </button>
        </Link>
        <Link to="/">
          <button className="w-full bg-white rounded-lg shadow px-4 py-2 text-left hover:bg-gray-100">
            Retour au tableau de bord
          </button>
        </Link>
      </aside>
    );
  }

  // Sidebar par défaut pour toutes les autres pages
  return (
    <aside className="bg-gray-200 w-64 p-6 flex flex-col gap-4">
      {pathname !== '/' && (
        <Link to="/">
          <button className="w-full bg-white rounded-lg shadow px-4 py-2 text-left hover:bg-gray-100">
            Tableau de bord
          </button>
        </Link>
      )}

      {token && (
        <>
          {pathname !== '/add-archive' && (
            <Link to="/add-archive">
              <button className="w-full bg-white rounded-lg shadow px-4 py-2 text-left hover:bg-gray-100">
                Importer une archive PDF
              </button>
            </Link>
          )}
          {role === 'admin' && pathname !== '/archives' && (
            <Link to="/archives">
              <button className="w-full bg-white rounded-lg shadow px-4 py-2 text-left hover:bg-gray-100">
                Importer des décisions depuis Judilibre
              </button>
            </Link>
          )}
        </>
      )}

      {pathname !== '/search' && (
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
