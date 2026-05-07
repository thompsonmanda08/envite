"use server";

import { revalidateTag } from "next/cache";

import { CACHE_TAGS } from "@/lib/cache-tags";
import type { APIResponse, EventRecord, EventStatus } from "@/types";

import authenticatedApiClient, {
  badRequestResponse,
  fromBackend,
  handleError,
} from "./api-config";

type ListParams = {
  page?: number;
  page_size?: number;
  status?: EventStatus;
  event_type_id?: string;
  start_date?: string;
  end_date?: string;
  search?: string;
  sort_by?: "created_at" | "start_date" | "title";
  sort_order?: "asc" | "desc";
};

function toQuery(params?: ListParams): Record<string, string> | undefined {
  if (!params) return;
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === "") continue;
    out[k] = String(v);
  }
  return Object.keys(out).length ? out : undefined;
}

export async function getMyEvents(
  params?: ListParams,
): Promise<APIResponse<EventRecord[]>> {
  const url = "/api/v1/events/list";
  try {
    const res = await authenticatedApiClient({
      url,
      method: "GET",
      params: toQuery(params),
      next: { tags: [CACHE_TAGS.EVENTS], revalidate: 30 },
    });
    return fromBackend<EventRecord[]>(res);
  } catch (error: any) {
    return handleError(error, "GET", url);
  }
}

export async function getAllEvents(
  params?: ListParams,
): Promise<APIResponse<EventRecord[]>> {
  const url = "/api/v1/events/whole-list";
  try {
    const res = await authenticatedApiClient({
      url,
      method: "GET",
      params: toQuery(params),
      next: { tags: [CACHE_TAGS.EVENTS], revalidate: 60 },
    });
    return fromBackend<EventRecord[]>(res);
  } catch (error: any) {
    return handleError(error, "GET", url);
  }
}

export async function getEvent(id: string): Promise<APIResponse<EventRecord>> {
  if (!id) return badRequestResponse("Event ID required");
  const url = `/api/v1/events/${id}`;
  try {
    const res = await authenticatedApiClient({
      url,
      method: "GET",
      next: { tags: [CACHE_TAGS.EVENT(id)], revalidate: 30 },
    });
    return fromBackend<EventRecord>(res);
  } catch (error: any) {
    return handleError(error, "GET", url);
  }
}

export type CreateEventInput = Pick<
  EventRecord,
  "event_type_id" | "title" | "start_date"
> &
  Partial<
    Pick<
      EventRecord,
      | "description"
      | "theme"
      | "dress_code"
      | "venue"
      | "venue_address"
      | "venue_map_pin"
      | "end_date"
      | "rsvp_deadline"
      | "max_attendees"
      | "special_instructions"
      | "dietary_restrictions_note"
      | "parking_info"
      | "contact_person"
      | "contact_phone"
      | "contact_email"
      | "requires_rsvp"
      | "is_multi_day"
      | "duration_days"
      | "banner_url"
    >
  >;

export type UpdateEventInput = Partial<CreateEventInput>;

export async function createEvent(
  data: CreateEventInput,
): Promise<APIResponse<EventRecord>> {
  if (!data?.event_type_id || !data?.title || !data?.start_date) {
    return badRequestResponse(
      "event_type_id, title, start_date are required",
    );
  }
  const url = "/api/v1/events/new";
  try {
    const res = await authenticatedApiClient({ url, method: "POST", data });
    revalidateTag(CACHE_TAGS.EVENTS, "max");
    return fromBackend<EventRecord>(res);
  } catch (error: any) {
    return handleError(error, "POST", url);
  }
}

export async function updateEvent(
  id: string,
  data: UpdateEventInput,
): Promise<APIResponse<EventRecord>> {
  if (!id) return badRequestResponse("Event ID required");
  const url = `/api/v1/events/${id}`;
  try {
    const res = await authenticatedApiClient({ url, method: "PUT", data });
    revalidateTag(CACHE_TAGS.EVENTS, "max");
    revalidateTag(CACHE_TAGS.EVENT(id), "max");
    return fromBackend<EventRecord>(res);
  } catch (error: any) {
    return handleError(error, "PUT", url);
  }
}

export async function deleteEvent(id: string): Promise<APIResponse> {
  if (!id) return badRequestResponse("Event ID required");
  const url = `/api/v1/events/${id}`;
  try {
    const res = await authenticatedApiClient({ url, method: "DELETE" });
    revalidateTag(CACHE_TAGS.EVENTS, "max");
    revalidateTag(CACHE_TAGS.EVENT(id), "max");
    return fromBackend(res);
  } catch (error: any) {
    return handleError(error, "DELETE", url);
  }
}

export async function cancelEvent(
  id: string,
): Promise<APIResponse<EventRecord>> {
  if (!id) return badRequestResponse("Event ID required");
  const url = `/api/v1/events/${id}`;
  try {
    const res = await authenticatedApiClient({ url, method: "PATCH" });
    revalidateTag(CACHE_TAGS.EVENTS, "max");
    revalidateTag(CACHE_TAGS.EVENT(id), "max");
    return fromBackend<EventRecord>(res);
  } catch (error: any) {
    return handleError(error, "PATCH", url);
  }
}

// Swagger marks /events/{id}/publish as GET — odd for a state change but
// the spec is authoritative; mirror it.
export async function publishEvent(id: string): Promise<APIResponse> {
  if (!id) return badRequestResponse("Event ID required");
  const url = `/api/v1/events/${id}/publish`;
  try {
    const res = await authenticatedApiClient({ url, method: "GET" });
    revalidateTag(CACHE_TAGS.EVENTS, "max");
    revalidateTag(CACHE_TAGS.EVENT(id), "max");
    return fromBackend(res);
  } catch (error: any) {
    return handleError(error, "GET", url);
  }
}

export async function completeEvent(id: string): Promise<APIResponse> {
  if (!id) return badRequestResponse("Event ID required");
  const url = `/api/v1/events/${id}/complete`;
  try {
    const res = await authenticatedApiClient({ url, method: "PATCH" });
    revalidateTag(CACHE_TAGS.EVENTS, "max");
    revalidateTag(CACHE_TAGS.EVENT(id), "max");
    return fromBackend(res);
  } catch (error: any) {
    return handleError(error, "PATCH", url);
  }
}

export type EventStats = {
  total_guests?: number;
  confirmed?: number;
  declined?: number;
  pending?: number;
  checked_in?: number;
  [k: string]: unknown;
};

export async function getEventStats(
  id: string,
): Promise<APIResponse<EventStats>> {
  if (!id) return badRequestResponse("Event ID required");
  const url = `/api/v1/events/${id}/stats`;
  try {
    const res = await authenticatedApiClient({
      url,
      method: "GET",
      next: { tags: [CACHE_TAGS.EVENT(id)], revalidate: 30 },
    });
    return fromBackend<EventStats>(res);
  } catch (error: any) {
    return handleError(error, "GET", url);
  }
}
