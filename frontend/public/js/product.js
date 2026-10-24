/**
 * Product detail page script for ShopScale.
 *
 * Resolves product details by URL query parameter, renders specs table,
 * and manages quantity adjustment and cart additions.
 */

import { addToCart, getCartItemCount } from "./cart.js";
import { getProductById } from "./catalog-data.js";
import { showToast, updateCartBadge } from "./index.js";

/**
 * Extract product ID from URL query parameters.
 *
 * @returns {number} Product ID or default 1.
 */
function getProductIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  return id ? Number(id) : 1;
}

/**
 * Render technical specifications table rows.
 *
 * @param {Object.<string, string>} specs - Key-value map of specifications.
 * @returns {void}
 */
function renderSpecsTable(specs) {
  const tbody = document.getElementById("specs-table-body");
  if (!tbody) return;
  tbody.textContent = "";

  Object.entries(specs).forEach(([key, val]) => {
    const tr = document.createElement("tr");

    const tdKey = document.createElement("td");
    tdKey.className = "py-3 px-4 font-semibold text-slate-900 bg-slate-50 w-1/3";
    tdKey.textContent = key;

    const tdVal = document.createElement("td");
    tdVal.className = "py-3 px-4 text-slate-700 font-mono text-xs";
    tdVal.textContent = val;

    tr.appendChild(tdKey);
    tr.appendChild(tdVal);
    tbody.appendChild(tr);
  });
}

/**
 * Populate product details into the DOM.
 *
 * @returns {void}
 */
function initProductDetails() {
  const id = getProductIdFromUrl();
  const product = getProductById(id) || getProductById(1);
  if (!product) return;

  // Breadcrumbs & Title
  const breadcrumb = document.getElementById("breadcrumb-title");
  if (breadcrumb) breadcrumb.textContent = product.title;

  const title = document.getElementById("product-title");
  if (title) title.textContent = product.title;

  const visualTitle = document.getElementById("product-title-visual");
  if (visualTitle) visualTitle.textContent = product.title;

  const categoryName = document.getElementById("product-category-name");
  if (categoryName) categoryName.textContent = product.categoryName;

  const badge = document.getElementById("product-badge");
  if (badge) badge.textContent = product.badge;

  const sku = document.getElementById("product-sku");
  if (sku) sku.textContent = product.sku;

  const sla = document.getElementById("product-sla");
  if (sla) sla.textContent = product.sla;

  const price = document.getElementById("product-price");
  if (price) price.textContent = `$${product.price.toFixed(2)}`;

  const desc = document.getElementById("product-long-desc");
  if (desc) desc.textContent = product.longDescription;

  const stockStatus = document.getElementById("product-stock-status");
  if (stockStatus) {
    stockStatus.textContent = product.stock > 0 ? `In Stock (${product.stock} units)` : "Out of Stock";
    stockStatus.className = product.stock > 0
      ? "text-sm font-semibold text-emerald-700"
      : "text-sm font-semibold text-rose-700";
  }

  // Render specifications
  renderSpecsTable(product.specs);

  // Setup quantity controls
  const qtyInput = /** @type {HTMLInputElement|null} */ (document.getElementById("quantity-input"));
  const btnMinus = document.getElementById("btn-qty-minus");
  const btnPlus = document.getElementById("btn-qty-plus");

  if (btnMinus && qtyInput) {
    btnMinus.addEventListener("click", () => {
      const val = Math.max(1, parseInt(qtyInput.value || "1", 10) - 1);
      qtyInput.value = String(val);
    });
  }

  if (btnPlus && qtyInput) {
    btnPlus.addEventListener("click", () => {
      const val = Math.min(100, parseInt(qtyInput.value || "1", 10) + 1);
      qtyInput.value = String(val);
    });
  }

  // Setup Add to Cart button
  const btnAdd = document.getElementById("btn-add-cart");
  if (btnAdd && qtyInput) {
    btnAdd.addEventListener("click", () => {
      const qty = parseInt(qtyInput.value || "1", 10);
      addToCart(product, qty);
      updateCartBadge();
      showToast(`Added ${qty} × ${product.title} to cart`);
    });
  }

  // Setup Instant Checkout button
  const btnCheckout = document.getElementById("btn-quick-checkout");
  if (btnCheckout && qtyInput) {
    btnCheckout.addEventListener("click", (e) => {
      e.preventDefault();
      const qty = parseInt(qtyInput.value || "1", 10);
      addToCart(product, qty);
      window.location.href = "./checkout.html";
    });
  }
}

// Bootstrap on DOM ready
document.addEventListener("DOMContentLoaded", () => {
  const badge = document.getElementById("nav-cart-count");
  if (badge) {
    badge.textContent = String(getCartItemCount());
  }
  initProductDetails();
});
