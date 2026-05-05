# Backend Pending

Surfaces shipped in the frontend that require backend work before going live.
URLs below are the optimistic guesses currently posted by the action layer —
swap them in once routes are confirmed.

Reference: [Envite.postman_collection.json](./Envite.postman_collection.json).

---

## 1. Guest CRUD

**Frontend:** [src/app/(dashboard)/events/[id]/guests/](../src/app/(dashboard)/events/%5Bid%5D/guests/)
**Actions:** [src/app/_actions/guests.ts](../src/app/_actions/guests.ts)
**Hooks:** [src/hooks/use-guests-queries.ts](../src/hooks/use-guests-queries.ts)
**Postman:** only `events / step 4 - upload guests` stub with empty URL.

| Action            | Verb   | Optimistic URL                                  | Body / params                                |
| ----------------- | ------ | ----------------------------------------------- | -------------------------------------------- |
| `getGuests`       | GET    | `/api/v1/events/{eventId}/guests`               | `?page&page_size&rsvp&group&search`          |
| `addGuest`        | POST   | `/api/v1/events/{eventId}/guests`               | `{name, email?, phone?, group?, plus_ones?}` |
| `bulkAddGuests`   | POST   | `/api/v1/events/{eventId}/guests/bulk`          | `{guests: Guest[]}`                          |
| `updateGuest`     | PUT    | `/api/v1/events/{eventId}/guests/{id}`          | `Partial<Guest>`                             |
| `deleteGuest`     | DELETE | `/api/v1/events/{eventId}/guests/{id}`          | —                                            |
| `setRsvp`         | PATCH  | `/api/v1/events/{eventId}/guests/{id}/rsvp`     | `{rsvp: "pending"\|"going"\|"maybe"\|"declined"}` |

`Guest` shape: see [src/types/index.ts](../src/types/index.ts) — `id, event_id, name, email?, phone?, rsvp, plus_ones?, group?, notes?, invited_at?, responded_at?`.

**UI behaviour today:** stat row + add-guest dialog + inline RSVP toggle + delete all render and call mutations; `useGuestsQuery` returns empty list on 404 (caught upstream).

---

## 2. Public RSVP submission

**Frontend:** [src/app/(public)/i/[id]/_components/rsvp-form.tsx](../src/app/(public)/i/%5Bid%5D/_components/rsvp-form.tsx)
**Actions:** [src/app/_actions/public.ts](../src/app/_actions/public.ts)
**Postman:** no public namespace exists.

| Action              | Verb | Optimistic URL                                | Body                                                                                  |
| ------------------- | ---- | --------------------------------------------- | ------------------------------------------------------------------------------------- |
| `submitPublicRsvp`  | POST | `/api/v1/public/events/{event_id}/rsvp`       | `{name, email, rsvp, phone?, plus_ones?, session_id?, message?}`                      |

Uses unauthenticated `axios` client (no `Authorization` header). Backend
should accept either anonymous responses or token-gated invite links
(`/i/{shareCode}`). If tokenised, accept `?token=` and skip name/email.

**UI behaviour today:** form submits, toast on error, success state with
status-aware copy (`Going` / `Maybe` / `Declined`).

---

## 3. Event-type update & delete

**Frontend:** [src/app/(dashboard)/event-types/](../src/app/(dashboard)/event-types/)
**Actions:** [src/app/_actions/event-types.ts](../src/app/_actions/event-types.ts)
**Postman:** has only `event-type/list`, `event-type/{id}/details`, `event-type/new`.

Pending:

| Action              | Verb   | Suggested URL                          | Body                  |
| ------------------- | ------ | -------------------------------------- | --------------------- |
| `updateEventType`   | PUT    | `/api/v1/event-type/{id}`              | `Partial<EventType>`  |
| `deleteEventType`   | DELETE | `/api/v1/event-type/{id}`              | —                     |

Frontend currently exposes list + create only — no edit/delete UI yet
(blocked on backend).

---

## 4. Password reset token flow

**Frontend:** [src/app/(auth)/reset-password/page.tsx](../src/app/(auth)/reset-password/page.tsx)
**Postman:** has `POST /user/password/reset` (request reset email) and
`PATCH /user/password` (change password while authenticated). No
**token-based reset** endpoint exists.

Pending:

| Action              | Verb | Suggested URL                          | Body                          |
| ------------------- | ---- | -------------------------------------- | ----------------------------- |
| Verify reset token  | GET  | `/api/v1/user/password/reset/{token}`  | —                             |
| Set new password    | POST | `/api/v1/user/password/reset/{token}`  | `{password, password_confirm}`|

`reset-password/page.tsx` currently shows a placeholder card pointing
users to Settings → Passphrase or `mailto:hello@e-nvite.com`. Wire to
`resetPassword({ token, password })` in
[src/app/_actions/auth.ts](../src/app/_actions/auth.ts) once endpoints land.

---

## 5. Invitation share URL & guest distribution

**Frontend:** [src/app/(dashboard)/events/[id]/invitations/](../src/app/(dashboard)/events/%5Bid%5D/invitations/)
**Postman:** invitation create/update/delete documented; **no `share_url`** in response examples and **no per-guest distribution** endpoint.

Pending clarifications:

- Does the backend return `share_url` (e.g. `/i/{slug}` or signed token URL) on `POST /invitations/{eventId}`? UI reads `inv.share_url` and exposes copy-to-clipboard if present.
- How are guests connected to invitations? Current `Invitation` type has `sessions: string[]` but no guest list. Postman shows no link-to-guests endpoint.
- Is there a "send" / "dispatch" step that emails the invitation to a guest list, or are invitations purely templates that guests reach via shared link?

UI today treats invitations as **templates only** (type + image + sessions). No send button — was removed in commit `797ae20`.

---

## 6. Imagekit upload auth

**Frontend:** [src/components/ui/image-upload.tsx](../src/components/ui/image-upload.tsx), [src/components/base/single-image-upload.tsx](../src/components/base/single-image-upload.tsx)
**Action:** [src/app/_actions/index.ts](../src/app/_actions/index.ts) → `uploadImageAuth()`
**Postman:** no upload-auth endpoint documented.

Currently calls `getUploadAuthParams` from `@imagekit/next/server` using
local env vars (`IMAGEKIT_PRIVATE_KEY`, `NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY`).
Works if those are set; backend may want to mediate signing. Confirm
intended pattern.

---

## Resolution checklist

When backend confirms each surface, do this in order:

1. Update the relevant `_actions/*.ts` URLs and bodies.
2. Adjust the type in [src/types/index.ts](../src/types/index.ts) if response shape differs.
3. Drop the `NOTE:` comment block at the top of the affected action file.
4. Sanity-check the `revalidateTag(..., "max")` calls — Next 16 requires the cacheLife profile arg.
5. Run `pnpm type-check && pnpm build` and smoke the matching UI route.
