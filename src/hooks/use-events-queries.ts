"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  cancelEvent,
  createEvent,
  deleteEvent,
  getAllEvents,
  getEvent,
  getMyEvents,
  updateEvent,
  type CreateEventInput,
  type UpdateEventInput,
} from "@/app/_actions/events";
import { EVENTS_KEYS } from "@/lib/query-keys";
import type { EventRecord } from "@/types";

type ListParams = Parameters<typeof getMyEvents>[0];

export function useMyEventsQuery(
  params?: ListParams,
  initialData?: EventRecord[],
) {
  return useQuery({
    queryKey: ["events", "list", "mine", params ?? {}],
    queryFn: async () => {
      const res = await getMyEvents(params);
      if (!res.success) throw new Error(res.message);
      return (res.data ?? []) as EventRecord[];
    },
    initialData,
    staleTime: 30 * 1000,
  });
}

export function useAllEventsQuery(
  params?: ListParams,
  initialData?: EventRecord[],
) {
  return useQuery({
    queryKey: ["events", "list", "all", params ?? {}],
    queryFn: async () => {
      const res = await getAllEvents(params);
      if (!res.success) throw new Error(res.message);
      return (res.data ?? []) as EventRecord[];
    },
    initialData,
    staleTime: 60 * 1000,
  });
}

// Backward-compat alias for older callers using `useEventsQuery`.
export const useEventsQuery = useMyEventsQuery;

export function useEventQuery(id: string, initialData?: EventRecord) {
  return useQuery({
    queryKey: EVENTS_KEYS.detail(id),
    queryFn: async () => {
      const res = await getEvent(id);
      if (!res.success) throw new Error(res.message);
      return res.data as EventRecord;
    },
    enabled: !!id,
    initialData,
    staleTime: 30 * 1000,
  });
}

export function useCreateEventMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateEventInput) => createEvent(data),
    onSuccess: (res) => {
      if (res.success) qc.invalidateQueries({ queryKey: EVENTS_KEYS.all });
    },
  });
}

export function useUpdateEventMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateEventInput }) =>
      updateEvent(id, data),
    onSuccess: (res, vars) => {
      if (res.success) {
        qc.invalidateQueries({ queryKey: EVENTS_KEYS.all });
        qc.invalidateQueries({ queryKey: EVENTS_KEYS.detail(vars.id) });
      }
    },
  });
}

export function useDeleteEventMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteEvent(id),
    onSuccess: (res, id) => {
      if (res.success) {
        qc.invalidateQueries({ queryKey: EVENTS_KEYS.all });
        qc.removeQueries({ queryKey: EVENTS_KEYS.detail(id) });
      }
    },
  });
}

export function useCancelEventMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => cancelEvent(id),
    onSuccess: (res, id) => {
      if (res.success) {
        qc.invalidateQueries({ queryKey: EVENTS_KEYS.all });
        qc.invalidateQueries({ queryKey: EVENTS_KEYS.detail(id) });
      }
    },
  });
}
