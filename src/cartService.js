/**
 * cartService.js
 * Business logic for cart persistence.
 * Depends on db.js — but never on 'pg' directly.
 *
 * This separation is the key:
 *   - Unit tests mock db.js   → test logic without a database
 *   - Integration tests use a real db.js → test the full stack
 */

const db = require("./db");
const { calculateSubtotal, applyDiscount, calculateTax } = require("./cart");

/**
 * Adds an item to a user's persisted cart.
 * @param {string} userId
 * @param {{ name: string, price: number, quantity: number }} item
 */
async function addItem(userId, item) {
  const existing = (await db.getCart(userId)) || [];
  const idx = existing.findIndex((i) => i.name === item.name);

  if (idx >= 0) {
    existing[idx].quantity += item.quantity;
  } else {
    existing.push(item);
  }

  await db.saveCart(userId, existing);
  return existing;
}

/**
 * Removes an item by name from a user's cart.
 * @param {string} userId
 * @param {string} itemName
 */
async function removeItem(userId, itemName) {
  const existing = (await db.getCart(userId)) || [];
  const updated = existing.filter((i) => i.name !== itemName);
  await db.saveCart(userId, updated);
  return updated;
}

/**
 * Returns the full cart with subtotal, discount, tax, and total.
 * @param {string} userId
 * @param {number} discountPercent
 * @param {number} taxRate
 */
async function getCartSummary(userId, discountPercent = 0, taxRate = 0.08) {
  const items = (await db.getCart(userId)) || [];
  const subtotal = calculateSubtotal(items);
  const discounted = applyDiscount(subtotal, discountPercent);
  const tax = calculateTax(discounted, taxRate);

  return {
    items,
    subtotal,
    discounted,
    tax,
    total: parseFloat((discounted + tax).toFixed(2)),
  };
}

/**
 * Clears a user's cart entirely.
 * @param {string} userId
 */
async function clearCart(userId) {
  await db.deleteCart(userId);
}

module.exports = { addItem, removeItem, getCartSummary, clearCart };
