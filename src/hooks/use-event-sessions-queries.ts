"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createEventSession,
  deleteEventSession,
  getEventSession,
  getEventSessions,
  updateEventSession,
  type CreateEventSessionInput,
  type UpdateEventSessionInput,
} from "@/app/_actions/event-sessions";
import { SESSIONS_KEYS } from "@/lib/query-keys";
import type { EventSession } from "@/types";

type ListParams = Parameters<typeof getEventSessions>[1];

export function useEventSessionsQuery(
  eventId: string,
  params?: ListParams,
  initialData?: EventSession[],
) {
  return useQuery({
    queryKey: SESSIONS_KEYS.list(eventId, params),
    queryFn: async () => {
      const res = await getEventSessions(eventId, params);
      if (!res.success) throw new Error(res.message);
      return (res.data ?? []) as EventSession[];
    },
    enabled: !!eventId,
    initialData,
    staleTime: 30 * 1000,
  });
}

export function useEventSessionQuery(id: string, initialData?: EventSession) {
  return useQuery({
    queryKey: SESSIONS_KEYS.detail(id),
    queryFn: async () => {
      const res = await getEventSession(id);
      if (!res.success) throw new Error(res.message);
      return res.data as EventSession;
    },
    enabled: !!id,
    initialData,
    staleTime: 30 * 1000,
  });
}

export function useCreateEventSessionMutation(eventId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateEventSessionInput) =>
      createEventSession(eventId, data),
    onSuccess: (res) => {
      if (res.success) {
        qc.invalidateQueries({ queryKey: ["sessions", "list", eventId] });
      }
    },
  });
}

export function useUpdateEventSessionMutation(eventId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateEventSessionInput }) =>
      updateEventSession(id, eventId, data),
    onSuccess: (res, vars) => {
      if (res.success) {
        qc.invalidateQueries({ queryKey: ["sessions", "list", eventId] });
        qc.invalidateQueries({ queryKey: SESSIONS_KEYS.detail(vars.id) });
      }
    },
  });
}

export function useDeleteEventSessionMutation(eventId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, hard }: { id: string; hard?: boolean }) =>
      deleteEventSession(id, eventId, hard ?? false),
    onSuccess: (res, vars) => {
      if (res.success) {
        qc.invalidateQueries({ queryKey: ["sessions", "list", eventId] });
        qc.removeQueries({ queryKey: SESSIONS_KEYS.detail(vars.id) });
      }
    },
  });
}
