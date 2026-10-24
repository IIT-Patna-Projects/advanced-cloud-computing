/**
 * Authentication management module for ShopScale.
 *
 * Handles JWT access tokens stored in browser sessionStorage.
 */

const TOKEN_KEY = "shopscale_token";
const USER_KEY = "shopscale_user";

/**
 * Retrieve the active JWT token from session storage.
 *
 * @returns {string|null} JWT token or null if unauthenticated.
 */
export function getToken() {
  return sessionStorage.getItem(TOKEN_KEY);
}

/**
 * Store the active JWT token in session storage.
 *
 * @param {string} token - JWT bearer token.
 * @returns {void}
 */
export function setToken(token) {
  sessionStorage.setItem(TOKEN_KEY, token);
}

/**
 * Clear authentication credentials and user profile from session storage.
 *
 * @returns {void}
 */
export function clearAuth() {
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(USER_KEY);
}

/**
 * Check whether a user is currently authenticated.
 *
 * @returns {boolean} True if an active token is present, false otherwise.
 */
export function isAuthenticated() {
  return Boolean(getToken());
}

/**
 * Store the current user profile in session storage.
 *
 * @param {object} user - User profile object.
 * @returns {void}
 */
export function setCurrentUser(user) {
  sessionStorage.setItem(USER_KEY, JSON.stringify(user));
}

/**
 * Retrieve the current user profile from session storage.
 *
 * @returns {object|null} Parsed user profile or null.
 */
export function getCurrentUser() {
  const data = sessionStorage.getItem(USER_KEY);
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}
