"use client";

import type { AuthUser } from "@/types";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  getMe,
  loginUser,
  logoutUser,
  registerUser,
  requestPasswordReset,
  resetPassword,
  type LoginData,
  type SignUpData,
} from "@/app/_actions/auth";
import { AUTH_KEYS } from "@/lib/query-keys";

export function useMeQuery(initialData?: AuthUser) {
  return useQuery({
    queryKey: AUTH_KEYS.me,
    queryFn: async () => {
      const res = await getMe();

      if (!res.success) throw new Error(res.message);

      return res.data as AuthUser;
    },
    initialData,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}

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
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: SignUpData) => registerUser(data),
    onSuccess: (res) => {
      if (res.success) qc.invalidateQueries({ queryKey: AUTH_KEYS.me });
    },
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

export function useResetPasswordMutation() {
  return useMutation({
    mutationFn: (data: { token: string; password: string }) =>
      resetPassword(data),
  });
}
