import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiFetch } from '../utils/apiFetch';

const RegisterForm = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [institution, setInstitution] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    if (password !== confirmPwd) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    try {
      await apiFetch('/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          email,
          password,
          institution,
        }),
      });

      setSuccess(true);
      setError(null);
    } catch (err) {
      console.error('[❌] Register error:', err);
      setError('Erreur lors de l’envoi du formulaire.');
    }
  };

  return (
    <div className="flex flex-1">

      <main className="flex-1 flex items-center justify-center">
        <form
          onSubmit={handleRegister}
          className="w-full max-w-md bg-white p-8 rounded shadow-md"
        >
          <h2 className="text-xl font-semibold text-center text-gray-800 mb-6">
            Faire une demande via le formulaire :
          </h2>

          <input
            type="text"
            placeholder="Nom d’utilisateur"
            className="w-full border border-gray-300 rounded p-2 mb-4"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <input
            type="email"
            placeholder="Email"
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

          <input
            type="password"
            placeholder="Confirmer le mot de passe"
            className="w-full border border-gray-300 rounded p-2 mb-4"
            value={confirmPwd}
            onChange={(e) => setConfirmPwd(e.target.value)}
          />

          <input
            type="text"
            placeholder="Institution / affiliation"
            className="w-full border border-gray-300 rounded p-2 mb-4"
            value={institution}
            onChange={(e) => setInstitution(e.target.value)}
          />

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
          >
            S’inscrire
          </button>

          {success && (
            <p className="text-green-700 text-sm mt-4">
              ✅ Votre demande d’inscription a été envoyée avec succès. Vous recevrez un email lorsque votre compte sera validé par un administrateur.
            </p>
          )}

          {error && (
            <p className="text-red-600 text-sm mt-4">
              {error}
            </p>
          )}

          <div className="mt-4 text-sm text-blue-600 hover:underline text-center">
            <Link to="/login">← Retour à la page de connexion</Link>
          </div>
        </form>
      </main>
    </div>
  );
};

export default RegisterForm;
