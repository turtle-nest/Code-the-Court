import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

// Small helper to join only truthy parts with " – "
function joinParts(parts) {
  return parts.filter(Boolean).join(' – ');
}

function Header({ title }) {
  const navigate = useNavigate();

  // Auth tokens
  const token = localStorage.getItem('token');

  // Try to read a structured user object first, then fall back to individual keys
  let userObj = null;
  try {
    const raw = localStorage.getItem('user'); // e.g. {"fullName":"Nicolas","institution":"Holberton","role":"Admin","email":"..."}
    if (raw) userObj = JSON.parse(raw);
  } catch (_) {
    /* ignore bad JSON */
  }

  const fullName    = userObj?.fullName    || localStorage.getItem('fullName')    || '';
  const institution = userObj?.institution || localStorage.getItem('institution') || '';
  const role        = (userObj?.role || localStorage.getItem('role') || '').trim();
  const email       = userObj?.email || localStorage.getItem('userEmail') || '';

  // Prefer fullName; if absent, show email local-part as a fallback
  const displayName = fullName || (email ? email.split('@')[0] : '');

  // Compose: "Nom – Institution – Rôle"
  const identityLine = joinParts([
    displayName,
    institution,
    role ? role.charAt(0).toUpperCase() + role.slice(1) : ''
  ]);

  const handleLogout = () => {
    // Clear everything we might have set during auth
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('fullName');
    localStorage.removeItem('institution');
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
                  {/* Identity line at the left of logout button */}
                  {identityLine ? (
                    <span
                      className="hidden md:inline font-medium truncate max-w-[300px] text-white/90"
                      title={identityLine}
                    >
                      {identityLine}
                    </span>
                  ) : null}

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
