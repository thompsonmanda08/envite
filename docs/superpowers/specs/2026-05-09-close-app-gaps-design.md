# Close App Gaps — Design Spec

**Date:** 2026-05-09
**Status:** Approved (pending user spec review)

## Goal

Close four targeted gaps in the otherwise complete e-nvite app:

1. Date format mismatch between frontend `datetime-local` inputs and the backend's expected `YYYY-MM-DD`.
2. Test coverage on pure helpers (currently only `response-helpers.test.ts` exists).
3. PWA Phase 2 perf polish (bundle analyzer, dynamic imports, resource hints, package optimization).
4. Public RSVP form — production-grade UI, gated behind a feature flag until backend ships the public endpoint.

## Non-goals

- PWA Phase 3 push notifications (blocked on backend VAPID + subscription endpoints).
- PWA Phase 4 share target / file handlers / periodic sync.
- New features beyond the four gaps.
- UI integration tests (per existing TDD posture: pure helpers only).
- Refactoring areas outside the gap surface.

---

## Phase A — Date format fix

### Problem

`event-form.tsx` uses `<input type="datetime-local">`, which produces `YYYY-MM-DDTHH:mm`. Swagger documents `start_date` / `end_date` as `YYYY-MM-DD`. Today the frontend ships the longer string straight through `_actions/events.ts` and trusts the backend to coerce. Per `BACKEND_PENDING.md` line 121 this is unverified — risk: server-side 400 on stricter validation.

### Approach

Transform at the action boundary, not the form. Single chokepoint, easier to test, leaves the form's `datetime-local` UX intact (host expects to pick a time, even if the API only stores the date).

### Files

- **Create** `src/lib/format.ts` (new) — pure helper module.
  ```ts
  export function toBackendDate(input: string | undefined): string | undefined {
    if (!input) return input;
    return input.split("T")[0];
  }
  ```
- **Modify** `src/app/_actions/events.ts` — `createEvent`, `updateEvent`: pass `start_date` / `end_date` through `toBackendDate` when assembling payloads.
- **Modify** `src/lib/format.test.ts` (new, Phase B covers this).

### Verification

1. `bun run test:run` — `toBackendDate` cases pass.
2. `bun run dev`, walk through the new-event wizard, inspect Network tab — payload shows `start_date: "2026-05-12"` not `"2026-05-12T18:00"`.
3. `bun run type-check` — green.
4. Commit: `fix(events): trim time off start_date/end_date before backend POST/PUT`.

---

## Phase B — Test coverage

### Scope

Pure helpers only, matching the existing TDD posture documented in the original full-app plan. No UI tests, no server-action smoke tests automated (those stay manual).

### Targets

| File | What to cover |
|---|---|
| `src/lib/format.ts` (new) | `toBackendDate` — empty, undefined, `YYYY-MM-DD` passthrough, `YYYY-MM-DDTHH:mm` truncation, ISO with seconds and milliseconds |
| `src/lib/auth.ts` | JWT parse / verify helpers — happy path, expired, malformed, missing claims |
| `src/lib/currency.ts` | `formatCurrency` USD + ZMW; `convertAmount` rounding to 2dp; `fetchLiveExchangeRate` falls back when fetch fails (mock fetch) |
| `src/lib/sanitize.ts` | `isomorphic-dompurify` wrappers — strip script tags, preserve safe markup |
| `src/lib/utils/index.ts`, `src/lib/utils/names.ts` | Whatever pure functions exist (audit before writing) |

### Approach

- Write failing test, then implementation, then refactor (TDD per skill). For helpers that already exist, write test from current behaviour (characterization tests).
- Keep tests in-place beside source: `currency.test.ts` next to `currency.ts`. Matches existing pattern (`response-helpers.test.ts`).

### Verification

1. `bun run test:run` — all tests pass.
2. Coverage spot-check: every exported pure function from listed files has at least one assertion.
3. `bun run type-check` — green.
4. Commit: `test(lib): cover pure helpers (format, auth, currency, sanitize, utils)`.

---

## Phase C — PWA Phase 2 polish

### Goals

Trim bundle, defer EditorJS, add resource hints. No service-worker changes (Phase 1 already shipped at commit `42dfb0f`).

### Changes

1. **Bundle analyzer**
   - Add `@next/bundle-analyzer` (devDep).
   - Wrap `next.config.ts`:
     ```ts
     import withBundleAnalyzer from "@next/bundle-analyzer";
     const analyze = withBundleAnalyzer({ enabled: process.env.ANALYZE === "true" });
     export default analyze(withSerwist(nextConfig));
     ```
   - Add npm script: `"analyze": "ANALYZE=true bun run build"` (cross-platform: use `cross-env` if needed on Windows; check first).

2. **Dynamic-import EditorJS**
   - `rich-text-modal.tsx` already wraps EditorJS. Confirm it's a Client Component, then split:
     ```ts
     const RichTextModal = dynamic(() => import("./rich-text-modal-impl"), { ssr: false });
     ```
   - Move existing `rich-text-modal.tsx` content to `rich-text-modal-impl.tsx`; new `rich-text-modal.tsx` re-exports the dynamic wrapper.

3. **Extend `optimizePackageImports`**
   - In `next.config.ts` `experimental.optimizePackageImports`, add: `cmdk`, `@hookform/resolvers`, `zod`, `react-hook-form`.

4. **Resource hints in `app/layout.tsx`**
   - Add (server-rendered, no client cost):
     ```tsx
     <link rel="dns-prefetch" href={process.env.NEXT_PUBLIC_API_HOST ?? ""} />
     <link rel="preconnect" href="https://ik.imagekit.io" crossOrigin="" />
     ```

### Verification

1. Baseline: `bun run build` — note `Route (app)` First Load JS column for `/dashboard`, `/dashboard/events/new`, `/i/[id]`.
2. Apply changes.
3. `bun run build` — bundle deltas ideally negative on routes that touched EditorJS.
4. `ANALYZE=true bun run build` — eyeball treemap, no surprises.
5. `bun run dev`, smoke: open RichTextModal, confirm it still loads (will fetch on demand now).
6. `bun run type-check` — green.
7. Commit: `perf(pwa): bundle analyzer, dynamic EditorJS, resource hints, package import optimization`.

---

## Phase D — Public RSVP form harden

### Current state

Commit `9f65079` ("feat(public): RSVP form on /i/[id]") added an RSVP form. Backend has no public endpoint per `BACKEND_PENDING.md`. Status of the existing form unclear without inspection — Phase D step 1 audits it.

### Approach

1. **Audit** existing public RSVP UI on `src/app/(public)/i/[id]/_components/`.
2. **Feature flag** the live submission with `NEXT_PUBLIC_ENABLE_PUBLIC_RSVP` (default `false`). When unset/false → show the read-only "look out for invitation" placeholder. When `true` → render the form and POST.
3. **Action contract** — create or align `src/app/_actions/public.ts`:
   ```ts
   "use server";
   export async function submitPublicRsvp(
     token: string,
     payload: { rsvp_status: "confirmed" | "declined"; guest_count?: number; note?: string }
   ): Promise<APIResponse<null>> {
     // POST /api/v1/public/guests/{token}/rsvp (per BACKEND_PENDING.md)
   }
   ```
   No Authorization header — public endpoint.
4. **Token handling** — read from URL query (`?t=...`) or path. Decision: query param first (simpler, swap to path when backend confirms shape).
5. **Form UX** — confirmed / declined toggle, optional `+1` count, optional note, submit, success / failure toasts. Disabled state when flag off.
6. **Tests** — none (UI). Add `submitPublicRsvp` to Phase B unit-test scope if it has any pure transformation logic.

### Verification

1. `NEXT_PUBLIC_ENABLE_PUBLIC_RSVP=false` (default) — visit `/i/<id>` while logged out, see placeholder.
2. `NEXT_PUBLIC_ENABLE_PUBLIC_RSVP=true` locally — see form, submit (will 404 on backend, that's expected). Confirm error UX surfaces.
3. `bun run type-check` — green.
4. Commit: `feat(public): flag-gated RSVP form, action stub for backend public endpoint`.

---

## Sequencing

A → B → C → D. Each phase independently revertable. Type-check + commit at each phase boundary.

| Phase | Estimated effort | Backend dependency |
|---|---|---|
| A — Date fix | 30 min | None |
| B — Tests | 2 hr | None |
| C — PWA polish | 1 hr | None |
| D — Public RSVP | 2 hr | None (gated) |

Total: ~5.5 hr.

## Risks

- **Phase A** — backend may already accept `datetime-local`. If so, the trim is harmless. Verify by inspecting one POST response on the existing dev server before believing the BACKEND_PENDING note.
- **Phase B** — `lib/auth.ts` JWT helpers may rely on env-time secrets. Mock with `vi.stubEnv` if so.
- **Phase C** — EditorJS dynamic wrap can break SSR if any caller renders it server-side. Audit all `<RichTextModal>` callers; all should be Client.
- **Phase D** — token shape unknown. Document the assumption (`?t=...`) and call it out for backend to confirm.

## Open questions

None blocking. All risks have a fallback path documented above.
