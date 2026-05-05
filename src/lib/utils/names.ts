/**
 * Format helpers for the structured user-name fields introduced in
 * migration 020_user_titles. The backend stores the cached display string in
 * `users.name`, but UI code should always go through `formatUserName` so we
 * can adapt to titles, initials, and greetings without re-parsing strings.
 */

export type NameInput = {
  title?: string | null;
  first_name?: string | null;
  firstName?: string | null;
  last_name?: string | null;
  lastName?: string | null;
  name?: string | null;
};

export type NameVariant = "formal" | "greeting" | "full" | "initials";

const SHORT_TITLE_MAX_LEN = 4;

const trim = (v: string | null | undefined): string =>
  typeof v === "string" ? v.trim() : "";

const titleWithDot = (title: string): string => {
  if (!title) return "";
  if (title.endsWith(".")) return title;
  if (title.length <= SHORT_TITLE_MAX_LEN) return `${title}.`;
  return title;
};

/** Pull (title, first, last, fallbackFullName) from any caller shape. */
const pickFields = (u: NameInput) => ({
  title: trim(u.title),
  first: trim(u.first_name ?? u.firstName),
  last: trim(u.last_name ?? u.lastName),
  fallback: trim(u.name),
});

/**
 * Return a display string for a user.
 *
 * - `formal`   → "Dr. E. Mwape" (title + first initial + last)
 * - `greeting` → "Dr. Mwape"     (title + last)
 * - `full`     → "Dr. Edward Mwape" (title + first + last)
 * - `initials` → "EM" (uppercased first letter of first + last)
 *
 * Falls back to legacy `name` parsing when first/last are absent so the UI
 * stays sensible during the migration window.
 */
export function formatUserName(
  user: NameInput | null | undefined,
  variant: NameVariant = "full",
): string {
  if (!user) return "";

  const { title, first, last, fallback } = pickFields(user);

  // Legacy fallback: nothing structured, use the cached name verbatim.
  if (!first && !last) {
    if (variant === "initials") return fallbackInitials(fallback);
    return fallback;
  }

  if (variant === "initials") {
    return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
  }

  const t = title ? titleWithDot(title) : "";

  if (variant === "greeting") {
    return [t, last || first].filter(Boolean).join(" ");
  }

  if (variant === "formal") {
    const initial = first ? `${first.charAt(0).toUpperCase()}.` : "";
    return [t, initial, last].filter(Boolean).join(" ");
  }

  // full
  return [t, first, last].filter(Boolean).join(" ");
}

/**
 * Initials from a user object — preferred over the legacy `getInitials(name)`
 * because it uses the structured fields when present.
 */
export const userInitials = (
  user: NameInput | null | undefined,
): string => formatUserName(user, "initials");

/** Last-resort initials parser for a single string (e.g. "Dr. E. Mwape").
 * Strips a leading honorific token before taking initials so we never get
 * "DE" out of "Dr. E. Mwape". */
function fallbackInitials(name: string): string {
  if (!name) return "";
  const HONORIFIC_RE = /^(mr|mrs|ms|miss|mx|dr|prof|rev)\.?$/i;
  const tokens = name.split(/\s+/).filter(Boolean);
  const stripped = tokens[0] && HONORIFIC_RE.test(tokens[0])
    ? tokens.slice(1)
    : tokens;
  if (stripped.length === 0) return "";
  if (stripped.length === 1) {
    return stripped[0].charAt(0).toUpperCase();
  }
  // First initial + last initial. Skip middle initials so "E. Mwape" → "EM".
  const first = stripped[0].replace(/[^a-zA-Z]/g, "");
  const last = stripped[stripped.length - 1].replace(/[^a-zA-Z]/g, "");
  return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
}
