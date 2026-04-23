const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

export const buildApiUrl = (path) => `${apiBaseUrl}${path}`;

export const apiFetch = (path, options = {}) =>
  fetch(buildApiUrl(path), {
    credentials: 'include',
    ...options,
  });
