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
let searchDebounceTimer = null;
let activeAbortController = null;

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
  badgeSpan.textContent = product.badge || "Tier";

  const stockCount = typeof product.stock === "number" ? product.stock : 0;
  const stockSpan = document.createElement("span");
  stockSpan.className = stockCount > 20
    ? "font-medium text-emerald-700"
    : "font-medium text-amber-700";
  stockSpan.textContent = stockCount > 0 ? `Stock: ${stockCount}` : "Backorder";

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
  const numPrice = typeof product.price === "number" ? product.price : parseFloat(product.price || "0");
  priceSpan.textContent = `$${isNaN(numPrice) ? "0.00" : numPrice.toFixed(2)}`;
  const slaSpan = document.createElement("span");
  slaSpan.className = "text-[10px] text-slate-400 font-mono";
  slaSpan.textContent = product.sla || "99.99%";
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
 * Render loading skeleton placeholders in the product catalog grid.
 *
 * @param {HTMLElement} container - Catalog grid container element.
 * @param {number} [count=8] - Number of skeleton cards to render.
 * @returns {void}
 */
function renderSkeletons(container, count = 8) {
  container.textContent = "";
  for (let i = 0; i < count; i++) {
    const card = document.createElement("div");
    card.className = "bg-white rounded-xl border border-slate-200 p-5 space-y-4 animate-pulse flex flex-col justify-between";

    const header = document.createElement("div");
    header.className = "flex items-center justify-between";
    const badge = document.createElement("div");
    badge.className = "h-4 w-16 bg-slate-200 rounded";
    const stock = document.createElement("div");
    stock.className = "h-3 w-14 bg-slate-200 rounded";
    header.appendChild(badge);
    header.appendChild(stock);

    const body = document.createElement("div");
    body.className = "space-y-2";
    const title = document.createElement("div");
    title.className = "h-4 w-3/4 bg-slate-200 rounded";
    const sku = document.createElement("div");
    sku.className = "h-3 w-1/3 bg-slate-200 rounded";
    const desc1 = document.createElement("div");
    desc1.className = "h-3 w-full bg-slate-200 rounded";
    const desc2 = document.createElement("div");
    desc2.className = "h-3 w-4/5 bg-slate-200 rounded";
    body.appendChild(title);
    body.appendChild(sku);
    body.appendChild(desc1);
    body.appendChild(desc2);

    const footer = document.createElement("div");
    footer.className = "pt-4 border-t border-slate-100 flex items-center justify-between";
    const price = document.createElement("div");
    price.className = "h-5 w-16 bg-slate-200 rounded";
    const btn = document.createElement("div");
    btn.className = "h-7 w-20 bg-slate-200 rounded-lg";
    footer.appendChild(price);
    footer.appendChild(btn);

    card.appendChild(header);
    card.appendChild(body);
    card.appendChild(footer);

    container.appendChild(card);
  }
}

/**
 * Render an empty state notice in the catalog container.
 *
 * @param {HTMLElement} container - Grid container element.
 * @param {string} [title="No products found matching your filter."] - Primary title.
 * @param {string} [subtitle="Try adjusting your search terms or selecting another category."] - Secondary text.
 * @returns {void}
 */
function renderEmptyState(container, title = "No products found matching your filter.", subtitle = "Try adjusting your search terms or selecting another category.") {
  container.textContent = "";
  const emptyDiv = document.createElement("div");
  emptyDiv.className = "col-span-full py-12 text-center text-slate-500 space-y-2";

  const p1 = document.createElement("p");
  p1.className = "text-base font-semibold text-slate-700";
  p1.textContent = title;

  const p2 = document.createElement("p");
  p2.className = "text-xs text-slate-400";
  p2.textContent = subtitle;

  emptyDiv.appendChild(p1);
  emptyDiv.appendChild(p2);
  container.appendChild(emptyDiv);
}

/**
 * Render an error state banner with a retry action in the product catalog grid.
 *
 * @param {HTMLElement} container - Catalog grid container element.
 * @param {string} errorMessage - Error description to display.
 * @param {() => void} retryCallback - Handler to invoke on retry.
 * @returns {void}
 */
function renderErrorState(container, errorMessage, retryCallback) {
  const errorBanner = document.createElement("div");
  errorBanner.className = "col-span-full p-4 mb-4 rounded-xl border border-rose-200 bg-rose-50 text-rose-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs";

  const textDiv = document.createElement("div");
  textDiv.className = "flex items-center space-x-2";

  const iconSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  iconSvg.setAttribute("class", "w-4 h-4 text-rose-600 flex-shrink-0");
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

  const span = document.createElement("span");
  span.textContent = `API Notice: ${errorMessage}. Displaying cached local catalog.`;

  textDiv.appendChild(iconSvg);
  textDiv.appendChild(span);

  const retryBtn = document.createElement("button");
  retryBtn.className = "px-3 py-1 font-semibold rounded bg-rose-600 text-white hover:bg-rose-700 transition-colors flex-shrink-0";
  retryBtn.textContent = "Retry API";
  retryBtn.addEventListener("click", () => {
    retryCallback();
  });

  errorBanner.appendChild(textDiv);
  errorBanner.appendChild(retryBtn);

  container.prepend(errorBanner);
}

/**
 * Load and render catalog products asynchronously from the backend API.
 * Falls back to offline client data if the API is unreachable.
 *
 * @returns {Promise<void>}
 */
export async function loadCatalog() {
  const container = document.getElementById("product-grid");
  const countLabel = document.getElementById("catalog-result-count");
  if (!container) return;

  renderSkeletons(container, 8);
  if (countLabel) {
    countLabel.textContent = "Fetching catalog products...";
  }

  if (activeAbortController) {
    activeAbortController.abort();
  }
  activeAbortController = new AbortController();

  const queryParams = new URLSearchParams();
  if (currentCategory && currentCategory !== "all") {
    queryParams.set("category", currentCategory);
  }
  if (currentSearch && currentSearch.trim()) {
    queryParams.set("search", currentSearch.trim());
  }
  if (currentSort) {
    queryParams.set("sort", currentSort);
  }
  queryParams.set("page", "1");
  queryParams.set("limit", "24");

  try {
    const data = await apiRequest(`/products?${queryParams.toString()}`, {
      signal: activeAbortController.signal
    });

    container.textContent = "";

    const items = Array.isArray(data.items) ? data.items : [];
    const totalCount = typeof data.total === "number" ? data.total : items.length;

    if (countLabel) {
      countLabel.textContent = `Showing ${totalCount} product${totalCount === 1 ? "" : "s"}`;
    }

    if (items.length === 0) {
      renderEmptyState(container);
      return;
    }

    items.forEach((item) => {
      const normalized = {
        id: item.id,
        sku: item.sku,
        title: item.title,
        description: item.description,
        category: item.category,
        categoryName: item.category_name || item.categoryName,
        badge: item.badge,
        price: typeof item.price === "number" ? item.price : parseFloat(item.price || "0"),
        stock: item.stock,
        sla: item.sla,
        specs: item.specs || {},
        longDescription: item.long_description || item.longDescription || item.description
      };
      container.appendChild(createProductCard(normalized));
    });
  } catch (error) {
    if (error && error.name === "AbortError") {
      return;
    }
    const message = error instanceof Error ? error.message : "Network error";
    container.textContent = "";

    const fallbackProducts = queryCatalog(currentCategory, currentSearch, currentSort);
    if (countLabel) {
      countLabel.textContent = `Showing ${fallbackProducts.length} product${fallbackProducts.length === 1 ? "" : "s"} (Offline Mode)`;
    }

    renderErrorState(container, message, () => {
      loadCatalog();
    });

    if (fallbackProducts.length === 0) {
      renderEmptyState(container, "No products found in local cache.", "Check backend API connectivity and retry.");
      return;
    }

    fallbackProducts.forEach((product) => {
      container.appendChild(createProductCard(product));
    });
  }
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

      loadCatalog();
    });
  });
}

/**
 * Bind catalog search input listener.
 *
 * @returns {void}
 */
function setupSearchListener() {
  const input = /** @type {HTMLInputElement|null} */ (document.getElementById("search-input"));
  if (input) {
    input.addEventListener("input", (e) => {
      const target = /** @type {HTMLInputElement} */ (e.target);
      currentSearch = target.value;
      if (searchDebounceTimer) {
        clearTimeout(searchDebounceTimer);
      }
      searchDebounceTimer = setTimeout(() => {
        loadCatalog();
      }, 250);
    });
  }

  const sortSelect = /** @type {HTMLSelectElement|null} */ (document.getElementById("sort-select"));
  if (sortSelect) {
    sortSelect.addEventListener("change", (e) => {
      const target = /** @type {HTMLSelectElement} */ (e.target);
      currentSort = target.value;
      loadCatalog();
    });
  }
}

// Bootstrap on DOM ready
document.addEventListener("DOMContentLoaded", () => {
  checkSystemHealth();
  updateCartBadge();
  setupCategoryFilters();
  setupSearchListener();
  loadCatalog();
});
