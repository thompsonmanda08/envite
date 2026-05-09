import { afterEach, describe, expect, it, vi } from "vitest";

import {
  convertAmount,
  fetchLiveExchangeRate,
  formatCurrency,
} from "./currency";

describe("formatCurrency (currency.ts)", () => {
  it("formats USD with $ prefix", () => {
    expect(formatCurrency(1234.5)).toBe("$1,234.50");
  });

  it("formats ZMW with K prefix", () => {
    expect(formatCurrency(1234.5, "ZMW")).toBe("K1,234.50");
  });

  it("rounds to 2 decimals (USD)", () => {
    expect(formatCurrency(1234.555)).toMatch(/\$1,234\.5[56]/);
  });
});

describe("convertAmount", () => {
  it("multiplies amount by rate", () => {
    expect(convertAmount(100, 1.5)).toBe(150);
  });

  it("rounds to 2 decimal places", () => {
    expect(convertAmount(10, 0.123456)).toBe(1.23);
  });
});

describe("fetchLiveExchangeRate", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns 1 when from === to", async () => {
    expect(await fetchLiveExchangeRate("USD", "USD")).toBe(1);
  });

  it("returns the live rate when API succeeds", async () => {
    vi.stubGlobal("fetch", () =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            result: "success",
            rates: { ZMW: 28.0 },
          }),
      }),
    );

    expect(await fetchLiveExchangeRate("USD", "ZMW")).toBe(28.0);
  });

  it("falls back to seeded rate on fetch error", async () => {
    vi.stubGlobal("fetch", () => Promise.reject(new Error("network")));

    expect(await fetchLiveExchangeRate("USD", "ZMW")).toBe(27.5);
  });

  it("falls back when API returns non-success result", async () => {
    vi.stubGlobal("fetch", () =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ result: "error" }),
      }),
    );

    expect(await fetchLiveExchangeRate("USD", "ZMW")).toBe(27.5);
  });

  it("falls back when HTTP status is not ok", async () => {
    vi.stubGlobal("fetch", () =>
      Promise.resolve({ ok: false, status: 503, json: () => Promise.resolve({}) }),
    );

    expect(await fetchLiveExchangeRate("ZMW", "USD")).toBe(0.0364);
  });
});
