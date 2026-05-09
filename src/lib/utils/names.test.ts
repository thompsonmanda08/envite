import { describe, expect, it } from "vitest";

import { formatUserName, userInitials } from "./names";

describe("formatUserName", () => {
  it("returns empty string for null user", () => {
    expect(formatUserName(null)).toBe("");
  });

  it("returns empty string for undefined user", () => {
    expect(formatUserName(undefined)).toBe("");
  });

  it("formats full variant with title + first + last", () => {
    expect(
      formatUserName(
        { title: "Dr", first_name: "Edward", last_name: "Mwape" },
        "full",
      ),
    ).toBe("Dr. Edward Mwape");
  });

  it("formats formal variant with first initial", () => {
    expect(
      formatUserName(
        { title: "Dr", first_name: "Edward", last_name: "Mwape" },
        "formal",
      ),
    ).toBe("Dr. E. Mwape");
  });

  it("formats greeting with title + last", () => {
    expect(
      formatUserName(
        { title: "Dr", first_name: "Edward", last_name: "Mwape" },
        "greeting",
      ),
    ).toBe("Dr. Mwape");
  });

  it("formats initials from structured fields", () => {
    expect(
      formatUserName(
        { first_name: "Edward", last_name: "Mwape" },
        "initials",
      ),
    ).toBe("EM");
  });

  it("falls back to legacy name field when no first/last", () => {
    expect(formatUserName({ name: "Edward Mwape" }, "full")).toBe(
      "Edward Mwape",
    );
  });

  it("strips honorific from legacy fallback initials", () => {
    expect(formatUserName({ name: "Dr. E. Mwape" }, "initials")).toBe("EM");
  });

  it("handles camelCase aliases firstName / lastName", () => {
    expect(
      formatUserName(
        { firstName: "Edward", lastName: "Mwape" },
        "full",
      ),
    ).toBe("Edward Mwape");
  });

  it("does not append a dot to titles longer than 4 chars", () => {
    expect(
      formatUserName(
        { title: "Professor", first_name: "Edward", last_name: "Mwape" },
        "greeting",
      ),
    ).toBe("Professor Mwape");
  });
});

describe("userInitials", () => {
  it("delegates to formatUserName initials variant", () => {
    expect(userInitials({ first_name: "Anna", last_name: "Banda" })).toBe("AB");
  });

  it("returns empty string for null", () => {
    expect(userInitials(null)).toBe("");
  });
});
