import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Item = ({ to, label, active }) => (
  <Link
    to={to}
    aria-current={active ? 'page' : undefined}
    className={[
      // height x2.5: bigger vertical padding + slightly larger text
      'block w-full rounded-xl px-4 py-8 text-base font-medium transition',
      'bg-[#1552a1] text-white',
      'ring-1 ring-[#1e4ed8]/20 shadow-sm',
      'hover:bg-[#1d4ed8] hover:ring-[#1d4ed8]/40',
      'focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:ring-offset-2 focus:ring-offset-gray-200',
      active ? 'bg-[#1d4ed8]' : ''
    ].join(' ')}
  >
    {label}
  </Link>
);

const Sidebar = () => {
  const { pathname } = useLocation();
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  return (
    <aside
      className={[
        'w-64 shrink-0 rounded-2xl border border-blue-100 bg-[#f2f6fa] p-4',
        'sticky top-24 md:top-28',
        'h-[calc(100vh-6rem)] md:h-[calc(100vh-7rem)]',
        'overflow-y-auto'
      ].join(' ')}
      aria-label="Menu latéral"
    >
      <nav className="flex flex-col gap-3">
        {pathname === '/login' && (
          <>
            <Item to="/register" label="Créer un compte" active={pathname === '/register'} />
            <Item to="/" label="Retour au tableau de bord" active={pathname === '/'} />
          </>
        )}

        {pathname === '/register' && (
          <>
            <Item to="/login" label="Déjà inscrit ? Se connecter" active={pathname === '/login'} />
            <Item to="/" label="Retour au tableau de bord" active={pathname === '/'} />
          </>
        )}

        {pathname !== '/login' && pathname !== '/register' && (
          <>
            {pathname !== '/' && <Item to="/" label="Tableau de bord" active={pathname === '/'} />}

            {token && (
              <>
                {pathname !== '/add-archive' && (
                  <Item
                    to="/add-archive"
                    label="Ajouter une archive"
                    active={pathname === '/add-archive'}
                  />
                )}

                {role === 'admin' && pathname !== '/archives' && (
                  <Item
                    to="/archives"
                    label="Décisions Judilibre"
                    active={pathname === '/archives'}
                  />
                )}
              </>
            )}

            {pathname !== '/search' && (
              <Item to="/search" label="Recherche corpus" active={pathname === '/search'} />
            )}
          </>
        )}
      </nav>
    </aside>
  );
};

export default Sidebar;
