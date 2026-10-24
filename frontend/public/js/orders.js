/**
 * Order history page script for ShopScale storefront.
 *
 * Renders committed simulated order transactions, allocation breakdowns,
 * and cryptographic verification hashes from local storage.
 */

import { getCartItemCount } from "./cart.js";

/**
 * Render all order history cards into the container.
 *
 * @returns {void}
 */
function renderOrders() {
  const container = document.getElementById("orders-list-container");
  const emptyState = document.getElementById("orders-empty-state");
  if (!container) return;

  const orders = JSON.parse(localStorage.getItem("shopscale_orders") || "[]");

  if (orders.length === 0) {
    if (emptyState) emptyState.classList.remove("hidden");
    container.textContent = "";
    return;
  }

  if (emptyState) emptyState.classList.add("hidden");
  container.textContent = "";

  const params = new URLSearchParams(window.location.search);
  const highlightedId = params.get("orderId");

  orders.forEach((order) => {
    const card = document.createElement("article");
    const isHighlighted = highlightedId === order.id;

    card.className = `bg-white rounded-xl border p-6 shadow-sm space-y-4 transition-all ${
      isHighlighted ? "border-emerald-500 ring-2 ring-emerald-100" : "border-slate-200"
    }`;

    // Header: Order ID & Date & Status
    const header = document.createElement("div");
    header.className = "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-slate-100 text-xs";

    const left = document.createElement("div");
    left.className = "space-y-0.5";
    const idSpan = document.createElement("span");
    idSpan.className = "font-bold text-slate-900 text-sm font-mono block";
    idSpan.textContent = order.id;
    const dateSpan = document.createElement("span");
    dateSpan.className = "text-slate-400";
    dateSpan.textContent = new Date(order.date).toLocaleString();
    left.appendChild(idSpan);
    left.appendChild(dateSpan);

    const right = document.createElement("div");
    right.className = "flex items-center space-x-2";

    const regionBadge = document.createElement("span");
    regionBadge.className = "px-2 py-0.5 rounded font-mono text-[11px] bg-slate-100 text-slate-700 border border-slate-200";
    regionBadge.textContent = order.region || "ap-south-1";

    const statusBadge = document.createElement("span");
    statusBadge.className = "px-2.5 py-1 rounded-full font-semibold text-xs bg-emerald-100 text-emerald-800 border border-emerald-300";
    statusBadge.textContent = order.status || "COMPLETED";

    right.appendChild(regionBadge);
    right.appendChild(statusBadge);

    header.appendChild(left);
    header.appendChild(right);

    // Items List
    const itemsList = document.createElement("div");
    itemsList.className = "divide-y divide-slate-100";

    (order.items || []).forEach((item) => {
      const itemRow = document.createElement("div");
      itemRow.className = "flex justify-between items-center py-2 text-xs";

      const titleLink = document.createElement("a");
      titleLink.href = `./product.html?id=${item.id}`;
      titleLink.className = "font-medium text-slate-800 hover:text-emerald-600 transition-colors";
      titleLink.textContent = `${item.quantity} × ${item.title}`;

      const priceSpan = document.createElement("span");
      priceSpan.className = "font-mono text-slate-700 font-semibold";
      priceSpan.textContent = `$${(item.price * item.quantity).toFixed(2)}`;

      itemRow.appendChild(titleLink);
      itemRow.appendChild(priceSpan);
      itemsList.appendChild(itemRow);
    });

    // Footer: Transaction Hash & Total
    const footer = document.createElement("div");
    footer.className = "pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs";

    const hashSpan = document.createElement("span");
    hashSpan.className = "font-mono text-slate-400 text-[11px] truncate max-w-xs";
    hashSpan.textContent = `Tx: ${order.transactionHash || "0x00"}`;

    const totalSpan = document.createElement("span");
    totalSpan.className = "text-sm font-bold text-slate-900";
    totalSpan.textContent = `Total Committed: $${Number(order.total || 0).toFixed(2)}`;

    footer.appendChild(hashSpan);
    footer.appendChild(totalSpan);

    card.appendChild(header);
    card.appendChild(itemsList);
    card.appendChild(footer);

    container.appendChild(card);
  });
}

// Bootstrap on DOM ready
document.addEventListener("DOMContentLoaded", () => {
  const badge = document.getElementById("nav-cart-count");
  if (badge) {
    badge.textContent = String(getCartItemCount());
  }
  renderOrders();
});
