"use server";

import { revalidateTag } from "next/cache";

import { CACHE_TAGS } from "@/lib/cache-tags";
import type { APIResponse, Invitation } from "@/types";

import authenticatedApiClient, {
  badRequestResponse,
  fromBackend,
  fromBackendList,
  handleError,
} from "./api-config";

export type InvitationInput = {
  invitation_type: string;
  custom_image_url?: string;
  sessions: string[];
};

export async function getInvitations(
  eventId: string,
): Promise<APIResponse<Invitation[]>> {
  if (!eventId) return badRequestResponse("Event ID required");
  const url = `/api/v1/invitations/${eventId}/list`;
  try {
    const res = await authenticatedApiClient({
      url,
      method: "GET",
      next: { tags: [CACHE_TAGS.INVITATIONS], revalidate: 60 },
    });
    return fromBackendList<Invitation>(res);
  } catch (error: any) {
    return handleError(error, "GET", url);
  }
}

export async function getInvitation(
  id: string,
): Promise<APIResponse<Invitation>> {
  if (!id) return badRequestResponse("Invitation ID required");
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

export async function createInvitation(
  eventId: string,
  data: InvitationInput,
): Promise<APIResponse<Invitation>> {
  if (!eventId) return badRequestResponse("Event ID required");
  if (!data?.invitation_type)
    return badRequestResponse("Invitation type required");
  if (!data?.sessions?.length)
    return badRequestResponse("At least one session required");

  const url = `/api/v1/invitations/${eventId}`;
  try {
    const res = await authenticatedApiClient({ url, method: "POST", data });
    revalidateTag(CACHE_TAGS.INVITATIONS, "max");
    return fromBackend<Invitation>(res);
  } catch (error: any) {
    return handleError(error, "POST", url);
  }
}

export async function updateInvitation(
  id: string,
  data: Partial<InvitationInput>,
): Promise<APIResponse<Invitation>> {
  if (!id) return badRequestResponse("Invitation ID required");
  const url = `/api/v1/invitations/${id}`;
  try {
    const res = await authenticatedApiClient({ url, method: "PUT", data });
    revalidateTag(CACHE_TAGS.INVITATION(id), "max");
    revalidateTag(CACHE_TAGS.INVITATIONS, "max");
    return fromBackend<Invitation>(res);
  } catch (error: any) {
    return handleError(error, "PUT", url);
  }
}

export async function deleteInvitation(id: string): Promise<APIResponse> {
  if (!id) return badRequestResponse("Invitation ID required");
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

export async function getInvitationDetails(
  id: string,
): Promise<APIResponse<Invitation>> {
  if (!id) return badRequestResponse("Invitation ID required");
  const url = `/api/v1/invitations/${id}/details`;
  try {
    const res = await authenticatedApiClient({
      url,
      method: "GET",
      next: { tags: [CACHE_TAGS.INVITATION(id)], revalidate: 30 },
    });
    return fromBackend<Invitation>(res);
  } catch (error: any) {
    return handleError(error, "GET", url);
  }
}

export type InvitationSendResponse = {
  message?: string;
  queued?: number;
  skipped?: number;
};

// Queues invitation messages to RabbitMQ for delivery via email/WhatsApp.
// Backend returns 402 if event bill not paid. Only guests with
// invitation_sent === false are queued.
export async function sendInvitation(
  invitationId: string,
): Promise<APIResponse<InvitationSendResponse>> {
  if (!invitationId)
    return badRequestResponse("Invitation ID required");
  const url = `/api/v1/invitations/${invitationId}/send`;
  try {
    const res = await authenticatedApiClient({ url, method: "POST" });
    revalidateTag(CACHE_TAGS.INVITATIONS, "max");
    revalidateTag(CACHE_TAGS.GUESTS, "max");
    return fromBackend<InvitationSendResponse>(res);
  } catch (error: any) {
    return handleError(error, "POST", url);
  }
}
