/**
 * Checkout flow script for ShopScale storefront.
 *
 * Populates review sidebar from cart state, simulates transactional
 * inventory locking, and persists committed orders to localStorage.
 */

import { clearCart, getCart, getCartTotal } from "./cart.js";

/**
 * Render order review items in the right sidebar.
 *
 * @returns {void}
 */
function renderOrderReview() {
  const container = document.getElementById("checkout-items-list");
  const subtotalEl = document.getElementById("checkout-subtotal");
  const taxEl = document.getElementById("checkout-tax");
  const totalEl = document.getElementById("checkout-total");

  if (!container) return;
  container.textContent = "";

  const items = getCart();

  if (items.length === 0) {
    window.location.href = "./cart.html";
    return;
  }

  const subtotal = getCartTotal();
  const tax = subtotal * 0.05;
  const total = subtotal + tax;

  if (subtotalEl) subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
  if (taxEl) taxEl.textContent = `$${tax.toFixed(2)}`;
  if (totalEl) totalEl.textContent = `$${total.toFixed(2)}`;

  items.forEach((item) => {
    const itemDiv = document.createElement("div");
    itemDiv.className = "flex justify-between items-center py-2 text-xs";

    const left = document.createElement("div");
    left.className = "flex flex-col pr-2";
    const title = document.createElement("span");
    title.className = "font-semibold text-slate-800 line-clamp-1";
    title.textContent = item.title;
    const qty = document.createElement("span");
    qty.className = "text-slate-400 font-mono";
    qty.textContent = `Qty: ${item.quantity} × $${item.price.toFixed(2)}`;
    left.appendChild(title);
    left.appendChild(qty);

    const price = document.createElement("span");
    price.className = "font-bold text-slate-900";
    price.textContent = `$${(item.price * item.quantity).toFixed(2)}`;

    itemDiv.appendChild(left);
    itemDiv.appendChild(price);
    container.appendChild(itemDiv);
  });
}

/**
 * Handle form submission and commit order.
 *
 * @param {SubmitEvent} e - Form event.
 * @returns {Promise<void>}
 */
async function handleCheckoutSubmit(e) {
  e.preventDefault();

  const btn = document.getElementById("btn-submit-order");
  if (btn) {
    btn.setAttribute("disabled", "true");
    btn.textContent = "Committing Transaction (Row Locks Active)...";
  }

  const nameInput = /** @type {HTMLInputElement} */ (document.getElementById("input-fullname"));
  const emailInput = /** @type {HTMLInputElement} */ (document.getElementById("input-email"));
  const orgInput = /** @type {HTMLInputElement} */ (document.getElementById("input-organization"));
  const regionSelect = /** @type {HTMLSelectElement} */ (document.getElementById("input-region"));
  const paymentInput = /** @type {HTMLInputElement|null} */ (document.querySelector("input[name=\"payment-method\"]:checked"));

  const items = getCart();
  const subtotal = getCartTotal();
  const tax = subtotal * 0.05;
  const total = subtotal + tax;

  const orderId = `ORD-2026-${Math.floor(1000 + Math.random() * 9000)}`;

  const orderRecord = {
    id: orderId,
    date: new Date().toISOString(),
    customer: {
      name: nameInput ? nameInput.value : "",
      email: emailInput ? emailInput.value : "",
      organization: orgInput ? orgInput.value : ""
    },
    region: regionSelect ? regionSelect.value : "ap-south-1",
    paymentMethod: paymentInput ? paymentInput.value : "aws-credits",
    items,
    subtotal: Math.round(subtotal * 100) / 100,
    tax: Math.round(tax * 100) / 100,
    total: Math.round(total * 100) / 100,
    status: "COMPLETED",
    transactionHash: `0x${Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`
  };

  // Simulate network transaction delay
  await new Promise((resolve) => setTimeout(resolve, 800));

  // Save to orders history
  const orders = JSON.parse(localStorage.getItem("shopscale_orders") || "[]");
  orders.unshift(orderRecord);
  localStorage.setItem("shopscale_orders", JSON.stringify(orders));

  // Clear shopping cart
  clearCart();

  // Redirect to orders page with new order highlighted
  window.location.href = `./orders.html?orderId=${orderId}`;
}

// Bootstrap on DOM ready
document.addEventListener("DOMContentLoaded", () => {
  renderOrderReview();
  const form = document.getElementById("checkout-form");
  if (form) {
    form.addEventListener("submit", handleCheckoutSubmit);
  }
});
