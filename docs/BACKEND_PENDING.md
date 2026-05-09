# Backend integration status

Cross-reference of frontend server actions vs `docs/swagger.yaml` (source of truth).

Last audit: 2026-05-09.

## ✅ Wired correctly

### Auth — [src/app/_actions/auth.ts](../src/app/_actions/auth.ts)

| Method | Path | Frontend |
| --- | --- | --- |
| POST | `/api/v1/user/registration` | `registerUser` / `createNewAccount` |
| POST | `/api/v1/user/authentication` | `loginUser` |
| POST | `/api/v1/user/password/reset` | `requestPasswordReset` / `sendResetEmail` |
| GET | `/api/v1/user/profile` | `getMe` |
| PATCH | `/api/v1/user/profile` | `updateProfile` |
| PATCH | `/api/v1/user/password` | `changePassword` |

### Event types — [src/app/_actions/event-types.ts](../src/app/_actions/event-types.ts)

| Method | Path | Frontend |
| --- | --- | --- |
| GET | `/api/v1/event-type/list` | `getEventTypes` |
| GET | `/api/v1/event-type/{id}` | `getEventType` |
| POST | `/api/v1/event-type/new` | `createEventType` |
| PUT | `/api/v1/event-type/{id}` | `updateEventType` |
| DELETE | `/api/v1/event-type/{id}` | `deleteEventType` |

### Events — [src/app/_actions/events.ts](../src/app/_actions/events.ts)

| Method | Path | Frontend |
| --- | --- | --- |
| GET | `/api/v1/events/list` | `getMyEvents` |
| GET | `/api/v1/events/whole-list` | `getAllEvents` |
| GET | `/api/v1/events/{id}` | `getEvent` |
| POST | `/api/v1/events/new` | `createEvent` |
| PUT | `/api/v1/events/{id}` | `updateEvent` |
| DELETE | `/api/v1/events/{id}` | `deleteEvent` |
| PATCH | `/api/v1/events/{id}` | `cancelEvent` |
| GET | `/api/v1/events/{id}/publish` | `publishEvent` |
| PATCH | `/api/v1/events/{id}/complete` | `completeEvent` |
| GET | `/api/v1/events/{id}/stats` | `getEventStats` |

### Event sessions — [src/app/_actions/event-sessions.ts](../src/app/_actions/event-sessions.ts)

| Method | Path | Frontend |
| --- | --- | --- |
| POST | `/api/v1/event-sessions/{eventId}` | `createEventSession` |
| GET | `/api/v1/event-sessions/{eventId}/list` | `getEventSessions` |
| GET | `/api/v1/event-sessions/{id}` | `getEventSession` |
| PUT | `/api/v1/event-sessions/{id}` | `updateEventSession` |
| DELETE | `/api/v1/event-sessions/{id}` | `deleteEventSession` |

### Invitations — [src/app/_actions/invitations.ts](../src/app/_actions/invitations.ts)

| Method | Path | Frontend |
| --- | --- | --- |
| POST | `/api/v1/invitations/{eventId}` | `createInvitation` |
| GET | `/api/v1/invitations/{eventId}/list` | `getInvitations` |
| GET | `/api/v1/invitations/{id}` | `getInvitation` |
| GET | `/api/v1/invitations/{id}/details` | `getInvitationDetails` |
| PUT | `/api/v1/invitations/{id}` | `updateInvitation` |
| DELETE | `/api/v1/invitations/{id}` | `deleteInvitation` |
| POST | `/api/v1/invitations/{id}/send` | `sendInvitation` |

### Guests — [src/app/_actions/guests.ts](../src/app/_actions/guests.ts)

`{id}` is overloaded — meaning depends on verb (see file header for table).

| Method | Path | Frontend |
| --- | --- | --- |
| GET | `/api/v1/guests/{eventId}` | `getGuests` |
| GET | `/api/v1/guests/{guestId}/details` | `getGuestDetails` |
| POST | `/api/v1/guests/{invitationId}` | `uploadGuestsFromUrl` (Excel URL) |
| POST | `/api/v1/guests/{invitationId}/manual` | `addGuestsManual` |
| PUT | `/api/v1/guests/{guestId}` | `updateGuest`, `setGuestRsvp` |
| DELETE | `/api/v1/guests` | `deleteGuests`, single via `useDeleteGuestMutation` |
| POST | `/api/v1/guests/{guestId}/check-in` | `checkInGuest` |

### Files — [src/app/_actions/files.ts](../src/app/_actions/files.ts)

| Method | Path | Frontend |
| --- | --- | --- |
| POST | `/api/v1/files/{collection}` | `uploadFile` |
| GET | `/api/v1/files/{collection}/{record_id}` | `listFiles` |
| GET | `/api/v1/files/{collection}/{record_id}/{filename}` | `fileUrl` (path builder) |
| DELETE | `/api/v1/files/{collection}/{record_id}/{filename}` | `deleteFile` |

Collections: `qr_codes`, `event_banners`, `avatars` (public) — `guest_lists`, `attachments` (auth required).

## ⚠ No public RSVP endpoint

Swagger does not document a public RSVP submission endpoint. RSVP is recorded
via authenticated `PUT /api/v1/guests/{guestId}` with `{ rsvp_status }`.

Frontend status (2026-05-09): `src/app/_actions/public.ts` posts to the
**assumed** path `POST /api/v1/public/guests/{token}/rsvp` behind feature flag
`NEXT_PUBLIC_ENABLE_PUBLIC_RSVP`. Default off — flip to `true` once backend
confirms the endpoint shape. Form lives at
`src/app/(public)/i/[id]/_components/rsvp-form.tsx`.

Token transport currently assumed to be `?t=<opaque>` query string. If backend
chooses path-bound (`/i/<token>`), update `_actions/public.ts` and the page's
`searchParams` plumbing accordingly.

## 🔌 Not yet integrated in frontend

These endpoints are documented but no UI calls them yet:

- `GET /api/v1/webhooks/whatsapp` — Meta verification handshake (server-only)
- `POST /api/v1/webhooks/whatsapp` — inbound messages (server-only)

These belong on the backend, not this repo.

## Schema notes

- `Guest.rsvp_status` is `pending | confirmed | declined` (NOT
  `going / maybe / declined`). Frontend `RsvpStatus` matches.
- `Guest.invitation_method` enum: `email | sms | whatsapp`.
- `start_date` / `end_date` accepted as `YYYY-MM-DD` per swagger examples.
  Frontend `_actions/events.ts` calls `toBackendDate()` (from `@/lib/format`)
  on both fields before POST/PUT, so the form's `datetime-local` input always
  reaches the backend as `YYYY-MM-DD` (time component dropped at the action
  boundary).
