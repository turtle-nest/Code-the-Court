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
      {/* Page de connexion (publique, sans layout) */}
      <Route path="/login" element={<LoginForm />} />

      {/* Page d'accueil (publique) */}
      <Route
        path="/"
        element={
          <Layout title="Tableau de bord">
            <Home />
          </Layout>
        }
      />

      {/* Ajout d'archive (protégé, admin uniquement) */}
      <Route
        path="/add-archive"
        element={
          <PrivateRoute allowedRoles={['admin']}>
            <Layout title="Saisir une archive">
              <AddArchivePage />
            </Layout>
          </PrivateRoute>
        }
      />

      {/* Import de décisions (protégé) */}
      <Route
        path="/archives"
        element={
          <PrivateRoute>
            <Layout title="Importer des décisions">
              <DecisionsPage />
            </Layout>
          </PrivateRoute>
        }
      />
    </Routes>
  );
}

export default App;
