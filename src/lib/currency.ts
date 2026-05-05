export type Currency = "USD" | "ZMW";

export const SUPPORTED_CURRENCIES: Record<
  Currency,
  { symbol: string; name: string }
> = {
  USD: { symbol: "$", name: "US Dollar" },
  ZMW: { symbol: "K", name: "Zambian Kwacha" },
};

/** Format an amount in the given currency for display. */
export function formatCurrency(
  amount: number,
  currency: Currency = "USD",
): string {
  if (currency === "ZMW") {
    return `K${amount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

/**
 * Convert an amount using the given exchange rate.
 * Both from and to are implied by the rate (e.g. USD→ZMW rate = 27.5).
 */
export function convertAmount(amount: number, rate: number): number {
  return Math.round(amount * rate * 100) / 100;
}

// Seed fallback rates (kept in sync with exchange_rates seed in migration)
const FALLBACK_RATES: Record<string, number> = {
  USD_ZMW: 27.5,
  ZMW_USD: 0.0364,
};

/**
 * Fetch a live exchange rate between two currencies.
 * Uses open.er-api.com (free, no API key required).
 * Falls back to seeded rates when the API is unavailable.
 */
export async function fetchLiveExchangeRate(
  from: Currency,
  to: Currency,
): Promise<number> {
  if (from === to) return 1;
  try {
    const res = await fetch(`https://open.er-api.com/v6/latest/${from}`);

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    if (data.result === "success" && data.rates?.[to]) {
      return data.rates[to] as number;
    }
  } catch {
    // fall through to fallback
  }

  return FALLBACK_RATES[`${from}_${to}`] ?? 1;
}
