'use client';

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { AvailabilityStatus } from '@/entities/product/model/types';

export interface CompareItem {
  id: string;
  slug: string;
  name: string;
  imageUrl?: string | null;
  price: number;
  brandName?: string | null;
  availabilityStatus: AvailabilityStatus;
}

interface CompareState {
  items: CompareItem[];
  isHydrated: boolean;
  addItem: (item: CompareItem) => void;
  removeItem: (id: string) => void;
  toggleItem: (item: CompareItem) => void;
  clearItems: () => void;
  hasItem: (id: string) => boolean;
  totalItems: () => number;
  setHydrated: (value: boolean) => void;
}

export const useCompareStore = create<CompareState>()(
  persist(
    (set, get) => ({
      items: [],
      isHydrated: false,
      addItem: (item) =>
        set((state) => {
          if (state.items.some((existing) => existing.id === item.id)) {
            return state;
          }

          return { items: [...state.items, item] };
        }),
      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        })),
      toggleItem: (item) =>
        set((state) => {
          const exists = state.items.some((existing) => existing.id === item.id);
          if (exists) {
            return {
              items: state.items.filter((existing) => existing.id !== item.id),
            };
          }

          return { items: [...state.items, item] };
        }),
      clearItems: () => set({ items: [] }),
      hasItem: (id) => get().items.some((item) => item.id === id),
      totalItems: () => get().items.length,
      setHydrated: (value) => set({ isHydrated: value }),
    }),
    {
      name: 'sashashop-compare',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    },
  ),
);
