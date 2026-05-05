"use server";

import { revalidateTag } from "next/cache";
import type { APIResponse, AuthUser } from "@/types";
import authenticatedApiClient, {
  axios,
  fromBackend,
  handleError,
  badRequestResponse,
} from "./api-config";
import { createAuthSession, deleteSession, getCurrentUser } from "@/lib/auth";
import { CACHE_TAGS } from "@/lib/cache-tags";

export type LoginData = { email: string; password: string };
export type SignUpData = {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  password: string;
};

export async function loginUser(data: LoginData): Promise<APIResponse> {
  if (!data?.email || !data?.password) {
    return badRequestResponse("Email and password are required");
  }
  const url = "/api/v1/auth/login";
  try {
    const res = await axios.post(url, data);
    const body = res.data?.data || res.data;

    await createAuthSession({
      access_token: body?.accessToken || body?.access_token,
      refresh_token: body?.refreshToken || body?.refresh_token,
      role: body?.user?.role,
      user_id: body?.user?.id,
      expiresIn: body?.expiresIn,
      user: body?.user,
    });

    revalidateTag(CACHE_TAGS.AUTH);
    return fromBackend(res, "Login successful");
  } catch (error: any) {
    return handleError(error, "POST", url);
  }
}

export async function registerUser(data: SignUpData): Promise<APIResponse> {
  if (!data?.email || !data?.password) {
    return badRequestResponse("Email and password are required");
  }
  const url = "/api/v1/auth/signup";
  try {
    const res = await axios.post(url, data);
    const body = res.data?.data || res.data;

    if (body?.accessToken || body?.access_token) {
      await createAuthSession({
        access_token: body?.accessToken || body?.access_token,
        refresh_token: body?.refreshToken || body?.refresh_token,
        role: body?.user?.role,
        user_id: body?.user?.id,
        expiresIn: body?.expiresIn,
        user: body?.user,
      });
    }

    revalidateTag(CACHE_TAGS.AUTH);
    return fromBackend(res, "Signup successful");
  } catch (error: any) {
    return handleError(error, "POST", url);
  }
}

export async function logoutUser(): Promise<APIResponse> {
  const url = "/api/v1/auth/logout";
  try {
    await authenticatedApiClient({ url, method: "POST" }).catch(() => null);
    await deleteSession();
    revalidateTag(CACHE_TAGS.AUTH);
    return { success: true, message: "Logout successful", data: null };
  } catch (error: any) {
    await deleteSession();
    return handleError(error, "POST", url);
  }
}

export async function getMe(): Promise<APIResponse<AuthUser>> {
  const url = "/api/v1/auth/me";
  try {
    const res = await authenticatedApiClient({
      url,
      method: "GET",
      next: { tags: [CACHE_TAGS.USER], revalidate: 60 },
    });
    return fromBackend<AuthUser>(res);
  } catch (error: any) {
    // Fall back to in-cookie user if backend /me is unreachable.
    const user = await getCurrentUser();
    if (user) return { success: true, message: "OK", data: user };
    return handleError(error, "GET", url);
  }
}

export async function requestPasswordReset(
  email: string,
): Promise<APIResponse> {
  if (!email) return badRequestResponse("Email is required");
  const url = "/api/v1/auth/forgot-password";
  try {
    const res = await axios.post(url, { email });
    return fromBackend(res, "Reset email sent");
  } catch (error: any) {
    return handleError(error, "POST", url);
  }
}

export async function resetPassword(data: {
  token: string;
  password: string;
}): Promise<APIResponse> {
  if (!data?.token || !data?.password) {
    return badRequestResponse("Token and password are required");
  }
  const url = "/api/v1/auth/reset-password";
  try {
    const res = await axios.post(url, data);
    return fromBackend(res, "Password updated");
  } catch (error: any) {
    return handleError(error, "POST", url);
  }
}
