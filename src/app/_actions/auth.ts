"use server";

import { revalidateTag } from "next/cache";

import type { APIResponse, AuthUser } from "@/types";

import { CACHE_TAGS } from "@/lib/cache-tags";
import { createAuthSession, deleteSession, getCurrentUser } from "@/lib/auth";

import authenticatedApiClient, {
  axios,
  badRequestResponse,
  fromBackend,
  handleError,
} from "./api-config";

export type LoginData = { email: string; password: string };

export type SignUpData = {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone: string;
};

export type UpdateProfileData = Partial<
  Pick<AuthUser, "email" | "first_name" | "last_name" | "phone">
>;

export type UpdatePasswordData = { email: string; password: string };

// Decode the unverified JWT payload to extract `expiresAt` (epoch seconds).
// The backend signs these — we only need the claim, not signature verification.
function decodeJwtExpiry(token: string): number | undefined {
  try {
    const [, payload] = token.split(".");
    if (!payload) return;
    const json = JSON.parse(
      Buffer.from(payload.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf-8"),
    );
    if (typeof json?.expiresAt === "number") return json.expiresAt;
    if (typeof json?.exp === "number") return json.exp;
    return;
  } catch {
    return;
  }
}

export async function loginUser(data: LoginData): Promise<APIResponse<AuthUser>> {
  if (!data?.email || !data?.password) {
    return badRequestResponse("Email and password are required");
  }
  const url = "/api/v1/user/authentication";
  try {
    const res = await axios.post(url, data);
    const body = res.data?.data ?? res.data;
    const token: string | undefined =
      body?.token || body?.access_token || body?.accessToken;
    if (!token) {
      return { success: false, message: "Token missing in response", data: null };
    }

    await createAuthSession({
      access_token: token,
      expires_at: decodeJwtExpiry(token),
      user: body?.user,
    });

    revalidateTag(CACHE_TAGS.AUTH, "max");
    return fromBackend<AuthUser>(res, "Login successful");
  } catch (error: any) {
    return handleError(error, "POST", url);
  }
}

export async function registerUser(data: SignUpData): Promise<APIResponse<AuthUser>> {
  if (!data?.email || !data?.password) {
    return badRequestResponse("Email and password are required");
  }
  if (!data?.first_name || !data?.last_name) {
    return badRequestResponse("First and last name are required");
  }
  const url = "/api/v1/user/registration";
  try {
    const res = await axios.post(url, data);
    return fromBackend<AuthUser>(res, "Account created");
  } catch (error: any) {
    return handleError(error, "POST", url);
  }
}

export async function logoutUser(): Promise<APIResponse> {
  await deleteSession();
  revalidateTag(CACHE_TAGS.AUTH, "max");
  return { success: true, message: "Logout successful", data: null };
}

export async function getProfile(): Promise<APIResponse<AuthUser>> {
  const url = "/api/v1/user/profile";
  try {
    const res = await authenticatedApiClient({
      url,
      method: "GET",
      next: { tags: [CACHE_TAGS.USER], revalidate: 60 },
    });
    return fromBackend<AuthUser>(res);
  } catch (error: any) {
    // Fall back to the cookie-cached user when the backend is unreachable.
    const user = await getCurrentUser();
    if (user) return { success: true, message: "OK", data: user };
    return handleError(error, "GET", url);
  }
}

// Backward-compat alias — older callers used `getMe`. Remove once renamed.
export const getMe = getProfile;

export async function updateProfile(
  data: UpdateProfileData,
): Promise<APIResponse<AuthUser>> {
  const url = "/api/v1/user/profile";
  try {
    const res = await authenticatedApiClient({ url, method: "PATCH", data });
    revalidateTag(CACHE_TAGS.USER, "max");
    return fromBackend<AuthUser>(res);
  } catch (error: any) {
    return handleError(error, "PATCH", url);
  }
}

export async function updatePassword(
  data: UpdatePasswordData,
): Promise<APIResponse> {
  if (!data?.email || !data?.password) {
    return badRequestResponse("Email and password are required");
  }
  const url = "/api/v1/user/password";
  try {
    const res = await authenticatedApiClient({ url, method: "PATCH", data });
    return fromBackend(res, "Password updated");
  } catch (error: any) {
    return handleError(error, "PATCH", url);
  }
}

export async function requestPasswordReset(
  email: string,
): Promise<APIResponse> {
  if (!email) return badRequestResponse("Email is required");
  const url = "/api/v1/user/password/reset";
  try {
    const res = await axios.post(url, { email });
    return fromBackend(res, "Reset email sent");
  } catch (error: any) {
    return handleError(error, "POST", url);
  }
}

// Backward-compat aliases for callers that imported the older names.
export const sendResetEmail = requestPasswordReset;
export const createNewAccount = registerUser;

// `resetPassword` was modelled on a token-based flow that the Envite backend
// does not document. Keep the export but mark as deprecated; rewire when
// backend confirms the contract.
export async function resetPassword(_data: {
  token: string;
  password: string;
}): Promise<APIResponse> {
  return {
    success: false,
    message:
      "Token-based password reset is not yet supported by the backend; use updatePassword(authenticated) or requestPasswordReset(email) instead.",
    data: null,
  };
}
