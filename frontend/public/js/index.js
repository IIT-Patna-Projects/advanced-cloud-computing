/**
 * Main application script for the ShopScale homepage.
 *
 * Bootstraps status checks, binds interactive UI events, and
 * renders dynamic text strictly through safe DOM manipulation (textContent).
 */

import { apiRequest } from "./api.js";
import { getCartItemCount } from "./cart.js";

/**
 * Initialize health indicators by querying frontend and backend health endpoints.
 *
 * @returns {Promise<void>}
 */
async function checkSystemHealth() {
  const backendBadge = document.getElementById("backend-status-badge");
  const dbBadge = document.getElementById("db-status-badge");
  const frontendBadge = document.getElementById("frontend-status-badge");

  // Check frontend local health
  try {
    const feRes = await fetch("/healthz");
    if (feRes.ok && frontendBadge) {
      frontendBadge.textContent = "ONLINE (Port 3000)";
      frontendBadge.className = "px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300";
    }
  } catch {
    if (frontendBadge) {
      frontendBadge.textContent = "OFFLINE";
      frontendBadge.className = "px-2.5 py-1 text-xs font-semibold rounded-full bg-rose-100 text-rose-800 border border-rose-300";
    }
  }

  // Check reverse-proxied backend health
  try {
    const beData = await apiRequest("/health");
    if (backendBadge) {
      backendBadge.textContent = `ONLINE (v${beData.version})`;
      backendBadge.className = "px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300";
    }

    if (dbBadge) {
      const isConnected = beData.database === "connected";
      dbBadge.textContent = isConnected ? "CONNECTED" : "DISCONNECTED";
      dbBadge.className = isConnected
        ? "px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300"
        : "px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-800 border border-amber-300";
    }
  } catch (err) {
    if (backendBadge) {
      backendBadge.textContent = "UNREACHABLE";
      backendBadge.className = "px-2.5 py-1 text-xs font-semibold rounded-full bg-rose-100 text-rose-800 border border-rose-300";
    }
    if (dbBadge) {
      dbBadge.textContent = "UNKNOWN";
      dbBadge.className = "px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-700 border border-slate-300";
    }
  }
}

/**
 * Update the shopping cart item counter badge in the navigation header.
 *
 * @returns {void}
 */
function updateCartBadge() {
  const badge = document.getElementById("nav-cart-count");
  if (badge) {
    const count = getCartItemCount();
    badge.textContent = String(count);
  }
}

// Bootstrap on DOM ready
document.addEventListener("DOMContentLoaded", () => {
  checkSystemHealth();
  updateCartBadge();
});
