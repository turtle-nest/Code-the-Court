// src/components/Layout.jsx
import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import '../styles/Layout.css';

function Layout({ children }) {
  return (
    <>
      <Header />
      <div className="page-layout">
        <Sidebar />
        <main className="main-content">
          {children}
        </main>
      </div>
    </>
  );
}

export default Layout;
