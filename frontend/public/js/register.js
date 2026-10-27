/**
 * Registration page script for ShopScale storefront.
 *
 * Validates registration input credentials, handles account provisioning via
 * /api/auth/register, and displays inline validation feedback.
 */

import { apiRequest } from "./api.js";
import { setupNavAuth } from "./auth.js";

/**
 * Handle user registration form submission.
 *
 * @param {SubmitEvent} e - Form event.
 * @returns {Promise<void>}
 */
async function handleRegister(e) {
  e.preventDefault();

  const nameInput = /** @type {HTMLInputElement|null} */ (document.getElementById("reg-fullname"));
  const emailInput = /** @type {HTMLInputElement|null} */ (document.getElementById("reg-email"));
  const passInput = /** @type {HTMLInputElement|null} */ (document.getElementById("reg-password"));
  const confirmInput = /** @type {HTMLInputElement|null} */ (document.getElementById("reg-confirm-password"));
  const errorMsg = document.getElementById("register-error-msg");
  const submitBtn = document.getElementById("btn-submit-register");

  const fullName = nameInput ? nameInput.value.trim() : "";
  const email = emailInput ? emailInput.value.trim() : "";
  const password = passInput ? passInput.value : "";
  const confirmPassword = confirmInput ? confirmInput.value : "";

  // Reset previous error display
  if (errorMsg) {
    errorMsg.textContent = "";
    errorMsg.classList.add("hidden");
  }

  // Client-side validations
  if (!fullName) {
    if (errorMsg) {
      errorMsg.textContent = "Please enter your full customer name.";
      errorMsg.className = "text-xs p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 font-medium";
      errorMsg.classList.remove("hidden");
    }
    return;
  }

  const emailPattern = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
  if (!email || !emailPattern.test(email)) {
    if (errorMsg) {
      errorMsg.textContent = "Please enter a valid email address (e.g. name@domain.com).";
      errorMsg.className = "text-xs p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 font-medium";
      errorMsg.classList.remove("hidden");
    }
    return;
  }

  if (password.length < 8) {
    if (errorMsg) {
      errorMsg.textContent = "Password must be at least 8 characters in length.";
      errorMsg.className = "text-xs p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 font-medium";
      errorMsg.classList.remove("hidden");
    }
    return;
  }

  if (password !== confirmPassword) {
    if (errorMsg) {
      errorMsg.textContent = "Passwords do not match. Please verify both password entries.";
      errorMsg.className = "text-xs p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 font-medium";
      errorMsg.classList.remove("hidden");
    }
    return;
  }

  // Submit button loading state
  if (submitBtn) {
    submitBtn.setAttribute("disabled", "true");
    submitBtn.className = "w-full py-2.5 px-4 text-xs font-semibold text-white bg-emerald-400 cursor-not-allowed rounded-lg shadow-sm transition-all text-center";
    submitBtn.textContent = "Creating Account...";
  }

  try {
    await apiRequest("/auth/register", {
      method: "POST",
      body: JSON.stringify({
        email,
        password,
        full_name: fullName
      })
    });

    window.location.href = "./login.html?registered=true";
  } catch (err) {
    if (submitBtn) {
      submitBtn.removeAttribute("disabled");
      submitBtn.className = "w-full py-2.5 px-4 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-all text-center";
      submitBtn.textContent = "Create Benchmark Account";
    }

    const message = err instanceof Error ? err.message : "Account registration failed.";
    if (errorMsg) {
      errorMsg.textContent = message;
      errorMsg.className = "text-xs p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 font-medium";
      errorMsg.classList.remove("hidden");
    }
  }
}

// Bootstrap on DOM ready
document.addEventListener("DOMContentLoaded", () => {
  setupNavAuth();
  const form = document.getElementById("register-form");
  if (form) {
    form.addEventListener("submit", handleRegister);
  }
});

