import React from 'react';
import { Link } from 'react-router-dom';

function Header({ title }) {
  const token = localStorage.getItem('token');
  const userEmail = localStorage.getItem('userEmail');
  const userRole = localStorage.getItem('role');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('role');
    window.location.href = '/login';
  };

  return (
    <header className="relative bg-blue-800 text-white px-8 h-28 flex items-center justify-between">
      {/* Logo à gauche */}
      <div className="flex items-center h-full">
        <Link to="/">
          <img
            src="/logo.png"
            alt="SocioJustice Logo"
            className="h-full max-h-24 w-auto object-contain"
          />
        </Link>
      </div>

      {/* Titre centré */}
      {title && (
        <h1 className="absolute left-1/2 transform -translate-x-1/2 text-4xl font-bold text-white">
          {title}
        </h1>
      )}

      {/* Zone utilisateur à droite */}
      <div className="flex items-center gap-4 text-sm">
        {!token ? (
          <Link
            to="/login"
            className="bg-white text-blue-800 px-4 py-2 rounded hover:bg-gray-100 transition"
          >
            Connexion
          </Link>
        ) : (
          <>
            <span>{userEmail} ({userRole})</span>
            <button
              onClick={handleLogout}
              className="bg-white text-blue-800 px-4 py-2 rounded hover:bg-gray-100 transition"
            >
              Se déconnecter
            </button>
          </>
        )}
      </div>
    </header>
  );
}

export default Header;
