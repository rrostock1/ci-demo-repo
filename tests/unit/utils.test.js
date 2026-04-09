const {
  truncate,
  formatCurrency,
  titleCase,
  isValidEmail,
} = require("../../src/utils");

// ─── truncate ─────────────────────────────────────────────────────────────────

describe("truncate", () => {
  test("returns the original string if within limit", () => {
    expect(truncate("hello", 10)).toBe("hello");
  });

  test("truncates and appends ellipsis when over limit", () => {
    expect(truncate("hello world", 5)).toBe("hello...");
  });

  test("handles exact-length strings without truncating", () => {
    expect(truncate("hello", 5)).toBe("hello");
  });
});

// ─── formatCurrency ───────────────────────────────────────────────────────────

describe("formatCurrency", () => {
  test("formats a whole number with two decimal places", () => {
    expect(formatCurrency(10)).toBe("$10.00");
  });

  test("formats a decimal value correctly", () => {
    expect(formatCurrency(9.5)).toBe("$9.50");
  });

  test("formats zero correctly", () => {
    expect(formatCurrency(0)).toBe("$0.00");
  });
});

// ─── titleCase ────────────────────────────────────────────────────────────────

describe("titleCase", () => {
  test("capitalizes the first letter of each word", () => {
    expect(titleCase("hello world")).toBe("Hello World");
  });

  test("lowercases the rest of each word", () => {
    expect(titleCase("HELLO WORLD")).toBe("Hello World");
  });

  test("handles a single word", () => {
    expect(titleCase("javascript")).toBe("Javascript");
  });
});

// ─── isValidEmail ─────────────────────────────────────────────────────────────

describe("isValidEmail", () => {
  test("accepts a standard email address", () => {
    expect(isValidEmail("student@university.edu")).toBe(true);
  });

  test("rejects a string with no @ symbol", () => {
    expect(isValidEmail("notanemail")).toBe(false);
  });

  test("rejects a string with no domain", () => {
    expect(isValidEmail("user@")).toBe(false);
  });

  test("rejects an empty string", () => {
    expect(isValidEmail("")).toBe(false);
  });
});
