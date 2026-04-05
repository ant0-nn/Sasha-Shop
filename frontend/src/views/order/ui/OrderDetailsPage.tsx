'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CalendarClock, CreditCard, MapPin, Package2, Phone, UserRound } from 'lucide-react';
import { AuthGate } from '@/widgets/auth-gate';
import { PaymentMethod, OrderStatus } from '@/entities/order/model/types';
import { useMyOrderQuery } from '@/features/orders/model/use-orders';
import { useShopSettingsQuery } from '@/features/shop-settings/model/use-shop-settings';
import {
  formatDateTimeBySettings,
  formatMoneyBySettings,
} from '@/shared/lib/shop-settings/format';

const paymentMethodLabel: Record<PaymentMethod, string> = {
  CASH_ON_DELIVERY: 'Готівка при отриманні',
  CARD_ON_DELIVERY: 'Карткою при отриманні',
  BANK_TRANSFER: 'Банківський переказ',
};

const statusMeta: Record<OrderStatus, { label: string; className: string }> = {
  PENDING: { label: 'Очікує оплату', className: 'bg-amber-100 text-amber-700' },
  PAID: { label: 'Оплачено', className: 'bg-emerald-100 text-emerald-700' },
  PROCESSING: { label: 'В обробці', className: 'bg-sky-100 text-sky-700' },
  SHIPPED: { label: 'Відправлено', className: 'bg-violet-100 text-violet-700' },
  DELIVERED: { label: 'Доставлено', className: 'bg-green-100 text-green-700' },
  CANCELLED: { label: 'Скасовано', className: 'bg-red-100 text-red-700' },
};

interface OrderDetailsPageProps {
  id: string;
}

export function OrderDetailsPage({ id }: OrderDetailsPageProps) {
  return (
    <AuthGate>
      <OrderDetailsContent id={id} />
    </AuthGate>
  );
}

function OrderDetailsContent({ id }: OrderDetailsPageProps) {
  const router = useRouter();
  const orderQuery = useMyOrderQuery(id, true);
  const settingsQuery = useShopSettingsQuery(true);
  const settings = settingsQuery.data;

  if (orderQuery.isPending) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-border bg-foreground p-6 text-copy-light">
          Завантаження замовлення...
        </div>
      </div>
    );
  }

  if (orderQuery.isError || !orderQuery.data) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
          <p className="font-semibold text-red-700">Не вдалося завантажити замовлення</p>
          <p className="mt-1 text-sm text-red-600">
            {orderQuery.error instanceof Error
              ? orderQuery.error.message
              : 'Спробуйте пізніше'}
          </p>
        </div>
      </div>
    );
  }

  const order = orderQuery.data;
  const status = statusMeta[order.status];

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <button
        type="button"
        onClick={() => router.push('/account')}
        className="inline-flex items-center gap-2 text-sm font-semibold text-copy-light transition-colors hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" />
        Назад до кабінету
      </button>

      <section className="rounded-2xl border border-border bg-foreground p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-black text-primary-content">
              Замовлення #{order.displayNumber}
            </h1>
            <p className="mt-1 text-sm text-copy-light">
              {formatDateTimeBySettings(order.createdAt, settings)}
            </p>
          </div>
          <span className={`rounded-full px-3 py-1 text-xs font-bold ${status.className}`}>
            {status.label}
          </span>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="space-y-2 rounded-xl border border-border bg-background p-4 text-sm text-copy">
            <p className="inline-flex items-center gap-2 font-semibold text-primary-content">
              <UserRound className="h-4 w-4" />
              Отримувач
            </p>
            <p>{order.customerName}</p>
            <p className="inline-flex items-center gap-2">
              <Phone className="h-4 w-4" />
              {order.customerPhone}
            </p>
            <p className="inline-flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              {order.deliveryCity}, {order.deliveryAddress}
            </p>
          </div>

          <div className="space-y-2 rounded-xl border border-border bg-background p-4 text-sm text-copy">
            <p className="inline-flex items-center gap-2 font-semibold text-primary-content">
              <CreditCard className="h-4 w-4" />
              Оплата
            </p>
            <p>{paymentMethodLabel[order.paymentMethod]}</p>
            <p className="inline-flex items-center gap-2">
              <CalendarClock className="h-4 w-4" />
              Оновлено: {formatDateTimeBySettings(order.updatedAt, settings)}
            </p>
            {order.comment ? <p>Коментар: {order.comment}</p> : null}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-foreground p-6 shadow-sm">
        <p className="mb-4 inline-flex items-center gap-2 text-sm font-bold text-primary-content">
          <Package2 className="h-4 w-4" />
          Склад замовлення
        </p>

        <div className="space-y-3">
          {order.items.map((item) => (
            <article key={item.id} className="grid gap-3 rounded-xl border border-border bg-background p-3 sm:grid-cols-[76px_1fr_auto] sm:items-center">
              <div className="relative h-[76px] overflow-hidden rounded-lg border border-border bg-white">
                {item.productImageUrl ? (
                  <Image
                    src={item.productImageUrl}
                    alt={item.productName}
                    fill
                    className="object-contain p-1"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-copy-lighter">Фото</div>
                )}
              </div>

              <div>
                <Link href={`/product/${item.productSlug}`} className="font-semibold text-copy transition-colors hover:text-primary">
                  {item.productName}
                </Link>
                <p className="text-xs text-copy-light">Кількість: {item.quantity}</p>
                <p className="text-xs text-copy-light">
                  Ціна: {formatMoneyBySettings(item.price, settings)}
                </p>
              </div>

              <p className="text-lg font-black text-copy">
                {formatMoneyBySettings(item.subtotal, settings)}
              </p>
            </article>
          ))}
        </div>

        <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
          <p className="text-sm text-copy-light">Разом</p>
          <p className="text-2xl font-black text-copy">
            {formatMoneyBySettings(order.totalAmount, settings)}
          </p>
        </div>
      </section>
    </div>
  );
}
