// src/services/archives.js
import { apiFetch } from '../utils/apiFetch';

export async function getAllArchives() {
  return apiFetch('/api/archives');
}

export async function createArchive(data) {
  return apiFetch('/api/archives', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export async function deleteArchiveById(archiveId) {
  const res = await fetch(`/api/archives/${archiveId}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  if (res.status === 204) return true;

  let message = `HTTP ${res.status}`;
  try {
    const body = await res.json();
    if (body?.error) message = body.error;
  } catch (_) {}
  throw new Error(message);
}
