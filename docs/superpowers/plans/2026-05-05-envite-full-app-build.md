# e-nvite Full App Build — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a fully operational e-nvite app — auth, events, event sessions, invitations, guests + RSVP — wired SSR-first to the Envite backend, layered as Server Action → Hook → UI.

**Architecture:**
- Next 16 App Router. SSR-first: server components call server actions, prefetch data, and pass `initialData` to client `useQuery` hooks.
- Server Action → Hook → UI everywhere. Mutations go through `useMutation` hooks that wrap server actions and `revalidateTag` server-side caches.
- API client lives in `src/app/_actions/api-config.ts` (pattern lifted from edusync). Pure-function helpers live in `src/lib/`.
- Caching: Next `next.tags`/`revalidateTag` server-side, react-query keys client-side. Both share a single source of truth (`CACHE_TAGS` ↔ `*_KEYS`).

**Tech Stack:**
- Next 16.2.x · React 19.2.x · TypeScript 5.x · Tailwind v4 · framer-motion
- @tanstack/react-query 5.x · jose · sonner · react-hook-form + zod
- Vitest (unit) for pure helpers · manual smoke test for UI
- Package manager: **bun**

**Backend contract (from Postman collection):**
- `baseURL`: `http://localhost:4000`
- All payloads + responses are **snake_case**
- Auth header: `Authorization: Bearer <jwt>`. Token returned in login body. **No refresh-token endpoint** in the collection — simplify auth (no silent refresh) and revisit if backend adds it.

**Routes mapped:**
| Domain | Method | Path |
|---|---|---|
| User | POST | `/api/v1/user/registration` |
| User | POST | `/api/v1/user/authentication` |
| User | POST | `/api/v1/user/password/reset` |
| User | GET  | `/api/v1/user/profile` |
| User | PATCH | `/api/v1/user/profile` |
| User | PATCH | `/api/v1/user/password` |
| Event Type | GET  | `/api/v1/event-type/list` |
| Event Type | GET  | `/api/v1/event-type/:id/details` |
| Event Type | POST | `/api/v1/event-type/new` |
| Events | POST | `/api/v1/events/new` |
| Events | PUT  | `/api/v1/events/:id` |
| Events | DELETE | `/api/v1/events/:id` |
| Events | PATCH | `/api/v1/events/:id` (cancel) |
| Events | GET  | `/api/v1/events/whole-list` (admin/all) |
| Events | GET  | `/api/v1/events/list` (current user) |
| Events | GET  | `/api/v1/events/:id` |
| Sessions | POST | `/api/v1/event-sessions/:event_id` |
| Sessions | PUT  | `/api/v1/event-sessions/:id` |
| Sessions | DELETE | `/api/v1/event-sessions/:id?hard_delete=true` |
| Sessions | GET  | `/api/v1/event-sessions/:id` |
| Sessions | GET  | `/api/v1/event-sessions/:event_id/list` |
| Invitations | POST | `/api/v1/invitations/:event_id` |
| Invitations | GET  | `/api/v1/invitations/:event_id/list` |
| Invitations | GET  | `/api/v1/invitations/:id` |
| Invitations | PUT  | `/api/v1/invitations/:id` |
| Invitations | DELETE | `/api/v1/invitations/:id` |
| Guests | TBD by backend | placeholder for now |

**TDD posture (deliberate, pragmatic):**
The skill is rigid about TDD. For UI/integration work, full TDD is wasteful — we'd write redundant tests against UI scaffolding that exists for design, not behaviour. Compromise:
- **TDD strictly required** for: pure helpers (`fromBackend`, `handleError`, validators, mappers, format utilities, JWT helpers).
- **Smoke verification** for: server actions (run via dev server + curl/devtools), pages (visual check + type-check).
- **Type-check** is the safety net everywhere: every task ends with `bun run type-check`.

**Working directory note:** Plan assumes execution in a git worktree (per the writing-plans skill recommendation). If running on `main`, branch first: `git checkout -b feat/full-app-build`.

---

## Phase 0 — Toolchain bump

Bring deps + tooling in line with edusync (Next 16, vitest, bun) before touching the API layer. Each task ends with the project still booting on `bun run dev`.

### Task 0.1: Switch to bun + install deps

**Files:**
- Modify: `package.json`
- Verify: `bun.lock`

- [ ] **Step 1: Inspect current state**

```bash
ls bun.lock
cat package.json | head -10
```
Expected: `bun.lock` exists; `package.json` has `next` `^15.3.5`.

- [ ] **Step 2: Bump core deps (Next 16, React 19.2, query 5.90)**

Open `package.json`. Replace these versions:
```jsonc
{
  "scripts": {
    "dev": "next dev --turbo",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit",
    "type-check:watch": "tsc --noEmit --watch",
    "test": "vitest",
    "test:run": "vitest run"
  },
  "dependencies": {
    "next": "^16.2.4",
    "react": "19.2.4",
    "react-dom": "19.2.4",
    "@tanstack/react-query": "^5.90.5",
    "@tanstack/react-query-devtools": "^5.90.2",
    "@hookform/resolvers": "^5.2.2",
    "react-hook-form": "^7.58.1",
    "zod": "^3.25.76"
  },
  "devDependencies": {
    "@types/react": "19.2.11",
    "@types/react-dom": "19.2.3",
    "@types/node": "^24",
    "typescript": "^5.8.3",
    "vitest": "^4.1.2",
    "@vitest/ui": "^4.1.2",
    "@vitejs/plugin-react": "^6.0.1",
    "@testing-library/jest-dom": "^6.9.1",
    "@testing-library/react": "^16.3.2",
    "jsdom": "^29.0.1",
    "eslint": "^9.29.0",
    "eslint-config-next": "16.1.6"
  }
}
```
Drop legacy axios entry from `dependencies` if still present (we use native fetch).

- [ ] **Step 3: Install via bun**

```bash
bun install
```
Expected: lockfile resolves, no peer-dep errors that block install.

- [ ] **Step 4: Boot dev server**

```bash
bun run dev
```
Expected: `Local: http://localhost:3000` printed. Open `/` — current landing page renders. Stop server with Ctrl-C.

- [ ] **Step 5: Commit**

```bash
git add package.json bun.lock
git commit -m "chore: bump to next 16, react 19.2, add vitest deps"
```

### Task 0.2: Add Vitest config

**Files:**
- Create: `vitest.config.ts`
- Create: `src/test/setup.ts`
- Modify: `tsconfig.json`

- [ ] **Step 1: Write vitest config**

Create `vitest.config.ts`:
```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["src/test/setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});
```

- [ ] **Step 2: Write test setup**

Create `src/test/setup.ts`:
```ts
import "@testing-library/jest-dom/vitest";
```

- [ ] **Step 3: Add vitest types to tsconfig**

In `tsconfig.json` `compilerOptions.types`, ensure:
```json
"types": ["vitest/globals", "@testing-library/jest-dom"]
```
If `types` not present, add it. Also ensure `"include"` covers `src/test`.

- [ ] **Step 4: Run vitest with no tests**

```bash
bun run test:run
```
Expected: "No test files found" (exit 0 or non-fatal). Confirms vitest is discoverable.

- [ ] **Step 5: Commit**

```bash
git add vitest.config.ts src/test/setup.ts tsconfig.json
git commit -m "chore: add vitest config"
```

### Task 0.3: Set up env

**Files:**
- Create: `.env.local` (gitignored — do not commit secrets)
- Modify: `.env.example` (create if missing)

- [ ] **Step 1: Confirm `.env.local` is gitignored**

```bash
grep -q "^\.env\.local$" .gitignore || echo ".env.local" >> .gitignore
```

- [ ] **Step 2: Write `.env.example`**

Create `.env.example`:
```
# Backend API base URL (server-side fetch). Used by src/app/_actions/api-config.ts
BASE_URL=http://localhost:4000

# JWT signing secret for the server-side session cookie. Must be >= 32 chars.
AUTH_SECRET=replace-me-with-32-or-more-random-characters-please

# Public site URL (used by metadata + sitemap)
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

- [ ] **Step 3: Create local copy**

```bash
cp .env.example .env.local
```
Manually edit `.env.local` to set `AUTH_SECRET` to a real 32+ char value (e.g. `openssl rand -base64 48`).

- [ ] **Step 4: Verify dev server still boots**

```bash
bun run dev
```
Open `/`, verify the page renders with no env errors. Stop server.

- [ ] **Step 5: Commit (example file only)**

```bash
git add .env.example .gitignore
git commit -m "chore: document env vars"
```

---

## Phase 1 — API client alignment to backend

Adjust the in-place edusync-pattern client to the real Envite backend (snake_case payloads, `localhost:4000`, no refresh-token endpoint).

### Task 1.1: Align types to snake_case backend

**Files:**
- Modify: `src/types/index.ts`

- [ ] **Step 1: Write type definitions**

Replace the `// ─── Domain ───` block in `src/types/index.ts` with:
```ts
// ─── Domain (snake_case, matches backend) ──────────────────────────────────
export type EventStatus = "draft" | "published" | "cancelled";

export type EventType = {
  id: string;
  name: string;
  description?: string;
  icon_url?: string;
  price_per_invitation?: number;
  max_free_invitations?: number;
  created_at?: string;
  updated_at?: string;
};

export type EventRecord = {
  id: string;
  event_type_id: string;
  user_id?: string;
  title: string;
  description?: string;
  theme?: string;
  dress_code?: string;
  venue?: string;
  venue_address?: string;
  venue_map_pin?: string;
  start_date: string;
  end_date?: string;
  rsvp_deadline?: string;
  max_attendees?: number;
  special_instructions?: string;
  dietary_restrictions_note?: string;
  parking_info?: string;
  contact_person?: string;
  contact_phone?: string;
  contact_email?: string;
  requires_rsvp?: boolean;
  is_multi_day?: boolean;
  duration_days?: number;
  banner_url?: string;
  status: EventStatus;
  created_at?: string;
  updated_at?: string;
};

export type EventSession = {
  id: string;
  event_id: string;
  session_name: string;
  description?: string;
  session_date: string;
  start_time: string;
  end_time?: string;
  venue?: string;
  venue_address?: string;
  dress_code?: string;
  max_attendees?: number;
  special_notes?: string;
  session_order: number;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
};

export type Invitation = {
  id: string;
  event_id: string;
  invitation_type: string;
  custom_image_url?: string;
  sessions: string[]; // session ids
  share_url?: string;
  status?: "draft" | "published" | "archived";
  created_at?: string;
  updated_at?: string;
};

export type RsvpStatus = "pending" | "going" | "maybe" | "declined";

export type Guest = {
  id: string;
  event_id: string;
  invitation_id?: string;
  name: string;
  email?: string;
  phone?: string;
  rsvp: RsvpStatus;
  plus_ones?: number;
  group?: string;
  notes?: string;
  invited_at?: string;
  responded_at?: string;
};
```

Also replace `AuthUser` with snake_case primary fields:
```ts
export type AuthUser = {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  avatar_url?: string;
  role?: UserRole;
  is_verified?: boolean;
  created_at?: string;
  updated_at?: string;
  last_login?: string;
};
```

Drop the legacy shopify-ish `Order` type if not used. Quick check first:
```bash
grep -rn "import.*Order.*from.*@/types" src
```
If no results, delete `Order`/`OrderItem` from `src/types/index.ts`. If hits exist, keep.

- [ ] **Step 2: Run type-check**

```bash
bun run type-check
```
Expected: errors only in files that referenced old camelCase fields (will fix in subsequent tasks).

- [ ] **Step 3: Commit**

```bash
git add src/types/index.ts
git commit -m "refactor(types): switch domain types to snake_case backend shape"
```

### Task 1.2: Test fromBackend handles real backend response

**Files:**
- Create: `src/lib/response-helpers.test.ts`
- Modify: `src/lib/response-helpers.ts`

- [ ] **Step 1: Write failing test**

Create `src/lib/response-helpers.test.ts`:
```ts
import { describe, expect, it } from "vitest";
import { fromBackend, handleError } from "./response-helpers";

describe("fromBackend", () => {
  it("preserves backend success flag", () => {
    const result = fromBackend({
      data: { success: true, message: "ok", data: { id: "1" } },
    });
    expect(result.success).toBe(true);
    expect(result.data).toEqual({ id: "1" });
    expect(result.message).toBe("ok");
  });

  it("normalises pagination camel + snake aliases", () => {
    const result = fromBackend({
      data: {
        success: true,
        data: [],
        pagination: {
          page: 1,
          pageSize: 20,
          totalPages: 5,
          total: 100,
          hasNext: true,
          hasPrev: false,
        },
      },
    });
    expect(result.pagination?.page_size).toBe(20);
    expect(result.pagination?.total_pages).toBe(5);
    expect(result.pagination?.totalCount).toBe(100);
    expect(result.pagination?.has_next).toBe(true);
    expect(result.pagination?.hasPrev).toBe(false);
  });

  it("falls back to success=false when backend omits flag", () => {
    const result = fromBackend({ data: { data: null } });
    expect(result.success).toBe(false);
  });
});

describe("handleError", () => {
  it("returns 401 message verbatim", () => {
    const r = handleError(
      { response: { status: 401, data: { message: "Token expired" } } },
      "GET",
      "/x",
    );
    expect(r.success).toBe(false);
    expect(r.message).toBe("Token expired");
  });

  it("rethrows NEXT_REDIRECT digests", () => {
    expect(() =>
      handleError({ digest: "NEXT_REDIRECT;..." }, "GET", "/x"),
    ).toThrow();
  });
});
```

- [ ] **Step 2: Run — should pass already**

```bash
bun run test:run -- response-helpers
```
Expected: PASS (helpers were written in earlier session).

If they fail, fix `src/lib/response-helpers.ts` to satisfy the cases. The current implementation should pass — if not, the test exposed a real bug.

- [ ] **Step 3: Commit**

```bash
git add src/lib/response-helpers.test.ts
git commit -m "test: cover fromBackend + handleError edge cases"
```

### Task 1.3: Default BASE_URL to `localhost:4000` and drop refresh-token logic

**Files:**
- Modify: `src/app/_actions/api-config.ts`

- [ ] **Step 1: Update default base URL**

Open `src/app/_actions/api-config.ts`. Find:
```ts
const BASE_URL =
  process.env.BASE_URL ||
  process.env.NEXT_PUBLIC_SERVER_URL ||
  "http://localhost:8080";
```
Replace with:
```ts
const BASE_URL =
  process.env.BASE_URL ||
  process.env.NEXT_PUBLIC_SERVER_URL ||
  "http://localhost:4000";
```

- [ ] **Step 2: Remove silentRefresh + 401 retry**

In the same file, delete the entire `silentRefresh` function and its references inside `authenticatedApiClient`. Replace `authenticatedApiClient` body with:
```ts
const authenticatedApiClient = async (
  reqConfig: RequestType,
): Promise<FetchResponse> => {
  const { isAuthenticated, session } = await verifySession();

  if (!isAuthenticated || !session?.access_token) {
    throw {
      response: { status: 401, data: { message: "No valid session" } },
      status: 401,
      message: "No valid session",
    };
  }

  const headers: Record<string, string> = {
    "Content-Type": reqConfig.contentType || "application/json",
    Authorization: `Bearer ${session.access_token}`,
  };

  return await request({
    method: "GET",
    ...reqConfig,
    headers: { ...headers, ...reqConfig.headers },
  });
};
```
Drop the now-unused `updateAuthSession` import.

- [ ] **Step 3: Type-check**

```bash
bun run type-check
```
Expected: clean (or only pre-existing errors from Task 1.1 fallout — those get fixed below).

- [ ] **Step 4: Smoke test**

```bash
bun run dev
```
Open `/`. Landing page renders. Stop server.

- [ ] **Step 5: Commit**

```bash
git add src/app/_actions/api-config.ts
git commit -m "refactor(api): drop refresh-token logic (backend has no refresh endpoint)"
```

### Task 1.4: Adapt `lib/auth.ts` to backend token shape

The backend returns a JWT in the auth response body. Decode reveals `{ accessKey, expiresAt }` (epoch seconds). Our wrapper still wraps it in our own JWT cookie — keep that pattern; just adjust input fields.

**Files:**
- Modify: `src/lib/auth.ts`

- [ ] **Step 1: Loosen `createAuthSession` input**

In `src/lib/auth.ts`, replace `createAuthSession` signature + body:
```ts
export async function createAuthSession(input: {
  access_token: string;
  expires_at?: number; // epoch seconds (from backend JWT)
  user?: AuthUser;
}): Promise<void> {
  const expiresAt = input.expires_at
    ? new Date(input.expires_at * 1000)
    : new Date(Date.now() + SESSION_CONFIG.SESSION_TTL);

  const session: AuthSession = {
    access_token: input.access_token,
    expiresAt,
    user: input.user,
  };

  const cookieLifetimeMs = SESSION_CONFIG.SESSION_TTL;
  const cookieExpiry = new Date(Date.now() + cookieLifetimeMs);
  const jwtTtl = `${Math.ceil(cookieLifetimeMs / 1000)}s`;
  const token = await encrypt(session, jwtTtl);
  if (!token) throw new Error("Failed to create session token.");

  const store = await cookies();
  store.set(AUTH_SESSION, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: cookieExpiry,
    sameSite: "strict",
    path: "/",
  });
  store.delete(SCREEN_LOCK_SESSION);
}
```
Drop the `refresh_token`, `role`, `user_id`, `organization_id`, `expiresIn` parameters. Keep them on the `AuthSession` type for forward-compat.

- [ ] **Step 2: Update `SESSION_TTL`**

In `src/lib/session-config.ts`, set `SESSION_TTL` to 7d (we have no refresh path — give the cookie a long life):
```ts
export const SESSION_CONFIG = {
  SESSION_TTL: 7 * 24 * 60 * 60 * 1000, // 7d
  SCREEN_LOCK_COUNTDOWN: 90 * 1000,
} as const;
```
Drop `REFRESH_TOKEN_TTL` if unused after Task 1.3.

- [ ] **Step 3: Type-check**

```bash
bun run type-check
```
Expected: errors in `src/app/_actions/auth.ts` (will fix in Phase 2).

- [ ] **Step 4: Commit**

```bash
git add src/lib/auth.ts src/lib/session-config.ts
git commit -m "refactor(auth): align session creation with backend token shape"
```

---

## Phase 2 — Auth flows

### Task 2.1: Rewrite `_actions/auth.ts` for `/api/v1/user/*`

**Files:**
- Modify: `src/app/_actions/auth.ts`

- [ ] **Step 1: Replace file contents**

Open `src/app/_actions/auth.ts`. Replace the whole file with:
```ts
"use server";

import { revalidateTag } from "next/cache";
import type { APIResponse, AuthUser } from "@/types";
import authenticatedApiClient, {
  axios,
  fromBackend,
  handleError,
  badRequestResponse,
} from "./api-config";
import { createAuthSession, deleteSession, getCurrentUser } from "@/lib/auth";
import { CACHE_TAGS } from "@/lib/cache-tags";

export type LoginData = { email: string; password: string };
export type SignUpData = {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone: string;
};

function decodeJwtExpiry(token: string): number | undefined {
  try {
    const [, payload] = token.split(".");
    if (!payload) return;
    const json = JSON.parse(
      Buffer.from(payload.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf-8"),
    );
    return typeof json?.expiresAt === "number" ? json.expiresAt : undefined;
  } catch {
    return undefined;
  }
}

export async function loginUser(data: LoginData): Promise<APIResponse<AuthUser>> {
  if (!data?.email || !data?.password) {
    return badRequestResponse("Email and password are required");
  }
  const url = "/api/v1/user/authentication";
  try {
    const res = await axios.post(url, data);
    const body = res.data?.data || res.data;
    const token: string | undefined = body?.token || body?.access_token || body?.accessToken;
    if (!token) return { success: false, message: "Token missing in response", data: null };

    await createAuthSession({
      access_token: token,
      expires_at: decodeJwtExpiry(token),
      user: body?.user,
    });

    revalidateTag(CACHE_TAGS.AUTH);
    return fromBackend<AuthUser>(res, "Login successful");
  } catch (error: any) {
    return handleError(error, "POST", url);
  }
}

export async function registerUser(data: SignUpData): Promise<APIResponse<AuthUser>> {
  if (!data?.email || !data?.password) return badRequestResponse("Email and password are required");
  if (!data?.first_name || !data?.last_name) return badRequestResponse("Name is required");
  const url = "/api/v1/user/registration";
  try {
    const res = await axios.post(url, data);
    return fromBackend<AuthUser>(res, "Account created");
  } catch (error: any) {
    return handleError(error, "POST", url);
  }
}

export async function requestPasswordReset(email: string): Promise<APIResponse> {
  if (!email) return badRequestResponse("Email is required");
  const url = "/api/v1/user/password/reset";
  try {
    const res = await axios.post(url, { email });
    return fromBackend(res, "Reset email sent");
  } catch (error: any) {
    return handleError(error, "POST", url);
  }
}

export async function getProfile(): Promise<APIResponse<AuthUser>> {
  const url = "/api/v1/user/profile";
  try {
    const res = await authenticatedApiClient({
      url,
      method: "GET",
      next: { tags: [CACHE_TAGS.USER], revalidate: 60 },
    });
    return fromBackend<AuthUser>(res);
  } catch (error: any) {
    const fallback = await getCurrentUser();
    if (fallback) return { success: true, message: "OK", data: fallback };
    return handleError(error, "GET", url);
  }
}

export async function updateProfile(
  data: Partial<Pick<AuthUser, "email" | "first_name" | "last_name" | "phone">>,
): Promise<APIResponse<AuthUser>> {
  const url = "/api/v1/user/profile";
  try {
    const res = await authenticatedApiClient({ url, method: "PATCH", data });
    revalidateTag(CACHE_TAGS.USER);
    return fromBackend<AuthUser>(res);
  } catch (error: any) {
    return handleError(error, "PATCH", url);
  }
}

export async function updatePassword(data: {
  email: string;
  password: string;
}): Promise<APIResponse> {
  if (!data?.email || !data?.password) return badRequestResponse("Email and password are required");
  const url = "/api/v1/user/password";
  try {
    const res = await authenticatedApiClient({ url, method: "PATCH", data });
    return fromBackend(res, "Password updated");
  } catch (error: any) {
    return handleError(error, "PATCH", url);
  }
}

export async function logoutUser(): Promise<APIResponse> {
  await deleteSession();
  revalidateTag(CACHE_TAGS.AUTH);
  return { success: true, message: "Logout successful", data: null };
}
```

- [ ] **Step 2: Type-check**

```bash
bun run type-check
```
Expected: clean except for hooks file (next task).

- [ ] **Step 3: Commit**

```bash
git add src/app/_actions/auth.ts
git commit -m "feat(auth): wire user actions to /api/v1/user/* endpoints"
```

### Task 2.2: Rewrite `use-auth-mutations.ts` against new actions

**Files:**
- Modify: `src/hooks/use-auth-mutations.ts`

- [ ] **Step 1: Replace file**

Replace `src/hooks/use-auth-mutations.ts` with:
```ts
"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getProfile,
  loginUser,
  logoutUser,
  registerUser,
  requestPasswordReset,
  updatePassword,
  updateProfile,
  type LoginData,
  type SignUpData,
} from "@/app/_actions/auth";
import type { AuthUser } from "@/types";
import { AUTH_KEYS } from "@/lib/query-keys";

export function useProfileQuery(initialData?: AuthUser) {
  return useQuery({
    queryKey: AUTH_KEYS.me,
    queryFn: async () => {
      const res = await getProfile();
      if (!res.success) throw new Error(res.message);
      return res.data as AuthUser;
    },
    initialData,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}

export function useLoginMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: LoginData) => loginUser(data),
    onSuccess: (res) => {
      if (res.success) qc.invalidateQueries({ queryKey: AUTH_KEYS.me });
    },
  });
}

export function useRegisterMutation() {
  return useMutation({ mutationFn: (data: SignUpData) => registerUser(data) });
}

export function useLogoutMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => logoutUser(),
    onSuccess: () => qc.clear(),
  });
}

export function useRequestPasswordResetMutation() {
  return useMutation({ mutationFn: (email: string) => requestPasswordReset(email) });
}

export function useUpdateProfileMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof updateProfile>[0]) => updateProfile(data),
    onSuccess: (res) => {
      if (res.success) qc.invalidateQueries({ queryKey: AUTH_KEYS.me });
    },
  });
}

export function useUpdatePasswordMutation() {
  return useMutation({
    mutationFn: (data: { email: string; password: string }) => updatePassword(data),
  });
}
```

- [ ] **Step 2: Type-check**

```bash
bun run type-check
```
Expected: clean.

- [ ] **Step 3: Commit**

```bash
git add src/hooks/use-auth-mutations.ts
git commit -m "feat(hooks): align auth mutations with new server actions"
```

### Task 2.3: Wire login form

**Files:**
- Modify: `src/app/(auth)/login/page.tsx`

- [ ] **Step 1: Read current login page**

```bash
cat src/app/\(auth\)/login/page.tsx
```
Note current shape — likely a static form. We replace with a wired client form.

- [ ] **Step 2: Replace contents**

Open `src/app/(auth)/login/page.tsx`. Replace with:
```tsx
"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { useLoginMutation, useRegisterMutation } from "@/hooks/use-auth-mutations";

export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const isSignup = params.get("signup") === "true";
  const [mode, setMode] = useState<"login" | "signup">(isSignup ? "signup" : "login");

  const login = useLoginMutation();
  const register = useRegisterMutation();

  const [form, setForm] = useState({
    email: "",
    password: "",
    first_name: "",
    last_name: "",
    phone: "",
  });

  function bind<K extends keyof typeof form>(k: K) {
    return {
      value: form[k],
      onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
        setForm((f) => ({ ...f, [k]: e.target.value })),
    };
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (mode === "login") {
      const res = await login.mutateAsync({ email: form.email, password: form.password });
      if (!res.success) return toast.error(res.message);
      toast.success("Welcome back");
      router.replace("/");
      return;
    }
    const res = await register.mutateAsync(form);
    if (!res.success) return toast.error(res.message);
    toast.success("Account created — please sign in");
    setMode("login");
  }

  const pending = login.isPending || register.isPending;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6 py-12">
      <h1 className="font-display text-3xl font-medium tracking-tight">
        {mode === "login" ? "Welcome back" : "Create your account"}
      </h1>
      <p className="mt-2 text-sm text-mute">
        {mode === "login" ? "Sign in to manage your events." : "Join e-nvite in under a minute."}
      </p>

      <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-4">
        {mode === "signup" && (
          <>
            <input
              {...bind("first_name")}
              placeholder="First name"
              required
              className="rounded-lg border border-hairline bg-surface px-4 py-3 text-sm focus:border-foreground/40 focus:outline-none"
            />
            <input
              {...bind("last_name")}
              placeholder="Last name"
              required
              className="rounded-lg border border-hairline bg-surface px-4 py-3 text-sm focus:border-foreground/40 focus:outline-none"
            />
            <input
              {...bind("phone")}
              type="tel"
              placeholder="Phone"
              required
              className="rounded-lg border border-hairline bg-surface px-4 py-3 text-sm focus:border-foreground/40 focus:outline-none"
            />
          </>
        )}
        <input
          {...bind("email")}
          type="email"
          placeholder="Email"
          required
          autoComplete="email"
          className="rounded-lg border border-hairline bg-surface px-4 py-3 text-sm focus:border-foreground/40 focus:outline-none"
        />
        <input
          {...bind("password")}
          type="password"
          placeholder="Password"
          required
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          className="rounded-lg border border-hairline bg-surface px-4 py-3 text-sm focus:border-foreground/40 focus:outline-none"
        />
        <button
          type="submit"
          disabled={pending}
          className="mt-2 rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {pending ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}
        </button>
      </form>

      <div className="mt-6 flex items-center justify-between text-sm">
        <button
          type="button"
          onClick={() => setMode((m) => (m === "login" ? "signup" : "login"))}
          className="text-foreground/70 hover:text-foreground"
        >
          {mode === "login" ? "Create an account" : "Have an account? Sign in"}
        </button>
        <Link href="/forgot-password" className="text-foreground/70 hover:text-foreground">
          Forgot password
        </Link>
      </div>
    </main>
  );
}
```

- [ ] **Step 3: Smoke test**

```bash
bun run dev
```
Open `/login`. Form renders. Toggle login/signup. Try submit — expect "fetch failed" or 401 from backend (acceptable; we just verify wiring). Stop server.

- [ ] **Step 4: Type-check**

```bash
bun run type-check
```
Expected: clean.

- [ ] **Step 5: Commit**

```bash
git add src/app/\(auth\)/login/page.tsx
git commit -m "feat(auth): wire login + signup form to mutations"
```

### Task 2.4: Forgot-password page

**Files:**
- Modify: `src/app/(auth)/forgot-password/page.tsx`

- [ ] **Step 1: Replace file**

```tsx
"use client";

import { useState } from "react";
import { toast } from "sonner";
import Link from "next/link";
import { useRequestPasswordResetMutation } from "@/hooks/use-auth-mutations";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const reset = useRequestPasswordResetMutation();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await reset.mutateAsync(email);
    if (!res.success) return toast.error(res.message);
    toast.success("If the email exists, a reset link is on its way");
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6 py-12">
      <h1 className="font-display text-3xl font-medium tracking-tight">Reset your password</h1>
      <p className="mt-2 text-sm text-mute">We'll send a reset link to your email.</p>
      <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-4">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="rounded-lg border border-hairline bg-surface px-4 py-3 text-sm focus:border-foreground/40 focus:outline-none"
        />
        <button
          type="submit"
          disabled={reset.isPending}
          className="rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {reset.isPending ? "Sending…" : "Send reset link"}
        </button>
      </form>
      <Link href="/login" className="mt-6 text-sm text-foreground/70 hover:text-foreground">
        Back to sign in
      </Link>
    </main>
  );
}
```

- [ ] **Step 2: Smoke test**

```bash
bun run dev
```
Open `/forgot-password`. Renders. Stop.

- [ ] **Step 3: Commit**

```bash
git add src/app/\(auth\)/forgot-password/page.tsx
git commit -m "feat(auth): wire forgot-password form"
```

---

## Phase 3 — Event Types domain

### Task 3.1: `_actions/event-types.ts`

**Files:**
- Create: `src/app/_actions/event-types.ts`
- Modify: `src/lib/cache-tags.ts`
- Modify: `src/lib/query-keys.ts`

- [ ] **Step 1: Add cache tags + query keys**

Append to `src/lib/cache-tags.ts`:
```ts
export const EVENT_TYPES_TAG = "event-types";
export const EVENT_TYPE_TAG = (id: string) => `event-type:${id}`;
```
Add to `CACHE_TAGS` object literal:
```ts
EVENT_TYPES: "event-types",
EVENT_TYPE: (id: string) => `event-type:${id}`,
```

Append to `src/lib/query-keys.ts`:
```ts
export const EVENT_TYPES_KEYS = {
  all: ["event-types"] as const,
  list: () => ["event-types", "list"] as const,
  detail: (id: string) => ["event-types", id] as const,
};
```

- [ ] **Step 2: Write the action file**

Create `src/app/_actions/event-types.ts`:
```ts
"use server";

import { revalidateTag } from "next/cache";
import type { APIResponse, EventType } from "@/types";
import authenticatedApiClient, {
  fromBackend,
  handleError,
  badRequestResponse,
} from "./api-config";
import { CACHE_TAGS } from "@/lib/cache-tags";

export async function getEventTypes(): Promise<APIResponse<EventType[]>> {
  const url = "/api/v1/event-type/list";
  try {
    const res = await authenticatedApiClient({
      url,
      method: "GET",
      next: { tags: [CACHE_TAGS.EVENT_TYPES], revalidate: 300 },
    });
    return fromBackend<EventType[]>(res);
  } catch (error: any) {
    return handleError(error, "GET", url);
  }
}

export async function getEventType(id: string): Promise<APIResponse<EventType>> {
  if (!id) return badRequestResponse("Event type ID required");
  const url = `/api/v1/event-type/${id}/details`;
  try {
    const res = await authenticatedApiClient({
      url,
      method: "GET",
      next: { tags: [CACHE_TAGS.EVENT_TYPE(id)], revalidate: 300 },
    });
    return fromBackend<EventType>(res);
  } catch (error: any) {
    return handleError(error, "GET", url);
  }
}

export async function createEventType(
  data: Pick<EventType, "name" | "description" | "icon_url" | "price_per_invitation" | "max_free_invitations">,
): Promise<APIResponse<EventType>> {
  if (!data?.name) return badRequestResponse("Name required");
  const url = "/api/v1/event-type/new";
  try {
    const res = await authenticatedApiClient({ url, method: "POST", data });
    revalidateTag(CACHE_TAGS.EVENT_TYPES);
    return fromBackend<EventType>(res);
  } catch (error: any) {
    return handleError(error, "POST", url);
  }
}
```

- [ ] **Step 3: Type-check**

```bash
bun run type-check
```
Expected: clean.

- [ ] **Step 4: Commit**

```bash
git add src/app/_actions/event-types.ts src/lib/cache-tags.ts src/lib/query-keys.ts
git commit -m "feat(event-types): server actions + tags"
```

### Task 3.2: `use-event-types-queries.ts`

**Files:**
- Create: `src/hooks/use-event-types-queries.ts`

- [ ] **Step 1: Write file**

```ts
"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createEventType,
  getEventType,
  getEventTypes,
} from "@/app/_actions/event-types";
import type { EventType } from "@/types";
import { EVENT_TYPES_KEYS } from "@/lib/query-keys";

export function useEventTypesQuery(initialData?: EventType[]) {
  return useQuery({
    queryKey: EVENT_TYPES_KEYS.list(),
    queryFn: async () => {
      const res = await getEventTypes();
      if (!res.success) throw new Error(res.message);
      return (res.data ?? []) as EventType[];
    },
    initialData,
    staleTime: 5 * 60 * 1000,
  });
}

export function useEventTypeQuery(id: string, initialData?: EventType) {
  return useQuery({
    queryKey: EVENT_TYPES_KEYS.detail(id),
    queryFn: async () => {
      const res = await getEventType(id);
      if (!res.success) throw new Error(res.message);
      return res.data as EventType;
    },
    enabled: !!id,
    initialData,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateEventTypeMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof createEventType>[0]) => createEventType(data),
    onSuccess: (res) => {
      if (res.success) qc.invalidateQueries({ queryKey: EVENT_TYPES_KEYS.all });
    },
  });
}
```

- [ ] **Step 2: Type-check**

```bash
bun run type-check
```

- [ ] **Step 3: Commit**

```bash
git add src/hooks/use-event-types-queries.ts
git commit -m "feat(event-types): query + mutation hooks"
```

---

## Phase 4 — Events domain

### Task 4.1: Replace `_actions/events.ts` with backend-aligned routes

**Files:**
- Modify: `src/app/_actions/events.ts`

- [ ] **Step 1: Replace contents**

```ts
"use server";

import { revalidateTag } from "next/cache";
import type { APIResponse, EventRecord, EventStatus } from "@/types";
import authenticatedApiClient, {
  fromBackend,
  handleError,
  badRequestResponse,
} from "./api-config";
import { CACHE_TAGS } from "@/lib/cache-tags";

type ListParams = {
  page?: number;
  page_size?: number;
  status?: EventStatus;
  event_type_id?: string;
  start_date?: string;
  end_date?: string;
  search?: string;
  sort_by?: "created_at" | "start_date" | "title";
  sort_order?: "asc" | "desc";
};

function toQuery(params?: ListParams): Record<string, string> | undefined {
  if (!params) return;
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === "") continue;
    out[k] = String(v);
  }
  return Object.keys(out).length ? out : undefined;
}

export async function getMyEvents(
  params?: ListParams,
): Promise<APIResponse<EventRecord[]>> {
  const url = "/api/v1/events/list";
  try {
    const res = await authenticatedApiClient({
      url,
      method: "GET",
      params: toQuery(params),
      next: { tags: [CACHE_TAGS.EVENTS], revalidate: 30 },
    });
    return fromBackend<EventRecord[]>(res);
  } catch (error: any) {
    return handleError(error, "GET", url);
  }
}

export async function getAllEvents(
  params?: ListParams,
): Promise<APIResponse<EventRecord[]>> {
  const url = "/api/v1/events/whole-list";
  try {
    const res = await authenticatedApiClient({
      url,
      method: "GET",
      params: toQuery(params),
      next: { tags: [CACHE_TAGS.EVENTS], revalidate: 60 },
    });
    return fromBackend<EventRecord[]>(res);
  } catch (error: any) {
    return handleError(error, "GET", url);
  }
}

export async function getEvent(id: string): Promise<APIResponse<EventRecord>> {
  if (!id) return badRequestResponse("Event ID required");
  const url = `/api/v1/events/${id}`;
  try {
    const res = await authenticatedApiClient({
      url,
      method: "GET",
      next: { tags: [CACHE_TAGS.EVENT(id)], revalidate: 30 },
    });
    return fromBackend<EventRecord>(res);
  } catch (error: any) {
    return handleError(error, "GET", url);
  }
}

export async function createEvent(
  data: Partial<EventRecord>,
): Promise<APIResponse<EventRecord>> {
  if (!data?.title || !data?.event_type_id || !data?.start_date) {
    return badRequestResponse("title, event_type_id, start_date are required");
  }
  const url = "/api/v1/events/new";
  try {
    const res = await authenticatedApiClient({ url, method: "POST", data });
    revalidateTag(CACHE_TAGS.EVENTS);
    return fromBackend<EventRecord>(res);
  } catch (error: any) {
    return handleError(error, "POST", url);
  }
}

export async function updateEvent(
  id: string,
  data: Partial<EventRecord>,
): Promise<APIResponse<EventRecord>> {
  if (!id) return badRequestResponse("Event ID required");
  const url = `/api/v1/events/${id}`;
  try {
    const res = await authenticatedApiClient({ url, method: "PUT", data });
    revalidateTag(CACHE_TAGS.EVENTS);
    revalidateTag(CACHE_TAGS.EVENT(id));
    return fromBackend<EventRecord>(res);
  } catch (error: any) {
    return handleError(error, "PUT", url);
  }
}

export async function deleteEvent(id: string): Promise<APIResponse> {
  if (!id) return badRequestResponse("Event ID required");
  const url = `/api/v1/events/${id}`;
  try {
    const res = await authenticatedApiClient({ url, method: "DELETE" });
    revalidateTag(CACHE_TAGS.EVENTS);
    revalidateTag(CACHE_TAGS.EVENT(id));
    return fromBackend(res);
  } catch (error: any) {
    return handleError(error, "DELETE", url);
  }
}

export async function cancelEvent(id: string): Promise<APIResponse<EventRecord>> {
  if (!id) return badRequestResponse("Event ID required");
  const url = `/api/v1/events/${id}`;
  try {
    const res = await authenticatedApiClient({ url, method: "PATCH" });
    revalidateTag(CACHE_TAGS.EVENTS);
    revalidateTag(CACHE_TAGS.EVENT(id));
    return fromBackend<EventRecord>(res);
  } catch (error: any) {
    return handleError(error, "PATCH", url);
  }
}
```

- [ ] **Step 2: Type-check**

```bash
bun run type-check
```
Expected: errors only in `use-events-queries.ts` (next task).

- [ ] **Step 3: Commit**

```bash
git add src/app/_actions/events.ts
git commit -m "feat(events): align actions with backend list/whole-list/new/update/delete/cancel"
```

### Task 4.2: Update `use-events-queries.ts`

**Files:**
- Modify: `src/hooks/use-events-queries.ts`

- [ ] **Step 1: Replace contents**

```ts
"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  cancelEvent,
  createEvent,
  deleteEvent,
  getAllEvents,
  getEvent,
  getMyEvents,
  updateEvent,
} from "@/app/_actions/events";
import type { EventRecord } from "@/types";
import { EVENTS_KEYS } from "@/lib/query-keys";

type ListParams = Parameters<typeof getMyEvents>[0];

export function useMyEventsQuery(
  params?: ListParams,
  initialData?: EventRecord[],
) {
  return useQuery({
    queryKey: ["events", "list", "mine", params ?? {}],
    queryFn: async () => {
      const res = await getMyEvents(params);
      if (!res.success) throw new Error(res.message);
      return (res.data ?? []) as EventRecord[];
    },
    initialData,
    staleTime: 30 * 1000,
  });
}

export function useAllEventsQuery(
  params?: ListParams,
  initialData?: EventRecord[],
) {
  return useQuery({
    queryKey: ["events", "list", "all", params ?? {}],
    queryFn: async () => {
      const res = await getAllEvents(params);
      if (!res.success) throw new Error(res.message);
      return (res.data ?? []) as EventRecord[];
    },
    initialData,
    staleTime: 60 * 1000,
  });
}

export function useEventQuery(id: string, initialData?: EventRecord) {
  return useQuery({
    queryKey: EVENTS_KEYS.detail(id),
    queryFn: async () => {
      const res = await getEvent(id);
      if (!res.success) throw new Error(res.message);
      return res.data as EventRecord;
    },
    enabled: !!id,
    initialData,
    staleTime: 30 * 1000,
  });
}

export function useCreateEventMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<EventRecord>) => createEvent(data),
    onSuccess: (res) => {
      if (res.success) qc.invalidateQueries({ queryKey: EVENTS_KEYS.all });
    },
  });
}

export function useUpdateEventMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<EventRecord> }) =>
      updateEvent(id, data),
    onSuccess: (res, vars) => {
      if (res.success) {
        qc.invalidateQueries({ queryKey: EVENTS_KEYS.all });
        qc.invalidateQueries({ queryKey: EVENTS_KEYS.detail(vars.id) });
      }
    },
  });
}

export function useDeleteEventMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteEvent(id),
    onSuccess: (res, id) => {
      if (res.success) {
        qc.invalidateQueries({ queryKey: EVENTS_KEYS.all });
        qc.removeQueries({ queryKey: EVENTS_KEYS.detail(id) });
      }
    },
  });
}

export function useCancelEventMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => cancelEvent(id),
    onSuccess: (res, id) => {
      if (res.success) {
        qc.invalidateQueries({ queryKey: EVENTS_KEYS.all });
        qc.invalidateQueries({ queryKey: EVENTS_KEYS.detail(id) });
      }
    },
  });
}
```

- [ ] **Step 2: Type-check**

```bash
bun run type-check
```
Expected: clean.

- [ ] **Step 3: Commit**

```bash
git add src/hooks/use-events-queries.ts
git commit -m "feat(events): hooks for list/byUser/detail + mutations"
```

### Task 4.3: Dashboard layout shell

**Files:**
- Modify: `src/app/(dashboard)/layout.tsx`
- Create: `src/components/dashboard/sidebar.tsx`
- Create: `src/components/dashboard/topbar.tsx`

- [ ] **Step 1: Sidebar**

Create `src/components/dashboard/sidebar.tsx`:
```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calendar, Home, LayoutTemplate, Settings, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "Overview", icon: Home },
  { href: "/events", label: "Events", icon: Calendar },
  { href: "/event-types", label: "Templates", icon: LayoutTemplate },
  { href: "/guests", label: "Guests", icon: Users },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="hidden w-60 shrink-0 border-r border-hairline bg-surface/40 p-6 md:flex md:flex-col">
      <Link href="/" className="mb-10 inline-flex items-center gap-2">
        <span className="grid h-8 w-8 place-items-center rounded-full bg-foreground text-background font-display">
          e
        </span>
        <span className="font-display text-lg font-medium">e-nvite</span>
      </Link>
      <nav className="flex flex-col gap-1">
        {NAV.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-full px-4 py-2.5 text-sm transition-colors",
                active
                  ? "bg-foreground text-background"
                  : "text-foreground/75 hover:bg-foreground/5 hover:text-foreground",
              )}
            >
              <item.icon size={16} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
```

- [ ] **Step 2: Topbar**

Create `src/components/dashboard/topbar.tsx`:
```tsx
"use client";

import { Bell, Search } from "lucide-react";
import { useLogoutMutation } from "@/hooks/use-auth-mutations";
import { useRouter } from "next/navigation";
import ThemeToggle from "@/components/landing-page/theme-toggle";
import type { AuthUser } from "@/types";

export default function Topbar({ user }: { user: AuthUser | null }) {
  const router = useRouter();
  const logout = useLogoutMutation();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-hairline bg-background/80 px-6 py-4 backdrop-blur">
      <div className="relative flex flex-1 items-center">
        <Search size={14} className="absolute left-3 text-mute" />
        <input
          placeholder="Search events, guests, templates"
          className="w-full max-w-md rounded-full border border-hairline bg-surface px-9 py-2 text-sm placeholder:text-mute focus:border-foreground/40 focus:outline-none"
        />
      </div>
      <div className="flex items-center gap-3">
        <ThemeToggle />
        <button className="grid h-9 w-9 place-items-center rounded-full border border-hairline bg-surface/60 text-foreground hover:border-foreground/30">
          <Bell size={16} />
        </button>
        {user ? (
          <div className="flex items-center gap-3">
            <div className="hidden text-right text-xs leading-tight md:block">
              <div className="font-medium">{user.first_name ?? user.email}</div>
              <div className="text-mute">{user.email}</div>
            </div>
            <button
              onClick={async () => {
                await logout.mutateAsync();
                router.replace("/login");
              }}
              className="rounded-full border border-hairline px-3 py-1.5 text-xs text-foreground/80 hover:text-foreground"
            >
              Sign out
            </button>
          </div>
        ) : null}
      </div>
    </header>
  );
}
```

- [ ] **Step 3: Layout (server-side prefetch profile)**

Replace `src/app/(dashboard)/layout.tsx`:
```tsx
import { redirect } from "next/navigation";
import { getProfile } from "@/app/_actions/auth";
import Sidebar from "@/components/dashboard/sidebar";
import Topbar from "@/components/dashboard/topbar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const me = await getProfile();
  if (!me.success || !me.data) redirect("/login");

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar user={me.data} />
        <main className="flex-1 px-6 py-8">{children}</main>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Smoke test**

```bash
bun run dev
```
Open `/`. If unauthenticated, expect redirect to `/login`. Log in (assuming backend up). Sidebar + topbar render. Stop.

- [ ] **Step 5: Commit**

```bash
git add src/app/\(dashboard\)/layout.tsx src/components/dashboard
git commit -m "feat(dashboard): SSR shell with prefetched profile + sidebar + topbar"
```

### Task 4.4: Events list page (SSR initialData → useQuery)

**Files:**
- Modify: `src/app/(dashboard)/events/page.tsx` (create dir if missing)
- Create: `src/app/(dashboard)/events/_components/events-list.tsx`

- [ ] **Step 1: Server page**

Create `src/app/(dashboard)/events/page.tsx`:
```tsx
import { getMyEvents } from "@/app/_actions/events";
import EventsList from "./_components/events-list";

export const dynamic = "force-dynamic";

export default async function EventsPage() {
  const res = await getMyEvents({ page: 1, page_size: 20, sort_by: "created_at", sort_order: "desc" });
  return <EventsList initialData={res.success ? (res.data ?? []) : []} />;
}
```

- [ ] **Step 2: Client list with `initialData`**

Create `src/app/(dashboard)/events/_components/events-list.tsx`:
```tsx
"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { useMyEventsQuery } from "@/hooks/use-events-queries";
import type { EventRecord } from "@/types";
import { format } from "date-fns";

export default function EventsList({ initialData }: { initialData: EventRecord[] }) {
  const { data = [], isFetching } = useMyEventsQuery(
    { page: 1, page_size: 20, sort_by: "created_at", sort_order: "desc" },
    initialData,
  );

  return (
    <div className="mx-auto max-w-6xl">
      <header className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="font-display text-3xl font-medium tracking-tight">Your events</h1>
          <p className="mt-1 text-sm text-mute">
            {data.length} {data.length === 1 ? "event" : "events"}
            {isFetching ? " · refreshing…" : ""}
          </p>
        </div>
        <Link
          href="/events/new"
          className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background hover:opacity-90"
        >
          <Plus size={14} /> New event
        </Link>
      </header>

      {data.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-hairline bg-surface/40 p-16 text-center">
          <p className="font-display text-2xl">No events yet</p>
          <p className="mt-2 text-sm text-mute">Create your first event to start sending invitations.</p>
          <Link
            href="/events/new"
            className="mt-6 inline-flex rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background"
          >
            Create event
          </Link>
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {data.map((e) => (
            <li key={e.id}>
              <Link
                href={`/events/${e.id}`}
                className="group block h-full rounded-2xl border border-hairline bg-surface p-6 transition hover:-translate-y-0.5 hover:border-foreground/25 hover:shadow-[0_24px_60px_-30px_color-mix(in_oklch,var(--foreground)_25%,transparent)]"
              >
                <div className="text-[10px] uppercase tracking-[0.2em] text-mute">{e.status}</div>
                <h3 className="mt-3 font-display text-xl font-medium">{e.title}</h3>
                <p className="mt-1 line-clamp-2 text-sm text-mute">{e.description}</p>
                <div className="mt-6 flex items-center justify-between text-xs text-mute">
                  <span>{format(new Date(e.start_date), "MMM d, yyyy")}</span>
                  <span>{e.venue}</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Install date-fns if missing**

```bash
bun add date-fns
```

- [ ] **Step 4: Smoke test**

```bash
bun run dev
```
Authenticated user opens `/events`. Server-rendered list appears immediately; client takes over for refetch. Stop.

- [ ] **Step 5: Commit**

```bash
git add src/app/\(dashboard\)/events bun.lock package.json
git commit -m "feat(events): SSR list page with initialData → useQuery handoff"
```

### Task 4.5: New event wizard — Step 1 (event details)

**Files:**
- Create: `src/app/(dashboard)/events/new/page.tsx`
- Create: `src/app/(dashboard)/events/new/_components/event-form.tsx`

- [ ] **Step 1: SSR page that prefetches event types**

Create `src/app/(dashboard)/events/new/page.tsx`:
```tsx
import { getEventTypes } from "@/app/_actions/event-types";
import EventForm from "./_components/event-form";

export const dynamic = "force-dynamic";

export default async function NewEventPage() {
  const types = await getEventTypes();
  return <EventForm initialEventTypes={types.success ? (types.data ?? []) : []} />;
}
```

- [ ] **Step 2: Client form**

Create `src/app/(dashboard)/events/new/_components/event-form.tsx`:
```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useEventTypesQuery } from "@/hooks/use-event-types-queries";
import { useCreateEventMutation } from "@/hooks/use-events-queries";
import type { EventType, EventRecord } from "@/types";

const FIELDS = [
  { name: "title", label: "Title", type: "text", required: true },
  { name: "theme", label: "Theme" },
  { name: "venue", label: "Venue" },
  { name: "venue_address", label: "Venue address" },
  { name: "start_date", label: "Start date", type: "date", required: true },
  { name: "end_date", label: "End date", type: "date" },
  { name: "rsvp_deadline", label: "RSVP deadline", type: "date" },
  { name: "max_attendees", label: "Max attendees", type: "number" },
  { name: "contact_person", label: "Contact person" },
  { name: "contact_email", label: "Contact email", type: "email" },
  { name: "contact_phone", label: "Contact phone", type: "tel" },
] as const;

export default function EventForm({
  initialEventTypes,
}: {
  initialEventTypes: EventType[];
}) {
  const router = useRouter();
  const { data: types = initialEventTypes } = useEventTypesQuery(initialEventTypes);
  const create = useCreateEventMutation();
  const [form, setForm] = useState<Partial<EventRecord>>({
    event_type_id: types[0]?.id ?? "",
    requires_rsvp: true,
    is_multi_day: false,
    duration_days: 1,
  });

  function set<K extends keyof EventRecord>(k: K, v: EventRecord[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.event_type_id) return toast.error("Pick an event type");
    const res = await create.mutateAsync(form);
    if (!res.success) return toast.error(res.message);
    toast.success("Event created");
    router.replace(`/events/${res.data!.id}/sessions`);
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-3xl">
      <header className="mb-8">
        <h1 className="font-display text-3xl font-medium tracking-tight">Create event</h1>
        <p className="mt-1 text-sm text-mute">Step 1 of 4 — event details</p>
      </header>

      <div className="mb-6">
        <label className="mb-2 block text-sm font-medium">Event type</label>
        <select
          value={form.event_type_id ?? ""}
          onChange={(e) => set("event_type_id", e.target.value)}
          required
          className="w-full rounded-lg border border-hairline bg-surface px-4 py-3 text-sm focus:border-foreground/40 focus:outline-none"
        >
          <option value="">Select…</option>
          {types.map((t) => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {FIELDS.map((f) => (
          <label key={f.name} className="flex flex-col gap-2">
            <span className="text-sm font-medium">
              {f.label}
              {("required" in f) && f.required ? <span className="text-destructive"> *</span> : null}
            </span>
            <input
              type={"type" in f ? f.type : "text"}
              required={"required" in f && f.required}
              value={(form as any)[f.name] ?? ""}
              onChange={(e) =>
                set(
                  f.name as keyof EventRecord,
                  ("type" in f && f.type === "number"
                    ? Number(e.target.value)
                    : e.target.value) as any,
                )
              }
              className="rounded-lg border border-hairline bg-surface px-4 py-3 text-sm focus:border-foreground/40 focus:outline-none"
            />
          </label>
        ))}
      </div>

      <label className="mt-6 flex flex-col gap-2">
        <span className="text-sm font-medium">Description</span>
        <textarea
          value={form.description ?? ""}
          onChange={(e) => set("description", e.target.value)}
          rows={4}
          className="rounded-lg border border-hairline bg-surface px-4 py-3 text-sm focus:border-foreground/40 focus:outline-none"
        />
      </label>

      <label className="mt-6 flex flex-col gap-2">
        <span className="text-sm font-medium">Dress code</span>
        <textarea
          value={form.dress_code ?? ""}
          onChange={(e) => set("dress_code", e.target.value)}
          rows={3}
          className="rounded-lg border border-hairline bg-surface px-4 py-3 text-sm focus:border-foreground/40 focus:outline-none"
        />
      </label>

      <div className="mt-8 flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-full border border-hairline px-5 py-2.5 text-sm"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={create.isPending}
          className="rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background disabled:opacity-50"
        >
          {create.isPending ? "Creating…" : "Continue → Sessions"}
        </button>
      </div>
    </form>
  );
}
```

- [ ] **Step 3: Smoke test**

`bun run dev` → `/events/new` → form renders, types populated. Submit hits backend (or fails predictably). Stop.

- [ ] **Step 4: Commit**

```bash
git add src/app/\(dashboard\)/events/new
git commit -m "feat(events): wizard step 1 — event details form"
```

### Task 4.6: Event detail page (SSR + client refetch)

**Files:**
- Create: `src/app/(dashboard)/events/[id]/page.tsx`
- Create: `src/app/(dashboard)/events/[id]/_components/event-detail.tsx`

- [ ] **Step 1: SSR page**

Create `src/app/(dashboard)/events/[id]/page.tsx`:
```tsx
import { notFound } from "next/navigation";
import { getEvent } from "@/app/_actions/events";
import EventDetail from "./_components/event-detail";

export const dynamic = "force-dynamic";

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const res = await getEvent(id);
  if (!res.success || !res.data) notFound();
  return <EventDetail id={id} initialData={res.data} />;
}
```

- [ ] **Step 2: Client wrapper**

Create `src/app/(dashboard)/events/[id]/_components/event-detail.tsx`:
```tsx
"use client";

import Link from "next/link";
import { format } from "date-fns";
import { Calendar, MapPin, Users } from "lucide-react";
import { useEventQuery, useCancelEventMutation } from "@/hooks/use-events-queries";
import type { EventRecord } from "@/types";
import { toast } from "sonner";

export default function EventDetail({
  id,
  initialData,
}: {
  id: string;
  initialData: EventRecord;
}) {
  const { data } = useEventQuery(id, initialData);
  const cancel = useCancelEventMutation();
  if (!data) return null;

  return (
    <div className="mx-auto max-w-4xl">
      <Link href="/events" className="text-sm text-mute hover:text-foreground">
        ← All events
      </Link>

      <header className="mt-4">
        <div className="text-[10px] uppercase tracking-[0.2em] text-mute">{data.status}</div>
        <h1 className="mt-2 font-display text-4xl font-medium tracking-tight">{data.title}</h1>
        {data.theme ? <p className="mt-1 italic text-mute">{data.theme}</p> : null}
      </header>

      <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
        <Stat icon={<Calendar size={14} />} label="Starts" value={format(new Date(data.start_date), "EEE, MMM d, yyyy")} />
        <Stat icon={<MapPin size={14} />} label="Venue" value={data.venue ?? "—"} />
        <Stat icon={<Users size={14} />} label="Capacity" value={String(data.max_attendees ?? "—")} />
      </div>

      <section className="mt-12">
        <h2 className="font-display text-xl font-medium">About</h2>
        <p className="mt-3 text-sm leading-relaxed text-foreground/85">{data.description}</p>
      </section>

      {data.dress_code ? (
        <section className="mt-10">
          <h2 className="font-display text-xl font-medium">Dress code</h2>
          <p className="mt-3 text-sm leading-relaxed text-foreground/85">{data.dress_code}</p>
        </section>
      ) : null}

      <div className="mt-12 flex flex-wrap gap-3">
        <Link
          href={`/events/${data.id}/sessions`}
          className="rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background"
        >
          Manage sessions
        </Link>
        <Link
          href={`/events/${data.id}/invitations`}
          className="rounded-full border border-hairline px-5 py-2.5 text-sm"
        >
          Invitations
        </Link>
        <Link
          href={`/events/${data.id}/edit`}
          className="rounded-full border border-hairline px-5 py-2.5 text-sm"
        >
          Edit event
        </Link>
        <button
          type="button"
          onClick={async () => {
            if (!confirm("Cancel this event? Guests will be notified.")) return;
            const res = await cancel.mutateAsync(data.id);
            if (!res.success) toast.error(res.message);
            else toast.success("Event cancelled");
          }}
          className="rounded-full border border-hairline px-5 py-2.5 text-sm text-destructive"
        >
          Cancel event
        </button>
      </div>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-hairline bg-surface p-5">
      <div className="flex items-center gap-2 text-mute">
        {icon}
        <span className="text-[10px] uppercase tracking-[0.2em]">{label}</span>
      </div>
      <div className="mt-2 font-display text-lg font-medium">{value}</div>
    </div>
  );
}
```

- [ ] **Step 3: Smoke test**

`bun run dev` → after creating an event, follow link to `/events/<id>`. Detail renders. Stop.

- [ ] **Step 4: Commit**

```bash
git add src/app/\(dashboard\)/events/\[id\]
git commit -m "feat(events): SSR detail page with cancel action"
```

### Task 4.7: Edit event page

**Files:**
- Create: `src/app/(dashboard)/events/[id]/edit/page.tsx`
- Create: `src/app/(dashboard)/events/[id]/edit/_components/edit-event-form.tsx`

- [ ] **Step 1: SSR page**

```tsx
// src/app/(dashboard)/events/[id]/edit/page.tsx
import { notFound } from "next/navigation";
import { getEvent } from "@/app/_actions/events";
import { getEventTypes } from "@/app/_actions/event-types";
import EditEventForm from "./_components/edit-event-form";

export const dynamic = "force-dynamic";

export default async function EditEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [evt, types] = await Promise.all([getEvent(id), getEventTypes()]);
  if (!evt.success || !evt.data) notFound();
  return (
    <EditEventForm
      initial={evt.data}
      initialEventTypes={types.success ? (types.data ?? []) : []}
    />
  );
}
```

- [ ] **Step 2: Client form**

Mirror `event-form.tsx` from Task 4.5 but seed state from `initial` and call `useUpdateEventMutation`. Same fields. Path: `src/app/(dashboard)/events/[id]/edit/_components/edit-event-form.tsx`. (Use the shared field array — identical to step 1; no new types or props introduced.)

- [ ] **Step 3: Smoke test + Commit**

```bash
bun run dev
# verify edit flow
git add src/app/\(dashboard\)/events/\[id\]/edit
git commit -m "feat(events): edit event form"
```

---

## Phase 5 — Event Sessions

### Task 5.1: `_actions/event-sessions.ts`

**Files:**
- Create: `src/app/_actions/event-sessions.ts`
- Modify: `src/lib/cache-tags.ts` (add `SESSIONS`, `SESSIONS_BY_EVENT(id)`, `SESSION(id)`)
- Modify: `src/lib/query-keys.ts` (add `SESSIONS_KEYS`)

- [ ] **Step 1: Tags + keys**

Add to `CACHE_TAGS`:
```ts
SESSIONS: "sessions",
SESSIONS_BY_EVENT: (eventId: string) => `sessions:event:${eventId}`,
SESSION: (id: string) => `session:${id}`,
```
Add to `query-keys.ts`:
```ts
export const SESSIONS_KEYS = {
  all: ["sessions"] as const,
  list: (eventId: string, params?: Record<string, any>) =>
    ["sessions", "list", eventId, params ?? {}] as const,
  detail: (id: string) => ["sessions", id] as const,
};
```

- [ ] **Step 2: Action file**

```ts
// src/app/_actions/event-sessions.ts
"use server";

import { revalidateTag } from "next/cache";
import type { APIResponse, EventSession } from "@/types";
import authenticatedApiClient, {
  fromBackend,
  handleError,
  badRequestResponse,
} from "./api-config";
import { CACHE_TAGS } from "@/lib/cache-tags";

type ListParams = {
  page?: number;
  page_size?: number;
  is_active?: boolean;
  start_date?: string;
  end_date?: string;
  sort_by?: "created_at" | "session_date" | "session_name" | "session_order";
  sort_order?: "asc" | "desc";
};

function toQuery(p?: ListParams) {
  if (!p) return;
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(p)) {
    if (v === undefined || v === null || v === "") continue;
    out[k] = String(v);
  }
  return Object.keys(out).length ? out : undefined;
}

export async function getEventSessions(
  eventId: string,
  params?: ListParams,
): Promise<APIResponse<EventSession[]>> {
  if (!eventId) return badRequestResponse("Event ID required");
  const url = `/api/v1/event-sessions/${eventId}/list`;
  try {
    const res = await authenticatedApiClient({
      url,
      method: "GET",
      params: toQuery(params),
      next: { tags: [CACHE_TAGS.SESSIONS_BY_EVENT(eventId)], revalidate: 30 },
    });
    return fromBackend<EventSession[]>(res);
  } catch (error: any) {
    return handleError(error, "GET", url);
  }
}

export async function getEventSession(id: string): Promise<APIResponse<EventSession>> {
  if (!id) return badRequestResponse("Session ID required");
  const url = `/api/v1/event-sessions/${id}`;
  try {
    const res = await authenticatedApiClient({
      url,
      method: "GET",
      next: { tags: [CACHE_TAGS.SESSION(id)], revalidate: 30 },
    });
    return fromBackend<EventSession>(res);
  } catch (error: any) {
    return handleError(error, "GET", url);
  }
}

export async function createEventSession(
  eventId: string,
  data: Partial<EventSession>,
): Promise<APIResponse<EventSession>> {
  if (!eventId) return badRequestResponse("Event ID required");
  if (!data?.session_name || !data?.session_date || !data?.start_time) {
    return badRequestResponse("session_name, session_date, start_time are required");
  }
  const url = `/api/v1/event-sessions/${eventId}`;
  try {
    const res = await authenticatedApiClient({ url, method: "POST", data });
    revalidateTag(CACHE_TAGS.SESSIONS_BY_EVENT(eventId));
    return fromBackend<EventSession>(res);
  } catch (error: any) {
    return handleError(error, "POST", url);
  }
}

export async function updateEventSession(
  id: string,
  data: Partial<EventSession>,
): Promise<APIResponse<EventSession>> {
  if (!id) return badRequestResponse("Session ID required");
  const url = `/api/v1/event-sessions/${id}`;
  try {
    const res = await authenticatedApiClient({ url, method: "PUT", data });
    revalidateTag(CACHE_TAGS.SESSION(id));
    if (data.event_id) revalidateTag(CACHE_TAGS.SESSIONS_BY_EVENT(data.event_id));
    return fromBackend<EventSession>(res);
  } catch (error: any) {
    return handleError(error, "PUT", url);
  }
}

export async function deleteEventSession(
  id: string,
  hard = true,
  eventId?: string,
): Promise<APIResponse> {
  if (!id) return badRequestResponse("Session ID required");
  const url = `/api/v1/event-sessions/${id}`;
  try {
    const res = await authenticatedApiClient({
      url,
      method: "DELETE",
      params: { hard_delete: String(hard) },
    });
    revalidateTag(CACHE_TAGS.SESSION(id));
    if (eventId) revalidateTag(CACHE_TAGS.SESSIONS_BY_EVENT(eventId));
    return fromBackend(res);
  } catch (error: any) {
    return handleError(error, "DELETE", url);
  }
}
```

- [ ] **Step 3: Type-check + commit**

```bash
bun run type-check
git add src/app/_actions/event-sessions.ts src/lib/cache-tags.ts src/lib/query-keys.ts
git commit -m "feat(sessions): server actions for event sessions"
```

### Task 5.2: `use-event-sessions-queries.ts`

**Files:**
- Create: `src/hooks/use-event-sessions-queries.ts`

- [ ] **Step 1: Write hooks**

```ts
"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createEventSession,
  deleteEventSession,
  getEventSession,
  getEventSessions,
  updateEventSession,
} from "@/app/_actions/event-sessions";
import type { EventSession } from "@/types";
import { SESSIONS_KEYS } from "@/lib/query-keys";

export function useEventSessionsQuery(
  eventId: string,
  params?: Parameters<typeof getEventSessions>[1],
  initialData?: EventSession[],
) {
  return useQuery({
    queryKey: SESSIONS_KEYS.list(eventId, params),
    queryFn: async () => {
      const res = await getEventSessions(eventId, params);
      if (!res.success) throw new Error(res.message);
      return (res.data ?? []) as EventSession[];
    },
    enabled: !!eventId,
    initialData,
    staleTime: 30 * 1000,
  });
}

export function useEventSessionQuery(id: string, initialData?: EventSession) {
  return useQuery({
    queryKey: SESSIONS_KEYS.detail(id),
    queryFn: async () => {
      const res = await getEventSession(id);
      if (!res.success) throw new Error(res.message);
      return res.data as EventSession;
    },
    enabled: !!id,
    initialData,
    staleTime: 30 * 1000,
  });
}

export function useCreateEventSessionMutation(eventId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<EventSession>) => createEventSession(eventId, data),
    onSuccess: (res) => {
      if (res.success) qc.invalidateQueries({ queryKey: ["sessions", "list", eventId] });
    },
  });
}

export function useUpdateEventSessionMutation(eventId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<EventSession> }) =>
      updateEventSession(id, { ...data, event_id: eventId }),
    onSuccess: (res, vars) => {
      if (res.success) {
        qc.invalidateQueries({ queryKey: ["sessions", "list", eventId] });
        qc.invalidateQueries({ queryKey: SESSIONS_KEYS.detail(vars.id) });
      }
    },
  });
}

export function useDeleteEventSessionMutation(eventId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteEventSession(id, true, eventId),
    onSuccess: (res) => {
      if (res.success) qc.invalidateQueries({ queryKey: ["sessions", "list", eventId] });
    },
  });
}
```

- [ ] **Step 2: Type-check + commit**

```bash
bun run type-check
git add src/hooks/use-event-sessions-queries.ts
git commit -m "feat(sessions): hooks"
```

### Task 5.3: Sessions page (wizard step 2)

**Files:**
- Create: `src/app/(dashboard)/events/[id]/sessions/page.tsx`
- Create: `src/app/(dashboard)/events/[id]/sessions/_components/sessions-manager.tsx`

- [ ] **Step 1: SSR page**

```tsx
// src/app/(dashboard)/events/[id]/sessions/page.tsx
import { notFound } from "next/navigation";
import { getEvent } from "@/app/_actions/events";
import { getEventSessions } from "@/app/_actions/event-sessions";
import SessionsManager from "./_components/sessions-manager";

export const dynamic = "force-dynamic";

export default async function SessionsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [evt, sessions] = await Promise.all([
    getEvent(id),
    getEventSessions(id, { sort_by: "session_order", sort_order: "asc" }),
  ]);
  if (!evt.success || !evt.data) notFound();
  return (
    <SessionsManager
      eventId={id}
      eventTitle={evt.data.title}
      initialSessions={sessions.success ? (sessions.data ?? []) : []}
    />
  );
}
```

- [ ] **Step 2: Sessions manager (list + inline create modal)**

```tsx
// src/app/(dashboard)/events/[id]/sessions/_components/sessions-manager.tsx
"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  useCreateEventSessionMutation,
  useDeleteEventSessionMutation,
  useEventSessionsQuery,
  useUpdateEventSessionMutation,
} from "@/hooks/use-event-sessions-queries";
import type { EventSession } from "@/types";
import { format } from "date-fns";
import Link from "next/link";

const EMPTY: Partial<EventSession> = {
  session_name: "",
  description: "",
  session_date: "",
  start_time: "",
  end_time: "",
  venue: "",
  venue_address: "",
  dress_code: "",
  max_attendees: 0,
  special_notes: "",
  session_order: 1,
};

export default function SessionsManager({
  eventId,
  eventTitle,
  initialSessions,
}: {
  eventId: string;
  eventTitle: string;
  initialSessions: EventSession[];
}) {
  const { data = initialSessions } = useEventSessionsQuery(
    eventId,
    { sort_by: "session_order", sort_order: "asc" },
    initialSessions,
  );
  const create = useCreateEventSessionMutation(eventId);
  const update = useUpdateEventSessionMutation(eventId);
  const del = useDeleteEventSessionMutation(eventId);

  const [editing, setEditing] = useState<EventSession | null>(null);
  const [draft, setDraft] = useState<Partial<EventSession>>(EMPTY);
  const [open, setOpen] = useState(false);

  function startCreate() {
    setEditing(null);
    setDraft({ ...EMPTY, session_order: data.length + 1 });
    setOpen(true);
  }
  function startEdit(s: EventSession) {
    setEditing(s);
    setDraft(s);
    setOpen(true);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const res = editing
      ? await update.mutateAsync({ id: editing.id, data: draft })
      : await create.mutateAsync(draft);
    if (!res.success) return toast.error(res.message);
    toast.success(editing ? "Session updated" : "Session added");
    setOpen(false);
  }

  return (
    <div className="mx-auto max-w-4xl">
      <header className="mb-8 flex items-end justify-between">
        <div>
          <Link href={`/events/${eventId}`} className="text-sm text-mute hover:text-foreground">
            ← {eventTitle}
          </Link>
          <h1 className="mt-2 font-display text-3xl font-medium tracking-tight">Sessions</h1>
          <p className="mt-1 text-sm text-mute">Step 2 of 4</p>
        </div>
        <button
          onClick={startCreate}
          className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background"
        >
          <Plus size={14} /> Add session
        </button>
      </header>

      {data.length === 0 ? (
        <p className="rounded-3xl border border-dashed border-hairline bg-surface/40 p-12 text-center text-mute">
          Add the first session — ceremony, reception, after-party. Each session can have its own venue, time, and dress code.
        </p>
      ) : (
        <ol className="flex flex-col gap-3">
          {data.map((s) => (
            <li
              key={s.id}
              className="flex items-center justify-between rounded-2xl border border-hairline bg-surface p-5"
            >
              <div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-mute">#{s.session_order}</div>
                <div className="mt-1 font-display text-lg font-medium">{s.session_name}</div>
                <div className="text-xs text-mute">
                  {format(new Date(s.session_date), "MMM d")} · {s.start_time}{s.end_time ? `–${s.end_time}` : ""} · {s.venue}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => startEdit(s)}
                  className="grid h-9 w-9 place-items-center rounded-full border border-hairline hover:border-foreground/30"
                  aria-label="Edit"
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={async () => {
                    if (!confirm("Delete this session?")) return;
                    const res = await del.mutateAsync(s.id);
                    if (!res.success) toast.error(res.message);
                  }}
                  className="grid h-9 w-9 place-items-center rounded-full border border-hairline text-destructive hover:border-destructive/40"
                  aria-label="Delete"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </li>
          ))}
        </ol>
      )}

      <div className="mt-10 flex justify-end">
        <Link
          href={`/events/${eventId}/invitations`}
          className="rounded-full border border-hairline px-5 py-2.5 text-sm"
        >
          Continue → Invitations
        </Link>
      </div>

      {open ? (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-foreground/40 p-4 backdrop-blur"
          onClick={() => setOpen(false)}
        >
          <form
            onSubmit={save}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-3xl border border-hairline bg-background p-8"
          >
            <h2 className="font-display text-2xl font-medium">
              {editing ? "Edit session" : "Add session"}
            </h2>
            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
              {[
                ["session_name", "Name", "text"],
                ["session_order", "Order", "number"],
                ["session_date", "Date", "date"],
                ["start_time", "Start", "time"],
                ["end_time", "End", "time"],
                ["venue", "Venue", "text"],
                ["venue_address", "Address", "text"],
                ["max_attendees", "Max attendees", "number"],
              ].map(([k, label, type]) => (
                <label key={k} className="flex flex-col gap-1.5">
                  <span className="text-xs font-medium text-foreground/85">{label}</span>
                  <input
                    type={type}
                    value={(draft as any)[k] ?? ""}
                    onChange={(e) =>
                      setDraft((d) => ({
                        ...d,
                        [k]: type === "number" ? Number(e.target.value) : e.target.value,
                      }))
                    }
                    className="rounded-lg border border-hairline bg-surface px-3 py-2 text-sm focus:border-foreground/40 focus:outline-none"
                  />
                </label>
              ))}
            </div>
            <label className="mt-4 flex flex-col gap-1.5">
              <span className="text-xs font-medium text-foreground/85">Dress code</span>
              <textarea
                value={draft.dress_code ?? ""}
                onChange={(e) => setDraft((d) => ({ ...d, dress_code: e.target.value }))}
                rows={2}
                className="rounded-lg border border-hairline bg-surface px-3 py-2 text-sm focus:border-foreground/40 focus:outline-none"
              />
            </label>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full border border-hairline px-4 py-2 text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={create.isPending || update.isPending}
                className="rounded-full bg-foreground px-5 py-2 text-sm font-medium text-background disabled:opacity-50"
              >
                {editing ? "Save" : "Add"}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}
```

- [ ] **Step 3: Smoke test + commit**

```bash
bun run dev
# verify create/edit/delete cycle
git add src/app/\(dashboard\)/events/\[id\]/sessions
git commit -m "feat(sessions): wizard step 2 — sessions manager"
```

---

## Phase 6 — Invitations

### Task 6.1: Replace `_actions/invitations.ts` with backend routes

**Files:**
- Modify: `src/app/_actions/invitations.ts`

- [ ] **Step 1: Replace contents**

```ts
"use server";

import { revalidateTag } from "next/cache";
import type { APIResponse, Invitation } from "@/types";
import authenticatedApiClient, {
  fromBackend,
  handleError,
  badRequestResponse,
} from "./api-config";
import { CACHE_TAGS } from "@/lib/cache-tags";

export async function getInvitations(
  eventId: string,
): Promise<APIResponse<Invitation[]>> {
  if (!eventId) return badRequestResponse("Event ID required");
  const url = `/api/v1/invitations/${eventId}/list`;
  try {
    const res = await authenticatedApiClient({
      url,
      method: "GET",
      next: { tags: [CACHE_TAGS.INVITATIONS], revalidate: 30 },
    });
    return fromBackend<Invitation[]>(res);
  } catch (error: any) {
    return handleError(error, "GET", url);
  }
}

export async function getInvitation(id: string): Promise<APIResponse<Invitation>> {
  if (!id) return badRequestResponse("Invitation ID required");
  const url = `/api/v1/invitations/${id}`;
  try {
    const res = await authenticatedApiClient({
      url,
      method: "GET",
      next: { tags: [CACHE_TAGS.INVITATION(id)], revalidate: 30 },
    });
    return fromBackend<Invitation>(res);
  } catch (error: any) {
    return handleError(error, "GET", url);
  }
}

export async function createInvitation(
  eventId: string,
  data: Pick<Invitation, "invitation_type" | "custom_image_url" | "sessions">,
): Promise<APIResponse<Invitation>> {
  if (!eventId) return badRequestResponse("Event ID required");
  if (!data?.invitation_type) return badRequestResponse("invitation_type required");
  const url = `/api/v1/invitations/${eventId}`;
  try {
    const res = await authenticatedApiClient({ url, method: "POST", data });
    revalidateTag(CACHE_TAGS.INVITATIONS);
    return fromBackend<Invitation>(res);
  } catch (error: any) {
    return handleError(error, "POST", url);
  }
}

export async function updateInvitation(
  id: string,
  data: Partial<Invitation>,
): Promise<APIResponse<Invitation>> {
  if (!id) return badRequestResponse("Invitation ID required");
  const url = `/api/v1/invitations/${id}`;
  try {
    const res = await authenticatedApiClient({ url, method: "PUT", data });
    revalidateTag(CACHE_TAGS.INVITATIONS);
    revalidateTag(CACHE_TAGS.INVITATION(id));
    return fromBackend<Invitation>(res);
  } catch (error: any) {
    return handleError(error, "PUT", url);
  }
}

export async function deleteInvitation(id: string): Promise<APIResponse> {
  if (!id) return badRequestResponse("Invitation ID required");
  const url = `/api/v1/invitations/${id}`;
  try {
    const res = await authenticatedApiClient({ url, method: "DELETE" });
    revalidateTag(CACHE_TAGS.INVITATIONS);
    revalidateTag(CACHE_TAGS.INVITATION(id));
    return fromBackend(res);
  } catch (error: any) {
    return handleError(error, "DELETE", url);
  }
}
```

- [ ] **Step 2: Type-check + commit**

```bash
bun run type-check
git add src/app/_actions/invitations.ts
git commit -m "feat(invitations): align with backend per-event endpoints"
```

### Task 6.2: Update `use-invitations-queries.ts`

**Files:**
- Modify: `src/hooks/use-invitations-queries.ts`

- [ ] **Step 1: Replace**

```ts
"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createInvitation,
  deleteInvitation,
  getInvitation,
  getInvitations,
  updateInvitation,
} from "@/app/_actions/invitations";
import type { Invitation } from "@/types";
import { INVITATIONS_KEYS } from "@/lib/query-keys";

export function useInvitationsQuery(eventId: string, initialData?: Invitation[]) {
  return useQuery({
    queryKey: INVITATIONS_KEYS.list(eventId),
    queryFn: async () => {
      const res = await getInvitations(eventId);
      if (!res.success) throw new Error(res.message);
      return (res.data ?? []) as Invitation[];
    },
    enabled: !!eventId,
    initialData,
    staleTime: 60 * 1000,
  });
}

export function useInvitationQuery(id: string, initialData?: Invitation) {
  return useQuery({
    queryKey: INVITATIONS_KEYS.detail(id),
    queryFn: async () => {
      const res = await getInvitation(id);
      if (!res.success) throw new Error(res.message);
      return res.data as Invitation;
    },
    enabled: !!id,
    initialData,
    staleTime: 60 * 1000,
  });
}

export function useCreateInvitationMutation(eventId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof createInvitation>[1]) =>
      createInvitation(eventId, data),
    onSuccess: (res) => {
      if (res.success) qc.invalidateQueries({ queryKey: INVITATIONS_KEYS.list(eventId) });
    },
  });
}

export function useUpdateInvitationMutation(eventId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Invitation> }) =>
      updateInvitation(id, data),
    onSuccess: (res, vars) => {
      if (res.success) {
        qc.invalidateQueries({ queryKey: INVITATIONS_KEYS.list(eventId) });
        qc.invalidateQueries({ queryKey: INVITATIONS_KEYS.detail(vars.id) });
      }
    },
  });
}

export function useDeleteInvitationMutation(eventId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteInvitation(id),
    onSuccess: (res) => {
      if (res.success) qc.invalidateQueries({ queryKey: INVITATIONS_KEYS.list(eventId) });
    },
  });
}
```

- [ ] **Step 2: Type-check + commit**

```bash
bun run type-check
git add src/hooks/use-invitations-queries.ts
git commit -m "feat(invitations): hooks per-event"
```

### Task 6.3: Invitations page (wizard step 3)

**Files:**
- Create: `src/app/(dashboard)/events/[id]/invitations/page.tsx`
- Create: `src/app/(dashboard)/events/[id]/invitations/_components/invitations-builder.tsx`

- [ ] **Step 1: SSR page**

```tsx
// src/app/(dashboard)/events/[id]/invitations/page.tsx
import { notFound } from "next/navigation";
import { getEvent } from "@/app/_actions/events";
import { getEventSessions } from "@/app/_actions/event-sessions";
import { getInvitations } from "@/app/_actions/invitations";
import InvitationsBuilder from "./_components/invitations-builder";

export const dynamic = "force-dynamic";

export default async function InvitationsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [evt, sessions, invitations] = await Promise.all([
    getEvent(id),
    getEventSessions(id, { sort_by: "session_order", sort_order: "asc" }),
    getInvitations(id),
  ]);
  if (!evt.success || !evt.data) notFound();
  return (
    <InvitationsBuilder
      eventId={id}
      eventTitle={evt.data.title}
      initialSessions={sessions.success ? (sessions.data ?? []) : []}
      initialInvitations={invitations.success ? (invitations.data ?? []) : []}
    />
  );
}
```

- [ ] **Step 2: Builder component**

```tsx
// src/app/(dashboard)/events/[id]/invitations/_components/invitations-builder.tsx
"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { useEventSessionsQuery } from "@/hooks/use-event-sessions-queries";
import {
  useCreateInvitationMutation,
  useDeleteInvitationMutation,
  useInvitationsQuery,
} from "@/hooks/use-invitations-queries";
import type { EventSession, Invitation } from "@/types";

export default function InvitationsBuilder({
  eventId,
  eventTitle,
  initialSessions,
  initialInvitations,
}: {
  eventId: string;
  eventTitle: string;
  initialSessions: EventSession[];
  initialInvitations: Invitation[];
}) {
  const { data: sessions = initialSessions } = useEventSessionsQuery(
    eventId,
    { sort_by: "session_order", sort_order: "asc" },
    initialSessions,
  );
  const { data: invitations = initialInvitations } = useInvitationsQuery(
    eventId,
    initialInvitations,
  );
  const create = useCreateInvitationMutation(eventId);
  const del = useDeleteInvitationMutation(eventId);

  const [type, setType] = useState("All access pass");
  const [imageUrl, setImageUrl] = useState("");
  const [picked, setPicked] = useState<string[]>([]);

  async function add() {
    if (!type) return toast.error("Type required");
    if (picked.length === 0) return toast.error("Pick at least one session");
    const res = await create.mutateAsync({
      invitation_type: type,
      custom_image_url: imageUrl || undefined,
      sessions: picked,
    });
    if (!res.success) return toast.error(res.message);
    toast.success("Invitation tier added");
    setType("All access pass");
    setImageUrl("");
    setPicked([]);
  }

  return (
    <div className="mx-auto max-w-4xl">
      <header className="mb-8">
        <Link href={`/events/${eventId}`} className="text-sm text-mute hover:text-foreground">
          ← {eventTitle}
        </Link>
        <h1 className="mt-2 font-display text-3xl font-medium tracking-tight">Invitations</h1>
        <p className="mt-1 text-sm text-mute">Step 3 of 4 — define invitation tiers</p>
      </header>

      <section className="rounded-3xl border border-hairline bg-surface p-6">
        <h2 className="font-display text-xl font-medium">New invitation tier</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium">Tier name</span>
            <input
              value={type}
              onChange={(e) => setType(e.target.value)}
              placeholder="VIP, All access, Reception only…"
              className="rounded-lg border border-hairline bg-background px-3 py-2 text-sm focus:border-foreground/40 focus:outline-none"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium">Custom image URL</span>
            <input
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://…"
              className="rounded-lg border border-hairline bg-background px-3 py-2 text-sm focus:border-foreground/40 focus:outline-none"
            />
          </label>
        </div>

        <div className="mt-5">
          <div className="text-xs font-medium">Sessions in this tier</div>
          <div className="mt-2 flex flex-wrap gap-2">
            {sessions.map((s) => {
              const on = picked.includes(s.id);
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() =>
                    setPicked((p) => (on ? p.filter((x) => x !== s.id) : [...p, s.id]))
                  }
                  className={`rounded-full border px-4 py-1.5 text-xs transition ${on ? "border-foreground bg-foreground text-background" : "border-hairline bg-background text-foreground/80 hover:border-foreground/30"}`}
                >
                  #{s.session_order} {s.session_name}
                </button>
              );
            })}
            {sessions.length === 0 ? (
              <span className="text-xs text-mute">Add sessions first.</span>
            ) : null}
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={add}
            disabled={create.isPending}
            className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background disabled:opacity-50"
          >
            <Plus size={14} /> Add tier
          </button>
        </div>
      </section>

      <h2 className="mt-12 font-display text-xl font-medium">Existing tiers</h2>
      {invitations.length === 0 ? (
        <p className="mt-4 rounded-2xl border border-dashed border-hairline bg-surface/40 p-10 text-center text-mute">
          No tiers yet.
        </p>
      ) : (
        <ul className="mt-4 flex flex-col gap-3">
          {invitations.map((i) => (
            <li
              key={i.id}
              className="flex items-center justify-between rounded-2xl border border-hairline bg-surface p-5"
            >
              <div>
                <div className="font-display text-lg font-medium">{i.invitation_type}</div>
                <div className="text-xs text-mute">{i.sessions.length} session{i.sessions.length === 1 ? "" : "s"}</div>
              </div>
              <button
                onClick={async () => {
                  if (!confirm("Delete tier?")) return;
                  const res = await del.mutateAsync(i.id);
                  if (!res.success) toast.error(res.message);
                }}
                className="grid h-9 w-9 place-items-center rounded-full border border-hairline text-destructive hover:border-destructive/40"
              >
                <Trash2 size={14} />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-12 flex justify-end">
        <Link
          href={`/events/${eventId}/guests`}
          className="rounded-full border border-hairline px-5 py-2.5 text-sm"
        >
          Continue → Guests
        </Link>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Smoke test + commit**

```bash
bun run dev
git add src/app/\(dashboard\)/events/\[id\]/invitations
git commit -m "feat(invitations): wizard step 3 — tier builder"
```

---

## Phase 7 — Guests / RSVP placeholders

The Postman collection only stubs guest upload. Build a placeholder UI now; wire to real endpoints when backend is ready.

### Task 7.1: Guests placeholder page

**Files:**
- Create: `src/app/(dashboard)/events/[id]/guests/page.tsx`
- Create: `src/app/(dashboard)/events/[id]/guests/_components/guests-placeholder.tsx`

- [ ] **Step 1: SSR page**

```tsx
// src/app/(dashboard)/events/[id]/guests/page.tsx
import { notFound } from "next/navigation";
import { getEvent } from "@/app/_actions/events";
import GuestsPlaceholder from "./_components/guests-placeholder";

export const dynamic = "force-dynamic";

export default async function GuestsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const evt = await getEvent(id);
  if (!evt.success || !evt.data) notFound();
  return <GuestsPlaceholder eventId={id} eventTitle={evt.data.title} />;
}
```

- [ ] **Step 2: Component**

```tsx
// src/app/(dashboard)/events/[id]/guests/_components/guests-placeholder.tsx
"use client";

import Link from "next/link";
import { Upload } from "lucide-react";

export default function GuestsPlaceholder({
  eventId,
  eventTitle,
}: {
  eventId: string;
  eventTitle: string;
}) {
  return (
    <div className="mx-auto max-w-3xl">
      <Link href={`/events/${eventId}`} className="text-sm text-mute hover:text-foreground">
        ← {eventTitle}
      </Link>
      <h1 className="mt-2 font-display text-3xl font-medium tracking-tight">Guests</h1>
      <p className="mt-1 text-sm text-mute">Step 4 of 4 — upload guest list</p>

      <div className="mt-10 rounded-3xl border border-dashed border-hairline bg-surface/40 p-16 text-center">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-foreground text-background">
          <Upload size={18} />
        </div>
        <p className="mt-6 font-display text-xl">Guest upload — coming online soon</p>
        <p className="mx-auto mt-2 max-w-md text-sm text-mute">
          The backend endpoint for bulk guest import is being finalised. We've built the UI; once the API ships, drop-in CSV upload will land here.
        </p>
      </div>

      <div className="mt-10 flex justify-end">
        <Link
          href={`/events/${eventId}`}
          className="rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background"
        >
          Finish → Back to event
        </Link>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/\(dashboard\)/events/\[id\]/guests
git commit -m "feat(guests): step 4 placeholder until backend lands"
```

---

## Phase 8 — Public invitation / RSVP page

Public RSVP route. Reads event by id (no auth) — assumes backend opens read-only event detail to anonymous guests via a token. If not yet supported, this page falls back to "preview-only" mode.

### Task 8.1: Public event view

**Files:**
- Create: `src/app/(public)/i/[id]/page.tsx`
- Create: `src/app/(public)/i/[id]/_components/public-event.tsx`

- [ ] **Step 1: Public route group + page**

```tsx
// src/app/(public)/i/[id]/page.tsx
import { notFound } from "next/navigation";
import { getEvent } from "@/app/_actions/events";
import { getEventSessions } from "@/app/_actions/event-sessions";
import PublicEvent from "./_components/public-event";

export const dynamic = "force-dynamic";

export default async function PublicEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [evt, sessions] = await Promise.all([
    getEvent(id),
    getEventSessions(id, { sort_by: "session_order", sort_order: "asc" }),
  ]);
  if (!evt.success || !evt.data) notFound();
  return (
    <PublicEvent
      event={evt.data}
      sessions={sessions.success ? (sessions.data ?? []) : []}
    />
  );
}
```

- [ ] **Step 2: Component**

```tsx
// src/app/(public)/i/[id]/_components/public-event.tsx
"use client";

import { format } from "date-fns";
import { Calendar, MapPin } from "lucide-react";
import type { EventRecord, EventSession } from "@/types";

export default function PublicEvent({
  event,
  sessions,
}: {
  event: EventRecord;
  sessions: EventSession[];
}) {
  return (
    <main className="mx-auto max-w-3xl px-6 py-20">
      <header className="text-center">
        <p className="text-[11px] uppercase tracking-[0.3em] text-mute">You are invited</p>
        <h1 className="mt-4 font-display text-5xl font-medium leading-tight tracking-tight">
          {event.title}
        </h1>
        {event.theme ? (
          <p className="mt-2 font-display text-lg italic text-foreground/70">{event.theme}</p>
        ) : null}
      </header>

      <p className="mx-auto mt-10 max-w-2xl text-center text-base leading-relaxed text-foreground/85">
        {event.description}
      </p>

      <div className="mx-auto mt-12 grid max-w-xl gap-3">
        <Row icon={<Calendar size={14} />} label="Date" value={format(new Date(event.start_date), "EEEE, MMMM d, yyyy")} />
        <Row icon={<MapPin size={14} />} label="Venue" value={event.venue ?? "—"} />
      </div>

      {sessions.length > 0 ? (
        <section className="mt-16">
          <h2 className="text-center font-display text-2xl font-medium">Programme</h2>
          <ol className="mt-6 flex flex-col gap-4">
            {sessions.map((s) => (
              <li key={s.id} className="rounded-2xl border border-hairline bg-surface p-5">
                <div className="text-[10px] uppercase tracking-[0.2em] text-mute">#{s.session_order}</div>
                <div className="mt-1 font-display text-lg font-medium">{s.session_name}</div>
                <div className="mt-1 text-xs text-mute">
                  {format(new Date(s.session_date), "MMM d")} · {s.start_time}{s.end_time ? `–${s.end_time}` : ""} · {s.venue}
                </div>
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      <section className="mt-16 text-center">
        <p className="text-sm text-mute">
          RSVP form will appear here once the guest endpoints are live.
        </p>
      </section>
    </main>
  );
}

function Row({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-hairline bg-surface px-5 py-4">
      <div className="flex items-center gap-3 text-mute">
        {icon}
        <span className="text-[10px] uppercase tracking-[0.2em]">{label}</span>
      </div>
      <span className="font-display text-base">{value}</span>
    </div>
  );
}
```

- [ ] **Step 3: Make middleware allow `/i/*`**

In `src/middleware.ts`, extend `PUBLIC_ROUTES` matching:
```ts
const PUBLIC_ROUTES = ["/", "/support", ...AUTH_ROUTES];
// Also treat anything under /i/ as public:
const isPublicPrefix = pathname.startsWith("/i/");
if ((isPublicRoute || isPublicPrefix) && !isAuthenticated) return NextResponse.next();
```

- [ ] **Step 4: Smoke + commit**

```bash
bun run dev
# visit /i/<some-event-id> while logged out
git add src/app/\(public\) src/middleware.ts
git commit -m "feat(public): public event view at /i/[id]"
```

---

## Phase 9 — Dashboard overview + event-types admin page

### Task 9.1: Dashboard overview

**Files:**
- Modify: `src/app/(dashboard)/page.tsx`

- [ ] **Step 1: Replace contents**

```tsx
import Link from "next/link";
import { format } from "date-fns";
import { Calendar, Plus, Sparkles } from "lucide-react";
import { getMyEvents } from "@/app/_actions/events";

export const dynamic = "force-dynamic";

export default async function DashboardHome() {
  const res = await getMyEvents({ page: 1, page_size: 5, sort_by: "created_at", sort_order: "desc" });
  const events = res.success ? (res.data ?? []) : [];

  return (
    <div className="mx-auto max-w-6xl">
      <header className="mb-12">
        <p className="text-[11px] uppercase tracking-[0.3em] text-mute">Overview</p>
        <h1 className="mt-2 font-display text-4xl font-medium tracking-tight">Welcome back</h1>
      </header>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard label="Active events" value={events.filter((e) => e.status !== "cancelled").length} icon={<Calendar size={16} />} />
        <StatCard label="Drafts" value={events.filter((e) => e.status === "draft").length} icon={<Sparkles size={16} />} />
        <StatCard label="Recently created" value={events.length} icon={<Plus size={16} />} />
      </div>

      <section className="mt-12">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl font-medium">Recent events</h2>
          <Link href="/events" className="text-sm text-foreground/70 hover:text-foreground">
            View all →
          </Link>
        </div>
        <ul className="mt-6 flex flex-col gap-3">
          {events.map((e) => (
            <li key={e.id}>
              <Link
                href={`/events/${e.id}`}
                className="flex items-center justify-between rounded-2xl border border-hairline bg-surface p-5 transition hover:border-foreground/25"
              >
                <div>
                  <div className="text-[10px] uppercase tracking-[0.2em] text-mute">{e.status}</div>
                  <div className="mt-1 font-display text-lg font-medium">{e.title}</div>
                </div>
                <span className="text-xs text-mute">{format(new Date(e.start_date), "MMM d, yyyy")}</span>
              </Link>
            </li>
          ))}
          {events.length === 0 ? (
            <li className="rounded-2xl border border-dashed border-hairline bg-surface/40 p-10 text-center text-mute">
              No events yet — <Link className="underline" href="/events/new">create your first</Link>.
            </li>
          ) : null}
        </ul>
      </section>
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-hairline bg-surface p-6">
      <div className="flex items-center gap-2 text-mute">
        {icon}
        <span className="text-[10px] uppercase tracking-[0.2em]">{label}</span>
      </div>
      <div className="mt-3 font-display text-4xl font-medium">{value}</div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/\(dashboard\)/page.tsx
git commit -m "feat(dashboard): overview with SSR-fetched recent events"
```

### Task 9.2: Event types admin page

**Files:**
- Create: `src/app/(dashboard)/event-types/page.tsx`
- Create: `src/app/(dashboard)/event-types/_components/event-types-list.tsx`

- [ ] **Step 1: SSR page**

```tsx
// src/app/(dashboard)/event-types/page.tsx
import { getEventTypes } from "@/app/_actions/event-types";
import EventTypesList from "./_components/event-types-list";

export const dynamic = "force-dynamic";

export default async function EventTypesPage() {
  const res = await getEventTypes();
  return <EventTypesList initialData={res.success ? (res.data ?? []) : []} />;
}
```

- [ ] **Step 2: Client list + create modal**

```tsx
// src/app/(dashboard)/event-types/_components/event-types-list.tsx
"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import {
  useCreateEventTypeMutation,
  useEventTypesQuery,
} from "@/hooks/use-event-types-queries";
import type { EventType } from "@/types";

export default function EventTypesList({ initialData }: { initialData: EventType[] }) {
  const { data = initialData } = useEventTypesQuery(initialData);
  const create = useCreateEventTypeMutation();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState({
    name: "",
    description: "",
    icon_url: "",
    price_per_invitation: 0,
    max_free_invitations: 0,
  });

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const res = await create.mutateAsync(draft);
    if (!res.success) return toast.error(res.message);
    toast.success("Template created");
    setOpen(false);
    setDraft({ name: "", description: "", icon_url: "", price_per_invitation: 0, max_free_invitations: 0 });
  }

  return (
    <div className="mx-auto max-w-5xl">
      <header className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="font-display text-3xl font-medium tracking-tight">Event templates</h1>
          <p className="mt-1 text-sm text-mute">{data.length} templates</p>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background"
        >
          <Plus size={14} /> New template
        </button>
      </header>

      <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {data.map((t) => (
          <li key={t.id} className="rounded-2xl border border-hairline bg-surface p-6">
            <div className="font-display text-xl font-medium">{t.name}</div>
            <p className="mt-2 line-clamp-3 text-sm text-mute">{t.description}</p>
            <div className="mt-4 flex items-center justify-between text-xs text-mute">
              <span>${t.price_per_invitation ?? 0}/invite</span>
              <span>{t.max_free_invitations ?? 0} free</span>
            </div>
          </li>
        ))}
      </ul>

      {open ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/40 p-4 backdrop-blur" onClick={() => setOpen(false)}>
          <form
            onSubmit={save}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-3xl border border-hairline bg-background p-8"
          >
            <h2 className="font-display text-2xl font-medium">New template</h2>
            <div className="mt-6 flex flex-col gap-4">
              <input placeholder="Name" required value={draft.name} onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} className="rounded-lg border border-hairline bg-surface px-4 py-3 text-sm" />
              <textarea placeholder="Description" value={draft.description} onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))} rows={3} className="rounded-lg border border-hairline bg-surface px-4 py-3 text-sm" />
              <input placeholder="Icon URL" value={draft.icon_url} onChange={(e) => setDraft((d) => ({ ...d, icon_url: e.target.value }))} className="rounded-lg border border-hairline bg-surface px-4 py-3 text-sm" />
              <div className="grid grid-cols-2 gap-3">
                <input type="number" placeholder="Price/invite" value={draft.price_per_invitation} onChange={(e) => setDraft((d) => ({ ...d, price_per_invitation: Number(e.target.value) }))} className="rounded-lg border border-hairline bg-surface px-4 py-3 text-sm" />
                <input type="number" placeholder="Free invites" value={draft.max_free_invitations} onChange={(e) => setDraft((d) => ({ ...d, max_free_invitations: Number(e.target.value) }))} className="rounded-lg border border-hairline bg-surface px-4 py-3 text-sm" />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button type="button" onClick={() => setOpen(false)} className="rounded-full border border-hairline px-4 py-2 text-sm">Cancel</button>
              <button type="submit" disabled={create.isPending} className="rounded-full bg-foreground px-5 py-2 text-sm font-medium text-background disabled:opacity-50">Create</button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}
```

- [ ] **Step 3: Smoke + commit**

```bash
bun run dev
git add src/app/\(dashboard\)/event-types
git commit -m "feat(event-types): admin list + create modal"
```

### Task 9.3: Settings / profile page

**Files:**
- Create: `src/app/(dashboard)/settings/page.tsx`
- Create: `src/app/(dashboard)/settings/_components/profile-form.tsx`

- [ ] **Step 1: SSR page**

```tsx
// src/app/(dashboard)/settings/page.tsx
import { getProfile } from "@/app/_actions/auth";
import ProfileForm from "./_components/profile-form";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const me = await getProfile();
  if (!me.success || !me.data) redirect("/login");
  return <ProfileForm initial={me.data} />;
}
```

- [ ] **Step 2: Client form**

```tsx
// src/app/(dashboard)/settings/_components/profile-form.tsx
"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  useProfileQuery,
  useUpdatePasswordMutation,
  useUpdateProfileMutation,
} from "@/hooks/use-auth-mutations";
import type { AuthUser } from "@/types";

export default function ProfileForm({ initial }: { initial: AuthUser }) {
  const { data = initial } = useProfileQuery(initial);
  const updateProfile = useUpdateProfileMutation();
  const updatePassword = useUpdatePasswordMutation();

  const [profile, setProfile] = useState({
    email: data.email,
    first_name: data.first_name ?? "",
    last_name: data.last_name ?? "",
    phone: data.phone ?? "",
  });
  const [password, setPassword] = useState("");

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    const res = await updateProfile.mutateAsync(profile);
    if (!res.success) return toast.error(res.message);
    toast.success("Profile updated");
  }

  async function savePassword(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) return toast.error("Min 8 characters");
    const res = await updatePassword.mutateAsync({ email: profile.email, password });
    if (!res.success) return toast.error(res.message);
    toast.success("Password updated");
    setPassword("");
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-display text-3xl font-medium tracking-tight">Settings</h1>

      <form onSubmit={saveProfile} className="mt-10 flex flex-col gap-4">
        <h2 className="font-display text-xl font-medium">Profile</h2>
        {(["email", "first_name", "last_name", "phone"] as const).map((k) => (
          <label key={k} className="flex flex-col gap-1.5">
            <span className="text-xs font-medium capitalize">{k.replace("_", " ")}</span>
            <input
              type={k === "email" ? "email" : "text"}
              value={(profile as any)[k]}
              onChange={(e) => setProfile((p) => ({ ...p, [k]: e.target.value }))}
              className="rounded-lg border border-hairline bg-surface px-4 py-3 text-sm focus:border-foreground/40 focus:outline-none"
            />
          </label>
        ))}
        <button
          type="submit"
          disabled={updateProfile.isPending}
          className="self-end rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background disabled:opacity-50"
        >
          {updateProfile.isPending ? "Saving…" : "Save profile"}
        </button>
      </form>

      <form onSubmit={savePassword} className="mt-12 flex flex-col gap-4">
        <h2 className="font-display text-xl font-medium">Change password</h2>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="New password (min 8 chars)"
          className="rounded-lg border border-hairline bg-surface px-4 py-3 text-sm focus:border-foreground/40 focus:outline-none"
        />
        <button
          type="submit"
          disabled={updatePassword.isPending}
          className="self-end rounded-full border border-hairline px-5 py-2.5 text-sm disabled:opacity-50"
        >
          {updatePassword.isPending ? "Saving…" : "Update password"}
        </button>
      </form>
    </div>
  );
}
```

- [ ] **Step 3: Smoke + commit**

```bash
bun run dev
git add src/app/\(dashboard\)/settings
git commit -m "feat(settings): profile + password forms"
```

---

## Phase 10 — Polish

### Task 10.1: Run frontend-design pass

The plan deliberately produced functional, clean UI. Now invoke the design pass for refinement (typography sizing, spacing rhythm, motion polish).

- [ ] **Step 1: Trigger frontend-design skill**

In Claude Code, run:
```
/frontend-design
```
Brief: "Polish the dashboard pages (overview, events list, event detail, sessions, invitations, settings) to match the editorial-luxury aesthetic of the public landing. Maintain Fraunces+Manrope, ivory/ink palette, hairline borders, navy/gold accents. Add framer-motion `whileInView` reveals to list cards and section blocks. Keep light + dark parity."

- [ ] **Step 2: Review diff**

`git diff --stat` after the design pass. Ensure no business logic changed — only styles/animations.

- [ ] **Step 3: Smoke each route**

`bun run dev`. Walk every dashboard page in light + dark. Verify motion respects `prefers-reduced-motion`.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "style: design pass on dashboard pages"
```

### Task 10.2: Final type-check + build

- [ ] **Step 1: Type-check**

```bash
bun run type-check
```
Expected: zero errors.

- [ ] **Step 2: Production build**

```bash
bun run build
```
Expected: build succeeds. If failures, fix and recommit.

- [ ] **Step 3: Vitest run**

```bash
bun run test:run
```
Expected: PASS.

- [ ] **Step 4: Commit any fix-ups**

```bash
git add -A
git commit -m "chore: final cleanup"
```

---

## Out of scope (intentionally deferred)

- Real refresh-token flow (backend doesn't expose `/auth/refresh`)
- Guest CSV import + RSVP capture (backend stub only)
- Email/SMS delivery channel selection (backend not yet exposed)
- Analytics dashboard / charts (no metrics endpoints in collection)
- Realtime RSVP updates (would need websockets/SSE; backend has neither)
- Stripe / payments for paid event types (`price_per_invitation` exists but no checkout)
- Multi-tenant org switching
- File upload for `banner_url` / `custom_image_url` (currently expects URL string)

Each becomes its own follow-up plan once backend support lands.

---

## Self-review checklist

- [x] Every server action has matching hook + cache tag
- [x] Every list page is SSR-prefetched and passes `initialData` to a client `useQuery`
- [x] Every mutation invalidates the matching query keys + revalidates the matching cache tags
- [x] Snake_case domain fields throughout (matches backend)
- [x] No silent-refresh assumption (backend has no refresh endpoint)
- [x] All routes from Postman collection are covered (user, event-type, events, event-sessions, invitations); guests deliberately stubbed
- [x] Light + dark theme parity preserved (no new hardcoded colors)
- [x] Motion respects `prefers-reduced-motion` (declared in `globals.css` + framer-motion's `useReducedMotion`)
- [x] Type-check + build run as gates

