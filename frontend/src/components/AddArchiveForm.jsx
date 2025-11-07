// src/components/AddArchiveForm.jsx
import React, { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../utils/apiFetch';

const AddArchiveForm = () => {
  // Form state
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [jurisdiction, setJurisdiction] = useState('');
  const [caseType, setCaseType] = useState('');
  const [keywords, setKeywords] = useState('');
  const [file, setFile] = useState(null);

  // UI state
  const [message, setMessage] = useState(null);
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  // Metadata state
  const [jurisdictions, setJurisdictions] = useState([]);
  const [caseTypes, setCaseTypes] = useState([]);
  const [loadingMeta, setLoadingMeta] = useState(true);
  const [metaError, setMetaError] = useState('');

  const navigate = useNavigate();
  const maxSize = 5 * 1024 * 1024; // 5MB

  // Dropzone
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'application/pdf': [] },
    maxSize,
    multiple: false,
    onDrop: (acceptedFiles, fileRejections) => {
      if (fileRejections.length > 0) {
        setMessage('❌ Fichier invalide (PDF uniquement, max 5 Mo)');
        setIsError(true);
      } else {
        setFile(acceptedFiles[0]);
        setMessage(null);
        setIsError(false);
      }
    },
  });

  // Load metadata (jurisdictions, case types)
  useEffect(() => {
    const loadMeta = async () => {
      try {
        setLoadingMeta(true);
        setMetaError('');
        // use apiFetch to respect base URL and headers
        const data = await apiFetch('/api/metadata', { method: 'GET' });
        setJurisdictions(Array.isArray(data.jurisdictions) ? data.jurisdictions : []);
        setCaseTypes(Array.isArray(data.caseTypes) ? data.caseTypes : []);
      } catch (e) {
        console.error('[metadata] load error:', e);
        setMetaError("Impossible de charger les listes (juridiction, type d'affaire).");
      } finally {
        setLoadingMeta(false);
      }
    };
    loadMeta();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!title || !date || !jurisdiction || !caseType || !file) {
      setMessage('❌ Tous les champs sont requis');
      setIsError(true);
      return;
    }

    setLoading(true);
    setMessage(null);
    setIsError(false);

    // Build payload – keys must match backend
    const formData = new FormData();
    formData.append('title', title);
    formData.append('date', date);
    formData.append('jurisdiction', jurisdiction);
    formData.append('caseType', caseType); // ✅ fixed key
    formData.append('keywords', keywords);
    formData.append('file', file);         // ✅ fixed key

    try {
      const data = await apiFetch('/api/archives', {
        method: 'POST',
        body: formData,
      });

      setMessage('✅ Décision enregistrée avec succès');
      setIsError(false);

      if (data && data.decision_id) {
        navigate(`/decisions/${data.decision_id}`);
      } else {
        console.warn('No decision_id returned from API.');
      }

      // Reset local state
      setTitle('');
      setDate('');
      setJurisdiction('');
      setCaseType('');
      setKeywords('');
      setFile(null);
    } catch (err) {
      console.error('[upload] error:', err);
      setMessage('❌ Une erreur est survenue');
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  // Auto-hide flash message
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(null), 5000);
    return () => clearTimeout(t);
  }, [message]);

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-semibold mb-4">Ajouter un fichier au format PDF :</h2>

      <input
        type="text"
        placeholder="Titre ou référence de la décision"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full border rounded px-3 py-2"
        aria-label="Titre"
        required
      />

      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="w-full border rounded px-3 py-2"
        aria-label="Date de la décision"
        required
      />

      <div className="flex gap-4">
        <select
          value={jurisdiction}
          onChange={(e) => setJurisdiction(e.target.value)}
          className="w-1/2 border rounded px-3 py-2"
          aria-label="Juridiction"
          disabled={loadingMeta || !!metaError}
          required
        >
          <option value="">{loadingMeta ? 'Chargement...' : '-- Juridiction --'}</option>
          {jurisdictions.map((j) => (
            <option key={j} value={j}>{j}</option>
          ))}
        </select>

        <select
          value={caseType}
          onChange={(e) => setCaseType(e.target.value)}
          className="w-1/2 border rounded px-3 py-2"
          aria-label="Type d\'affaire"
          disabled={loadingMeta || !!metaError}
          required
        >
          <option value="">{loadingMeta ? 'Chargement...' : "-- Type d'affaire --"}</option>
          {caseTypes.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      {metaError && (
        <p className="text-sm text-red-600">{metaError}</p>
      )}

      <input
        type="text"
        placeholder="Mots-clés (séparés par des virgules)"
        value={keywords}
        onChange={(e) => setKeywords(e.target.value)}
        className="w-full border rounded px-3 py-2"
        aria-label="Mots-clés"
      />

      <div
        {...getRootProps()}
        className="border-2 border-dashed border-gray-400 rounded px-4 py-6 text-center cursor-pointer bg-gray-50 hover:bg-gray-100"
        aria-label="Zone de dépôt du fichier PDF"
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p className="text-sm text-gray-700">Déposez le fichier ici...</p>
        ) : (
          <p className="text-sm text-gray-700">
            Glissez-déposez un fichier ici ou cliquez pour sélectionner
          </p>
        )}
      </div>

      {file && (
        <p className="text-sm text-green-600 font-medium">📄 {file.name}</p>
      )}

      <button
        type="submit"
        disabled={loading || loadingMeta || !!metaError}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Enregistrement...' : 'Enregistrer la décision'}
      </button>

      {message && (
        <p className={`mt-2 font-semibold ${isError ? 'text-red-600' : 'text-green-600'}`}>
          {message}
        </p>
      )}
    </form>
  );
};

export default AddArchiveForm;
