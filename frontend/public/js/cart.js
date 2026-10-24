/**
 * Shopping cart storage and management module for ShopScale.
 *
 * Persists selected items in localStorage and provides helpers
 * for updating and computing totals.
 */

const CART_KEY = "shopscale_cart";

/**
 * @typedef {Object} CartItem
 * @property {number} id - Product ID.
 * @property {string} title - Product title.
 * @property {number} price - Unit price.
 * @property {number} quantity - Item quantity.
 */

/**
 * Retrieve items from persistent cart storage.
 *
 * @returns {CartItem[]} List of cart items.
 */
export function getCart() {
  const data = localStorage.getItem(CART_KEY);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
}

/**
 * Save cart items to local storage.
 *
 * @param {CartItem[]} items - Array of cart items.
 * @returns {void}
 */
export function saveCart(items) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
}

/**
 * Add an item to the shopping cart or increment its quantity.
 *
 * @param {object} product - Product details (id, title, price).
 * @param {number} [quantity=1] - Quantity to add.
 * @returns {CartItem[]} Updated cart items list.
 */
export function addToCart(product, quantity = 1) {
  const items = getCart();
  const existing = items.find((item) => item.id === product.id);

  if (existing) {
    existing.quantity += quantity;
  } else {
    items.push({
      id: product.id,
      title: product.title,
      price: product.price,
      quantity
    });
  }

  saveCart(items);
  return items;
}

/**
 * Remove an item completely from the shopping cart.
 *
 * @param {number} productId - Product identifier.
 * @returns {CartItem[]} Updated cart items list.
 */
export function removeFromCart(productId) {
  const items = getCart().filter((item) => item.id !== productId);
  saveCart(items);
  return items;
}

/**
 * Calculate the total item count in the cart.
 *
 * @returns {number} Total quantity of all items in cart.
 */
export function getCartItemCount() {
  return getCart().reduce((acc, item) => acc + item.quantity, 0);
}

/**
 * Calculate the total monetary value of items in the cart.
 *
 * @returns {number} Cart total formatted to two decimal places.
 */
export function getCartTotal() {
  const total = getCart().reduce((acc, item) => acc + item.price * item.quantity, 0);
  return Math.round(total * 100) / 100;
}

/**
 * Clear all items from the shopping cart.
 *
 * @returns {void}
 */
export function clearCart() {
  localStorage.removeItem(CART_KEY);
}
