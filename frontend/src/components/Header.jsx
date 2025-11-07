import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Header({ title }) {
  const navigate = useNavigate();

  const token = localStorage.getItem('token');
  const userEmail = localStorage.getItem('userEmail');
  const userRole = localStorage.getItem('role');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('role');
    navigate('/');
  };

  const bgStyle = {
    backgroundImage: "url('/headerBg.png')",
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
  };

  return (
    <header
      role="banner"
      className="fixed top-0 left-0 z-50 w-full h-24 md:h-28 text-white shadow-md shadow-blue-100"
      style={bgStyle}
      aria-label="Bandeau du site"
    >
      <div className="absolute inset-0 z-0 bg-black/20" />

      <div className="absolute inset-0 z-10">
        <div className="h-full w-full px-6 md:px-8">
          <div className="h-full grid grid-cols-[1fr_auto_1fr] items-center">
            <div aria-hidden="true" />
            <div className="flex items-center justify-center min-w-0">
              {title ? (
                <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-center truncate">
                  {title}
                </h1>
              ) : null}
            </div>
            <div className="flex items-center justify-end gap-3 md:gap-4 text-sm">
              {!token ? (
                <Link
                  to="/login"
                  className="bg-white text-blue-800 px-3 py-2 rounded hover:bg-gray-100 transition"
                >
                  Connexion
                </Link>
              ) : (
                <>
                  <span className="hidden md:inline truncate max-w-[240px]">
                    {userEmail} ({userRole})
                  </span>
                  <button
                    onClick={handleLogout}
                    className="bg-white text-blue-800 px-3 py-2 rounded hover:bg-gray-100 transition"
                  >
                    Se déconnecter
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
