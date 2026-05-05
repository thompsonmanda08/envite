"use server";

import { revalidateTag } from "next/cache";
import type { APIResponse, Guest, RsvpStatus } from "@/types";
import authenticatedApiClient, {
  fromBackend,
  handleError,
  badRequestResponse,
} from "./api-config";
import { CACHE_TAGS } from "@/lib/cache-tags";

export async function getGuests(
  eventId: string,
  opts?: { params?: Record<string, string> },
): Promise<APIResponse<Guest[]>> {
  if (!eventId) return badRequestResponse("Event ID is required");
  const url = `/api/v1/events/${eventId}/guests`;
  try {
    const res = await authenticatedApiClient({
      url,
      method: "GET",
      params: opts?.params,
      next: {
        tags: [CACHE_TAGS.GUESTS_BY_EVENT(eventId), CACHE_TAGS.GUESTS],
        revalidate: 30,
      },
    });
    return fromBackend<Guest[]>(res);
  } catch (error: any) {
    return handleError(error, "GET", url);
  }
}

export async function addGuest(
  eventId: string,
  data: Partial<Guest>,
): Promise<APIResponse<Guest>> {
  if (!eventId) return badRequestResponse("Event ID is required");
  if (!data?.name) return badRequestResponse("Guest name is required");
  const url = `/api/v1/events/${eventId}/guests`;
  try {
    const res = await authenticatedApiClient({ url, method: "POST", data });
    revalidateTag(CACHE_TAGS.GUESTS_BY_EVENT(eventId));
    revalidateTag(CACHE_TAGS.GUESTS);
    return fromBackend<Guest>(res);
  } catch (error: any) {
    return handleError(error, "POST", url);
  }
}

export async function bulkAddGuests(
  eventId: string,
  guests: Array<Partial<Guest>>,
): Promise<APIResponse<Guest[]>> {
  if (!eventId) return badRequestResponse("Event ID is required");
  if (!guests?.length) return badRequestResponse("Guests list is required");
  const url = `/api/v1/events/${eventId}/guests/bulk`;
  try {
    const res = await authenticatedApiClient({
      url,
      method: "POST",
      data: { guests },
    });
    revalidateTag(CACHE_TAGS.GUESTS_BY_EVENT(eventId));
    revalidateTag(CACHE_TAGS.GUESTS);
    return fromBackend<Guest[]>(res);
  } catch (error: any) {
    return handleError(error, "POST", url);
  }
}

export async function updateGuest(
  eventId: string,
  id: string,
  data: Partial<Guest>,
): Promise<APIResponse<Guest>> {
  if (!eventId || !id) return badRequestResponse("Event and guest IDs required");
  const url = `/api/v1/events/${eventId}/guests/${id}`;
  try {
    const res = await authenticatedApiClient({ url, method: "PUT", data });
    revalidateTag(CACHE_TAGS.GUESTS_BY_EVENT(eventId));
    revalidateTag(CACHE_TAGS.GUESTS);
    return fromBackend<Guest>(res);
  } catch (error: any) {
    return handleError(error, "PUT", url);
  }
}

export async function deleteGuest(
  eventId: string,
  id: string,
): Promise<APIResponse> {
  if (!eventId || !id) return badRequestResponse("Event and guest IDs required");
  const url = `/api/v1/events/${eventId}/guests/${id}`;
  try {
    const res = await authenticatedApiClient({ url, method: "DELETE" });
    revalidateTag(CACHE_TAGS.GUESTS_BY_EVENT(eventId));
    revalidateTag(CACHE_TAGS.GUESTS);
    return fromBackend(res);
  } catch (error: any) {
    return handleError(error, "DELETE", url);
  }
}

export async function setRsvp(
  eventId: string,
  id: string,
  rsvp: RsvpStatus,
): Promise<APIResponse<Guest>> {
  if (!eventId || !id) return badRequestResponse("Event and guest IDs required");
  const url = `/api/v1/events/${eventId}/guests/${id}/rsvp`;
  try {
    const res = await authenticatedApiClient({
      url,
      method: "POST",
      data: { rsvp },
    });
    revalidateTag(CACHE_TAGS.GUESTS_BY_EVENT(eventId));
    revalidateTag(CACHE_TAGS.GUESTS);
    return fromBackend<Guest>(res);
  } catch (error: any) {
    return handleError(error, "POST", url);
  }
}
