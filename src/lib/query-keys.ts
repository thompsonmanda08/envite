// React-Query key factories — one source of truth for client-side cache keys.
// Mirror server-side CACHE_TAGS so invalidations stay symmetrical.

export const EVENTS_KEYS = {
  all: ["events"] as const,
  list: (params?: Record<string, any>) =>
    ["events", "list", params ?? {}] as const,
  detail: (id: string) => ["events", id] as const,
};

export const INVITATIONS_KEYS = {
  all: ["invitations"] as const,
  list: (eventId?: string) => ["invitations", "list", eventId ?? null] as const,
  detail: (id: string) => ["invitations", id] as const,
};

export const GUESTS_KEYS = {
  all: ["guests"] as const,
  list: (eventId: string, params?: Record<string, any>) =>
    ["guests", "list", eventId, params ?? {}] as const,
  detail: (id: string) => ["guests", id] as const,
};

export const AUTH_KEYS = {
  session: ["auth", "session"] as const,
  me: ["auth", "me"] as const,
};

export const EVENT_TYPES_KEYS = {
  all: ["event-types"] as const,
  list: () => ["event-types", "list"] as const,
  detail: (id: string) => ["event-types", id] as const,
};
