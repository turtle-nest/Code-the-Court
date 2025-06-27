// src/components/Header.jsx
import React from 'react';
import { Link } from 'react-router-dom';

function Header() {
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
    <header className="header">
      <div className="header-left">
        <h1 className="site-title">SocioJustice</h1>
        <nav className="nav-links">
          <Link to="/">Accueil</Link>
          <Link to="/archives">Archives</Link>
          {token && userRole === 'admin' && (
            <Link to="/add-archive">➕ Ajouter</Link>
          )}
        </nav>
      </div>

      <div className="header-right">
        {token ? (
          <>
            <span className="user-info">
              {userEmail} ({userRole})
            </span>
            <button className="logout-btn" onClick={handleLogout}>
              Se déconnecter
            </button>
          </>
        ) : (
          <Link to="/login">Connexion</Link>
        )}
      </div>
    </header>
  );
}

export default Header;
