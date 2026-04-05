'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createBanner,
  CreateBannerPayload,
  deleteBanner,
  getAdminBanners,
  updateBanner,
  UpdateBannerPayload,
} from '@/entities/banner/api/admin-banners.api';

export function useAdminBannersQuery() {
  return useQuery({
    queryKey: ['admin-banners'],
    queryFn: () => getAdminBanners(false),
  });
}

export function useCreateBannerMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateBannerPayload) => createBanner(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-banners'] });
      queryClient.invalidateQueries({ queryKey: ['banners', true] });
      queryClient.invalidateQueries({ queryKey: ['banners', false] });
    },
  });
}

export function useUpdateBannerMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateBannerPayload) => updateBanner(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-banners'] });
      queryClient.invalidateQueries({ queryKey: ['banners', true] });
      queryClient.invalidateQueries({ queryKey: ['banners', false] });
    },
  });
}

export function useDeleteBannerMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteBanner(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-banners'] });
      queryClient.invalidateQueries({ queryKey: ['banners', true] });
      queryClient.invalidateQueries({ queryKey: ['banners', false] });
    },
  });
}
