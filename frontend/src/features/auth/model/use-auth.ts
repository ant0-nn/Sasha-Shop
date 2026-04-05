'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSessionStore } from '@/entities/session/model/session.store';
import { getMe } from '@/entities/user/api/user.api';
import { login, register } from '../api/auth.api';

export function useMeQuery(enabled = true) {
  const token = useSessionStore((state) => state.token);

  return useQuery({
    queryKey: ['me', token],
    queryFn: getMe,
    enabled: enabled && Boolean(token),
    retry: false,
  });
}

export function useLoginMutation() {
  const setSession = useSessionStore((state) => state.setSession);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: login,
    onSuccess: (payload) => {
      setSession({ token: payload.accessToken, user: payload.user });
      queryClient.setQueryData(['me', payload.accessToken], payload.user);
    },
  });
}

export function useRegisterMutation() {
  const setSession = useSessionStore((state) => state.setSession);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: register,
    onSuccess: (payload) => {
      setSession({ token: payload.accessToken, user: payload.user });
      queryClient.setQueryData(['me', payload.accessToken], payload.user);
    },
  });
}
