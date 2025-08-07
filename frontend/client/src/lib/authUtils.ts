export function isUnauthorizedError(error: any): boolean {
  return error && (error.status === 401 || error.message?.includes('401'));
}

// Get API base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export function redirectToLogin() {
  window.location.href = `${API_BASE_URL}/api/login`;
}

export function redirectToLogout() {
  window.location.href = `${API_BASE_URL}/api/logout`;
}