"use server";

import type { APIResponse, EventType } from "@/types";

import { revalidateTag } from "next/cache";

import { CACHE_TAGS } from "@/lib/cache-tags";

import authenticatedApiClient, {
  fromBackend,
  handleError,
  badRequestResponse,
} from "./api-config";

export async function getEventTypes(): Promise<APIResponse<EventType[]>> {
  const url = "/api/v1/event-type/list";

  try {
    const res = await authenticatedApiClient({
      url,
      method: "GET",
      next: { tags: [CACHE_TAGS.EVENT_TYPES], revalidate: 300 },
    });

    return fromBackend<EventType[]>(res);
  } catch (error: any) {
    return handleError(error, "GET", url);
  }
}

export async function getEventType(
  id: string,
): Promise<APIResponse<EventType>> {
  if (!id) return badRequestResponse("Event type ID required");
  const url = `/api/v1/event-type/${id}/details`;

  try {
    const res = await authenticatedApiClient({
      url,
      method: "GET",
      next: { tags: [CACHE_TAGS.EVENT_TYPE(id)], revalidate: 300 },
    });

    return fromBackend<EventType>(res);
  } catch (error: any) {
    return handleError(error, "GET", url);
  }
}

export type EventTypeInput = Pick<
  EventType,
  | "name"
  | "description"
  | "icon_url"
  | "price_per_invitation"
  | "max_free_invitations"
>;

export async function createEventType(
  data: EventTypeInput,
): Promise<APIResponse<EventType>> {
  if (!data?.name) return badRequestResponse("Name required");
  const url = "/api/v1/event-type/new";

  try {
    const res = await authenticatedApiClient({ url, method: "POST", data });

    revalidateTag(CACHE_TAGS.EVENT_TYPES, "max");

    return fromBackend<EventType>(res);
  } catch (error: any) {
    return handleError(error, "POST", url);
  }
}

// NOTE: update + delete endpoints not yet documented in postman. URLs are
// optimistic guesses; calls will 404 until backend lands. See
// docs/BACKEND_PENDING.md.
export async function updateEventType(
  id: string,
  data: Partial<EventTypeInput>,
): Promise<APIResponse<EventType>> {
  if (!id) return badRequestResponse("Event type ID required");
  const url = `/api/v1/event-type/${id}`;

  try {
    const res = await authenticatedApiClient({ url, method: "PUT", data });
    revalidateTag(CACHE_TAGS.EVENT_TYPES, "max");
    revalidateTag(CACHE_TAGS.EVENT_TYPE(id), "max");
    return fromBackend<EventType>(res);
  } catch (error: any) {
    return handleError(error, "PUT", url);
  }
}

export async function deleteEventType(id: string): Promise<APIResponse> {
  if (!id) return badRequestResponse("Event type ID required");
  const url = `/api/v1/event-type/${id}`;

  try {
    const res = await authenticatedApiClient({ url, method: "DELETE" });
    revalidateTag(CACHE_TAGS.EVENT_TYPES, "max");
    revalidateTag(CACHE_TAGS.EVENT_TYPE(id), "max");
    return fromBackend(res);
  } catch (error: any) {
    return handleError(error, "DELETE", url);
  }
}
