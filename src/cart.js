/**
 * cart.js
 * A simple shopping cart — used as the demo subject for CI/CD Week 10.
 * Intentionally straightforward so the focus stays on the pipeline, not the code.
 */

/**
 * Calculates the subtotal for a list of items.
 * @param {Array<{name: string, price: number, quantity: number}>} items
 * @returns {number}
 */
function calculateSubtotal(items) {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

/**
 * Applies a percentage discount to a subtotal.
 * @param {number} subtotal
 * @param {number} discountPercent - e.g. 10 for 10%
 * @returns {number}
 */
function applyDiscount(subtotal, discountPercent) {
  if (discountPercent < 0 || discountPercent > 100) {
    throw new Error("Discount must be between 0 and 100");
  }
  return subtotal * (1 - discountPercent / 100);
}

/**
 * Calculates tax on a given amount.
 * @param {number} amount
 * @param {number} taxRate - e.g. 0.08 for 8%
 * @returns {number}
 */
function calculateTax(amount, taxRate) {
  if (taxRate < 0) {
    throw new Error("Tax rate cannot be negative");
  }
  return parseFloat((amount * taxRate).toFixed(2));
}

/**
 * Returns the total number of items in the cart.
 * @param {Array<{quantity: number}>} items
 * @returns {number}
 */
function getItemCount(items) {
  return items.reduce((count, item) => count + item.quantity, 0);
}

/**
 * Checks whether the cart is empty.
 * @param {Array} items
 * @returns {boolean}
 */
function isCartEmpty(items) {
  return items.length === 0;
}

module.exports = {
  calculateSubtotal,
  applyDiscount,
  calculateTax,
  getItemCount,
  isCartEmpty,
};
