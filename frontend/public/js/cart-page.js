/**
 * Cart page script for ShopScale storefront.
 *
 * Handles cart item table rendering, quantity updates, item deletions,
 * coupon code discounts, and order summary calculation.
 */

import { clearCart, getCart, getCartItemCount, removeFromCart, saveCart } from "./cart.js";
import { showToast, updateCartBadge } from "./index.js";

let discountPercentage = 0;

/**
 * Recalculate order summary values and update summary elements.
 *
 * @returns {void}
 */
function updateOrderSummary() {
  const items = getCart();
  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const tax = subtotal * 0.05;
  const discount = (subtotal * discountPercentage) / 100;
  const total = Math.max(0, subtotal + tax - discount);

  const subtotalEl = document.getElementById("summary-subtotal");
  if (subtotalEl) subtotalEl.textContent = `$${subtotal.toFixed(2)}`;

  const taxEl = document.getElementById("summary-tax");
  if (taxEl) taxEl.textContent = `$${tax.toFixed(2)}`;

  const discountRow = document.getElementById("summary-discount-row");
  const discountEl = document.getElementById("summary-discount");
  if (discountRow && discountEl) {
    if (discountPercentage > 0) {
      discountRow.classList.remove("hidden");
      discountEl.textContent = `-$${discount.toFixed(2)}`;
    } else {
      discountRow.classList.add("hidden");
    }
  }

  const totalEl = document.getElementById("summary-total");
  if (totalEl) totalEl.textContent = `$${total.toFixed(2)}`;

  const checkoutBtn = document.getElementById("btn-proceed-checkout");
  if (checkoutBtn) {
    if (items.length === 0) {
      checkoutBtn.classList.add("opacity-50", "pointer-events-none");
    } else {
      checkoutBtn.classList.remove("opacity-50", "pointer-events-none");
    }
  }
}

/**
 * Render all cart items into the table body.
 *
 * @returns {void}
 */
function renderCartTable() {
  const tbody = document.getElementById("cart-items-body");
  const emptyMessage = document.getElementById("cart-empty-message");
  const tableWrapper = document.getElementById("cart-table-wrapper");
  const actionsBar = document.getElementById("cart-actions-bar");
  if (!tbody) return;

  const items = getCart();

  if (items.length === 0) {
    if (emptyMessage) emptyMessage.classList.remove("hidden");
    if (tableWrapper) tableWrapper.classList.add("hidden");
    if (actionsBar) actionsBar.classList.add("hidden");
    updateOrderSummary();
    updateCartBadge();
    return;
  }

  if (emptyMessage) emptyMessage.classList.add("hidden");
  if (tableWrapper) tableWrapper.classList.remove("hidden");
  if (actionsBar) actionsBar.classList.remove("hidden");

  tbody.textContent = "";

  items.forEach((item) => {
    const tr = document.createElement("tr");

    // Product Title
    const tdProduct = document.createElement("td");
    tdProduct.className = "py-4 px-4";
    const productLink = document.createElement("a");
    productLink.href = `./product.html?id=${item.id}`;
    productLink.className = "font-semibold text-slate-900 hover:text-emerald-600 transition-colors block text-sm";
    productLink.textContent = item.title;
    tdProduct.appendChild(productLink);

    // Price
    const tdPrice = document.createElement("td");
    tdPrice.className = "py-4 px-4 font-mono text-xs text-slate-700";
    tdPrice.textContent = `$${item.price.toFixed(2)}`;

    // Quantity Modifier
    const tdQty = document.createElement("td");
    tdQty.className = "py-4 px-4";
    const qtyWrapper = document.createElement("div");
    qtyWrapper.className = "flex items-center space-x-1.5";

    const btnMinus = document.createElement("button");
    btnMinus.className = "w-6 h-6 flex items-center justify-center rounded border border-slate-300 text-xs font-bold text-slate-600 hover:bg-slate-100";
    btnMinus.textContent = "-";
    btnMinus.addEventListener("click", () => {
      if (item.quantity > 1) {
        item.quantity -= 1;
        saveCart(items);
        renderCartTable();
      } else {
        removeFromCart(item.id);
        renderCartTable();
      }
    });

    const qtySpan = document.createElement("span");
    qtySpan.className = "w-8 text-center text-xs font-semibold text-slate-800";
    qtySpan.textContent = String(item.quantity);

    const btnPlus = document.createElement("button");
    btnPlus.className = "w-6 h-6 flex items-center justify-center rounded border border-slate-300 text-xs font-bold text-slate-600 hover:bg-slate-100";
    btnPlus.textContent = "+";
    btnPlus.addEventListener("click", () => {
      item.quantity += 1;
      saveCart(items);
      renderCartTable();
    });

    qtyWrapper.appendChild(btnMinus);
    qtyWrapper.appendChild(qtySpan);
    qtyWrapper.appendChild(btnPlus);
    tdQty.appendChild(qtyWrapper);

    // Subtotal
    const tdSubtotal = document.createElement("td");
    tdSubtotal.className = "py-4 px-4 font-bold text-slate-900 text-sm";
    tdSubtotal.textContent = `$${(item.price * item.quantity).toFixed(2)}`;

    // Remove Action
    const tdAction = document.createElement("td");
    tdAction.className = "py-4 px-4 text-right";
    const removeBtn = document.createElement("button");
    removeBtn.className = "text-xs font-medium text-rose-600 hover:text-rose-800 transition-colors";
    removeBtn.textContent = "Remove";
    removeBtn.addEventListener("click", () => {
      removeFromCart(item.id);
      showToast(`Removed ${item.title} from cart`);
      renderCartTable();
    });
    tdAction.appendChild(removeBtn);

    tr.appendChild(tdProduct);
    tr.appendChild(tdPrice);
    tr.appendChild(tdQty);
    tr.appendChild(tdSubtotal);
    tr.appendChild(tdAction);

    tbody.appendChild(tr);
  });

  updateOrderSummary();
  updateCartBadge();
}

/**
 * Setup coupon code submission listener.
 *
 * @returns {void}
 */
function setupCouponListener() {
  const btn = document.getElementById("btn-apply-coupon");
  const input = /** @type {HTMLInputElement|null} */ (document.getElementById("coupon-input"));
  const message = document.getElementById("coupon-message");

  if (btn && input && message) {
    btn.addEventListener("click", () => {
      const code = input.value.trim().toUpperCase();
      if (code === "IITPATNA" || code === "CLOUDSCALE") {
        discountPercentage = 10;
        message.className = "text-xs text-emerald-600 font-semibold";
        message.textContent = "Coupon code applied: 10% discount!";
        updateOrderSummary();
      } else if (code === "") {
        message.textContent = "";
      } else {
        message.className = "text-xs text-rose-600";
        message.textContent = "Invalid coupon code.";
      }
    });
  }
}

/**
 * Setup clear cart action handler.
 *
 * @returns {void}
 */
function setupClearCartListener() {
  const btn = document.getElementById("btn-clear-cart");
  if (btn) {
    btn.addEventListener("click", () => {
      clearCart();
      showToast("Shopping cart cleared");
      renderCartTable();
    });
  }
}

// Bootstrap on DOM ready
document.addEventListener("DOMContentLoaded", () => {
  const badge = document.getElementById("nav-cart-count");
  if (badge) {
    badge.textContent = String(getCartItemCount());
  }
  renderCartTable();
  setupCouponListener();
  setupClearCartListener();
});
