/**
 * db.js
 * Thin data-access layer — wraps Postgres so the rest of the app
 * never imports 'pg' directly.  This boundary is what makes the
 * business logic unit-testable without a real database.
 *
 * In tests, callers mock THIS module:
 *   jest.mock('../src/db')
 */

const { Pool } = require("pg");

// Pool is created lazily so tests can import this file without
// needing a real Postgres connection available.
let _pool = null;

function getPool() {
  if (!_pool) {
    _pool = new Pool({
      host:     process.env.PGHOST     || "localhost",
      port:     parseInt(process.env.PGPORT || "5432"),
      database: process.env.PGDATABASE || "ci_demo",
      user:     process.env.PGUSER     || "postgres",
      password: process.env.PGPASSWORD || "postgres",
    });
  }
  return _pool;
}

/**
 * Ensures the carts table exists.
 * Call once at startup / in integration-test beforeAll.
 */
async function initSchema() {
  await getPool().query(`
    CREATE TABLE IF NOT EXISTS carts (
      id      SERIAL PRIMARY KEY,
      user_id TEXT NOT NULL UNIQUE,
      items   JSONB NOT NULL DEFAULT '[]'
    )
  `);
}

/**
 * Saves (upserts) a cart for a user.
 * @param {string} userId
 * @param {Array}  items
 */
async function saveCart(userId, items) {
  const result = await getPool().query(
    `INSERT INTO carts (user_id, items)
     VALUES ($1, $2)
     ON CONFLICT (user_id) DO UPDATE SET items = EXCLUDED.items
     RETURNING *`,
    [userId, JSON.stringify(items)]
  );
  return result.rows[0];
}

/**
 * Retrieves a cart for a user.  Returns null if not found.
 * @param {string} userId
 * @returns {Array|null}
 */
async function getCart(userId) {
  const result = await getPool().query(
    "SELECT items FROM carts WHERE user_id = $1",
    [userId]
  );
  if (result.rows.length === 0) return null;
  return result.rows[0].items;
}

/**
 * Deletes a cart for a user.
 * @param {string} userId
 */
async function deleteCart(userId) {
  await getPool().query("DELETE FROM carts WHERE user_id = $1", [userId]);
}

/**
 * Closes the connection pool.  Call in integration-test afterAll.
 */
async function closePool() {
  if (_pool) {
    await _pool.end();
    _pool = null;
  }
}

module.exports = { initSchema, saveCart, getCart, deleteCart, closePool };
