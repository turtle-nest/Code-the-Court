// src/components/AddArchiveForm.jsx
import React, { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { apiFetch } from '../utils/apiFetch';

const AddArchiveForm = () => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [jurisdiction, setJurisdiction] = useState('');
  const [caseType, setCaseType] = useState('');
  const [keywords, setKeywords] = useState('');
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState(null);
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  const [jurisdictions, setJurisdictions] = useState([]);
  const [caseTypes, setCaseTypes] = useState([]);

  const maxSize = 5 * 1024 * 1024; // 5MB

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

  useEffect(() => {
    // ✅ Charge la liste unique depuis /api/metadata
    fetch('http://localhost:3000/api/metadata')
      .then(res => res.json())
      .then(data => {
        setJurisdictions(data.jurisdictions || []);
        setCaseTypes(data.caseTypes || []);
      })
      .catch(console.error);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file || !title || !date || !jurisdiction || !caseType) {
      setMessage('❌ Tous les champs sont requis');
      setIsError(true);
      return;
    }

    setLoading(true);
    setMessage(null);
    setIsError(false);

    const formData = new FormData();
    formData.append('title', title);
    formData.append('date', date);
    formData.append('jurisdiction', jurisdiction);
    formData.append('content', caseType);
    formData.append('keywords', keywords);
    formData.append('pdf', file);

    try {
      await apiFetch('/api/archives', {
        method: 'POST',
        body: formData,
      });

      const now = new Date().toLocaleString('fr-FR');
      setMessage(`✅ Décision enregistrée le ${now}`);
      setIsError(false);

      setTitle('');
      setDate('');
      setJurisdiction('');
      setCaseType('');
      setKeywords('');
      setFile(null);
    } catch (err) {
      console.error('[❌] Upload error:', err);
      setMessage('❌ Une erreur est survenue');
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 bg-white shadow rounded-lg p-6"
    >
      <h2 className="text-lg font-semibold mb-4">
        Ajouter un fichier au format PDF :
      </h2>

      <input
        type="text"
        placeholder="Titre ou référence de la décision"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full border rounded px-3 py-2"
      />

      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="w-full border rounded px-3 py-2"
      />

      <div className="flex gap-4">
        <select
          value={jurisdiction}
          onChange={(e) => setJurisdiction(e.target.value)}
          className="w-1/2 border rounded px-3 py-2"
        >
          <option value="">-- Juridiction --</option>
          {jurisdictions.map(j => (
            <option key={j} value={j}>{j}</option>
          ))}
        </select>

        <select
          value={caseType}
          onChange={(e) => setCaseType(e.target.value)}
          className="w-1/2 border rounded px-3 py-2"
        >
          <option value="">-- Type d'affaire --</option>
          {caseTypes.map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      <input
        type="text"
        placeholder="Mots-clés (séparés par des virgules)"
        value={keywords}
        onChange={(e) => setKeywords(e.target.value)}
        className="w-full border rounded px-3 py-2"
      />

      <div
        {...getRootProps()}
        className="border-2 border-dashed border-gray-400 rounded px-4 py-6 text-center cursor-pointer bg-gray-50 hover:bg-gray-100"
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
        <p className="text-sm text-green-600 font-medium">
          📄 {file.name}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
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
