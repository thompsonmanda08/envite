import { describe, expect, it } from "vitest";

import {
  capitalize,
  cn,
  formatCurrency,
  generateAvatarFallback,
  generateRandomString,
  getInitials,
} from "./index";

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("a", "b")).toBe("a b");
  });

  it("dedupes conflicting tailwind classes (twMerge)", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
  });

  it("filters falsy values", () => {
    expect(cn("a", false, null, undefined, "b")).toBe("a b");
  });
});

describe("capitalize", () => {
  it("uppercases the first character", () => {
    expect(capitalize("hello")).toBe("Hello");
  });

  it("leaves the rest of the string unchanged", () => {
    expect(capitalize("hELLO")).toBe("HELLO");
  });

  it("handles single character", () => {
    expect(capitalize("a")).toBe("A");
  });
});

describe("formatCurrency", () => {
  it("formats USD by default", () => {
    const result = formatCurrency(1234.56);
    expect(result).toMatch(/^USD /);
    expect(result).toContain("234");
    expect(result).toContain("56");
  });

  it("formats ZMW when given", () => {
    const result = formatCurrency(1234.56, "ZMW");
    expect(result).toMatch(/^ZMW /);
    expect(result).toContain("234");
    expect(result).toContain("56");
  });

  it("returns 0.00 for null", () => {
    expect(formatCurrency(null)).toBe("USD 0.00");
  });

  it("returns 0.00 for undefined", () => {
    expect(formatCurrency(undefined)).toBe("USD 0.00");
  });

  it("always shows two decimals", () => {
    const result = formatCurrency(10);
    expect(result).toMatch(/\.00$/);
  });
});

describe("generateRandomString", () => {
  it("returns a string of the requested length", () => {
    expect(generateRandomString(12)).toHaveLength(12);
  });

  it("contains uppercase, lowercase, number, and special", () => {
    const s = generateRandomString(20);
    expect(s).toMatch(/[A-Z]/);
    expect(s).toMatch(/[a-z]/);
    expect(s).toMatch(/[0-9]/);
    expect(s).toMatch(/[!@#$%^&*()]/);
  });

  it("throws when length is below 4", () => {
    expect(() => generateRandomString(3)).toThrow();
  });
});

describe("getInitials + generateAvatarFallback", () => {
  it("getInitials returns initials from a single name string", () => {
    expect(getInitials("Edward Mwape")).toBe("EM");
  });

  it("generateAvatarFallback delegates to userInitials", () => {
    expect(generateAvatarFallback("Anna Banda")).toBe("AB");
  });
});
