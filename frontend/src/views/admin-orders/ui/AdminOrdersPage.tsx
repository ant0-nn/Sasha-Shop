'use client';

import { useMemo, useState } from 'react';
import { PackageSearch } from 'lucide-react';
import { OrderStatus, PaymentMethod } from '@/entities/order/model/types';
import { useAdminOrdersQuery } from '@/features/admin-orders/model/use-admin-orders';
import { useShopSettingsQuery } from '@/features/shop-settings/model/use-shop-settings';
import {
  formatDateTimeBySettings,
  formatMoneyBySettings,
} from '@/shared/lib/shop-settings/format';

const statusLabel: Record<OrderStatus, string> = {
  PENDING: 'Очікує оплату',
  PAID: 'Оплачено',
  PROCESSING: 'В обробці',
  SHIPPED: 'Відправлено',
  DELIVERED: 'Доставлено',
  CANCELLED: 'Скасовано',
};

const statusClass: Record<OrderStatus, string> = {
  PENDING: 'bg-amber-100 text-amber-700',
  PAID: 'bg-emerald-100 text-emerald-700',
  PROCESSING: 'bg-sky-100 text-sky-700',
  SHIPPED: 'bg-violet-100 text-violet-700',
  DELIVERED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
};

const paymentLabel: Record<PaymentMethod, string> = {
  CASH_ON_DELIVERY: 'Готівка при отриманні',
  CARD_ON_DELIVERY: 'Карткою при отриманні',
  BANK_TRANSFER: 'Банківський переказ',
};

export function AdminOrdersPage() {
  const [status, setStatus] = useState<OrderStatus | ''>('');
  const [orderNumberQuery, setOrderNumberQuery] = useState('');
  const ordersQuery = useAdminOrdersQuery(100, status || undefined);
  const settingsQuery = useShopSettingsQuery(true);
  const settings = settingsQuery.data;

  const filteredOrders = useMemo(() => {
    if (!ordersQuery.data) {
      return [];
    }

    const normalizedQuery = orderNumberQuery.trim().toUpperCase();
    if (!normalizedQuery) {
      return ordersQuery.data;
    }

    return ordersQuery.data.filter((order) => {
      const displayOrderNumber = order.displayNumber;
      const compactDisplayOrderNumber = displayOrderNumber.replace(/[^A-Z0-9]/g, '');
      const rawOrderId = order.id.toUpperCase();
      const compactRawOrderId = rawOrderId.replace(/-/g, '');
      const compactQuery = normalizedQuery.replace(/[^A-Z0-9]/g, '');

      return (
        displayOrderNumber.includes(normalizedQuery) ||
        compactDisplayOrderNumber.includes(compactQuery) ||
        rawOrderId.includes(normalizedQuery) ||
        compactRawOrderId.includes(compactQuery)
      );
    });
  }, [orderNumberQuery, ordersQuery.data]);

  const totalAmount = useMemo(
    () =>
      filteredOrders.reduce((sum, order) => sum + Number(order.totalAmount), 0),
    [filteredOrders],
  );

  return (
    <div className="space-y-6 text-[#1E1E1E]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-[28px] font-black tracking-tight">Замовлення</h2>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm">
            <PackageSearch className="h-4 w-4 text-gray-500" />
            <input
              type="text"
              value={orderNumberQuery}
              onChange={(event) => setOrderNumberQuery(event.target.value)}
              placeholder="Пошук: SS-260326-4013B2"
              className="w-64 bg-transparent text-sm outline-none placeholder:text-gray-400"
            />
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm">
            <PackageSearch className="h-4 w-4 text-gray-500" />
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value as OrderStatus | '')}
              className="bg-transparent text-sm outline-none"
            >
              <option value="">Всі статуси</option>
              <option value="PENDING">Очікує оплату</option>
              <option value="PAID">Оплачено</option>
              <option value="PROCESSING">В обробці</option>
              <option value="SHIPPED">Відправлено</option>
              <option value="DELIVERED">Доставлено</option>
              <option value="CANCELLED">Скасовано</option>
            </select>
          </div>
        </div>
      </div>

      <section className="grid gap-4 sm:grid-cols-3">
        <article className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase text-gray-500">Кількість</p>
          <p className="mt-2 text-2xl font-black">{filteredOrders.length}</p>
        </article>
        <article className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase text-gray-500">Сума</p>
          <p className="mt-2 text-2xl font-black">
            {formatMoneyBySettings(totalAmount, settings)}
          </p>
        </article>
        <article className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase text-gray-500">Фільтр</p>
          <p className="mt-2 text-2xl font-black">
            {status ? statusLabel[status] : 'Всі'}
          </p>
        </article>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        {ordersQuery.isPending && <p className="text-sm text-gray-500">Завантаження...</p>}
        {ordersQuery.isError && (
          <p className="text-sm text-red-600">{ordersQuery.error.message}</p>
        )}

        {ordersQuery.data && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-sm">
              <thead>
                <tr className="border-b text-left text-xs uppercase text-gray-500">
                  <th className="px-3 py-2">Номер</th>
                  <th className="px-3 py-2">Клієнт</th>
                  <th className="px-3 py-2">Контакти</th>
                  <th className="px-3 py-2">Доставка</th>
                  <th className="px-3 py-2">Оплата</th>
                  <th className="px-3 py-2">Статус</th>
                  <th className="px-3 py-2">Товарів</th>
                  <th className="px-3 py-2 text-right">Сума</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => {
                  const itemsCount = order.items.reduce(
                    (sum, item) => sum + item.quantity,
                    0,
                  );
                  const displayOrderNumber = order.displayNumber;

                  return (
                    <tr key={order.id} className="border-b last:border-b-0">
                      <td className="px-3 py-3 align-top font-mono text-xs text-gray-600">
                        <p className="font-semibold text-[#111]">{displayOrderNumber}</p>
                        <p className="mt-1 text-[11px] text-gray-400">
                          {order.id.slice(0, 8).toUpperCase()}
                        </p>
                      </td>
                      <td className="px-3 py-3 align-top">
                        <p className="font-semibold">{order.customerName}</p>
                        <p className="text-xs text-gray-500">
                          {formatDateTimeBySettings(order.createdAt, settings)}
                        </p>
                      </td>
                      <td className="px-3 py-3 align-top">
                        <p>{order.customerPhone}</p>
                        <p className="text-xs text-gray-500">UID: {order.userId.slice(0, 8)}</p>
                      </td>
                      <td className="px-3 py-3 align-top">
                        <p>{order.deliveryCity}</p>
                        <p className="text-xs text-gray-500">{order.deliveryAddress}</p>
                      </td>
                      <td className="px-3 py-3 align-top text-xs text-gray-700">
                        {paymentLabel[order.paymentMethod]}
                      </td>
                      <td className="px-3 py-3 align-top">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${statusClass[order.status]}`}>
                          {statusLabel[order.status]}
                        </span>
                      </td>
                      <td className="px-3 py-3 align-top">{itemsCount}</td>
                      <td className="px-3 py-3 text-right align-top font-black">
                        {formatMoneyBySettings(order.totalAmount, settings)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {ordersQuery.data && !filteredOrders.length && (
          <p className="text-sm text-gray-500">
            За вашим запитом замовлень не знайдено.
          </p>
        )}
      </section>
    </div>
  );
}
