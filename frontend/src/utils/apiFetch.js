// frontend/src/utils/apiFetch.js

export async function apiFetch(url, options = {}) {
  const token = localStorage.getItem('token');

  const headers = new Headers(options.headers || {});
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const fetchOptions = {
    ...options,
    headers,
  };

  try {
    const res = await fetch(url, fetchOptions);
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      // Déconnexion automatique si token expiré ou interdit
      if (res.status === 401 || res.status === 403) {
        console.warn('[🔒] Session expirée ou accès refusé. Déconnexion.');
        localStorage.removeItem('token');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('role');
        window.location.href = '/login?expired=1';
        return;
      }

      const errorMessage = data.message || data.error || 'Request failed';
      throw new Error(errorMessage);
    }

    return data;
  } catch (err) {
    console.error('[❌ apiFetch] Request failed:', err.message);
    throw err;
  }
}
