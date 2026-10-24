/**
 * API client module for ShopScale frontend.
 *
 * Directs all HTTP requests strictly through the Express reverse proxy (/api/*)
 * and attaches Bearer authorization tokens when available in sessionStorage.
 */

import { getToken } from "./auth.js";

/**
 * Execute an HTTP request through the reverse proxy.
 *
 * @param {string} endpoint - API endpoint relative path (e.g. '/health').
 * @param {RequestInit} [options={}] - Standard fetch options.
 * @returns {Promise<any>} Parsed JSON response body.
 * @throws {Error} When response status is not ok.
 */
export async function apiRequest(endpoint, options = {}) {
  const normalizedPath = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const url = normalizedPath.startsWith("/api") ? normalizedPath : `/api${normalizedPath}`;

  const headers = new Headers(options.headers || {});
  headers.set("Content-Type", "application/json");

  const token = getToken();
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(url, {
    ...options,
    headers
  });

  if (!response.ok) {
    const errorPayload = await response.json().catch(() => ({}));
    const message = errorPayload.detail || errorPayload.message || `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return response.json();
}
