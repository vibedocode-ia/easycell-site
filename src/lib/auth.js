/**
 * Helper unificado de autenticação para o EasyCell SaaS
 * Suporta interoperabilidade entre chaves antigas e novas de token
 */

export function getAuthToken() {
  if (typeof window === 'undefined') return '';
  return (
    localStorage.getItem('easycell_token') ||
    localStorage.getItem('easycell_auth_token') ||
    sessionStorage.getItem('easycell_token') ||
    sessionStorage.getItem('easycell_auth_token') ||
    ''
  );
}

export function getAuthHeaders(extraHeaders = {}) {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...extraHeaders,
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export function saveAuthToken(token) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('easycell_token', token);
  localStorage.setItem('easycell_auth_token', token);
  sessionStorage.setItem('easycell_token', token);
}
