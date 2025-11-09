// src/components/Layout.jsx
import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

const Layout = ({ children, title }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header title={title} />

      <div className="h-24 md:h-28" />

      <div className="flex min-h-[calc(100vh-6rem)] md:min-h-[calc(100vh-7rem)]">
        <Sidebar />
        <main className="flex-1 px-6 md:px-8 pb-12">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
