"use client";

import type { EventType } from "@/types";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createEventType,
  deleteEventType,
  getEventType,
  getEventTypes,
  updateEventType,
  type EventTypeInput,
} from "@/app/_actions/event-types";
import { EVENT_TYPES_KEYS } from "@/lib/query-keys";

export function useEventTypesQuery(initialData?: EventType[]) {
  return useQuery({
    queryKey: EVENT_TYPES_KEYS.list(),
    queryFn: async () => {
      const res = await getEventTypes();

      if (!res.success) throw new Error(res.message);

      return (res.data ?? []) as EventType[];
    },
    initialData,
    staleTime: 5 * 60 * 1000,
  });
}

export function useEventTypeQuery(id: string, initialData?: EventType) {
  return useQuery({
    queryKey: EVENT_TYPES_KEYS.detail(id),
    queryFn: async () => {
      const res = await getEventType(id);

      if (!res.success) throw new Error(res.message);

      return res.data as EventType;
    },
    enabled: !!id,
    initialData,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateEventTypeMutation() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: EventTypeInput) => createEventType(data),
    onSuccess: (res) => {
      if (res.success) qc.invalidateQueries({ queryKey: EVENT_TYPES_KEYS.all });
    },
  });
}

export function useUpdateEventTypeMutation() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<EventTypeInput> }) =>
      updateEventType(id, data),
    onSuccess: (res, vars) => {
      if (res.success) {
        qc.invalidateQueries({ queryKey: EVENT_TYPES_KEYS.all });
        qc.invalidateQueries({ queryKey: EVENT_TYPES_KEYS.detail(vars.id) });
      }
    },
  });
}

export function useDeleteEventTypeMutation() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteEventType(id),
    onSuccess: (res, id) => {
      if (res.success) {
        qc.invalidateQueries({ queryKey: EVENT_TYPES_KEYS.all });
        qc.removeQueries({ queryKey: EVENT_TYPES_KEYS.detail(id) });
      }
    },
  });
}
