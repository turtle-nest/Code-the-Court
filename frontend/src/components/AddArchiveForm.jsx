// src/components/AddArchiveForm.jsx
import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { apiFetch } from '../utils/apiFetch';

const AddArchiveForm = () => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [jurisdiction, setJurisdiction] = useState('');
  const [caseType, setCaseType] = useState('');
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState(null);
  const [isError, setIsError] = useState(false);

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

  const handleSubmit = async (e) => {
    console.log('[📨] handleSubmit triggered');
    e.preventDefault();
    if (!file || !title || !date || !jurisdiction || !caseType) {
      setMessage('❌ Tous les champs sont requis');
      setIsError(true);
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('date', date);
    formData.append('jurisdiction', jurisdiction);
    formData.append('content', caseType);
    formData.append('pdf', file);

    try {
      await apiFetch('/api/archives', {
        method: 'POST',
        body: formData,
      });

      const now = new Date().toLocaleString('fr-FR');
      setMessage(`✅ Décision enregistrée le ${now}`);
      setIsError(false);
      // reset form
      setTitle('');
      setDate('');
      setJurisdiction('');
      setCaseType('');
      setFile(null);
    } catch (err) {
      setMessage('❌ Une erreur est survenue');
      setIsError(true);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="add-archive-form">
      <h2>Ajouter un fichier au format pdf :</h2>

      <input
        type="text"
        placeholder="Titre ou référence de la décision"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />

      <select value={jurisdiction} onChange={(e) => setJurisdiction(e.target.value)}>
        <option value="">-- Juridiction --</option>
        <option value="Cour d'appel">Cour d'appel</option>
        <option value="Tribunal judiciaire">Tribunal judiciaire</option>
        <option value="Conseil des prud'hommes">Conseil des prud'hommes</option>
      </select>

      <select value={caseType} onChange={(e) => setCaseType(e.target.value)}>
        <option value="">-- Type d'affaire --</option>
        <option value="Civil">Civil</option>
        <option value="Pénal">Pénal</option>
        <option value="Social">Social</option>
      </select>

      <div {...getRootProps({ className: 'dropzone' })}>
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Déposez le fichier ici...</p>
        ) : (
          <p>Glissez-déposez un fichier ici ou cliquez pour sélectionner</p>
        )}
      </div>

      {file && <p>📄 {file.name}</p>}

      <button type="submit">Enregistrer la décision</button>

      {message && (
        <p style={{ color: isError ? 'red' : 'green' }}>{message}</p>
      )}
    </form>
  );
};

export default AddArchiveForm;
