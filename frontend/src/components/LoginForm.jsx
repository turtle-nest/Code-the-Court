// src/components/LoginForm.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../utils/api';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const { token, email: userEmail, role } = await apiFetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      localStorage.setItem('token', token);
      localStorage.setItem('userEmail', userEmail); // utile uniquement si backend renvoie l'email
      localStorage.setItem('role', role);           // utile pour restreindre l'UI

      navigate('/');
    } catch (err) {
      console.error('[❌] Login error:', err);
      setError('Identifiants invalides ou compte non validé');
    }
  };

  return (
    <form onSubmit={handleLogin} className="login-form">
      <h2>Connexion</h2>
      <input
        type="email"
        placeholder="Adresse email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="Mot de passe"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button type="submit">Se connecter</button>

      {error && <p style={{ color: 'red' }}>{error}</p>}
    </form>
  );
};

export default LoginForm;
