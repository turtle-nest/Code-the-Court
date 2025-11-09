import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import AddArchivePage from './pages/AddArchivePage';
import DecisionsPage from './pages/DecisionsPage';
import LoginForm from './pages/LoginForm';
import RegisterForm from './pages/RegisterForm';
import SearchPage from './pages/SearchPage';
import DecisionDetailPage from './pages/DecisionDetailPage';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';

function App() {
  return (
    <Routes>
      {/* Login page */}
      <Route
        path="/login"
        element={
          <Layout title="Page d’authentification">
            <LoginForm />
          </Layout>
        }
      />

      <Route
        path="/register"
        element={
          <Layout title="Demande d’inscription">
            <RegisterForm />
          </Layout>
        }
      />

      {/* Home */}
      <Route
        path="/"
        element={
          <Layout title="Tableau de bord">
            <Home />
          </Layout>
        }
      />

      {/* Adding archive */}
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

      {/* Import */}
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

      {/* Search */}
      <Route
        path="/search"
        element={
          <PrivateRoute>
            <Layout title="Rechercher des décisions">
              <SearchPage />
            </Layout>
          </PrivateRoute>
        }
      />

      {/* Route details decision with: dynamic ID */}
      <Route
        path="/decisions/:id"
        element={
          <PrivateRoute>
            <Layout title="Détails de la décision">
              <DecisionDetailPage />
            </Layout>
          </PrivateRoute>
        }
      />

      {/* Route fallback to avoid blank pages */}
      <Route
        path="*"
        element={
          <Layout title="Page non trouvée">
            <div className="p-8 text-center">
              <h1 className="text-3xl font-bold">404</h1>
              <p>Page non trouvée</p>
            </div>
          </Layout>
        }
      />
    </Routes>
  );
}

export default App;
