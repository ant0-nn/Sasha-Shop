'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSessionStore } from '@/entities/session/model/session.store';
import { createMyOrder, getMyOrder, getMyOrders } from '@/entities/order/api/order.api';

export function useMyOrdersQuery(take = 30, enabled = true) {
  const token = useSessionStore((state) => state.token);

  return useQuery({
    queryKey: ['my-orders', token, take],
    queryFn: () => getMyOrders(take),
    enabled: enabled && Boolean(token),
    retry: false,
  });
}

export function useCreateMyOrderMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createMyOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-orders'] });
    },
  });
}

export function useMyOrderQuery(orderId?: string, enabled = true) {
  const token = useSessionStore((state) => state.token);

  return useQuery({
    queryKey: ['my-order', token, orderId],
    queryFn: () => getMyOrder(orderId as string),
    enabled: enabled && Boolean(token) && Boolean(orderId),
    retry: false,
  });
}
