// Session lifetime. All values in milliseconds.
export const SESSION_CONFIG = {
  // Cookie + JWT envelope TTL. With no refresh-token endpoint, this is the
  // single TTL — long enough to feel persistent, short enough that a stolen
  // cookie expires within a week.
  SESSION_TTL: 7 * 24 * 60 * 60 * 1000, // 7d

  // Idle countdown before screen-lock fires.
  SCREEN_LOCK_COUNTDOWN: 90 * 1000, // 90s
} as const;
