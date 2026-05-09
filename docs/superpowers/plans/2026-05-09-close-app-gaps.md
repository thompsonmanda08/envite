# Close App Gaps — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship four targeted gap closures on the otherwise-complete e-nvite app: backend date format fix, pure-helper test coverage, PWA Phase 2 perf polish, public RSVP form gated behind a flag.

**Architecture:**
- TDD for pure helpers (test → fail → implement → pass → commit). Matches existing pattern in `src/lib/response-helpers.test.ts`.
- Date transform applied at server-action boundary, not in the form. Single chokepoint.
- PWA polish stays additive — wraps existing `withSerwist` config without disturbing it.
- Public RSVP guarded behind `NEXT_PUBLIC_ENABLE_PUBLIC_RSVP`. Off by default until the backend ships the public endpoint.

**Tech Stack:**
- Next 16.2.x, React 19.2.x, TypeScript 5.x, Tailwind v4, framer-motion
- Vitest 4.x + @testing-library + jsdom (already configured in `vitest.config.ts`)
- jose (JWT), isomorphic-dompurify, sonner, react-hook-form + zod
- Package manager: **bun**

**Spec:** [docs/superpowers/specs/2026-05-09-close-app-gaps-design.md](../specs/2026-05-09-close-app-gaps-design.md)

**Working directory note:** Plan assumes execution on a feature branch or worktree. If running on `main`: `git checkout -b feat/close-app-gaps`.

---

## Phase A — Date format fix

### Task A.1: Create `lib/format.ts` with failing test

**Files:**
- Create: `src/lib/format.ts`
- Create: `src/lib/format.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/lib/format.test.ts`:

```ts
import { describe, expect, it } from "vitest";

import { toBackendDate } from "./format";

describe("toBackendDate", () => {
  it("returns undefined when input is undefined", () => {
    expect(toBackendDate(undefined)).toBeUndefined();
  });

  it("returns empty string when input is empty", () => {
    expect(toBackendDate("")).toBe("");
  });

  it("passes YYYY-MM-DD through unchanged", () => {
    expect(toBackendDate("2026-05-12")).toBe("2026-05-12");
  });

  it("trims time off datetime-local input", () => {
    expect(toBackendDate("2026-05-12T18:30")).toBe("2026-05-12");
  });

  it("trims time off ISO string with seconds", () => {
    expect(toBackendDate("2026-05-12T18:30:45")).toBe("2026-05-12");
  });

  it("trims time off ISO string with milliseconds + Z", () => {
    expect(toBackendDate("2026-05-12T18:30:45.123Z")).toBe("2026-05-12");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
bun run test:run src/lib/format.test.ts
```

Expected: FAIL — `Cannot find module './format'`.

- [ ] **Step 3: Implement minimal helper**

Create `src/lib/format.ts`:

```ts
/**
 * Trim time off a date-time-local string before sending to backend.
 * Backend (per swagger.yaml) accepts YYYY-MM-DD; HTML <input type="datetime-local">
 * emits YYYY-MM-DDTHH:mm. Pass everything through this at the action boundary.
 */
export function toBackendDate(
  input: string | undefined,
): string | undefined {
  if (input === undefined) return undefined;
  if (input === "") return "";
  return input.split("T")[0] ?? input;
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
bun run test:run src/lib/format.test.ts
```

Expected: PASS — 6 tests, 0 failures.

- [ ] **Step 5: Commit**

```bash
git add src/lib/format.ts src/lib/format.test.ts
git commit -m "feat(lib): toBackendDate helper for YYYY-MM-DD coercion"
```

### Task A.2: Apply `toBackendDate` in events action

**Files:**
- Modify: `src/app/_actions/events.ts`

- [ ] **Step 1: Locate the create + update payload assembly**

Open `src/app/_actions/events.ts`. Search for `createEvent` and `updateEvent`. Both functions take a payload that contains `start_date` and `end_date`.

- [ ] **Step 2: Import the helper**

Add to the imports block (sorted alphabetically with existing imports):

```ts
import { toBackendDate } from "@/lib/format";
```

- [ ] **Step 3: Transform `start_date` / `end_date` before POST in `createEvent`**

Before the action calls `authenticatedApiClient` for POST `/api/v1/events/new`, build a coerced payload:

```ts
const coerced = {
  ...data,
  start_date: toBackendDate(data.start_date),
  end_date: toBackendDate(data.end_date),
};
```

Pass `coerced` (not `data`) to the request body.

- [ ] **Step 4: Same transform in `updateEvent`**

Same pattern in `updateEvent` before PUT `/api/v1/events/{id}`.

- [ ] **Step 5: Type-check**

```bash
bun run type-check
```

Expected: no errors.

- [ ] **Step 6: Smoke test in dev**

```bash
bun run dev
```

Visit `http://localhost:3000/dashboard/events/new`. Fill form, submit. Open DevTools Network → POST `/api/v1/events/new`. Confirm payload `start_date` is `YYYY-MM-DD`, not `YYYY-MM-DDTHH:mm`.

- [ ] **Step 7: Commit**

```bash
git add src/app/_actions/events.ts
git commit -m "fix(events): trim time off start_date/end_date before backend POST/PUT"
```

---

## Phase B — Test coverage

### Task B.1: Tests for `lib/sanitize.ts`

**Files:**
- Create: `src/lib/sanitize.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/lib/sanitize.test.ts`:

```ts
import { describe, expect, it } from "vitest";

import { safeHtml } from "./sanitize";

describe("safeHtml", () => {
  it("returns __html shape", () => {
    const r = safeHtml("<p>hi</p>");
    expect(r).toHaveProperty("__html");
  });

  it("strips <script> tags", () => {
    const r = safeHtml("<p>safe</p><script>alert(1)</script>");
    expect(r.__html).toContain("<p>safe</p>");
    expect(r.__html).not.toContain("<script>");
    expect(r.__html).not.toContain("alert");
  });

  it("preserves safe inline markup", () => {
    const r = safeHtml("<strong>bold</strong> <em>italic</em>");
    expect(r.__html).toContain("<strong>");
    expect(r.__html).toContain("<em>");
  });

  it("handles undefined input", () => {
    expect(safeHtml(undefined).__html).toBe("");
  });

  it("handles null input", () => {
    expect(safeHtml(null).__html).toBe("");
  });

  it("strips inline event handlers", () => {
    const r = safeHtml('<a href="#" onclick="alert(1)">link</a>');
    expect(r.__html).not.toContain("onclick");
  });
});
```

- [ ] **Step 2: Run test, expect pass (characterization test)**

```bash
bun run test:run src/lib/sanitize.test.ts
```

Expected: PASS — `safeHtml` exists and DOMPurify already does the right thing. If any test fails, adjust the test to match real DOMPurify behavior (these are characterization tests for the existing helper, not driving new behavior).

- [ ] **Step 3: Commit**

```bash
git add src/lib/sanitize.test.ts
git commit -m "test(sanitize): characterize safeHtml against DOMPurify"
```

### Task B.2: Tests for `lib/utils/names.ts`

**Files:**
- Create: `src/lib/utils/names.test.ts`

- [ ] **Step 1: Write the test**

Create `src/lib/utils/names.test.ts`:

```ts
import { describe, expect, it } from "vitest";

import { formatUserName, userInitials } from "./names";

describe("formatUserName", () => {
  it("returns empty string for null user", () => {
    expect(formatUserName(null)).toBe("");
  });

  it("returns empty string for undefined user", () => {
    expect(formatUserName(undefined)).toBe("");
  });

  it("formats full variant with title + first + last", () => {
    expect(
      formatUserName(
        { title: "Dr", first_name: "Edward", last_name: "Mwape" },
        "full",
      ),
    ).toBe("Dr. Edward Mwape");
  });

  it("formats formal variant with first initial", () => {
    expect(
      formatUserName(
        { title: "Dr", first_name: "Edward", last_name: "Mwape" },
        "formal",
      ),
    ).toBe("Dr. E. Mwape");
  });

  it("formats greeting with title + last", () => {
    expect(
      formatUserName(
        { title: "Dr", first_name: "Edward", last_name: "Mwape" },
        "greeting",
      ),
    ).toBe("Dr. Mwape");
  });

  it("formats initials from structured fields", () => {
    expect(
      formatUserName(
        { first_name: "Edward", last_name: "Mwape" },
        "initials",
      ),
    ).toBe("EM");
  });

  it("falls back to legacy name field when no first/last", () => {
    expect(formatUserName({ name: "Edward Mwape" }, "full")).toBe(
      "Edward Mwape",
    );
  });

  it("strips honorific from legacy fallback initials", () => {
    expect(formatUserName({ name: "Dr. E. Mwape" }, "initials")).toBe("EM");
  });

  it("handles camelCase aliases firstName / lastName", () => {
    expect(
      formatUserName(
        { firstName: "Edward", lastName: "Mwape" },
        "full",
      ),
    ).toBe("Edward Mwape");
  });

  it("does not append a dot to titles longer than 4 chars", () => {
    expect(
      formatUserName(
        { title: "Professor", first_name: "Edward", last_name: "Mwape" },
        "greeting",
      ),
    ).toBe("Professor Mwape");
  });
});

describe("userInitials", () => {
  it("delegates to formatUserName initials variant", () => {
    expect(userInitials({ first_name: "Anna", last_name: "Banda" })).toBe("AB");
  });

  it("returns empty string for null", () => {
    expect(userInitials(null)).toBe("");
  });
});
```

- [ ] **Step 2: Run test**

```bash
bun run test:run src/lib/utils/names.test.ts
```

Expected: PASS — characterization of existing helper.

- [ ] **Step 3: Commit**

```bash
git add src/lib/utils/names.test.ts
git commit -m "test(utils/names): cover formatUserName variants + fallback paths"
```

### Task B.3: Tests for `lib/utils/index.ts`

**Files:**
- Create: `src/lib/utils/index.test.ts`

- [ ] **Step 1: Write the test**

Create `src/lib/utils/index.test.ts`:

```ts
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
    expect(formatCurrency(1234.56)).toBe("USD 1,234.56");
  });

  it("formats ZMW when given", () => {
    expect(formatCurrency(1234.56, "ZMW")).toBe("ZMW 1,234.56");
  });

  it("returns 0.00 for null", () => {
    expect(formatCurrency(null)).toBe("USD 0.00");
  });

  it("returns 0.00 for undefined", () => {
    expect(formatCurrency(undefined)).toBe("USD 0.00");
  });

  it("always shows two decimals", () => {
    expect(formatCurrency(10)).toBe("USD 10.00");
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
```

- [ ] **Step 2: Run test**

```bash
bun run test:run src/lib/utils/index.test.ts
```

Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/lib/utils/index.test.ts
git commit -m "test(utils): cover cn, capitalize, formatCurrency, random string, initials"
```

### Task B.4: Tests for `lib/currency.ts`

**Files:**
- Create: `src/lib/currency.test.ts`

- [ ] **Step 1: Write the test**

Create `src/lib/currency.test.ts`:

```ts
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
```

- [ ] **Step 2: Run test**

```bash
bun run test:run src/lib/currency.test.ts
```

Expected: PASS — characterization. If `formatCurrency` rounding test mismatches, look at `Intl.NumberFormat` actual output and adjust the regex (some Intl implementations round half-to-even; the regex `1,234\.5[56]` covers both directions).

- [ ] **Step 3: Commit**

```bash
git add src/lib/currency.test.ts
git commit -m "test(currency): cover format, convert, live-rate fallback paths"
```

### Task B.5: Extract JWT helpers to `lib/jwt.ts` for testability

`lib/auth.ts` declares `"use server"` + `import "server-only"` at the top. That makes `encrypt` and `decrypt` un-importable from a Vitest jsdom test (server-only throws on non-server import). Extract the pure JWT helpers to a new file with no server-only contract; have `auth.ts` re-export them.

**Files:**
- Create: `src/lib/jwt.ts`
- Modify: `src/lib/auth.ts`

- [ ] **Step 1: Create `lib/jwt.ts`**

Create `src/lib/jwt.ts`:

```ts
import { SignJWT, jwtVerify } from "jose";

export const getSecretKey = () => {
  const secret =
    process.env.AUTH_SECRET ||
    process.env.JWT_SECRET ||
    "dev-only-secret-change-me-please-32+chars";

  if (!secret || secret.length < 32) {
    throw new Error("AUTH_SECRET must be at least 32 characters");
  }

  return secret;
};

const getKey = () => new TextEncoder().encode(getSecretKey());

export async function encrypt(payload: any, expirationTime: string = "7d") {
  if (!payload || typeof payload !== "object") {
    throw new Error("Payload must be a non-empty object");
  }

  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expirationTime)
    .sign(getKey());
}

export async function decrypt(token: any) {
  if (!token || typeof token !== "string") {
    return { success: false, message: "No session token", data: null };
  }
  if (token.split(".").length !== 3) {
    return { success: false, message: "Invalid token format", data: null };
  }
  try {
    const { payload } = await jwtVerify(token, getKey(), {
      algorithms: ["HS256"],
      clockTolerance: 15,
    });

    return payload;
  } catch (error: any) {
    return {
      success: false,
      message:
        error?.code === "ERR_JWT_EXPIRED"
          ? "Token expired"
          : "Failed to verify session",
      data: null,
    };
  }
}
```

- [ ] **Step 2: Refactor `lib/auth.ts` to re-export**

In `src/lib/auth.ts`, replace the local `getSecretKey`, `getKey`, `encrypt`, `decrypt` block (lines 18-69 in current file) with:

```ts
import { encrypt, decrypt } from "@/lib/jwt";

// re-export so existing call sites keep working
export { encrypt, decrypt };
```

Keep everything else (cookie helpers, `verifySession`, etc.) in place. They already call the local `encrypt` / `decrypt` and now use the re-exported ones.

- [ ] **Step 3: Type-check**

```bash
bun run type-check
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/lib/jwt.ts src/lib/auth.ts
git commit -m "refactor(auth): extract pure JWT helpers to lib/jwt for testability"
```

### Task B.6: Tests for `lib/jwt.ts`

**Files:**
- Create: `src/lib/jwt.test.ts`

- [ ] **Step 1: Write the test**

Create `src/lib/jwt.test.ts`:

```ts
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { decrypt, encrypt, getSecretKey } from "./jwt";

const TEST_SECRET = "test-secret-at-least-32-chars-long-yes";

describe("getSecretKey", () => {
  beforeEach(() => {
    vi.stubEnv("AUTH_SECRET", TEST_SECRET);
  });
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns AUTH_SECRET when set", () => {
    expect(getSecretKey()).toBe(TEST_SECRET);
  });

  it("throws when secret is shorter than 32 chars", () => {
    vi.stubEnv("AUTH_SECRET", "short");
    vi.stubEnv("JWT_SECRET", "");
    expect(() => getSecretKey()).toThrow(/at least 32/);
  });
});

describe("encrypt + decrypt", () => {
  beforeEach(() => {
    vi.stubEnv("AUTH_SECRET", TEST_SECRET);
  });
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("encrypts a payload to a 3-part JWT", async () => {
    const token = await encrypt({ sub: "user-1" });
    expect(token.split(".")).toHaveLength(3);
  });

  it("decrypts back to the original payload", async () => {
    const token = await encrypt({ sub: "user-1", role: "host" });
    const payload = await decrypt(token);
    expect(payload).toMatchObject({ sub: "user-1", role: "host" });
  });

  it("throws when encrypt is called with non-object payload", async () => {
    await expect(encrypt(null as any)).rejects.toThrow();
    await expect(encrypt("string" as any)).rejects.toThrow();
  });

  it("returns failure shape when token is undefined", async () => {
    const r = await decrypt(undefined);
    expect(r).toMatchObject({ success: false, message: "No session token" });
  });

  it("returns failure shape when token is malformed", async () => {
    const r = await decrypt("not-a-jwt");
    expect(r).toMatchObject({ success: false, message: "Invalid token format" });
  });

  it("returns 'Token expired' when JWT is past expiration", async () => {
    const token = await encrypt({ sub: "user-1" }, "1s");
    // Wait for the token to expire (clockTolerance is 15s, so we need to push past it).
    // Faster: stub Date.now() forward.
    const real = Date.now;
    Date.now = () => real() + 30_000;
    try {
      const r = await decrypt(token);
      expect(r).toMatchObject({ success: false, message: "Token expired" });
    } finally {
      Date.now = real;
    }
  });

  it("returns 'Failed to verify' on signature mismatch", async () => {
    const token = await encrypt({ sub: "user-1" });
    vi.stubEnv("AUTH_SECRET", "different-secret-also-32-chars-okay-pad");
    const r = await decrypt(token);
    expect(r).toMatchObject({
      success: false,
      message: "Failed to verify session",
    });
  });
});
```

- [ ] **Step 2: Run test**

```bash
bun run test:run src/lib/jwt.test.ts
```

Expected: PASS — 9 tests.

- [ ] **Step 3: Run full suite to confirm nothing else broke**

```bash
bun run test:run
```

Expected: all tests pass (existing `response-helpers.test.ts` + every new file).

- [ ] **Step 4: Commit**

```bash
git add src/lib/jwt.test.ts
git commit -m "test(jwt): cover encrypt/decrypt happy path, expiry, malformed, signature mismatch"
```

---

## Phase C — PWA Phase 2 polish

### Task C.1: Install bundle analyzer

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install dev dep**

```bash
bun add -d @next/bundle-analyzer cross-env
```

`cross-env` so the `analyze` script works on Windows PowerShell as well as POSIX.

- [ ] **Step 2: Add `analyze` script**

Open `package.json`. Inside `scripts`, add:

```json
"analyze": "cross-env ANALYZE=true bun run build"
```

- [ ] **Step 3: Verify install**

```bash
bun pm ls @next/bundle-analyzer
```

Expected: prints `@next/bundle-analyzer@x.y.z`.

- [ ] **Step 4: Commit**

```bash
git add package.json bun.lock
git commit -m "chore(pwa): add @next/bundle-analyzer + cross-env"
```

### Task C.2: Wire analyzer + extend optimizePackageImports

**Files:**
- Modify: `next.config.ts`

- [ ] **Step 1: Replace the file**

Open `next.config.ts`. Replace the full content with:

```ts
import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";
import withBundleAnalyzer from "@next/bundle-analyzer";

const withSerwist = withSerwistInit({
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
  cacheOnNavigation: true,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === "development",
});

const analyze = withBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "imagekit.io",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "ik.imagekit.io",
        port: "",
        pathname: "/**",
      },
    ],
  },
  turbopack: {
    rules: {
      "*.svg": {
        loaders: ["@svgr/webpack"],
        as: "*.js",
      },
    },
  },

  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "date-fns",
      "recharts",
      "framer-motion",
      "@radix-ui/react-icons",
      "cmdk",
      "@hookform/resolvers",
      "zod",
      "react-hook-form",
    ],
  },

  typescript: {
    ignoreBuildErrors: true,
  },
};

export default analyze(withSerwist(nextConfig));
```

- [ ] **Step 2: Type-check**

```bash
bun run type-check
```

Expected: no errors.

- [ ] **Step 3: Smoke build (no analyze flag)**

```bash
bun run build
```

Expected: build completes. Note the Route table First Load JS for `/dashboard`, `/dashboard/events/new`, `/i/[id]` — write down the numbers, you'll compare after Task C.3.

- [ ] **Step 4: Commit**

```bash
git add next.config.ts
git commit -m "perf(pwa): wire bundle analyzer, expand optimizePackageImports"
```

### Task C.3: Dynamic-import `rich-text-modal`

`rich-text-modal.tsx` pulls EditorJS (~150kB). It's only used in event/invitation forms, never on landing or auth. Wrap behind `next/dynamic({ ssr: false })`.

**Files:**
- Rename: `src/components/base/rich-text-modal.tsx` → `src/components/base/rich-text-modal-impl.tsx`
- Create: `src/components/base/rich-text-modal.tsx` (new wrapper)

- [ ] **Step 1: Rename the existing file**

```bash
git mv src/components/base/rich-text-modal.tsx src/components/base/rich-text-modal-impl.tsx
```

- [ ] **Step 2: Create the wrapper**

Create `src/components/base/rich-text-modal.tsx`:

```tsx
"use client";

import dynamic from "next/dynamic";

import type { ComponentProps } from "react";

import type RichTextModalImpl from "./rich-text-modal-impl";

const RichTextModal = dynamic(() => import("./rich-text-modal-impl"), {
  ssr: false,
  loading: () => null,
});

export default RichTextModal;
export type RichTextModalProps = ComponentProps<typeof RichTextModalImpl>;
```

- [ ] **Step 3: Confirm `rich-text-modal-impl.tsx` exports default**

```bash
head -1 src/components/base/rich-text-modal-impl.tsx
```

Expected: `"use client";` at the top, `export default function RichTextModal(...)` lower in the file. If the export was named not default, also update the wrapper's `import("./rich-text-modal-impl")` callback to pick the named export: `() => import("./rich-text-modal-impl").then(m => m.RichTextModal)`.

- [ ] **Step 4: Type-check**

```bash
bun run type-check
```

Expected: no errors.

- [ ] **Step 5: Smoke test in dev**

```bash
bun run dev
```

Visit `/dashboard/events/new`. Open the rich-text editor (description / theme / wherever it's bound). Confirm the modal opens, EditorJS renders, you can type. Close, reopen, no console errors.

- [ ] **Step 6: Build + compare bundle**

```bash
bun run build
```

Compare First Load JS for routes that use the editor (`/dashboard/events/new`, edit pages, invitations). Expected: drop on those routes, no change on landing/auth.

- [ ] **Step 7: Commit**

```bash
git add src/components/base/rich-text-modal.tsx src/components/base/rich-text-modal-impl.tsx
git commit -m "perf(editor): dynamic-import EditorJS to defer ~150kB off initial bundle"
```

### Task C.4: Resource hints in root layout

**Files:**
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Find the `<head>` block**

Open `src/app/layout.tsx`. Locate the `<head>` element (or the `metadata` export — Next 16 prefers `metadata.other` for arbitrary `<link>`s, but `<head>` literal works in App Router too).

- [ ] **Step 2: Add the hints inside `<head>`**

Inside the `<head>` block, add:

```tsx
<link
  rel="dns-prefetch"
  href={process.env.NEXT_PUBLIC_API_HOST ?? ""}
/>
<link rel="preconnect" href="https://ik.imagekit.io" crossOrigin="anonymous" />
<link rel="dns-prefetch" href="https://ik.imagekit.io" />
```

If the layout has no `<head>` block (Next 16 RSC layouts often don't), add a `head.tsx` sibling next to `layout.tsx`:

Create `src/app/head.tsx`:

```tsx
export default function Head() {
  return (
    <>
      <link
        rel="dns-prefetch"
        href={process.env.NEXT_PUBLIC_API_HOST ?? ""}
      />
      <link
        rel="preconnect"
        href="https://ik.imagekit.io"
        crossOrigin="anonymous"
      />
      <link rel="dns-prefetch" href="https://ik.imagekit.io" />
    </>
  );
}
```

(Pick whichever path matches the existing layout's structure.)

- [ ] **Step 3: Type-check**

```bash
bun run type-check
```

Expected: no errors.

- [ ] **Step 4: Smoke test**

```bash
bun run dev
```

Visit `/`. View page source — confirm the `<link rel="dns-prefetch">` and `<link rel="preconnect">` tags are present in the rendered HTML.

- [ ] **Step 5: Commit**

```bash
git add src/app/layout.tsx src/app/head.tsx
git commit -m "perf(html): dns-prefetch + preconnect for API host and ImageKit"
```

### Task C.5: One pass of analyzer

**Files:** none — diagnostic only.

- [ ] **Step 1: Run analyzer**

```bash
bun run analyze
```

Expected: build completes; the analyzer opens HTML treemap reports in the browser (or writes them to `.next/analyze/`).

- [ ] **Step 2: Eyeball client.html and node.html**

Look for unexpected large packages. Anything > 100kB on any client route deserves a question. Note findings (no commit needed — this is a diagnostic).

If a glaring issue surfaces, append a follow-up task to the plan or open an issue. Don't gold-plate; the goal is awareness, not exhaustive optimization.

---

## Phase D — Public RSVP form harden

### Task D.1: Document the env flag

**Files:**
- Modify: `.env.example` (create if missing)

- [ ] **Step 1: Check if `.env.example` exists**

```bash
ls .env.example 2>&1
```

If it exists, open it. If not, create it.

- [ ] **Step 2: Add the flag**

Append to `.env.example`:

```env
# Public-facing RSVP form. Off by default — set to "true" once the backend ships
# POST /api/v1/public/guests/{token}/rsvp.
NEXT_PUBLIC_ENABLE_PUBLIC_RSVP=false
```

- [ ] **Step 3: Commit**

```bash
git add .env.example
git commit -m "docs(env): document NEXT_PUBLIC_ENABLE_PUBLIC_RSVP flag"
```

### Task D.2: Public RSVP server action

**Files:**
- Create: `src/app/_actions/public.ts`

- [ ] **Step 1: Inspect existing API client shape**

Open `src/app/_actions/api-config.ts`. Note:
- The exported authenticated client name (e.g. `authenticatedApiClient`).
- Whether an unauthenticated client exists (likely `apiClient` or similar). If not, you'll create a tiny one inline.
- The shape of `fromBackend` and `handleError` for response normalization.

- [ ] **Step 2: Create the action**

Create `src/app/_actions/public.ts`:

```ts
"use server";

import type { APIResponse } from "@/types";

import { fromBackend, handleError } from "./api-config";

const BASE_URL = process.env.NEXT_PUBLIC_API_HOST ?? "http://localhost:4000";

export type PublicRsvpStatus = "confirmed" | "declined";

export type PublicRsvpPayload = {
  rsvp_status: PublicRsvpStatus;
  guest_count?: number;
  note?: string;
};

/**
 * Submit a guest's RSVP without authentication. Used from the public /i/[id]
 * page once the backend ships POST /api/v1/public/guests/{token}/rsvp.
 *
 * Token comes from the magic-link the guest received. Shape is currently
 * assumed to be opaque string in `?t=` query — confirm with backend before
 * promoting this beyond the feature flag.
 */
export async function submitPublicRsvp(
  token: string,
  payload: PublicRsvpPayload,
): Promise<APIResponse<null>> {
  if (!token) {
    return { success: false, message: "Missing invitation token", data: null };
  }
  if (!payload?.rsvp_status) {
    return { success: false, message: "RSVP status required", data: null };
  }

  const url = `/api/v1/public/guests/${encodeURIComponent(token)}/rsvp`;
  try {
    const res = await fetch(`${BASE_URL}${url}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store",
    });
    const data = await res.json().catch(() => ({}));
    return fromBackend<null>({ data });
  } catch (error: any) {
    return handleError(error, "POST", url);
  }
}
```

- [ ] **Step 3: Type-check**

```bash
bun run type-check
```

Expected: no errors. If `fromBackend` / `handleError` need a different argument shape, adjust the call to match `api-config.ts`.

- [ ] **Step 4: Commit**

```bash
git add src/app/_actions/public.ts
git commit -m "feat(public): submitPublicRsvp action stub for future backend endpoint"
```

### Task D.3: RSVP form component

**Files:**
- Create: `src/app/(public)/i/[id]/_components/rsvp-form.tsx`

- [ ] **Step 1: Create the component**

Create `src/app/(public)/i/[id]/_components/rsvp-form.tsx`:

```tsx
"use client";

import { useState, useTransition } from "react";

import { toast } from "sonner";

import {
  submitPublicRsvp,
  type PublicRsvpStatus,
} from "@/app/_actions/public";

export default function RsvpForm({ token }: { token: string }) {
  const [status, setStatus] = useState<PublicRsvpStatus | null>(null);
  const [guestCount, setGuestCount] = useState<number>(1);
  const [note, setNote] = useState("");
  const [pending, startTransition] = useTransition();
  const [done, setDone] = useState(false);

  function submit(next: PublicRsvpStatus) {
    setStatus(next);
    startTransition(async () => {
      const result = await submitPublicRsvp(token, {
        rsvp_status: next,
        guest_count: next === "confirmed" ? guestCount : undefined,
        note: note.trim() || undefined,
      });
      if (result.success) {
        setDone(true);
        toast.success("Reply received", {
          description:
            next === "confirmed"
              ? "Thank you — we'll see you there."
              : "Noted — your absence will be missed.",
        });
      } else {
        toast.error("Could not send your reply", {
          description: result.message ?? "Please try again in a moment.",
        });
      }
    });
  }

  if (done) {
    return (
      <div className="rounded-3xl border border-hairline bg-surface/60 p-12 text-center">
        <p className="font-display text-2xl italic text-foreground/80">
          Reply received.
        </p>
        <p className="mt-3 text-sm italic text-mute">
          Refresh this page if you need to change it.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-hairline bg-surface/60 p-12">
      <p className="font-brand text-center text-xs uppercase tracking-[0.42em] text-mute">
        Kindly respond
      </p>
      <p className="font-display mt-4 text-center text-2xl italic text-foreground/80">
        Will you join us?
      </p>

      <div className="mt-8 grid grid-cols-2 gap-3">
        <button
          type="button"
          disabled={pending}
          onClick={() => submit("confirmed")}
          className="rounded-full border border-foreground bg-foreground px-5 py-3 text-sm font-medium text-background transition disabled:opacity-50 hover:opacity-90"
        >
          {pending && status === "confirmed" ? "Sending…" : "Joyfully accept"}
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => submit("declined")}
          className="rounded-full border border-foreground/30 bg-transparent px-5 py-3 text-sm font-medium text-foreground transition disabled:opacity-50 hover:border-foreground"
        >
          {pending && status === "declined" ? "Sending…" : "Regretfully decline"}
        </button>
      </div>

      <div className="mt-8 grid gap-4">
        <label className="grid gap-2">
          <span className="font-brand text-xs uppercase tracking-[0.32em] text-mute">
            Number attending
          </span>
          <input
            type="number"
            min={1}
            max={10}
            value={guestCount}
            onChange={(e) => setGuestCount(Number(e.target.value) || 1)}
            disabled={pending}
            className="rounded-2xl border border-hairline bg-background px-4 py-3 text-base"
          />
        </label>
        <label className="grid gap-2">
          <span className="font-brand text-xs uppercase tracking-[0.32em] text-mute">
            Note to host (optional)
          </span>
          <textarea
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            disabled={pending}
            placeholder="A line or two…"
            className="rounded-2xl border border-hairline bg-background px-4 py-3 text-base"
          />
        </label>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Type-check**

```bash
bun run type-check
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/app/\(public\)/i/\[id\]/_components/rsvp-form.tsx
git commit -m "feat(public): RsvpForm component (gated, posts to public action)"
```

### Task D.4: Wire flag into `public-event.tsx`

**Files:**
- Modify: `src/app/(public)/i/[id]/_components/public-event.tsx`
- Modify: `src/app/(public)/i/[id]/page.tsx` (to read the token from query)

- [ ] **Step 1: Pass the token down to `PublicEvent`**

Open `src/app/(public)/i/[id]/page.tsx`. Update the page to read `?t=` from `searchParams`:

```tsx
export default async function PublicEventPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ t?: string }>;
}) {
  const { id } = await params;
  const { t: token } = await searchParams;
  // ...existing fetch logic...
  return (
    <PublicEvent
      event={evt.data}
      sessions={sessions.success ? (sessions.data ?? []) : []}
      token={token ?? null}
    />
  );
}
```

If the existing page doesn't already destructure `searchParams`, add the parameter and the fetch destructuring as shown.

- [ ] **Step 2: Accept `token` in `PublicEvent` props**

Open `src/app/(public)/i/[id]/_components/public-event.tsx`. Update the props type:

```tsx
export default function PublicEvent({
  event,
  sessions,
  token,
}: {
  event: EventRecord;
  sessions: EventSession[];
  token: string | null;
}) {
  // ...existing body...
}
```

- [ ] **Step 3: Replace the placeholder block with conditional form**

Inside `public-event.tsx`, find the `<motion.section>` that currently renders the "Look out for your invitation" copy (the `else` branch where `acceptingRsvp && !cancelled`). Replace its content with:

```tsx
{event.status === "cancelled" ? (
  <p className="font-display text-2xl italic text-foreground/70">
    This event has been cancelled.
  </p>
) : !acceptingRsvp ? (
  <>
    <p className="font-display text-2xl italic text-foreground/70">
      RSVP is closed.
    </p>
    {event.rsvp_deadline && (
      <p className="font-brand mt-3 text-xs uppercase tracking-[0.32em] text-mute">
        Deadline passed{" "}
        {format(new Date(event.rsvp_deadline), "MMMM d, yyyy")}
      </p>
    )}
  </>
) : flagOn && token ? (
  <RsvpForm token={token} />
) : (
  <>
    <p className="font-brand text-xs uppercase tracking-[0.42em] text-mute">
      Kindly respond
    </p>
    <p className="font-display mt-4 text-2xl italic text-foreground/80">
      Look out for your invitation by email, SMS, or WhatsApp.
    </p>
    <p className="mt-3 text-sm italic text-mute">
      Replies are recorded once you receive your personal link.
    </p>
  </>
)}
```

Add the imports + flag at the top of the file:

```tsx
import RsvpForm from "./rsvp-form";

const flagOn = process.env.NEXT_PUBLIC_ENABLE_PUBLIC_RSVP === "true";
```

When the flag is on AND the URL has `?t=...`, render the form. Otherwise the existing "look out for your invitation" placeholder stays.

- [ ] **Step 4: Type-check**

```bash
bun run type-check
```

Expected: no errors.

- [ ] **Step 5: Smoke test (flag off)**

```bash
bun run dev
```

Visit `http://localhost:3000/i/<some-event-id>` (no `?t=`). Expected: existing "look out for your invitation" copy. Visit `?t=demo-token`. Still placeholder (flag off).

- [ ] **Step 6: Smoke test (flag on)**

Stop the dev server. Set the env var and restart:

PowerShell:
```powershell
$env:NEXT_PUBLIC_ENABLE_PUBLIC_RSVP = "true" ; bun run dev
```

Bash:
```bash
NEXT_PUBLIC_ENABLE_PUBLIC_RSVP=true bun run dev
```

Visit `/i/<id>?t=demo-token`. Expected: RSVP form renders. Click "Joyfully accept" — expect a 404 toast (backend has no endpoint), confirming the wiring works end-to-end.

Visit `/i/<id>` (no `?t=`). Expected: still the placeholder copy — token absent, flag respected.

- [ ] **Step 7: Commit**

```bash
git add src/app/\(public\)/i/\[id\]/page.tsx src/app/\(public\)/i/\[id\]/_components/public-event.tsx
git commit -m "feat(public): flag-gated RSVP form on /i/[id], threads token from ?t="
```

---

## Phase E — Final verification

### Task E.1: Full test + type + build pass

**Files:** none.

- [ ] **Step 1: Tests**

```bash
bun run test:run
```

Expected: all suites pass — `response-helpers.test.ts`, `format.test.ts`, `sanitize.test.ts`, `utils/names.test.ts`, `utils/index.test.ts`, `currency.test.ts`, `jwt.test.ts`. No failures.

- [ ] **Step 2: Type-check**

```bash
bun run type-check
```

Expected: no errors.

- [ ] **Step 3: Production build**

```bash
bun run build
```

Expected: build completes. Eyeball the route table — `/dashboard/events/new` and edit pages should show smaller First Load JS than the baseline noted in Task C.2.

- [ ] **Step 4: Lint**

```bash
bun run lint
```

Expected: no errors. Fix any new ones (most likely import-order or unused-import on the new files).

- [ ] **Step 5: Commit any lint fixups**

If lint changes anything:

```bash
git add -A
git commit -m "chore(lint): fixups after gap closures"
```

### Task E.2: Update BACKEND_PENDING.md

**Files:**
- Modify: `docs/BACKEND_PENDING.md`

- [ ] **Step 1: Update the public-RSVP section**

Open `docs/BACKEND_PENDING.md`. The "⚠ No public RSVP endpoint" section currently says the public page shows a "look out for your invitation" placeholder. Update to reflect the new state:

```markdown
## ⚠ No public RSVP endpoint

Swagger does not document a public RSVP submission endpoint. RSVP is recorded
via authenticated `PUT /api/v1/guests/{guestId}` with `{ rsvp_status }`.

Frontend status (2026-05-09): `src/app/_actions/public.ts` posts to the
**assumed** path `POST /api/v1/public/guests/{token}/rsvp` behind feature flag
`NEXT_PUBLIC_ENABLE_PUBLIC_RSVP`. Default off — flip to `true` once backend
confirms the endpoint shape.

Token transport currently assumed to be `?t=<opaque>`. If backend chooses
path-bound (`/i/<token>`), update the action + page accordingly.
```

Also update the "Schema notes" section to note that frontend now coerces:

```markdown
- `start_date` / `end_date` accepted as `YYYY-MM-DD` per swagger examples.
  Frontend `_actions/events.ts` calls `toBackendDate()` on both fields before
  POST/PUT, so the form's `datetime-local` input always reaches the backend
  as `YYYY-MM-DD` (time component dropped).
```

- [ ] **Step 2: Update audit date**

Change the line near the top from `Last audit: 2026-05-07.` to `Last audit: 2026-05-09.`.

- [ ] **Step 3: Commit**

```bash
git add docs/BACKEND_PENDING.md
git commit -m "docs(backend-pending): note date coercion + flag-gated public RSVP"
```

---

## Out of scope (intentionally deferred)

- PWA Phase 3 push notifications — needs backend VAPID + subscription endpoints.
- PWA Phase 4 share target / file handlers / periodic background sync.
- UI integration tests — pure-helper TDD only, per the project's existing posture.
- Refactor of `lib/auth.ts` cookie helpers (extract beyond what Task B.5 already did).
- Live backend wiring of public RSVP — blocked on backend endpoint shape confirmation.

## Self-review checklist

- [ ] Every task's "Files" block lists exact paths.
- [ ] Every code step contains the actual code, not "implement here".
- [ ] Every commit step has a message in Conventional Commits form.
- [ ] Function/method names referenced in later tasks (e.g. `toBackendDate`, `submitPublicRsvp`, `RsvpForm`) match the names used at definition.
- [ ] No "Similar to Task N" — each task self-contained.
- [ ] Each phase ends green: type-check + commit.
- [ ] Spec coverage: A→fix, B→tests, C→PWA polish, D→public RSVP, E→verification. All four spec phases mapped.
