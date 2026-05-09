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
