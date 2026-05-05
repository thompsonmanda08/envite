"use client";

import type { Guest, RsvpStatus } from "@/types";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  addGuest,
  bulkAddGuests,
  deleteGuest,
  getGuests,
  setRsvp,
  updateGuest,
} from "@/app/_actions/guests";
import { GUESTS_KEYS } from "@/lib/query-keys";

export function useGuestsQuery(
  eventId: string,
  params?: Record<string, any>,
  initialData?: Guest[],
) {
  return useQuery({
    queryKey: GUESTS_KEYS.list(eventId, params),
    queryFn: async () => {
      const res = await getGuests(eventId, { params });

      if (!res.success) throw new Error(res.message);

      return (res.data ?? []) as Guest[];
    },
    enabled: !!eventId,
    initialData,
    staleTime: 30 * 1000,
  });
}

export function useAddGuestMutation(eventId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Guest>) => addGuest(eventId, data),
    onSuccess: (res) => {
      if (res.success) {
        qc.invalidateQueries({ queryKey: ["guests", "list", eventId] });
      }
    },
  });
}

export function useBulkAddGuestsMutation(eventId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (guests: Array<Partial<Guest>>) =>
      bulkAddGuests(eventId, guests),
    onSuccess: (res) => {
      if (res.success) {
        qc.invalidateQueries({ queryKey: ["guests", "list", eventId] });
      }
    },
  });
}

export function useUpdateGuestMutation(eventId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Guest> }) =>
      updateGuest(eventId, id, data),
    onSuccess: (res) => {
      if (res.success) {
        qc.invalidateQueries({ queryKey: ["guests", "list", eventId] });
      }
    },
  });
}

export function useDeleteGuestMutation(eventId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteGuest(eventId, id),
    onSuccess: (res) => {
      if (res.success) {
        qc.invalidateQueries({ queryKey: ["guests", "list", eventId] });
      }
    },
  });
}

export function useSetRsvpMutation(eventId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, rsvp }: { id: string; rsvp: RsvpStatus }) =>
      setRsvp(eventId, id, rsvp),
    onSuccess: (res) => {
      if (res.success) {
        qc.invalidateQueries({ queryKey: ["guests", "list", eventId] });
      }
    },
  });
}
