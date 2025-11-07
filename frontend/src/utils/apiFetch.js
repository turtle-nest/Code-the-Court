// ✅ src/utils/apiFetch.js

export async function apiFetch(path, options = {}) {
  const token = localStorage.getItem('token');
  const headers = new Headers(options.headers || {});

  // ➜ Ajoute ton JWT SocioJustice côté frontend
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  // ➜ Force JSON sauf si c'est un FormData
  if (
    options.body &&
    !headers.has('Content-Type') &&
    !(options.body instanceof FormData)
  ) {
    headers.set('Content-Type', 'application/json');
  }

  // ✅ Définit automatiquement le backend comme base si le proxy Vite ne marche pas
  const baseURL =
    import.meta.env.VITE_API_URL || 'http://localhost:3000';

  // ✅ Si le chemin ne commence pas par http, on le complète
  const url = path.startsWith('http') ? path : `${baseURL}${path}`;

  const fetchOptions = {
    ...options,
    headers,
    credentials: 'include', // ➜ optionnel : force envoi cookie si nécessaire
  };

  try {
    const res = await fetch(url, fetchOptions);

    // Essaye de parser JSON, fallback objet vide
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        console.warn('[🔒] Session expirée ou accès refusé.');
      }
      throw new Error(data.message || data.error || 'Request failed');
    }

    return data;
  } catch (err) {
    console.error('[❌ apiFetch] Request failed:', err.message);
    throw err;
  }
}
