"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  cancelInvitation,
  getInvitation,
  getInvitations,
  resendInvitation,
  sendInvitations,
} from "@/app/_actions/invitations";
import type { Invitation } from "@/types";
import { INVITATIONS_KEYS } from "@/lib/query-keys";

export function useInvitationsQuery(eventId?: string) {
  return useQuery({
    queryKey: INVITATIONS_KEYS.list(eventId),
    queryFn: async () => {
      const res = await getInvitations(eventId);
      if (!res.success) throw new Error(res.message);
      return (res.data ?? []) as Invitation[];
    },
    staleTime: 60 * 1000,
  });
}

export function useInvitationQuery(id: string) {
  return useQuery({
    queryKey: INVITATIONS_KEYS.detail(id),
    queryFn: async () => {
      const res = await getInvitation(id);
      if (!res.success) throw new Error(res.message);
      return res.data as Invitation;
    },
    enabled: !!id,
    staleTime: 60 * 1000,
  });
}

export function useSendInvitationsMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      eventId: string;
      guestIds: string[];
      channel: "email" | "sms" | "link";
      message?: string;
    }) => sendInvitations(data),
    onSuccess: (res, vars) => {
      if (res.success) {
        qc.invalidateQueries({ queryKey: INVITATIONS_KEYS.all });
        qc.invalidateQueries({ queryKey: ["guests", "list", vars.eventId] });
      }
    },
  });
}

export function useResendInvitationMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => resendInvitation(id),
    onSuccess: (res) => {
      if (res.success) qc.invalidateQueries({ queryKey: INVITATIONS_KEYS.all });
    },
  });
}

export function useCancelInvitationMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => cancelInvitation(id),
    onSuccess: (res) => {
      if (res.success) qc.invalidateQueries({ queryKey: INVITATIONS_KEYS.all });
    },
  });
}
