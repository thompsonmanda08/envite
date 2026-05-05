// Centralised cache tags — used by `revalidateTag` after mutations and as
// `next.tags` on read fetches so server-side caches invalidate cleanly.
export const CACHE_TAGS = {
  EVENTS: "events",
  EVENT: (id: string) => `event:${id}`,
  INVITATIONS: "invitations",
  INVITATION: (id: string) => `invitation:${id}`,
  GUESTS: "guests",
  GUESTS_BY_EVENT: (eventId: string) => `guests:event:${eventId}`,
  USER: "user",
  AUTH: "auth",
  EVENT_TYPES: "event-types",
  EVENT_TYPE: (id: string) => `event-type:${id}`,
  SESSIONS: "sessions",
  SESSIONS_BY_EVENT: (eventId: string) => `sessions:event:${eventId}`,
  SESSION: (id: string) => `session:${id}`,
} as const;
