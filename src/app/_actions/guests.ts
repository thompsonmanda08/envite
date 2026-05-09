"use server";

// Aligned to docs/swagger.yaml — Guests tag.
// Path semantics (id changes meaning by verb):
//   GET    /guests/{eventId}        -> list event guests
//   POST   /guests/{invitationId}   -> upload XLSX (UploadGuestsRequest)
//   POST   /guests/{invitationId}/manual -> bulk add (ManualGuestsRequest)
//   GET    /guests/{guestId}/details -> single guest
//   PUT    /guests/{guestId}        -> update (UpdateGuestRequest)
//   POST   /guests/{guestId}/check-in -> check in (CheckInRequest)
//   DELETE /guests                  -> bulk delete (DeleteMultipleRequest)

import { revalidateTag } from "next/cache";

import { CACHE_TAGS } from "@/lib/cache-tags";
import type { APIResponse, Guest, InvitationMethod, RsvpStatus } from "@/types";

import authenticatedApiClient, {
  badRequestResponse,
  fromBackend,
  fromBackendList,
  handleError,
} from "./api-config";

export type GuestData = {
  name: string;
  email?: string;
  mobile_number?: string;
  invitation_method: InvitationMethod;
};

export type UpdateGuestInput = {
  name?: string;
  email?: string;
  phone?: string;
  invitation_method?: InvitationMethod;
  invitation_sent?: boolean;
  invitation_sent_at?: string;
  rsvp_status?: RsvpStatus;
  qr_code_url?: string;
};

export async function getGuests(
  eventId: string,
): Promise<APIResponse<Guest[]>> {
  if (!eventId) return badRequestResponse("Event ID required");
  const url = `/api/v1/guests/${eventId}`;
  try {
    const res = await authenticatedApiClient({
      url,
      method: "GET",
      next: {
        tags: [CACHE_TAGS.GUESTS_BY_EVENT(eventId), CACHE_TAGS.GUESTS],
        revalidate: 30,
      },
    });
    return fromBackendList<Guest>(res);
  } catch (error: any) {
    return handleError(error, "GET", url);
  }
}

export async function getGuestDetails(
  guestId: string,
): Promise<APIResponse<Guest>> {
  if (!guestId) return badRequestResponse("Guest ID required");
  const url = `/api/v1/guests/${guestId}/details`;
  try {
    const res = await authenticatedApiClient({
      url,
      method: "GET",
      next: { revalidate: 30 },
    });
    return fromBackend<Guest>(res);
  } catch (error: any) {
    return handleError(error, "GET", url);
  }
}

export async function uploadGuestsFromUrl(
  invitationId: string,
  fileUrl: string,
): Promise<APIResponse> {
  if (!invitationId) return badRequestResponse("Invitation ID required");
  if (!fileUrl) return badRequestResponse("File URL required");
  const url = `/api/v1/guests/${invitationId}`;
  try {
    const res = await authenticatedApiClient({
      url,
      method: "POST",
      data: { url: fileUrl },
    });
    revalidateTag(CACHE_TAGS.GUESTS, "max");
    return fromBackend(res);
  } catch (error: any) {
    return handleError(error, "POST", url);
  }
}

export async function addGuestsManual(
  invitationId: string,
  guests: GuestData[],
): Promise<APIResponse> {
  if (!invitationId) return badRequestResponse("Invitation ID required");
  if (!guests?.length) return badRequestResponse("At least one guest required");
  const url = `/api/v1/guests/${invitationId}/manual`;
  try {
    const res = await authenticatedApiClient({
      url,
      method: "POST",
      data: { guests },
    });
    revalidateTag(CACHE_TAGS.GUESTS, "max");
    return fromBackend(res);
  } catch (error: any) {
    return handleError(error, "POST", url);
  }
}

export async function updateGuest(
  guestId: string,
  data: UpdateGuestInput,
): Promise<APIResponse> {
  if (!guestId) return badRequestResponse("Guest ID required");
  const url = `/api/v1/guests/${guestId}`;
  try {
    const res = await authenticatedApiClient({
      url,
      method: "PUT",
      data,
    });
    revalidateTag(CACHE_TAGS.GUESTS, "max");
    return fromBackend(res);
  } catch (error: any) {
    return handleError(error, "PUT", url);
  }
}

export async function setGuestRsvp(
  guestId: string,
  rsvp_status: RsvpStatus,
): Promise<APIResponse> {
  return updateGuest(guestId, { rsvp_status });
}

export async function deleteGuests(ids: string[]): Promise<APIResponse> {
  if (!ids?.length) return badRequestResponse("At least one ID required");
  const url = "/api/v1/guests";
  try {
    const res = await authenticatedApiClient({
      url,
      method: "DELETE",
      data: { ids },
    });
    revalidateTag(CACHE_TAGS.GUESTS, "max");
    return fromBackend(res);
  } catch (error: any) {
    return handleError(error, "DELETE", url);
  }
}

export async function checkInGuest(
  guestId: string,
  data: { session_id: string; notes?: string },
): Promise<APIResponse> {
  if (!guestId) return badRequestResponse("Guest ID required");
  if (!data?.session_id) return badRequestResponse("Session ID required");
  const url = `/api/v1/guests/${guestId}/check-in`;
  try {
    const res = await authenticatedApiClient({ url, method: "POST", data });
    revalidateTag(CACHE_TAGS.GUESTS, "max");
    return fromBackend(res);
  } catch (error: any) {
    return handleError(error, "POST", url);
  }
}
