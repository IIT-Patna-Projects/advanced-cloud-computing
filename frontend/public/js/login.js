/**
 * Login page script for ShopScale storefront.
 *
 * Handles credential autofill, live API authentication against /api/auth/login,
 * session token storage, and dynamic error/success alerts.
 */

import { apiRequest } from "./api.js";
import { setCurrentUser, setToken, setupNavAuth } from "./auth.js";
import { getCartItemCount } from "./cart.js";

/**
 * Check URL query parameters for post-registration redirect flag.
 *
 * @returns {void}
 */
function checkRegistrationNotice() {
  const params = new URLSearchParams(window.location.search);
  if (params.get("registered") === "true") {
    const form = document.getElementById("login-form");
    if (!form) return;

    const banner = document.createElement("div");
    banner.className = "p-3 mb-4 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2";

    const checkSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    checkSvg.setAttribute("class", "w-4 h-4 text-emerald-600 flex-shrink-0");
    checkSvg.setAttribute("viewBox", "0 0 24 24");
    checkSvg.setAttribute("fill", "none");
    checkSvg.setAttribute("stroke", "currentColor");
    checkSvg.setAttribute("stroke-width", "2");
    checkSvg.setAttribute("stroke-linecap", "round");
    checkSvg.setAttribute("stroke-linejoin", "round");
    const polyline = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
    polyline.setAttribute("points", "20 6 9 17 4 12");
    checkSvg.appendChild(polyline);

    const span = document.createElement("span");
    span.textContent = "Account created successfully! Please sign in with your credentials.";

    banner.appendChild(checkSvg);
    banner.appendChild(span);
    form.parentNode?.insertBefore(banner, form);
  }
}

/**
 * Handle user login form submission.
 *
 * @param {SubmitEvent} e - Form submit event.
 * @returns {Promise<void>}
 */
async function handleLogin(e) {
  e.preventDefault();

  const emailInput = /** @type {HTMLInputElement|null} */ (document.getElementById("input-email"));
  const passwordInput = /** @type {HTMLInputElement|null} */ (document.getElementById("input-password"));
  const errorMsg = document.getElementById("login-error-msg");
  const submitBtn = document.getElementById("btn-submit-login");

  const email = emailInput ? emailInput.value.trim() : "";
  const password = passwordInput ? passwordInput.value : "";

  // Reset previous error state
  if (errorMsg) {
    errorMsg.textContent = "";
    errorMsg.classList.add("hidden");
  }

  if (!email || !password) {
    if (errorMsg) {
      errorMsg.textContent = "Please provide both your registered email and password.";
      errorMsg.className = "text-xs p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 font-medium";
      errorMsg.classList.remove("hidden");
    }
    return;
  }

  // Display loading state on button
  if (submitBtn) {
    submitBtn.setAttribute("disabled", "true");
    submitBtn.className = "w-full py-2.5 px-4 text-xs font-semibold text-white bg-emerald-400 cursor-not-allowed rounded-lg shadow-sm transition-all flex items-center justify-center space-x-2";
    submitBtn.textContent = "Authenticating...";
  }

  try {
    const data = await apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password })
    });

    if (data && data.access_token) {
      setToken(data.access_token);
      setCurrentUser(data.user || { email, full_name: email.split("@")[0] });
      window.location.href = "./index.html";
    }
  } catch (err) {
    if (submitBtn) {
      submitBtn.removeAttribute("disabled");
      submitBtn.className = "w-full py-2.5 px-4 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-all text-center";
      submitBtn.textContent = "Sign In";
    }

    const message = err instanceof Error ? err.message : "Authentication failed.";
    if (errorMsg) {
      errorMsg.textContent = message;
      errorMsg.className = "text-xs p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 font-medium";
      errorMsg.classList.remove("hidden");
    }
  }
}

/**
 * Setup demo credentials auto-fill button.
 *
 * @returns {void}
 */
function setupDemoCreds() {
  const btn = document.getElementById("btn-demo-creds");
  const emailInput = /** @type {HTMLInputElement|null} */ (document.getElementById("input-email"));
  const passwordInput = /** @type {HTMLInputElement|null} */ (document.getElementById("input-password"));

  if (btn && emailInput && passwordInput) {
    btn.addEventListener("click", () => {
      emailInput.value = "customer@example.com";
      passwordInput.value = "SecurePassword123";
    });
  }
}

// Bootstrap on DOM ready
document.addEventListener("DOMContentLoaded", () => {
  const badge = document.getElementById("nav-cart-count");
  if (badge) {
    badge.textContent = String(getCartItemCount());
  }
  setupNavAuth();
  setupDemoCreds();
  checkRegistrationNotice();

  const form = document.getElementById("login-form");
  if (form) {
    form.addEventListener("submit", handleLogin);
  }
});

