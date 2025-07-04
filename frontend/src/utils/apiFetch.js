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
      if (res.status === 401 || res.status === 403) {
        console.warn('[🔒] Session expirée ou accès refusé.');
        // 🔥 En dev ➜ Ne pas logout automatiquement
        // localStorage.removeItem('token');
        // window.location.href = '/login?expired=1';
        // return;
      }

      console.warn(`[⚠️] API error ${res.status} :`, data.message || data.error);
      throw new Error(data.message || data.error || 'Request failed');
    }


    return data;
  } catch (err) {
    console.error('[❌ apiFetch] Request failed:', err.message);
    throw err;
  }
}
