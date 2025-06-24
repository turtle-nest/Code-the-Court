// src/services/api.js
const API_BASE = 'http://localhost:3000/api'; // adapte au besoin

export async function getDecisions(params = {}) {
  const query = new URLSearchParams(params).toString();
  const url = `${API_BASE}/decisions${query ? '?' + query : ''}`;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch decisions');
    return await res.json();
  } catch (err) {
    throw err;
  }
}
