/**
 * utils.js
 * Small utility functions — a second module to make the test suite
 * feel like a real (if tiny) codebase.
 */

/**
 * Truncates a string to a max length, appending "..." if cut.
 * @param {string} str
 * @param {number} maxLength
 * @returns {string}
 */
function truncate(str, maxLength) {
  //test commit
  if (str.length <= maxLength) {
    return str;
  }
  return str.slice(0, maxLength) + "...";
}

/**
 * Formats a number as a USD currency string.
 * @param {number} amount
 * @returns {string}
 */
function formatCurrency(amount) {
  return `$${amount.toFixed(2)}`;
}

/**
 * Capitalizes the first letter of each word in a string.
 * @param {string} str
 * @returns {string}
 */
function titleCase(str) {
  return str
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

/**
 * Returns true if a string is a valid email address (simple check).
 * @param {string} email
 * @returns {boolean}
 */
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

module.exports = {
  truncate,
  formatCurrency,
  titleCase,
  isValidEmail,
};
