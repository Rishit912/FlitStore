const apiBaseUrl = import.meta.env.DEV
  ? ''
  : (import.meta.env.VITE_API_BASE_URL || window.location.origin).replace(/\/$/, '');

export const buildApiUrl = (path) => `${apiBaseUrl}${path}`;

export const apiFetch = (path, options = {}) =>
  fetch(buildApiUrl(path), {
    credentials: 'include',
    ...options,
  });
