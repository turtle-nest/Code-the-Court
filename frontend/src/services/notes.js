// src/services/notes.js

// Keep API_URL for prod; in dev with Vite proxy, it can be empty and use relative URLs.
const API_URL = import.meta.env.VITE_API_URL || '';

/**
 * Reuse the same auth style as tags:
 * send Authorization: Bearer <token> from localStorage (if present),
 * and keep credentials:'include' for httpOnly cookies if/when you switch to cookie-based auth.
 */
function authHeaders() {
  const t = localStorage.getItem('token');
  return t ? { Authorization: `Bearer ${t}` } : {};
}

export async function fetchNotesForDecision(decisionId) {
  const res = await fetch(`${API_URL}/api/notes/decision/${decisionId}`, {
    credentials: 'include',
    headers: {
      ...authHeaders(),
    },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function createNoteForDecision(decisionId, content) {
  const res = await fetch(`${API_URL}/api/notes/decision/${decisionId}`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
    },
    body: JSON.stringify({ content }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function updateNote(noteId, content) {
  const res = await fetch(`${API_URL}/api/notes/${noteId}`, {
    method: 'PATCH',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
    },
    body: JSON.stringify({ content }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function deleteNote(noteId) {
  const res = await fetch(`${API_URL}/api/notes/${noteId}`, {
    method: 'DELETE',
    credentials: 'include',
    headers: {
      ...authHeaders(),
    },
  });
  if (!res.ok && res.status !== 204) throw new Error(`HTTP ${res.status}`);
}
