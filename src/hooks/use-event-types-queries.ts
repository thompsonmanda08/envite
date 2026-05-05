"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createEventType,
  getEventType,
  getEventTypes,
} from "@/app/_actions/event-types";
import type { EventType } from "@/types";
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
    mutationFn: (data: Parameters<typeof createEventType>[0]) => createEventType(data),
    onSuccess: (res) => {
      if (res.success) qc.invalidateQueries({ queryKey: EVENT_TYPES_KEYS.all });
    },
  });
}
