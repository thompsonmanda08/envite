"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  getProfile,
  loginUser,
  logoutUser,
  registerUser,
  requestPasswordReset,
  updatePassword,
  updateProfile,
  type LoginData,
  type SignUpData,
  type UpdatePasswordData,
  type UpdateProfileData,
} from "@/app/_actions/auth";
import { AUTH_KEYS } from "@/lib/query-keys";
import type { AuthUser } from "@/types";

export function useProfileQuery(initialData?: AuthUser) {
  return useQuery({
    queryKey: AUTH_KEYS.me,
    queryFn: async () => {
      const res = await getProfile();
      if (!res.success) throw new Error(res.message);
      return res.data as AuthUser;
    },
    initialData,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}

// Backward-compat alias — older callers used `useMeQuery`.
export const useMeQuery = useProfileQuery;

export function useLoginMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: LoginData) => loginUser(data),
    onSuccess: (res) => {
      if (res.success) qc.invalidateQueries({ queryKey: AUTH_KEYS.me });
    },
  });
}

export function useRegisterMutation() {
  // Registration does NOT auto-login — UI redirects to /login on success.
  // Therefore no profile invalidation here.
  return useMutation({
    mutationFn: (data: SignUpData) => registerUser(data),
  });
}

export function useLogoutMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => logoutUser(),
    onSuccess: () => {
      qc.removeQueries({ queryKey: AUTH_KEYS.me });
      qc.clear();
    },
  });
}

export function useRequestPasswordResetMutation() {
  return useMutation({
    mutationFn: (email: string) => requestPasswordReset(email),
  });
}

export function useUpdateProfileMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateProfileData) => updateProfile(data),
    onSuccess: (res) => {
      if (res.success) qc.invalidateQueries({ queryKey: AUTH_KEYS.me });
    },
  });
}

export function useUpdatePasswordMutation() {
  return useMutation({
    mutationFn: (data: UpdatePasswordData) => updatePassword(data),
  });
}
