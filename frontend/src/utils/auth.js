/**
 * Token Management Utilities
 * Handles JWT token storage and retrieval from localStorage
 */

const TOKEN_KEY = 'chatfree_token';
const USER_KEY = 'chatfree_user';

/**
 * Save token and user to localStorage
 */
export function saveToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

/**
 * Save user info to localStorage
 */
export function saveUser(user) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

/**
 * Save both token and user
 */
export function saveAuth(token, user) {
  saveToken(token);
  saveUser(user);
}

/**
 * Get token from localStorage
 */
export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

/**
 * Get user from localStorage
 */
export function getUser() {
  const user = localStorage.getItem(USER_KEY);
  return user ? JSON.parse(user) : null;
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated() {
  return !!getToken();
}

/**
 * Clear token and user from localStorage
 */
export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

/**
 * Get auth header for API requests
 */
export function getAuthHeader() {
  const token = getToken();
  if (!token) {
    return {};
  }
  return {
    Authorization: `Bearer ${token}`,
  };
}
