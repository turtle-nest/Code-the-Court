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
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || 'Request failed');
    }
    return await res.json();
  } catch (err) {
    console.error('[❌ apiFetch]', err.message);
    throw err;
  }
}
