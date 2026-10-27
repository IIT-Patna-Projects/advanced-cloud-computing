/**
 * Authentication management module for ShopScale.
 *
 * Handles JWT access tokens stored in browser sessionStorage,
 * user profile persistence, and dynamic navigation bar authentication states.
 */

import { apiRequest } from "./api.js";

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

/**
 * Fetch the authenticated user profile from the backend API.
 *
 * @returns {Promise<object|null>} User profile or null if unauthorized.
 */
export async function fetchCurrentUser() {
  if (!isAuthenticated()) return null;
  try {
    const user = await apiRequest("/auth/me");
    setCurrentUser(user);
    return user;
  } catch {
    clearAuth();
    return null;
  }
}

/**
 * Log out active session and redirect to login page.
 *
 * @returns {void}
 */
export function logout() {
  clearAuth();
  window.location.href = "./login.html";
}

/**
 * Update the navigation header bar to reflect active authentication state.
 * Replaces the Sign In link with the customer name and Sign Out button.
 *
 * @returns {void}
 */
export function setupNavAuth() {
  const loginLink = document.getElementById("nav-login-link") || document.querySelector('nav a[href="./login.html"]');
  if (!loginLink) return;

  const user = getCurrentUser();
  if (user && isAuthenticated()) {
    const nav = loginLink.parentElement;
    if (!nav) return;

    const userContainer = document.createElement("div");
    userContainer.id = "nav-user-container";
    userContainer.className = "flex items-center space-x-3 text-xs";

    const nameSpan = document.createElement("span");
    nameSpan.className = "font-medium text-slate-700 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200 flex items-center space-x-1.5";

    const userIcon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    userIcon.setAttribute("class", "w-3.5 h-3.5 text-slate-500");
    userIcon.setAttribute("viewBox", "0 0 24 24");
    userIcon.setAttribute("fill", "none");
    userIcon.setAttribute("stroke", "currentColor");
    userIcon.setAttribute("stroke-width", "2");
    userIcon.setAttribute("stroke-linecap", "round");
    userIcon.setAttribute("stroke-linejoin", "round");

    const path1 = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path1.setAttribute("d", "M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2");
    const circle1 = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle1.setAttribute("cx", "12");
    circle1.setAttribute("cy", "7");
    circle1.setAttribute("r", "4");

    userIcon.appendChild(path1);
    userIcon.appendChild(circle1);

    const nameText = document.createElement("span");
    nameText.textContent = user.full_name || user.email.split("@")[0];

    nameSpan.appendChild(userIcon);
    nameSpan.appendChild(nameText);

    const logoutBtn = document.createElement("button");
    logoutBtn.className = "text-slate-500 hover:text-rose-600 font-medium transition-colors";
    logoutBtn.textContent = "Sign Out";
    logoutBtn.addEventListener("click", () => {
      logout();
    });

    userContainer.appendChild(nameSpan);
    userContainer.appendChild(logoutBtn);

    loginLink.replaceWith(userContainer);
  }
}
