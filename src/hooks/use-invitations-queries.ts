"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createInvitation,
  deleteInvitation,
  getInvitation,
  getInvitations,
  updateInvitation,
  type InvitationInput,
} from "@/app/_actions/invitations";
import { INVITATIONS_KEYS } from "@/lib/query-keys";
import type { Invitation } from "@/types";

export function useInvitationsQuery(eventId: string, initialData?: Invitation[]) {
  return useQuery({
    queryKey: INVITATIONS_KEYS.list(eventId),
    queryFn: async () => {
      const res = await getInvitations(eventId);
      if (!res.success) throw new Error(res.message);
      return (res.data ?? []) as Invitation[];
    },
    enabled: !!eventId,
    initialData,
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

export function useCreateInvitationMutation(eventId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: InvitationInput) => createInvitation(eventId, data),
    onSuccess: (res) => {
      if (res.success) qc.invalidateQueries({ queryKey: INVITATIONS_KEYS.all });
    },
  });
}

export function useUpdateInvitationMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<InvitationInput>;
    }) => updateInvitation(id, data),
    onSuccess: (res, vars) => {
      if (res.success) {
        qc.invalidateQueries({ queryKey: INVITATIONS_KEYS.all });
        qc.invalidateQueries({ queryKey: INVITATIONS_KEYS.detail(vars.id) });
      }
    },
  });
}

export function useDeleteInvitationMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteInvitation(id),
    onSuccess: (res, id) => {
      if (res.success) {
        qc.invalidateQueries({ queryKey: INVITATIONS_KEYS.all });
        qc.removeQueries({ queryKey: INVITATIONS_KEYS.detail(id) });
      }
    },
  });
}
