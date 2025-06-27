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
