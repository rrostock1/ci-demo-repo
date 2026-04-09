const {
  calculateSubtotal,
  applyDiscount,
  calculateTax,
  getItemCount,
  isCartEmpty,
} = require("../../src/cart");

const sampleItems = [
  { name: "Widget", price: 10.0, quantity: 2 },
  { name: "Gadget", price: 25.0, quantity: 1 },
];

// ─── calculateSubtotal ────────────────────────────────────────────────────────

describe("calculateSubtotal", () => {
  test("sums price × quantity for each item", () => {
    expect(calculateSubtotal(sampleItems)).toBe(45.0);
  });

  test("returns 0 for an empty cart", () => {
    expect(calculateSubtotal([])).toBe(0);
  });

  test("handles a single item", () => {
    expect(
      calculateSubtotal([{ name: "Thing", price: 9.99, quantity: 3 }]),
    ).toBeCloseTo(29.97);
  });
});

// ─── applyDiscount ────────────────────────────────────────────────────────────

describe("applyDiscount", () => {
  test("applies a 10% discount correctly", () => {
    expect(applyDiscount(100, 10)).toBe(90);
  });

  test("applies a 0% discount (no change)", () => {
    expect(applyDiscount(50, 0)).toBe(50);
  });

  test("applies a 100% discount (free)", () => {
    expect(applyDiscount(50, 100)).toBe(0);
  });

  test("throws on a negative discount", () => {
    expect(() => applyDiscount(100, -5)).toThrow(
      "Discount must be between 0 and 100",
    );
  });

  test("throws when discount exceeds 100", () => {
    expect(() => applyDiscount(100, 110)).toThrow(
      "Discount must be between 0 and 100",
    );
  });
});

// ─── calculateTax ─────────────────────────────────────────────────────────────

describe("calculateTax", () => {
  test("calculates 8% tax correctly", () => {
    expect(calculateTax(100, 0.08)).toBe(8.0);
  });

  test("rounds to 2 decimal places", () => {
    expect(calculateTax(33.33, 0.08)).toBe(2.67);
  });

  test("returns 0 for a 0% tax rate", () => {
    expect(calculateTax(100, 0)).toBe(0);
  });

  test("throws on a negative tax rate", () => {
    expect(() => calculateTax(100, -0.1)).toThrow(
      "Tax rate cannot be negative",
    );
  });
});

// ─── getItemCount ─────────────────────────────────────────────────────────────

describe("getItemCount", () => {
  test("sums quantities across all items", () => {
    expect(getItemCount(sampleItems)).toBe(3);
  });

  test("returns 0 for an empty cart", () => {
    expect(getItemCount([])).toBe(0);
  });
});

// ─── isCartEmpty ──────────────────────────────────────────────────────────────

describe("isCartEmpty", () => {
  test("returns true for an empty array", () => {
    expect(isCartEmpty([])).toBe(true);
  });

  test("returns false when items are present", () => {
    expect(isCartEmpty(sampleItems)).toBe(false);
  });
});
