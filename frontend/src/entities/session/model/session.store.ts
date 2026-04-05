'use client';

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { User } from '@/entities/user/model/types';

interface SessionState {
  token: string | null;
  user: User | null;
  isHydrated: boolean;
  setSession: (payload: { token: string; user: User }) => void;
  setUser: (user: User) => void;
  clearSession: () => void;
  setHydrated: (value: boolean) => void;
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isHydrated: false,
      setSession: ({ token, user }) => set({ token, user }),
      setUser: (user) => set({ user }),
      clearSession: () => set({ token: null, user: null }),
      setHydrated: (value) => set({ isHydrated: value }),
    }),
    {
      name: 'sashashop-session',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ token: state.token, user: state.user }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    },
  ),
);
