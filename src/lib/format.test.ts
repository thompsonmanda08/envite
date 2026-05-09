import { describe, expect, it } from "vitest";

import { toBackendDate } from "./format";

describe("toBackendDate", () => {
  it("returns undefined when input is undefined", () => {
    expect(toBackendDate(undefined)).toBeUndefined();
  });

  it("returns empty string when input is empty", () => {
    expect(toBackendDate("")).toBe("");
  });

  it("passes YYYY-MM-DD through unchanged", () => {
    expect(toBackendDate("2026-05-12")).toBe("2026-05-12");
  });

  it("trims time off datetime-local input", () => {
    expect(toBackendDate("2026-05-12T18:30")).toBe("2026-05-12");
  });

  it("trims time off ISO string with seconds", () => {
    expect(toBackendDate("2026-05-12T18:30:45")).toBe("2026-05-12");
  });

  it("trims time off ISO string with milliseconds + Z", () => {
    expect(toBackendDate("2026-05-12T18:30:45.123Z")).toBe("2026-05-12");
  });
});
