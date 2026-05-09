// @vitest-environment node
/// <reference types="vitest" />

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { decrypt, encrypt, getSecretKey } from "./jwt";

const TEST_SECRET = "test-secret-at-least-32-chars-long-yes";

describe("getSecretKey", () => {
  beforeEach(() => {
    vi.stubEnv("AUTH_SECRET", TEST_SECRET);
  });
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns AUTH_SECRET when set", () => {
    expect(getSecretKey()).toBe(TEST_SECRET);
  });

  it("throws when secret is shorter than 32 chars", () => {
    vi.stubEnv("AUTH_SECRET", "short");
    vi.stubEnv("JWT_SECRET", "");
    expect(() => getSecretKey()).toThrow(/at least 32/);
  });
});

describe("encrypt + decrypt", () => {
  beforeEach(() => {
    vi.stubEnv("AUTH_SECRET", TEST_SECRET);
  });
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("encrypts a payload to a 3-part JWT", async () => {
    const token = await encrypt({ sub: "user-1" });
    expect(token.split(".")).toHaveLength(3);
  });

  it("decrypts back to the original payload", async () => {
    const token = await encrypt({ sub: "user-1", role: "host" });
    const payload = await decrypt(token);
    expect(payload).toMatchObject({ sub: "user-1", role: "host" });
  });

  it("throws when encrypt is called with non-object payload", async () => {
    await expect(encrypt(null as any)).rejects.toThrow();
    await expect(encrypt("string" as any)).rejects.toThrow();
  });

  it("returns failure shape when token is undefined", async () => {
    const r = await decrypt(undefined);
    expect(r).toMatchObject({ success: false, message: "No session token" });
  });

  it("returns failure shape when token is malformed", async () => {
    const r = await decrypt("not-a-jwt");
    expect(r).toMatchObject({ success: false, message: "Invalid token format" });
  });

  it("returns 'Token expired' when JWT is past expiration", async () => {
    vi.useFakeTimers();
    const now = Date.now();
    vi.setSystemTime(now);

    const token = await encrypt({ sub: "user-1" }, "1s");
    // clockTolerance is 15s, token expires in 1s, so advance 20s to be past tolerance.
    vi.advanceTimersByTime(20_000);

    const r = await decrypt(token);
    expect(r).toMatchObject({ success: false, message: "Token expired" });

    vi.useRealTimers();
  });

  it("returns 'Failed to verify' on signature mismatch", async () => {
    const token = await encrypt({ sub: "user-1" });
    vi.stubEnv("AUTH_SECRET", "different-secret-also-32-chars-okay-pad");
    const r = await decrypt(token);
    expect(r).toMatchObject({
      success: false,
      message: "Failed to verify session",
    });
  });
});
