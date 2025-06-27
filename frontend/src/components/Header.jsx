// src/components/Header.jsx
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
    <header className="bg-blue-800 text-white px-6 py-4 flex justify-between items-center">
      <div className="flex items-center gap-6">
        <h1 className="text-xl font-bold">SocioJustice</h1>
        {title && (
          <span className="text-lg font-medium text-white/90">
            {title}
          </span>
        )}
      </div>

      <div className="flex items-center gap-4 text-sm">
        {!token ? (
          <Link
            to="/login"
            className="bg-white text-blue-800 px-3 py-1 rounded hover:bg-gray-100 transition"
          >
            Connexion
          </Link>
        ) : (
          <>
            <span>{userEmail} ({userRole})</span>
            <button onClick={handleLogout} className="...">
              Se déconnecter
            </button>
          </>
        )}
      </div>
    </header>
  );
}

export default Header;
