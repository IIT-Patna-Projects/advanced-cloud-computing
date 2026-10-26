/**
 * Product detail page script for ShopScale.
 *
 * Resolves product details by URL query parameter via live backend API,
 * displays animated loading skeletons, renders technical specs,
 * and manages quantity adjustment and cart additions.
 */

import { apiRequest } from "./api.js";
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

  if (!specs || typeof specs !== "object") return;

  Object.entries(specs).forEach(([key, val]) => {
    const tr = document.createElement("tr");

    const tdKey = document.createElement("td");
    tdKey.className = "py-3 px-4 font-semibold text-slate-900 bg-slate-50 w-1/3";
    tdKey.textContent = key;

    const tdVal = document.createElement("td");
    tdVal.className = "py-3 px-4 text-slate-700 font-mono text-xs";
    tdVal.textContent = String(val);

    tr.appendChild(tdKey);
    tr.appendChild(tdVal);
    tbody.appendChild(tr);
  });
}

/**
 * Render loading skeleton placeholders across product detail containers.
 *
 * @returns {void}
 */
function setProductLoadingState() {
  const visualTitle = document.getElementById("product-title-visual");
  if (visualTitle) {
    visualTitle.textContent = "Loading schematic...";
  }

  const title = document.getElementById("product-title");
  if (title) {
    title.textContent = "Loading cloud resource...";
  }

  const desc = document.getElementById("product-long-desc");
  if (desc) {
    desc.textContent = "Querying live catalog specification from backend service...";
  }

  const price = document.getElementById("product-price");
  if (price) {
    price.textContent = "$--.--";
  }

  const stockStatus = document.getElementById("product-stock-status");
  if (stockStatus) {
    stockStatus.textContent = "Checking allocation availability...";
    stockStatus.className = "text-sm font-semibold text-slate-500 animate-pulse";
  }

  const tbody = document.getElementById("specs-table-body");
  if (tbody) {
    tbody.textContent = "";
    for (let i = 0; i < 4; i++) {
      const tr = document.createElement("tr");
      tr.className = "animate-pulse";

      const td1 = document.createElement("td");
      td1.className = "py-3 px-4 bg-slate-50 w-1/3";
      const bar1 = document.createElement("div");
      bar1.className = "h-4 w-24 bg-slate-200 rounded";
      td1.appendChild(bar1);

      const td2 = document.createElement("td");
      td2.className = "py-3 px-4";
      const bar2 = document.createElement("div");
      bar2.className = "h-4 w-40 bg-slate-200 rounded";
      td2.appendChild(bar2);

      tr.appendChild(td1);
      tr.appendChild(td2);
      tbody.appendChild(tr);
    }
  }
}

/**
 * Render product not found / error banner in product container.
 *
 * @param {number} id - Requested product ID.
 * @param {string} [errorMessage] - Optional error details.
 * @returns {void}
 */
function renderProductNotFound(id, errorMessage = "Product could not be found or has been decommissioned.") {
  const container = document.getElementById("product-detail-container");
  if (!container) return;

  container.textContent = "";
  const errorCard = document.createElement("div");
  errorCard.className = "col-span-full p-8 text-center bg-white rounded-xl border border-rose-200 space-y-4";

  const iconDiv = document.createElement("div");
  iconDiv.className = "w-12 h-12 mx-auto rounded-full bg-rose-100 flex items-center justify-center text-rose-600";
  const iconSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  iconSvg.setAttribute("class", "w-6 h-6");
  iconSvg.setAttribute("viewBox", "0 0 24 24");
  iconSvg.setAttribute("fill", "none");
  iconSvg.setAttribute("stroke", "currentColor");
  iconSvg.setAttribute("stroke-width", "2");
  iconSvg.setAttribute("stroke-linecap", "round");
  iconSvg.setAttribute("stroke-linejoin", "round");
  const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  circle.setAttribute("cx", "12");
  circle.setAttribute("cy", "12");
  circle.setAttribute("r", "10");
  const line1 = document.createElementNS("http://www.w3.org/2000/svg", "line");
  line1.setAttribute("x1", "12");
  line1.setAttribute("y1", "8");
  line1.setAttribute("x2", "12");
  line1.setAttribute("y2", "12");
  const line2 = document.createElementNS("http://www.w3.org/2000/svg", "line");
  line2.setAttribute("x1", "12");
  line2.setAttribute("y1", "16");
  line2.setAttribute("x2", "12.01");
  line2.setAttribute("y2", "16");
  iconSvg.appendChild(circle);
  iconSvg.appendChild(line1);
  iconSvg.appendChild(line2);
  iconDiv.appendChild(iconSvg);

  const titleH2 = document.createElement("h2");
  titleH2.className = "text-xl font-bold text-slate-900";
  titleH2.textContent = `Product Unavailable (ID: ${id})`;

  const p = document.createElement("p");
  p.className = "text-sm text-slate-600 max-w-md mx-auto";
  p.textContent = errorMessage;

  const btnReturn = document.createElement("a");
  btnReturn.href = "./index.html";
  btnReturn.className = "inline-block px-5 py-2.5 text-xs font-semibold rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-colors";
  btnReturn.textContent = "Return to Product Catalog";

  errorCard.appendChild(iconDiv);
  errorCard.appendChild(titleH2);
  errorCard.appendChild(p);
  errorCard.appendChild(btnReturn);

  container.appendChild(errorCard);
}

/**
 * Setup quantity adjustment buttons and cart actions.
 *
 * @param {import('./catalog-data.js').Product} product - Product model.
 * @returns {void}
 */
function setupQuantityAndCartHandlers(product) {
  const qtyInput = /** @type {HTMLInputElement|null} */ (document.getElementById("quantity-input"));
  const btnMinus = document.getElementById("btn-qty-minus");
  const btnPlus = document.getElementById("btn-qty-plus");

  if (btnMinus && qtyInput) {
    btnMinus.onclick = () => {
      const val = Math.max(1, parseInt(qtyInput.value || "1", 10) - 1);
      qtyInput.value = String(val);
    };
  }

  if (btnPlus && qtyInput) {
    btnPlus.onclick = () => {
      const val = Math.min(100, parseInt(qtyInput.value || "1", 10) + 1);
      qtyInput.value = String(val);
    };
  }

  const btnAdd = document.getElementById("btn-add-cart");
  if (btnAdd && qtyInput) {
    btnAdd.onclick = () => {
      const qty = parseInt(qtyInput.value || "1", 10);
      addToCart(product, qty);
      updateCartBadge();
      showToast(`Added ${qty} × ${product.title} to cart`);
    };
  }

  const btnCheckout = document.getElementById("btn-quick-checkout");
  if (btnCheckout && qtyInput) {
    btnCheckout.onclick = (e) => {
      e.preventDefault();
      const qty = parseInt(qtyInput.value || "1", 10);
      addToCart(product, qty);
      window.location.href = "./checkout.html";
    };
  }
}

/**
 * Populate product details into the DOM asynchronously via API with offline fallback.
 *
 * @returns {Promise<void>}
 */
export async function initProductDetails() {
  const id = getProductIdFromUrl();
  setProductLoadingState();

  let product = null;

  try {
    const data = await apiRequest(`/products/${id}`);
    if (data && data.id) {
      product = {
        id: data.id,
        sku: data.sku,
        title: data.title,
        description: data.description,
        category: data.category,
        categoryName: data.category_name || data.categoryName,
        badge: data.badge || "Tier",
        price: typeof data.price === "number" ? data.price : parseFloat(data.price || "0"),
        stock: typeof data.stock === "number" ? data.stock : 0,
        sla: data.sla || "99.99%",
        specs: data.specs || {},
        longDescription: data.long_description || data.longDescription || data.description
      };
    }
  } catch (apiError) {
    console.warn("API request failed, attempting local fallback:", apiError);
    const localProduct = getProductById(id);
    if (localProduct) {
      product = localProduct;
      showToast("Serving product from offline local catalog");
    } else {
      const msg = apiError instanceof Error ? apiError.message : "The requested cloud service configuration could not be found.";
      renderProductNotFound(id, msg);
      return;
    }
  }

  if (!product) {
    renderProductNotFound(id, "Product could not be found or has been decommissioned.");
    return;
  }

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

  // Setup quantity and cart action handlers
  setupQuantityAndCartHandlers(product);
}

// Bootstrap on DOM ready
document.addEventListener("DOMContentLoaded", () => {
  const badge = document.getElementById("nav-cart-count");
  if (badge) {
    badge.textContent = String(getCartItemCount());
  }
  initProductDetails();
});
