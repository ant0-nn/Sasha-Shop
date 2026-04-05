'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { useCartStore } from '@/entities/cart/model/cart.store';
import { useSessionStore } from '@/entities/session/model/session.store';
import { useCreateMyOrderMutation } from '@/features/orders/model/use-orders';
import { PaymentMethod } from '@/entities/order/model/types';
import { useShopSettingsQuery } from '@/features/shop-settings/model/use-shop-settings';
import { formatMoneyBySettings } from '@/shared/lib/shop-settings/format';

const availabilityConfig = {
  IN_STOCK: { label: 'В наявності', className: 'bg-emerald-100 text-emerald-700' },
  OUT_OF_STOCK: { label: 'Немає в наявності', className: 'bg-red-100 text-red-700' },
  EXPECTED: { label: 'Очікується', className: 'bg-amber-100 text-amber-700' },
};

const useAnimatedValue = (targetValue: number, duration = 320) => {
  const [animatedValue, setAnimatedValue] = useState(targetValue);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    const startValue = animatedValue;
    const diff = targetValue - startValue;

    if (diff === 0) {
      return;
    }

    const startTime = performance.now();

    const easeOutCubic = (t: number) => 1 - (1 - t) ** 3;

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutCubic(progress);
      const current = startValue + diff * eased;

      setAnimatedValue(current);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick);
      }
    };

    frameRef.current = requestAnimationFrame(tick);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [targetValue, duration]); // eslint-disable-line react-hooks/exhaustive-deps

  return animatedValue;
};

export default function CartPage() {
  const router = useRouter();
  const { items, removeItem, updateQuantity, clearCart, totalItems, totalPrice, isHydrated } = useCartStore();
  const token = useSessionStore((state) => state.token);
  const createOrderMutation = useCreateMyOrderMutation();
  const settingsQuery = useShopSettingsQuery(true);
  const settings = settingsQuery.data;
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryCity, setDeliveryCity] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>('CASH_ON_DELIVERY');
  const [comment, setComment] = useState('');

  const count = totalItems();
  const total = totalPrice();
  const animatedTotal = useAnimatedValue(total, 420);
  const isSubmittingOrder = createOrderMutation.isPending;
  const isCheckoutFormValid =
    customerName.trim().length >= 2 &&
    customerPhone.trim().length >= 8 &&
    deliveryCity.trim().length >= 2 &&
    deliveryAddress.trim().length >= 3;

  const handleCreateOrder = async () => {
    if (!token) {
      router.push('/login');
      return;
    }

    if (!items.length) {
      return;
    }

    setCheckoutError(null);

    try {
      await createOrderMutation.mutateAsync({
        items: items.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
        })),
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        deliveryCity: deliveryCity.trim(),
        deliveryAddress: deliveryAddress.trim(),
        paymentMethod,
        comment: comment.trim() || undefined,
      });

      clearCart();
      router.push('/account');
    } catch (error) {
      setCheckoutError(
        error instanceof Error
          ? error.message
          : 'Не вдалося оформити замовлення',
      );
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-black text-primary-content sm:text-4xl">Кошик</h1>
          <p className="mt-2 text-copy-light">
            {isHydrated ? `Товарів у кошику: ${count}` : 'Завантаження кошика...'}
          </p>
        </div>

        {items.length ? (
          <button
            type="button"
            onClick={clearCart}
            className="rounded-lg border border-border bg-white px-4 py-2 text-sm font-bold text-copy transition-colors hover:border-red-300 hover:text-red-600"
          >
            Очистити кошик
          </button>
        ) : null}
      </div>

      {!items.length ? (
        <div className="rounded-2xl border border-border bg-white p-8 text-center">
          <p className="text-lg font-bold text-primary-content">Кошик порожній</p>
          <p className="mt-2 text-copy-light">Додайте товари з каталогу, щоб оформити замовлення.</p>
          <Link
            href="/catalog"
            className="mt-4 inline-flex rounded-lg bg-primary px-5 py-2 font-bold text-primary-content"
          >
            Перейти в каталог
          </Link>
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
          <div className="space-y-3">
            {items.map((item) => {
              const availability = availabilityConfig[item.availabilityStatus];

              return (
                <article
                  key={item.id}
                  className="grid gap-4 rounded-2xl border border-border bg-white p-4 sm:grid-cols-[110px_1fr]"
                >
                  <Link href={`/product/${item.slug}`} className="relative h-[110px] overflow-hidden rounded-lg border border-border bg-white">
                    {item.imageUrl ? (
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        fill
                        className="object-contain p-2"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-copy-lighter">Фото</div>
                    )}
                  </Link>

                  <div className="space-y-3">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <Link
                          href={`/product/${item.slug}`}
                          className="text-lg font-bold text-primary-content transition-colors hover:text-primary"
                        >
                          {item.brandName ? `${item.brandName} ` : ''}
                          {item.name}
                        </Link>
                        <div className="mt-1">
                          <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${availability.className}`}>
                            {availability.label}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-bold text-copy-light transition-colors hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                        Видалити
                      </button>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="inline-flex items-center overflow-hidden rounded-lg border border-border">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="px-3 py-2 text-copy hover:bg-background"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="min-w-12 px-3 text-center font-bold">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="px-3 py-2 text-copy hover:bg-background"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>

                      <p className="text-2xl font-black text-black">
                        {formatMoneyBySettings(item.price * item.quantity, settings)}
                      </p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          <aside className="h-max space-y-4 rounded-2xl border border-border bg-white p-5">
            <div className="space-y-3 rounded-xl border border-border bg-background p-4">
              <p className="text-sm font-bold text-primary-content">
                Дані для оформлення
              </p>
              <input
                type="text"
                value={customerName}
                onChange={(event) => setCustomerName(event.target.value)}
                placeholder="ПІБ отримувача"
                className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-copy outline-none focus:border-primary"
              />
              <input
                type="text"
                value={customerPhone}
                onChange={(event) => setCustomerPhone(event.target.value)}
                placeholder="Телефон"
                className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-copy outline-none focus:border-primary"
              />
              <input
                type="text"
                value={deliveryCity}
                onChange={(event) => setDeliveryCity(event.target.value)}
                placeholder="Місто"
                className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-copy outline-none focus:border-primary"
              />
              <input
                type="text"
                value={deliveryAddress}
                onChange={(event) => setDeliveryAddress(event.target.value)}
                placeholder="Адреса / відділення"
                className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-copy outline-none focus:border-primary"
              />
              <select
                value={paymentMethod}
                onChange={(event) =>
                  setPaymentMethod(event.target.value as PaymentMethod)
                }
                className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-copy outline-none focus:border-primary"
              >
                <option value="CASH_ON_DELIVERY">Готівка при отриманні</option>
                <option value="CARD_ON_DELIVERY">Карткою при отриманні</option>
                <option value="BANK_TRANSFER">Банківський переказ</option>
              </select>
              <textarea
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                placeholder="Коментар до замовлення (опційно)"
                rows={3}
                className="w-full resize-none rounded-lg border border-border bg-white px-3 py-2 text-sm text-copy outline-none focus:border-primary"
              />
            </div>

            <p className="text-sm uppercase tracking-wider text-copy-lighter">Разом до сплати</p>
            <p className="mt-2 text-4xl font-black text-black">
              {formatMoneyBySettings(Math.max(0, Math.round(animatedTotal)), settings)}
            </p>
            <p className="mt-1 text-sm text-copy-light">Позицій: {count}</p>
            <p className="text-xs text-copy-light">
              Оплата не списується автоматично. Після оформлення менеджер зв&apos;яжеться з вами для підтвердження.
            </p>
            {checkoutError ? (
              <p className="mt-2 text-xs text-red-600">{checkoutError}</p>
            ) : null}

            <button
              type="button"
              onClick={handleCreateOrder}
              disabled={isSubmittingOrder || (Boolean(token) && !isCheckoutFormValid)}
              className="mt-4 w-full rounded-lg bg-[#E31B3D] px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-[#c91534] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmittingOrder
                ? 'Оформлення...'
                : token
                  ? isCheckoutFormValid
                    ? 'Оформити замовлення'
                    : 'Заповніть дані'
                  : 'Увійти для оформлення'}
            </button>

            <Link
              href="/catalog"
              className="mt-3 block text-center text-sm font-bold text-copy-light transition-colors hover:text-primary"
            >
              Продовжити покупки
            </Link>
          </aside>
        </div>
      )}
    </div>
  );
}
