'use client';

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { AvailabilityStatus } from '@/entities/product/model/types';

export interface CartItem {
  id: string;
  slug: string;
  name: string;
  imageUrl?: string | null;
  price: number;
  brandName?: string | null;
  availabilityStatus: AvailabilityStatus;
  quantity: number;
}

interface AddToCartInput {
  id: string;
  slug: string;
  name: string;
  imageUrl?: string | null;
  price: number;
  brandName?: string | null;
  availabilityStatus: AvailabilityStatus;
}

interface CartState {
  items: CartItem[];
  isHydrated: boolean;
  addItem: (input: AddToCartInput) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: () => number;
  totalPrice: () => number;
  setHydrated: (value: boolean) => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isHydrated: false,
      addItem: (input) =>
        set((state) => {
          const existing = state.items.find((item) => item.id === input.id);

          if (existing) {
            return {
              items: state.items.map((item) =>
                item.id === input.id
                  ? { ...item, quantity: Math.min(item.quantity + 1, 99) }
                  : item,
              ),
            };
          }

          return {
            items: [...state.items, { ...input, quantity: 1 }],
          };
        }),
      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        })),
      updateQuantity: (id, quantity) =>
        set((state) => {
          if (quantity <= 0) {
            return {
              items: state.items.filter((item) => item.id !== id),
            };
          }

          return {
            items: state.items.map((item) =>
              item.id === id ? { ...item, quantity: Math.min(quantity, 99) } : item,
            ),
          };
        }),
      clearCart: () => set({ items: [] }),
      totalItems: () => get().items.reduce((sum, item) => sum + item.quantity, 0),
      totalPrice: () =>
        get().items.reduce((sum, item) => sum + item.price * item.quantity, 0),
      setHydrated: (value) => set({ isHydrated: value }),
    }),
    {
      name: 'sashashop-cart',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    },
  ),
);
