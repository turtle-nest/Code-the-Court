// src/utils/apiFetch.js
// Robust HTTP helper. Keeps "/api/..." prefix intact.
// Base URL comes from VITE_API_URL (e.g. http://localhost:3000)

function buildBase() {
  const base = (import.meta.env.VITE_API_URL || 'http://localhost:3000').trim();
  return base.replace(/\/+$/, ''); // remove trailing slash
}

function normalizePath(p) {
  if (!p) return '/';
  // Absolute URL passthrough
  if (typeof p === 'string' && /^https?:\/\//i.test(p)) return p;

  // Ensure exactly one leading slash; collapse duplicate slashes
  let path = ('/' + String(p)).replace(/\/+/g, '/');

  // DO NOT strip "/api" anymore. We keep it by design.
  // path = path.replace(/^\/api(\/|$)/, '/'); // ❌ removed on purpose

  return path;
}

export async function apiFetch(path, options = {}) {
  const finalPath = normalizePath(path);
  const isAbsolute = /^https?:\/\//i.test(finalPath);
  const BASE = buildBase();
  const url = isAbsolute ? finalPath : `${BASE}${finalPath}`;

  const token = localStorage.getItem('token');
  const headers = new Headers(options.headers || {});

  // Attach auth token if present
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  // Auto JSON unless sending FormData or already set
  const isFormData = options.body instanceof FormData;
  if (options.body && !isFormData && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const res = await fetch(url, {
    credentials: 'include',
    ...options,
    headers,
  });

  const ct = res.headers.get('content-type') || '';
  const payload = ct.includes('application/json')
    ? await res.json().catch(() => ({}))
    : await res.text();

  if (!res.ok) {
    const msg =
      (payload && (payload.message || payload.error)) ||
      `HTTP ${res.status} ${res.statusText || ''}`.trim();
    throw new Error(msg);
  }

  return payload;
}
