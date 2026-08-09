const LOCAL_TOKEN_KEY = 'yourstore_token';
const SESSION_TOKEN_KEY = 'yourstore_session_token';

function decodePayload(token) {
  try {
    const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(decodeURIComponent(atob(payload).split('').map((char) => `%${(`00${char.charCodeAt(0).toString(16)}`).slice(-2)}`).join('')));
  } catch {
    return null;
  }
}

export function getToken() {
  const token = localStorage.getItem(LOCAL_TOKEN_KEY) || sessionStorage.getItem(SESSION_TOKEN_KEY);
  if (!token) return null;
  const payload = decodePayload(token);
  if (!payload?.exp || payload.exp * 1000 <= Date.now()) {
    clearToken();
    return null;
  }
  return token;
}

export function saveToken(token, remember = false) {
  clearToken();
  (remember ? localStorage : sessionStorage).setItem(remember ? LOCAL_TOKEN_KEY : SESSION_TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(LOCAL_TOKEN_KEY);
  sessionStorage.removeItem(SESSION_TOKEN_KEY);
}

async function request(path, options = {}) {
  const headers = new Headers(options.headers || {});
  if (options.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  const token = getToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);

  let response;
  try {
    response = await fetch(`/api${path}`, { ...options, headers });
  } catch {
    throw new Error('Network error. Check your connection and try again.');
  }

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 401 && token) {
      clearToken();
      document.dispatchEvent(new CustomEvent('auth:session-expired', { detail: payload }));
    }
    const error = new Error(payload.message || 'Something went wrong.');
    error.status = response.status;
    error.code = payload.code;
    throw error;
  }
  return payload;
}

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: 'POST', body: JSON.stringify(body) }),
  put: (path, body) => request(path, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (path) => request(path, { method: 'DELETE' })
};
