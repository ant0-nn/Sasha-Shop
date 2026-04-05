'use client';

import { useQuery } from '@tanstack/react-query';
import { getAdminOrders } from '@/entities/order/api/admin-orders.api';
import { OrderStatus } from '@/entities/order/model/types';

export function useAdminOrdersQuery(take = 100, status?: OrderStatus) {
  return useQuery({
    queryKey: ['admin-orders', take, status],
    queryFn: () => getAdminOrders(take, status),
  });
}
