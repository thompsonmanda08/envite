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

export async function createEventType(
  data: Pick<
    EventType,
    | "name"
    | "description"
    | "icon_url"
    | "price_per_invitation"
    | "max_free_invitations"
  >,
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
