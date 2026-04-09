/**
 * cart.integration.test.js  —  INTEGRATION TESTS
 *
 * These tests use a REAL Postgres database.
 * Locally: start it with  docker-compose up -d
 * In CI:   GitHub Actions spins up a postgres service container automatically.
 *
 * Nothing is mocked here.  We're testing the full stack:
 *   test → cartService → db.js → Postgres
 */

const db = require("../../src/db");
const { addItem, removeItem, getCartSummary, clearCart } = require("../../src/cartService");

const TEST_USER = "integration-test-user";

beforeAll(async () => {
  // Create the carts table if it doesn't exist
  await db.initSchema();
});

beforeEach(async () => {
  // Start each test with a clean slate for our test user
  await db.deleteCart(TEST_USER).catch(() => {});
});

afterAll(async () => {
  // Clean up and close the connection pool
  await db.deleteCart(TEST_USER).catch(() => {});
  await db.closePool();
});

// ─── Round-trip persistence ───────────────────────────────────────────────────

describe("cart persistence (round-trip)", () => {
  test("saves a cart and retrieves it from the database", async () => {
    await addItem(TEST_USER, { name: "Widget", price: 10, quantity: 2 });

    const items = await db.getCart(TEST_USER);

    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({ name: "Widget", price: 10, quantity: 2 });
  });

  test("persists multiple items correctly", async () => {
    await addItem(TEST_USER, { name: "Widget", price: 10, quantity: 1 });
    await addItem(TEST_USER, { name: "Gadget", price: 25, quantity: 3 });

    const items = await db.getCart(TEST_USER);

    expect(items).toHaveLength(2);
  });

  test("upserts — adding the same item increments quantity in the database", async () => {
    await addItem(TEST_USER, { name: "Widget", price: 10, quantity: 2 });
    await addItem(TEST_USER, { name: "Widget", price: 10, quantity: 3 });

    const items = await db.getCart(TEST_USER);

    expect(items).toHaveLength(1);
    expect(items[0].quantity).toBe(5);
  });
});

// ─── Remove item ─────────────────────────────────────────────────────────────

describe("removeItem (against real DB)", () => {
  test("removes one item and leaves the other in the database", async () => {
    await addItem(TEST_USER, { name: "Widget", price: 10, quantity: 1 });
    await addItem(TEST_USER, { name: "Gadget", price: 25, quantity: 1 });

    await removeItem(TEST_USER, "Widget");

    const items = await db.getCart(TEST_USER);
    expect(items).toHaveLength(1);
    expect(items[0].name).toBe("Gadget");
  });
});

// ─── Summary ─────────────────────────────────────────────────────────────────

describe("getCartSummary (against real DB)", () => {
  test("computes the correct total from persisted items", async () => {
    await addItem(TEST_USER, { name: "Widget", price: 10, quantity: 2 }); // 20
    await addItem(TEST_USER, { name: "Gadget", price: 25, quantity: 1 }); // 25 → 45

    const summary = await getCartSummary(TEST_USER, 0, 0.08);

    expect(summary.subtotal).toBe(45);
    expect(summary.total).toBeCloseTo(48.6);
  });
});

// ─── clearCart ────────────────────────────────────────────────────────────────

describe("clearCart (against real DB)", () => {
  test("cart is gone from the database after clearing", async () => {
    await addItem(TEST_USER, { name: "Widget", price: 10, quantity: 1 });
    await clearCart(TEST_USER);

    const items = await db.getCart(TEST_USER);
    expect(items).toBeNull();
  });
});
