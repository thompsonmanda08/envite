"use server";

import type { APIResponse } from "@/types";

import { axios, fromBackend, handleError } from "./api-config";

export type PublicRsvpStatus = "confirmed" | "declined";

export type PublicRsvpPayload = {
  rsvp_status: PublicRsvpStatus;
  guest_count?: number;
  note?: string;
};

/**
 * Submit a guest's RSVP without authentication. Used from the public /i/[id]
 * page once the backend ships POST /api/v1/public/guests/{token}/rsvp.
 *
 * Token comes from the magic-link the guest received. Currently assumed to be
 * an opaque string passed via `?t=` query — confirm with backend before
 * promoting beyond the NEXT_PUBLIC_ENABLE_PUBLIC_RSVP feature flag.
 */
export async function submitPublicRsvp(
  token: string,
  payload: PublicRsvpPayload,
): Promise<APIResponse<null>> {
  if (!token) {
    return { success: false, message: "Missing invitation token", data: null };
  }
  if (!payload?.rsvp_status) {
    return { success: false, message: "RSVP status required", data: null };
  }

  const url = `/api/v1/public/guests/${encodeURIComponent(token)}/rsvp`;
  try {
    const res = await axios.post(url, payload);
    return fromBackend<null>(res);
  } catch (error: unknown) {
    return handleError(error, "POST", url);
  }
}
