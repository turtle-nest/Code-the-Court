// src/pages/LoginForm.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { apiFetch } from '../utils/apiFetch';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('expired') === '1') {
      setError("⏳ Votre session a expiré. Veuillez vous reconnecter.");
    }
  }, [location.search]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const { token, refreshToken, email: userEmail, role } = await apiFetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      // ✅ Sauvegarde access + refresh tokens
      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('userEmail', userEmail);
      localStorage.setItem('role', role);

      navigate('/');

    } catch (err) {
      console.error('[❌] Login error:', err);

      if (err.message === 'pending') {
        setError("⏳ Votre compte est en attente de validation par un administrateur.");
      } else {
        setError("Identifiants incorrects ou compte non autorisé.");
      }
    }
  };

  return (
    <div className="flex flex-1">
      <main className="flex-1 flex items-center justify-center">
        <form onSubmit={handleLogin} className="w-full max-w-md bg-white p-8 rounded shadow-md">
          <h2 className="text-xl font-semibold text-center text-gray-800 mb-6">
            Connexion à votre espace :
          </h2>

          <input
            type="email"
            placeholder="Nom d’utilisateur ou Email"
            className="w-full border border-gray-300 rounded p-2 mb-4"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Mot de passe"
            className="w-full border border-gray-300 rounded p-2 mb-4"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
          >
            Se connecter
          </button>

          {error && (
            <p className="text-sm text-red-600 mt-4 text-center">
              {error}
            </p>
          )}

          <div className="mt-4 text-sm flex items-center">
            <input type="checkbox" id="remember" className="mr-2" />
            <label htmlFor="remember">Se souvenir de moi</label>
          </div>
        </form>
      </main>
    </div>
  );
};

export default LoginForm;
