"use client";

import type { EventRecord } from "@/types";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createEvent,
  deleteEvent,
  getEvent,
  getEvents,
  publishEvent,
  updateEvent,
} from "@/app/_actions/events";
import { EVENTS_KEYS } from "@/lib/query-keys";

export function useEventsQuery(
  params?: Record<string, any>,
  initialData?: EventRecord[],
) {
  return useQuery({
    queryKey: EVENTS_KEYS.list(params),
    queryFn: async () => {
      const res = await getEvents({ params });

      if (!res.success) throw new Error(res.message);

      return (res.data ?? []) as EventRecord[];
    },
    initialData,
    staleTime: 60 * 1000,
  });
}

export function useEventQuery(id: string) {
  return useQuery({
    queryKey: EVENTS_KEYS.detail(id),
    queryFn: async () => {
      const res = await getEvent(id);

      if (!res.success) throw new Error(res.message);

      return res.data as EventRecord;
    },
    enabled: !!id,
    staleTime: 60 * 1000,
  });
}

export function useCreateEventMutation() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<EventRecord>) => createEvent(data),
    onSuccess: (res) => {
      if (res.success) qc.invalidateQueries({ queryKey: EVENTS_KEYS.all });
    },
  });
}

export function useUpdateEventMutation() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<EventRecord> }) =>
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

export function usePublishEventMutation() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => publishEvent(id),
    onSuccess: (res, id) => {
      if (res.success) {
        qc.invalidateQueries({ queryKey: EVENTS_KEYS.all });
        qc.invalidateQueries({ queryKey: EVENTS_KEYS.detail(id) });
      }
    },
  });
}
