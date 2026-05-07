"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { Guest, RsvpStatus } from "@/types";
import {
  addGuestsManual,
  checkInGuest,
  deleteGuests,
  getGuestDetails,
  getGuests,
  setGuestRsvp,
  updateGuest,
  uploadGuestsFromUrl,
  type GuestData,
  type UpdateGuestInput,
} from "@/app/_actions/guests";
import { GUESTS_KEYS } from "@/lib/query-keys";

export function useGuestsQuery(eventId: string, initialData?: Guest[]) {
  return useQuery({
    queryKey: GUESTS_KEYS.list(eventId),
    queryFn: async () => {
      const res = await getGuests(eventId);
      if (!res.success) throw new Error(res.message);
      return (res.data ?? []) as Guest[];
    },
    enabled: !!eventId,
    initialData,
    staleTime: 30 * 1000,
  });
}

export function useGuestDetailsQuery(guestId: string) {
  return useQuery({
    queryKey: GUESTS_KEYS.detail(guestId),
    queryFn: async () => {
      const res = await getGuestDetails(guestId);
      if (!res.success) throw new Error(res.message);
      return res.data as Guest;
    },
    enabled: !!guestId,
    staleTime: 30 * 1000,
  });
}

export function useAddGuestsManualMutation(
  invitationId: string,
  eventId?: string,
) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (guests: GuestData[]) =>
      addGuestsManual(invitationId, guests),
    onSuccess: (res) => {
      if (res.success) {
        qc.invalidateQueries({ queryKey: ["guests"] });
        if (eventId)
          qc.invalidateQueries({ queryKey: GUESTS_KEYS.list(eventId) });
      }
    },
  });
}

export function useUploadGuestsMutation(
  invitationId: string,
  eventId?: string,
) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (fileUrl: string) => uploadGuestsFromUrl(invitationId, fileUrl),
    onSuccess: (res) => {
      if (res.success) {
        qc.invalidateQueries({ queryKey: ["guests"] });
        if (eventId)
          qc.invalidateQueries({ queryKey: GUESTS_KEYS.list(eventId) });
      }
    },
  });
}

export function useUpdateGuestMutation(eventId?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateGuestInput }) =>
      updateGuest(id, data),
    onSuccess: (res) => {
      if (res.success) {
        qc.invalidateQueries({ queryKey: ["guests"] });
        if (eventId)
          qc.invalidateQueries({ queryKey: GUESTS_KEYS.list(eventId) });
      }
    },
  });
}

export function useSetRsvpMutation(eventId?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, rsvp }: { id: string; rsvp: RsvpStatus }) =>
      setGuestRsvp(id, rsvp),
    onSuccess: (res) => {
      if (res.success) {
        qc.invalidateQueries({ queryKey: ["guests"] });
        if (eventId)
          qc.invalidateQueries({ queryKey: GUESTS_KEYS.list(eventId) });
      }
    },
  });
}

export function useDeleteGuestsMutation(eventId?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => deleteGuests(ids),
    onSuccess: (res) => {
      if (res.success) {
        qc.invalidateQueries({ queryKey: ["guests"] });
        if (eventId)
          qc.invalidateQueries({ queryKey: GUESTS_KEYS.list(eventId) });
      }
    },
  });
}

// Backward-compat: single delete passes through bulk endpoint.
export function useDeleteGuestMutation(eventId?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteGuests([id]),
    onSuccess: (res) => {
      if (res.success) {
        qc.invalidateQueries({ queryKey: ["guests"] });
        if (eventId)
          qc.invalidateQueries({ queryKey: GUESTS_KEYS.list(eventId) });
      }
    },
  });
}

export function useCheckInGuestMutation(eventId?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      session_id,
      notes,
    }: {
      id: string;
      session_id: string;
      notes?: string;
    }) => checkInGuest(id, { session_id, notes }),
    onSuccess: (res) => {
      if (res.success) {
        qc.invalidateQueries({ queryKey: ["guests"] });
        if (eventId)
          qc.invalidateQueries({ queryKey: GUESTS_KEYS.list(eventId) });
      }
    },
  });
}
