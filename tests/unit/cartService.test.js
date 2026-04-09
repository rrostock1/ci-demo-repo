/**
 * cartService.test.js  —  UNIT TESTS
 *
 * db.js is completely mocked here.  No Postgres, no Docker,
 * no network.  These run anywhere, instantly.
 *
 * This is the key teaching moment:
 *   jest.mock('../../../src/db') replaces the real module with
 *   auto-generated mock functions for every export.
 *   We then control exactly what the "database" returns.
 */

jest.mock("../../src/db");
const db = require("../../src/db");
const {
  addItem,
  removeItem,
  getCartSummary,
  clearCart,
} = require("../../src/cartService");

// Reset all mocks between tests so state doesn't bleed across
beforeEach(() => {
  jest.clearAllMocks();
});

// ─── addItem ──────────────────────────────────────────────────────────────────

describe("addItem", () => {
  test("adds a new item to an empty cart", async () => {
    db.getCart.mockResolvedValue(null); // DB returns: cart doesn't exist
    db.saveCart.mockResolvedValue(); // DB returns: save succeeds

    const result = await addItem("user-1", {
      name: "Widget",
      price: 10,
      quantity: 2,
    });

    expect(result).toEqual([{ name: "Widget", price: 10, quantity: 2 }]);
    expect(db.saveCart).toHaveBeenCalledWith("user-1", [
      { name: "Widget", price: 10, quantity: 2 },
    ]);
  });

  test("increments quantity when item already exists in cart", async () => {
    db.getCart.mockResolvedValue([{ name: "Widget", price: 10, quantity: 2 }]);
    db.saveCart.mockResolvedValue();
    //unit test will fail with first defect: never increments quantity in db.js
    const result = await addItem("user-1", {
      name: "Widget",
      price: 10,
      quantity: 3,
    });

    expect(result[0].quantity).toBe(5); // 2 + 3
  });

  test("adds a second distinct item alongside an existing one", async () => {
    db.getCart.mockResolvedValue([{ name: "Widget", price: 10, quantity: 1 }]);
    db.saveCart.mockResolvedValue();

    const result = await addItem("user-1", {
      name: "Gadget",
      price: 25,
      quantity: 1,
    });

    expect(result).toHaveLength(2);
    expect(result[1].name).toBe("Gadget");
  });

  test("calls db.saveCart exactly once", async () => {
    db.getCart.mockResolvedValue([]);
    db.saveCart.mockResolvedValue();

    await addItem("user-1", { name: "Widget", price: 10, quantity: 1 });

    expect(db.saveCart).toHaveBeenCalledTimes(1);
  });
});

// ─── removeItem ───────────────────────────────────────────────────────────────

describe("removeItem", () => {
  test("removes the named item from the cart", async () => {
    db.getCart.mockResolvedValue([
      { name: "Widget", price: 10, quantity: 2 },
      { name: "Gadget", price: 25, quantity: 1 },
    ]);
    db.saveCart.mockResolvedValue();

    const result = await removeItem("user-1", "Widget");

    expect(result).toEqual([{ name: "Gadget", price: 25, quantity: 1 }]);
  });

  test("is a no-op when the item is not in the cart", async () => {
    db.getCart.mockResolvedValue([{ name: "Gadget", price: 25, quantity: 1 }]);
    db.saveCart.mockResolvedValue();

    const result = await removeItem("user-1", "Widget");

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("Gadget");
  });

  test("results in an empty cart when the only item is removed", async () => {
    db.getCart.mockResolvedValue([{ name: "Widget", price: 10, quantity: 1 }]);
    db.saveCart.mockResolvedValue();

    const result = await removeItem("user-1", "Widget");

    expect(result).toEqual([]);
  });
});

// ─── getCartSummary ───────────────────────────────────────────────────────────

describe("getCartSummary", () => {
  test("returns correct totals for a populated cart", async () => {
    db.getCart.mockResolvedValue([
      { name: "Widget", price: 10, quantity: 2 }, // 20
      { name: "Gadget", price: 25, quantity: 1 }, // 25 → subtotal: 45
    ]);

    const summary = await getCartSummary("user-1", 0, 0.08);

    expect(summary.subtotal).toBe(45);
    expect(summary.tax).toBe(3.6);
    expect(summary.total).toBe(48.6);
  });

  test("applies a discount before calculating tax", async () => {
    db.getCart.mockResolvedValue([{ name: "Widget", price: 100, quantity: 1 }]);

    const summary = await getCartSummary("user-1", 10, 0.08); // 10% off → 90 → tax 7.20

    expect(summary.discounted).toBe(90);
    expect(summary.tax).toBe(7.2);
    expect(summary.total).toBe(97.2);
  });

  test("returns an empty summary for a user with no cart", async () => {
    db.getCart.mockResolvedValue(null);

    const summary = await getCartSummary("user-1");

    expect(summary.items).toEqual([]);
    expect(summary.total).toBe(0);
  });

  test("does not call db.saveCart (read-only operation)", async () => {
    db.getCart.mockResolvedValue([]);

    await getCartSummary("user-1");

    expect(db.saveCart).not.toHaveBeenCalled();
  });
});

// ─── clearCart ────────────────────────────────────────────────────────────────

describe("clearCart", () => {
  test("calls db.deleteCart with the correct userId", async () => {
    db.deleteCart.mockResolvedValue();

    await clearCart("user-1");

    expect(db.deleteCart).toHaveBeenCalledWith("user-1");
    expect(db.deleteCart).toHaveBeenCalledTimes(1);
  });
});
