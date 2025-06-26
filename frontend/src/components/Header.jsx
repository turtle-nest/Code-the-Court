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
    <header>
      <nav style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <Link to="/">Home</Link>
        <Link to="/archives">Archives</Link>

        {token ? (
          <>
            {userRole === 'admin' && (
              <Link to="/add-archive">➕ Ajouter</Link>
            )}
            <span>{userEmail} ({userRole})</span>
            <button onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <Link to="/login">Login</Link>
        )}
      </nav>
    </header>
  );
}

export default Header;
