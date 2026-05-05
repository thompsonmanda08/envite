"use server";

import type { APIResponse, RsvpStatus } from "@/types";

import {
  axios,
  badRequestResponse,
  fromBackend,
  handleError,
} from "./api-config";

export type PublicRsvpInput = {
  event_id: string;
  name: string;
  email: string;
  rsvp: RsvpStatus;
  plus_ones?: number;
  session_id?: string;
  message?: string;
  phone?: string;
};

export async function submitPublicRsvp(
  data: PublicRsvpInput,
): Promise<APIResponse> {
  if (!data?.event_id) return badRequestResponse("Event ID required");
  if (!data?.name) return badRequestResponse("Name required");
  if (!data?.email) return badRequestResponse("Email required");
  if (!data?.rsvp) return badRequestResponse("RSVP status required");

  const url = `/api/v1/public/events/${data.event_id}/rsvp`;
  const { event_id: _ignored, ...payload } = data;

  try {
    const res = await axios.post(url, payload);
    return fromBackend(res, "Response received");
  } catch (error: any) {
    return handleError(error, "POST", url);
  }
}
