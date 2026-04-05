'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  CalendarClock,
  LogOut,
  PackageSearch,
  Settings,
  ShoppingBag,
  UserRound,
} from 'lucide-react';
import { AuthGate } from '@/widgets/auth-gate';
import { useMeQuery } from '@/features/auth/model/use-auth';
import { useSessionStore } from '@/entities/session/model/session.store';
import { useCartStore } from '@/entities/cart/model/cart.store';
import { OrderStatus } from '@/entities/order/model/types';
import { useMyOrdersQuery } from '@/features/orders/model/use-orders';
import { useShopSettingsQuery } from '@/features/shop-settings/model/use-shop-settings';
import {
  formatDateBySettings,
  formatDateTimeBySettings,
  formatMoneyBySettings,
} from '@/shared/lib/shop-settings/format';

export function AccountPage() {
  return (
    <AuthGate>
      <AccountContent />
    </AuthGate>
  );
}

function AccountContent() {
  const router = useRouter();
  const clearSession = useSessionStore((state) => state.clearSession);
  const setUser = useSessionStore((state) => state.setUser);
  const userFromStore = useSessionStore((state) => state.user);
  const cartItemsCount = useCartStore((state) =>
    state.items.reduce((sum, item) => sum + item.quantity, 0),
  );
  const meQuery = useMeQuery(true);
  const myOrdersQuery = useMyOrdersQuery(20, true);
  const settingsQuery = useShopSettingsQuery(true);
  const settings = settingsQuery.data;
  const [now] = useState(() => Date.now());

  useEffect(() => {
    if (
      meQuery.data &&
      (userFromStore?.id !== meQuery.data.id ||
        userFromStore?.updatedAt !== meQuery.data.updatedAt ||
        userFromStore?.role !== meQuery.data.role)
    ) {
      setUser(meQuery.data);
    }
  }, [meQuery.data, setUser, userFromStore?.id, userFromStore?.role, userFromStore?.updatedAt]);

  const user = meQuery.data ?? userFromStore;
  const accountAgeDays = useMemo(() => {
    if (!user) {
      return 0;
    }

    const createdAt = new Date(user.createdAt);
    return Math.max(
      1,
      Math.floor((now - createdAt.getTime()) / (1000 * 60 * 60 * 24)),
    );
  }, [now, user]);

  const statusMeta: Record<
    OrderStatus,
    { label: string; className: string }
  > = {
    PENDING: {
      label: 'Очікує оплату',
      className: 'bg-amber-100 text-amber-700',
    },
    PAID: {
      label: 'Оплачено',
      className: 'bg-emerald-100 text-emerald-700',
    },
    PROCESSING: {
      label: 'В обробці',
      className: 'bg-sky-100 text-sky-700',
    },
    SHIPPED: {
      label: 'Відправлено',
      className: 'bg-violet-100 text-violet-700',
    },
    DELIVERED: {
      label: 'Доставлено',
      className: 'bg-green-100 text-green-700',
    },
    CANCELLED: {
      label: 'Скасовано',
      className: 'bg-red-100 text-red-700',
    },
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-black text-primary-content sm:text-4xl">
          Особистий кабінет
        </h1>
        <p className="text-copy-light">
          Керуйте профілем, кошиком і статусом вашого акаунта.
        </p>
      </div>

      {meQuery.isPending && (
        <div className="rounded-2xl border border-border bg-foreground p-6 shadow-sm">
          <p className="text-copy-light">Завантаження профілю...</p>
        </div>
      )}

      {meQuery.isError && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 shadow-sm">
          <p className="font-semibold text-red-700">Не вдалося завантажити профіль</p>
          <p className="mt-1 text-sm text-red-600">{meQuery.error.message}</p>
        </div>
      )}

      {user && (
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="space-y-6 rounded-2xl border border-border bg-foreground p-6 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-3">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 text-primary-content">
                  <UserRound className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-lg font-bold text-primary-content">{user.email}</p>
                </div>
              </div>

              <span className="rounded-full border border-border bg-background px-3 py-1 text-xs font-bold uppercase tracking-wide text-copy">
                {user.role === 'ADMIN' ? 'Адміністратор' : 'Клієнт'}
              </span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-border bg-background p-4">
                <p className="text-xs uppercase tracking-wide text-copy-lighter">
                  Дата реєстрації
                </p>
                <p className="mt-1 text-sm font-semibold text-copy">
                  {formatDateTimeBySettings(user.createdAt, settings)}
                </p>
              </div>

              <div className="rounded-xl border border-border bg-background p-4">
                <p className="text-xs uppercase tracking-wide text-copy-lighter">
                  В акаунті
                </p>
                <p className="mt-1 text-sm font-semibold text-copy">
                  {accountAgeDays} дн.
                </p>
              </div>
            </div>

            <div className="space-y-3 rounded-xl border border-border bg-background p-4">
              <p className="text-sm font-bold text-primary-content">Швидкі дії</p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => router.push('/catalog')}
                  className="inline-flex items-center gap-2 rounded-lg border border-border bg-white px-3 py-2 text-sm font-semibold text-copy transition-colors hover:border-primary hover:text-primary"
                >
                  <PackageSearch className="h-4 w-4" />
                  Перейти в каталог
                </button>
                <button
                  onClick={() => router.push('/cart')}
                  className="inline-flex items-center gap-2 rounded-lg border border-border bg-white px-3 py-2 text-sm font-semibold text-copy transition-colors hover:border-primary hover:text-primary"
                >
                  <ShoppingBag className="h-4 w-4" />
                  Відкрити кошик ({cartItemsCount})
                </button>
                {user.role === 'ADMIN' && (
                  <button
                    onClick={() => router.push('/dashboard')}
                    className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-content transition-colors hover:bg-primary-dark"
                  >
                    <Settings className="h-4 w-4" />
                    Адмін-панель
                  </button>
                )}
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <div className="rounded-2xl border border-border bg-foreground p-5 shadow-sm">
              <p className="text-sm font-bold text-primary-content">Замовлення</p>
              {myOrdersQuery.isPending && (
                <p className="mt-2 text-sm text-copy-light">Завантаження історії замовлень...</p>
              )}
              {myOrdersQuery.isError && (
                <p className="mt-2 text-sm text-red-600">
                  Не вдалося завантажити замовлення: {myOrdersQuery.error.message}
                </p>
              )}
              {!myOrdersQuery.isPending &&
                !myOrdersQuery.isError &&
                (myOrdersQuery.data?.length ? (
                  <div className="mt-3 space-y-3">
                    {myOrdersQuery.data.map((order) => {
                      const status = statusMeta[order.status];
                      const itemsCount = order.items.reduce(
                        (sum, item) => sum + item.quantity,
                        0,
                      );

                      return (
                        <article
                          key={order.id}
                          className="rounded-xl border border-border bg-background p-3"
                        >
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <div>
                              <p className="text-xs text-copy-lighter">
                                #{order.displayNumber}
                              </p>
                              <p className="text-sm font-semibold text-copy">
                                {formatDateTimeBySettings(order.createdAt, settings)}
                              </p>
                            </div>
                            <span
                              className={`rounded-full px-2.5 py-1 text-xs font-bold ${status.className}`}
                            >
                              {status.label}
                            </span>
                          </div>

                          <div className="mt-3 flex items-center justify-between text-sm">
                            <p className="text-copy-light">Позицій: {itemsCount}</p>
                            <div className="text-right">
                              <p className="font-black text-copy">
                                {formatMoneyBySettings(order.totalAmount, settings)}
                              </p>
                              <Link
                                href={`/account/orders/${order.id}`}
                                className="text-xs font-semibold text-primary hover:text-primary-dark"
                              >
                                Деталі
                              </Link>
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-copy-light">
                    У вас ще немає замовлень.
                  </p>
                ))}
            </div>

            <div className="rounded-2xl border border-border bg-foreground p-5 shadow-sm">
              <p className="text-sm font-bold text-primary-content">Остання активність</p>
              <div className="mt-3 space-y-2 text-sm text-copy">
                <p className="inline-flex items-center gap-2">
                  <CalendarClock className="h-4 w-4 text-primary-content" />
                  Оновлення профілю: {formatDateTimeBySettings(user.updatedAt, settings)}
                </p>
                <p className="inline-flex items-center gap-2">
                  <CalendarClock className="h-4 w-4 text-primary-content" />
                  Реєстрація: {formatDateBySettings(user.createdAt, settings)}
                </p>
              </div>
            </div>
          </section>
        </div>
      )}

      {user && (
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => {
              clearSession();
              router.push('/login');
            }}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-white px-4 py-2 text-sm font-semibold text-copy transition-colors hover:border-red-300 hover:text-red-600"
          >
            <LogOut className="h-4 w-4" />
            Вийти
          </button>
        </div>
      )}
    </div>
  );
}
