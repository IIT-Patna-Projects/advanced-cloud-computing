/**
 * Main application script for the ShopScale catalog homepage.
 *
 * Bootstraps system health probes, renders dynamic catalog products,
 * handles real-time search, category filtering, and cart additions
 * strictly through safe DOM manipulation (textContent).
 */

import { apiRequest } from "./api.js";
import { addToCart, getCartItemCount } from "./cart.js";
import { queryCatalog } from "./catalog-data.js";

let currentCategory = "all";
let currentSearch = "";
let currentSort = "featured";

/**
 * Display a temporary non-blocking toast notification.
 *
 * @param {string} message - Notification text.
 * @returns {void}
 */
export function showToast(message) {
  let toastContainer = document.getElementById("toast-container");
  if (!toastContainer) {
    toastContainer = document.createElement("div");
    toastContainer.id = "toast-container";
    toastContainer.className = "fixed bottom-5 right-5 z-50 flex flex-col space-y-2 pointer-events-none";
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement("div");
  toast.className = "pointer-events-auto px-4 py-2.5 rounded-lg bg-slate-900 text-white text-xs font-medium shadow-lg border border-slate-700 flex items-center space-x-2 transition-all transform translate-y-0 opacity-100";

  const iconSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  iconSvg.setAttribute("class", "w-4 h-4 text-emerald-400 flex-shrink-0");
  iconSvg.setAttribute("viewBox", "0 0 24 24");
  iconSvg.setAttribute("fill", "none");
  iconSvg.setAttribute("stroke", "currentColor");
  iconSvg.setAttribute("stroke-width", "2");
  iconSvg.setAttribute("stroke-linecap", "round");
  iconSvg.setAttribute("stroke-linejoin", "round");

  const path = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
  path.setAttribute("points", "20 6 9 17 4 12");
  iconSvg.appendChild(path);

  const textSpan = document.createElement("span");
  textSpan.textContent = message;

  toast.appendChild(iconSvg);
  toast.appendChild(textSpan);
  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("opacity-0", "translate-y-2");
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 2500);
}

/**
 * Update the shopping cart item counter badge in the navigation header.
 *
 * @returns {void}
 */
export function updateCartBadge() {
  const badge = document.getElementById("nav-cart-count");
  if (badge) {
    badge.textContent = String(getCartItemCount());
  }
}

/**
 * Create a DOM card element for a catalog product.
 *
 * @param {import('./catalog-data.js').Product} product - Product details.
 * @returns {HTMLElement} Product article element.
 */
function createProductCard(product) {
  const card = document.createElement("article");
  card.className = "bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between p-5 space-y-4 group";

  // Header: Badge & Stock
  const headerDiv = document.createElement("div");
  headerDiv.className = "flex items-center justify-between text-xs";

  const badgeSpan = document.createElement("span");
  badgeSpan.className = "inline-block px-2 py-0.5 font-semibold text-indigo-700 bg-indigo-50 border border-indigo-100 rounded";
  badgeSpan.textContent = product.badge;

  const stockSpan = document.createElement("span");
  stockSpan.className = product.stock > 20
    ? "font-medium text-emerald-700"
    : "font-medium text-amber-700";
  stockSpan.textContent = product.stock > 0 ? `Stock: ${product.stock}` : "Backorder";

  headerDiv.appendChild(badgeSpan);
  headerDiv.appendChild(stockSpan);

  // Body: Title & Description
  const bodyDiv = document.createElement("div");
  bodyDiv.className = "space-y-1.5";

  const titleLink = document.createElement("a");
  titleLink.href = `./product.html?id=${product.id}`;
  titleLink.className = "block text-base font-semibold text-slate-900 group-hover:text-emerald-600 transition-colors line-clamp-1";
  titleLink.textContent = product.title;

  const skuSpan = document.createElement("div");
  skuSpan.className = "text-xs font-mono text-slate-400";
  skuSpan.textContent = product.sku;

  const descP = document.createElement("p");
  descP.className = "text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed";
  descP.textContent = product.description;

  bodyDiv.appendChild(titleLink);
  bodyDiv.appendChild(skuSpan);
  bodyDiv.appendChild(descP);

  // Footer: Price & Actions
  const footerDiv = document.createElement("div");
  footerDiv.className = "pt-4 border-t border-slate-100 flex items-center justify-between";

  const priceDiv = document.createElement("div");
  priceDiv.className = "flex flex-col";
  const priceSpan = document.createElement("span");
  priceSpan.className = "text-lg font-bold text-slate-900";
  priceSpan.textContent = `$${product.price.toFixed(2)}`;
  const slaSpan = document.createElement("span");
  slaSpan.className = "text-[10px] text-slate-400 font-mono";
  slaSpan.textContent = product.sla;
  priceDiv.appendChild(priceSpan);
  priceDiv.appendChild(slaSpan);

  const actionsDiv = document.createElement("div");
  actionsDiv.className = "flex items-center space-x-2";

  const detailsBtn = document.createElement("a");
  detailsBtn.href = `./product.html?id=${product.id}`;
  detailsBtn.className = "px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors";
  detailsBtn.textContent = "View";

  const addBtn = document.createElement("button");
  addBtn.className = "px-3 py-1.5 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-sm";
  addBtn.textContent = "Add to Cart";
  addBtn.addEventListener("click", () => {
    addToCart(product, 1);
    updateCartBadge();
    showToast(`Added ${product.title} to cart`);
  });

  actionsDiv.appendChild(detailsBtn);
  actionsDiv.appendChild(addBtn);

  footerDiv.appendChild(priceDiv);
  footerDiv.appendChild(actionsDiv);

  card.appendChild(headerDiv);
  card.appendChild(bodyDiv);
  card.appendChild(footerDiv);

  return card;
}

/**
 * Render catalog cards based on active filtering and search parameters.
 *
 * @returns {void}
 */
function renderCatalog() {
  const container = document.getElementById("product-grid");
  const countLabel = document.getElementById("catalog-result-count");
  if (!container) return;

  container.textContent = "";

  const products = queryCatalog(currentCategory, currentSearch, currentSort);

  if (countLabel) {
    countLabel.textContent = `Showing ${products.length} product${products.length === 1 ? "" : "s"}`;
  }

  if (products.length === 0) {
    const emptyDiv = document.createElement("div");
    emptyDiv.className = "col-span-full py-12 text-center text-slate-500 space-y-2";
    const p1 = document.createElement("p");
    p1.className = "text-base font-semibold text-slate-700";
    p1.textContent = "No products found matching your filter.";
    const p2 = document.createElement("p");
    p2.className = "text-xs text-slate-400";
    p2.textContent = "Try adjusting your search terms or selecting another category.";
    emptyDiv.appendChild(p1);
    emptyDiv.appendChild(p2);
    container.appendChild(emptyDiv);
    return;
  }

  products.forEach((product) => {
    container.appendChild(createProductCard(product));
  });
}

/**
 * Query backend and frontend health endpoints and update status badges.
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
      frontendBadge.textContent = "OFFLINE (Static Mode)";
      frontendBadge.className = "px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-700 border border-slate-300";
    }
  }

  // Check backend health
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
  } catch {
    if (backendBadge) {
      backendBadge.textContent = "STANDALONE";
      backendBadge.className = "px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-700 border border-slate-300";
    }
    if (dbBadge) {
      dbBadge.textContent = "NOT CONNECTED";
      dbBadge.className = "px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-700 border border-slate-300";
    }
  }
}

/**
 * Bind category filter button click handlers.
 *
 * @returns {void}
 */
function setupCategoryFilters() {
  const buttons = document.querySelectorAll("[data-category-filter]");
  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetCategory = btn.getAttribute("data-category-filter") || "all";
      currentCategory = targetCategory;

      buttons.forEach((b) => {
        if (b === btn) {
          b.className = "px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-900 text-white transition-colors";
        } else {
          b.className = "px-3 py-1.5 text-xs font-medium rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors";
        }
      });

      renderCatalog();
    });
  });
}

/**
 * Bind catalog search input listener.
 *
 * @returns {void}
 */
function setupSearchListener() {
  const input = document.getElementById("search-input");
  if (input) {
    input.addEventListener("input", (e) => {
      const target = /** @type {HTMLInputElement} */ (e.target);
      currentSearch = target.value;
      renderCatalog();
    });
  }

  const sortSelect = document.getElementById("sort-select");
  if (sortSelect) {
    sortSelect.addEventListener("change", (e) => {
      const target = /** @type {HTMLSelectElement} */ (e.target);
      currentSort = target.value;
      renderCatalog();
    });
  }
}

// Bootstrap on DOM ready
document.addEventListener("DOMContentLoaded", () => {
  checkSystemHealth();
  updateCartBadge();
  setupCategoryFilters();
  setupSearchListener();
  renderCatalog();
});
