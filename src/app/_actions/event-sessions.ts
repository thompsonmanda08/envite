"use server";

import { revalidateTag } from "next/cache";
import type { APIResponse, EventSession } from "@/types";
import authenticatedApiClient, {
  fromBackend,
  handleError,
  badRequestResponse,
} from "./api-config";
import { CACHE_TAGS } from "@/lib/cache-tags";

type ListParams = {
  page?: number;
  page_size?: number;
  is_active?: boolean;
  start_date?: string;
  end_date?: string;
  sort_by?: "created_at" | "session_date" | "session_name" | "session_order";
  sort_order?: "asc" | "desc";
};

function toQuery(p?: ListParams): Record<string, string> | undefined {
  if (!p) return;
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(p)) {
    if (v === undefined || v === null || v === "") continue;
    out[k] = String(v);
  }
  return Object.keys(out).length ? out : undefined;
}

export async function getEventSessions(
  eventId: string,
  params?: ListParams,
): Promise<APIResponse<EventSession[]>> {
  if (!eventId) return badRequestResponse("Event ID required");
  const url = `/api/v1/event-sessions/${eventId}/list`;
  try {
    const res = await authenticatedApiClient({
      url,
      method: "GET",
      params: toQuery(params),
      next: { tags: [CACHE_TAGS.SESSIONS_BY_EVENT(eventId)], revalidate: 30 },
    });
    return fromBackend<EventSession[]>(res);
  } catch (error: any) {
    return handleError(error, "GET", url);
  }
}

export async function getEventSession(
  id: string,
): Promise<APIResponse<EventSession>> {
  if (!id) return badRequestResponse("Session ID required");
  const url = `/api/v1/event-sessions/${id}`;
  try {
    const res = await authenticatedApiClient({
      url,
      method: "GET",
      next: { tags: [CACHE_TAGS.SESSION(id)], revalidate: 30 },
    });
    return fromBackend<EventSession>(res);
  } catch (error: any) {
    return handleError(error, "GET", url);
  }
}

export async function createEventSession(
  eventId: string,
  data: Partial<EventSession>,
): Promise<APIResponse<EventSession>> {
  if (!eventId) return badRequestResponse("Event ID required");
  if (!data?.session_name || !data?.session_date || !data?.start_time) {
    return badRequestResponse(
      "session_name, session_date, start_time are required",
    );
  }
  const url = `/api/v1/event-sessions/${eventId}`;
  try {
    const res = await authenticatedApiClient({ url, method: "POST", data });
    revalidateTag(CACHE_TAGS.SESSIONS_BY_EVENT(eventId), "max");
    return fromBackend<EventSession>(res);
  } catch (error: any) {
    return handleError(error, "POST", url);
  }
}

export async function updateEventSession(
  id: string,
  data: Partial<EventSession>,
): Promise<APIResponse<EventSession>> {
  if (!id) return badRequestResponse("Session ID required");
  const url = `/api/v1/event-sessions/${id}`;
  try {
    const res = await authenticatedApiClient({ url, method: "PUT", data });
    revalidateTag(CACHE_TAGS.SESSION(id), "max");
    if (data.event_id) {
      revalidateTag(CACHE_TAGS.SESSIONS_BY_EVENT(data.event_id), "max");
    }
    return fromBackend<EventSession>(res);
  } catch (error: any) {
    return handleError(error, "PUT", url);
  }
}

export async function deleteEventSession(
  id: string,
  hard = true,
  eventId?: string,
): Promise<APIResponse> {
  if (!id) return badRequestResponse("Session ID required");
  const url = `/api/v1/event-sessions/${id}`;
  try {
    const res = await authenticatedApiClient({
      url,
      method: "DELETE",
      params: { hard_delete: String(hard) },
    });
    revalidateTag(CACHE_TAGS.SESSION(id), "max");
    if (eventId) {
      revalidateTag(CACHE_TAGS.SESSIONS_BY_EVENT(eventId), "max");
    }
    return fromBackend(res);
  } catch (error: any) {
    return handleError(error, "DELETE", url);
  }
}
