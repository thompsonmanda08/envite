"use server";

import type { APIResponse, Invitation } from "@/types";

import { revalidateTag } from "next/cache";

import { CACHE_TAGS } from "@/lib/cache-tags";

import authenticatedApiClient, {
  fromBackend,
  handleError,
  badRequestResponse,
} from "./api-config";

export async function getInvitations(
  eventId?: string,
): Promise<APIResponse<Invitation[]>> {
  const url = eventId
    ? `/api/v1/events/${eventId}/invitations`
    : "/api/v1/invitations";

  try {
    const res = await authenticatedApiClient({
      url,
      method: "GET",
      next: { tags: [CACHE_TAGS.INVITATIONS], revalidate: 60 },
    });

    return fromBackend<Invitation[]>(res);
  } catch (error: any) {
    return handleError(error, "GET", url);
  }
}

export async function getInvitation(
  id: string,
): Promise<APIResponse<Invitation>> {
  if (!id) return badRequestResponse("Invitation ID is required");
  const url = `/api/v1/invitations/${id}`;

  try {
    const res = await authenticatedApiClient({
      url,
      method: "GET",
      next: { tags: [CACHE_TAGS.INVITATION(id)], revalidate: 60 },
    });

    return fromBackend<Invitation>(res);
  } catch (error: any) {
    return handleError(error, "GET", url);
  }
}

export async function sendInvitations(data: {
  eventId: string;
  guestIds: string[];
  channel: "email" | "sms" | "link";
  message?: string;
}): Promise<APIResponse<Invitation[]>> {
  if (!data?.eventId || !data?.guestIds?.length) {
    return badRequestResponse("Event ID and guest IDs are required");
  }
  const url = `/api/v1/events/${data.eventId}/invitations/send`;

  try {
    const res = await authenticatedApiClient({ url, method: "POST", data });

    revalidateTag(CACHE_TAGS.INVITATIONS, "max");
    revalidateTag(CACHE_TAGS.GUESTS_BY_EVENT(data.eventId), "max");

    return fromBackend<Invitation[]>(res);
  } catch (error: any) {
    return handleError(error, "POST", url);
  }
}

export async function resendInvitation(
  id: string,
): Promise<APIResponse<Invitation>> {
  if (!id) return badRequestResponse("Invitation ID is required");
  const url = `/api/v1/invitations/${id}/resend`;

  try {
    const res = await authenticatedApiClient({ url, method: "POST" });

    revalidateTag(CACHE_TAGS.INVITATION(id), "max");
    revalidateTag(CACHE_TAGS.INVITATIONS, "max");

    return fromBackend<Invitation>(res);
  } catch (error: any) {
    return handleError(error, "POST", url);
  }
}

export async function cancelInvitation(id: string): Promise<APIResponse> {
  if (!id) return badRequestResponse("Invitation ID is required");
  const url = `/api/v1/invitations/${id}`;

  try {
    const res = await authenticatedApiClient({ url, method: "DELETE" });

    revalidateTag(CACHE_TAGS.INVITATION(id), "max");
    revalidateTag(CACHE_TAGS.INVITATIONS, "max");

    return fromBackend(res);
  } catch (error: any) {
    return handleError(error, "DELETE", url);
  }
}
