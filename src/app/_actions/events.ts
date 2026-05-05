"use server";

import type { APIResponse, EventRecord } from "@/types";

import { revalidateTag } from "next/cache";

import { CACHE_TAGS } from "@/lib/cache-tags";

import authenticatedApiClient, {
  fromBackend,
  handleError,
  badRequestResponse,
} from "./api-config";

export async function getEvents(opts?: {
  next?: NextFetchRequestConfig;
  params?: Record<string, string>;
}): Promise<APIResponse<EventRecord[]>> {
  const url = "/api/v1/events";

  try {
    const res = await authenticatedApiClient({
      url,
      method: "GET",
      params: opts?.params,
      next: opts?.next ?? { tags: [CACHE_TAGS.EVENTS], revalidate: 60 },
    });

    return fromBackend<EventRecord[]>(res);
  } catch (error: any) {
    return handleError(error, "GET", url);
  }
}

export async function getEvent(id: string): Promise<APIResponse<EventRecord>> {
  if (!id) return badRequestResponse("Event ID is required");
  const url = `/api/v1/events/${id}`;

  try {
    const res = await authenticatedApiClient({
      url,
      method: "GET",
      next: { tags: [CACHE_TAGS.EVENT(id)], revalidate: 60 },
    });

    return fromBackend<EventRecord>(res);
  } catch (error: any) {
    return handleError(error, "GET", url);
  }
}

export async function createEvent(
  data: Partial<EventRecord>,
): Promise<APIResponse<EventRecord>> {
  if (!data?.title || !data?.start_date) {
    return badRequestResponse("Title and start_date are required");
  }
  const url = "/api/v1/events";

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
  data: Partial<EventRecord>,
): Promise<APIResponse<EventRecord>> {
  if (!id) return badRequestResponse("Event ID is required");
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
  if (!id) return badRequestResponse("Event ID is required");
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

export async function publishEvent(
  id: string,
): Promise<APIResponse<EventRecord>> {
  if (!id) return badRequestResponse("Event ID is required");
  const url = `/api/v1/events/${id}/publish`;

  try {
    const res = await authenticatedApiClient({ url, method: "POST" });

    revalidateTag(CACHE_TAGS.EVENTS, "max");
    revalidateTag(CACHE_TAGS.EVENT(id), "max");

    return fromBackend<EventRecord>(res);
  } catch (error: any) {
    return handleError(error, "POST", url);
  }
}
