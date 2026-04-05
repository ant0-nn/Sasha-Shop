'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  adminUpdateShopSettings,
  getShopSettings,
} from '@/entities/shop-settings/api/shop-settings.api';
import { ShopSettings } from '@/entities/shop-settings/model/types';

export function useShopSettingsQuery(enabled = true) {
  return useQuery({
    queryKey: ['shop-settings'],
    queryFn: getShopSettings,
    enabled,
    staleTime: 60_000,
    retry: false,
  });
}

export function useAdminUpdateShopSettingsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: ShopSettings) => adminUpdateShopSettings(input),
    onSuccess: (updated) => {
      queryClient.setQueryData(['shop-settings'], updated);
      queryClient.invalidateQueries({ queryKey: ['shop-settings'] });
    },
  });
}
