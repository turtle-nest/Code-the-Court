// src/components/Layout.jsx
import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

const Layout = ({ children, title }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header title={title} />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 bg-gray-50 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
