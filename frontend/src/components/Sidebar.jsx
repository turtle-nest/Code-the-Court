// src/components/Sidebar.jsx
import React from 'react';
import { Link } from 'react-router-dom';

function Sidebar() {
  const role = localStorage.getItem('role');

  return (
    <aside className="sidebar">
      {role === 'admin' && (
        <>
          <Link to="/archives"><button>Importer des décisions</button></Link>
          <Link to="/add-archive"><button>Saisir une archive</button></Link>
        </>
      )}
      <Link to="/"><button>Rechercher</button></Link>
    </aside>
  );
}

export default Sidebar;
