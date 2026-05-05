"use server";
import "server-only";

import type { AuthSession, AuthUser, UserType } from "@/types";


import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

import { SESSION_CONFIG } from "@/lib/session-config";
import {
  AUTH_SESSION,
  USER_SESSION,
  PERMISSIONS_SESSION,
  SCREEN_LOCK_SESSION,
} from "@/lib/constants";

// ─── Crypto ─────────────────────────────────────────────────────────────────
const getSecretKey = () => {
  const secret =
    process.env.AUTH_SECRET ||
    process.env.JWT_SECRET ||
    "dev-only-secret-change-me-please-32+chars";

  if (!secret || secret.length < 32) {
    throw new Error("AUTH_SECRET must be at least 32 characters");
  }

  return secret;
};
const getKey = () => new TextEncoder().encode(getSecretKey());

export async function encrypt(payload: any, expirationTime: string = "7d") {
  if (!payload || typeof payload !== "object") {
    throw new Error("Payload must be a non-empty object");
  }

  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expirationTime)
    .sign(getKey());
}

export async function decrypt(token: any) {
  if (!token || typeof token !== "string") {
    return { success: false, message: "No session token", data: null };
  }
  if (token.split(".").length !== 3) {
    return { success: false, message: "Invalid token format", data: null };
  }
  try {
    const { payload } = await jwtVerify(token, getKey(), {
      algorithms: ["HS256"],
      clockTolerance: 15,
    });

    return payload;
  } catch (error: any) {
    return {
      success: false,
      message:
        error?.code === "ERR_JWT_EXPIRED"
          ? "Token expired"
          : "Failed to verify session",
      data: null,
    };
  }
}

// ─── Session lifecycle ──────────────────────────────────────────────────────
function normalizeSessionUser(user?: AuthUser): AuthUser | undefined {
  return user;
}

export async function createAuthSession(input: {
  access_token: string;
  expires_at?: number; // epoch seconds (from backend JWT payload)
  user?: AuthUser;
}): Promise<void> {
  const expiresAt = input.expires_at
    ? new Date(input.expires_at * 1000)
    : new Date(Date.now() + SESSION_CONFIG.SESSION_TTL);

  const session: AuthSession = {
    access_token: input.access_token,
    expiresAt,
    user: normalizeSessionUser(input.user) as any,
  };

  const cookieLifetimeMs = SESSION_CONFIG.SESSION_TTL;
  const cookieExpiry = new Date(Date.now() + cookieLifetimeMs);
  const jwtTtl = `${Math.ceil(cookieLifetimeMs / 1000)}s`;
  const token = await encrypt(session, jwtTtl);

  if (!token) throw new Error("Failed to create session token.");

  const store = await cookies();

  store.set(AUTH_SESSION, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: cookieExpiry,
    sameSite: "strict",
    path: "/",
  });
  store.delete(SCREEN_LOCK_SESSION);
}

export async function updateAuthSession(
  fields: Partial<AuthSession>,
): Promise<AuthSession | undefined> {
  const { isAuthenticated, session: oldSession } = await verifySession();

  if (!isAuthenticated || !oldSession) return;

  const cleaned = Object.fromEntries(
    Object.entries(oldSession).filter(([_, v]) => v !== null),
  ) as AuthSession;

  const newSession: AuthSession = { ...cleaned, ...fields };

  newSession.expiresAt = fields?.expiresAt
    ? new Date(fields.expiresAt as any)
    : oldSession?.expiresAt
      ? new Date(oldSession.expiresAt as any)
      : new Date(Date.now() + SESSION_CONFIG.SESSION_TTL);

  const cookieLifetimeMs = SESSION_CONFIG.SESSION_TTL;
  const cookieExpiry = new Date(Date.now() + cookieLifetimeMs);
  const jwtTtl = `${Math.ceil(cookieLifetimeMs / 1000)}s`;
  const token = await encrypt(newSession, jwtTtl);

  if (!token) throw new Error("Failed to update session token.");

  const store = await cookies();

  store.set(AUTH_SESSION, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: cookieExpiry,
    sameSite: "strict",
    path: "/",
  });

  return newSession;
}

export async function verifySession(): Promise<{
  isAuthenticated: boolean;
  session: AuthSession | null;
  accessExpired?: boolean;
  role?: UserType;
}> {
  try {
    const store = await cookies();
    const cookie = store.get(AUTH_SESSION)?.value;

    if (!cookie) return { isAuthenticated: false, session: null };

    const decrypted = await decrypt(cookie);

    if (!decrypted || (decrypted as any).success === false) {
      await deleteSession();

      return { isAuthenticated: false, session: null };
    }

    const session = decrypted as unknown as AuthSession;

    if (!session?.access_token) {
      return { isAuthenticated: false, session: null };
    }

    if (session.expiresAt) {
      const expiresAt = new Date(session.expiresAt as any);

      if (expiresAt < new Date()) {
        return { isAuthenticated: false, session, accessExpired: true };
      }
    }

    return { isAuthenticated: true, session, role: session.role };
  } catch {
    return { isAuthenticated: false, session: null };
  }
}

export async function getSession(): Promise<AuthSession | null> {
  const { session } = await verifySession();

  return session;
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const { session } = await verifySession();

  return (session?.user as AuthUser) || null;
}

export async function deleteSession() {
  try {
    const store = await cookies();

    store.delete(AUTH_SESSION);
    store.delete(USER_SESSION);
    store.delete(PERMISSIONS_SESSION);
    store.delete(SCREEN_LOCK_SESSION);

    return { success: true, message: "Logout success" };
  } catch (error: any) {
    return {
      success: false,
      message: "Failed to clear session cookies",
      error: error?.message || "Unknown error",
    };
  }
}
