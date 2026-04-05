'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useSessionStore } from '@/entities/session/model/session.store';
import { UserRole } from '@/entities/user/model/types';
import { useMeQuery } from '@/features/auth/model/use-auth';

interface AuthGateProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
}

export function AuthGate({ children, requiredRole }: AuthGateProps) {
  const router = useRouter();
  const pathname = usePathname();
  const token = useSessionStore((state) => state.token);
  const user = useSessionStore((state) => state.user);
  const isHydrated = useSessionStore((state) => state.isHydrated);
  const clearSession = useSessionStore((state) => state.clearSession);
  const setUser = useSessionStore((state) => state.setUser);
  const meQuery = useMeQuery(isHydrated && Boolean(token));

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    if (!token) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }

    if (meQuery.isError) {
      clearSession();
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }

    if (meQuery.data && user?.updatedAt !== meQuery.data.updatedAt) {
      setUser(meQuery.data);
    }

    const effectiveRole = meQuery.data?.role ?? user?.role;

    if (requiredRole && effectiveRole !== requiredRole) {
      router.replace('/account');
    }
  }, [
    isHydrated,
    token,
    user?.role,
    user?.updatedAt,
    meQuery.isError,
    meQuery.data,
    requiredRole,
    clearSession,
    setUser,
    router,
    pathname,
  ]);

  if (!isHydrated || !token) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-copy-light">
        Перевірка доступу...
      </div>
    );
  }

  if (meQuery.isPending) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-copy-light">
        Перевірка сесії...
      </div>
    );
  }

  if (meQuery.isError) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-copy-light">
        Оновлення сесії...
      </div>
    );
  }

  const effectiveRole = meQuery.data?.role ?? user?.role;

  if (requiredRole && effectiveRole !== requiredRole) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-copy-light">
        Перевірка ролі...
      </div>
    );
  }

  return <>{children}</>;
}
