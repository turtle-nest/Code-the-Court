// src/App.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import AddArchivePage from './pages/AddArchivePage';
import DecisionsPage from './pages/DecisionsPage';
import LoginForm from './pages/LoginForm';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginForm />} />

      <Route
        path="/"
        element={
          <PrivateRoute>
            <Layout><Home /></Layout>
          </PrivateRoute>
        }
      />

      <Route
        path="/add-archive"
        element={
          <PrivateRoute allowedRoles={['admin']}>
            <Layout><AddArchivePage /></Layout>
          </PrivateRoute>
        }
      />

      <Route
        path="/archives"
        element={
          <PrivateRoute>
            <Layout><DecisionsPage /></Layout>
          </PrivateRoute>
        }
      />
    </Routes>
  );
}

export default App;
