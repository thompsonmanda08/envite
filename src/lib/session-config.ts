// Session lifetimes. All values in milliseconds.
export const SESSION_CONFIG = {
  // Access token TTL — fallback when backend doesn't return expiresIn.
  SESSION_TTL: 24 * 60 * 60 * 1000, // 24h

  // Refresh-token TTL — also the cookie + JWT envelope lifetime.
  REFRESH_TOKEN_TTL: 7 * 24 * 60 * 60 * 1000, // 7d

  // Idle countdown before screen-lock fires.
  SCREEN_LOCK_COUNTDOWN: 90 * 1000, // 90s
} as const;
