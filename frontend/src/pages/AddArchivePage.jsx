// src/pages/AddArchivePage.jsx
import React from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import AddArchiveForm from '../components/AddArchiveForm';

const AddArchivePage = () => {
  return (
    <div className="flex h-screen">
      <div className="flex-1 p-8">
        <div className="mt-6 max-w-2xl">
          <AddArchiveForm />
        </div>
      </div>
    </div>
  );
};

export default AddArchivePage;
