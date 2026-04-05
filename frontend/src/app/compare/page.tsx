'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Trash2 } from 'lucide-react';
import { useCompareStore } from '@/entities/compare/model/compare.store';
import { AddToCartButton } from '@/features/cart/ui/AddToCartButton';
import { useShopSettingsQuery } from '@/features/shop-settings/model/use-shop-settings';
import { formatMoneyBySettings } from '@/shared/lib/shop-settings/format';

const availabilityConfig = {
  IN_STOCK: { label: 'В наявності', className: 'bg-emerald-100 text-emerald-700' },
  OUT_OF_STOCK: { label: 'Немає в наявності', className: 'bg-red-100 text-red-700' },
  EXPECTED: { label: 'Очікується', className: 'bg-amber-100 text-amber-700' },
};

export default function ComparePage() {
  const items = useCompareStore((state) => state.items);
  const clearItems = useCompareStore((state) => state.clearItems);
  const removeItem = useCompareStore((state) => state.removeItem);
  const isHydrated = useCompareStore((state) => state.isHydrated);
  const settingsQuery = useShopSettingsQuery(true);
  const settings = settingsQuery.data;

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-black text-primary-content sm:text-4xl">Порівняння товарів</h1>
          <p className="mt-2 text-copy-light">
            {isHydrated ? `Додано товарів: ${items.length}` : 'Завантаження списку порівняння...'}
          </p>
        </div>

        {items.length ? (
          <button
            type="button"
            onClick={clearItems}
            className="rounded-lg border border-border bg-white px-4 py-2 text-sm font-bold text-copy transition-colors hover:border-red-300 hover:text-red-600"
          >
            Очистити порівняння
          </button>
        ) : null}
      </div>

      {!items.length ? (
        <div className="rounded-2xl border border-border bg-white p-8 text-center">
          <p className="text-lg font-bold text-primary-content">Список порівняння порожній</p>
          <p className="mt-2 text-copy-light">
            Додайте товари з каталогу або зі сторінки товару, щоб порівняти їх параметри.
          </p>
          <Link
            href="/catalog"
            className="mt-4 inline-flex rounded-lg bg-primary px-5 py-2 font-bold text-primary-content"
          >
            Перейти в каталог
          </Link>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-2xl border border-border bg-white">
            <table className="min-w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-border bg-background">
                  <th className="whitespace-nowrap px-4 py-3 text-left font-bold text-copy">Параметр</th>
                  {items.map((item) => (
                    <th key={`head-${item.id}`} className="min-w-[220px] px-4 py-3 text-left font-bold text-primary-content">
                      {item.brandName ? `${item.brandName} ` : ''}
                      {item.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border">
                  <td className="whitespace-nowrap px-4 py-3 font-semibold text-copy">Ціна</td>
                  {items.map((item) => (
                    <td key={`price-${item.id}`} className="px-4 py-3 font-bold text-black">
                      {formatMoneyBySettings(item.price, settings)}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-border">
                  <td className="whitespace-nowrap px-4 py-3 font-semibold text-copy">Наявність</td>
                  {items.map((item) => {
                    const availability = availabilityConfig[item.availabilityStatus];
                    return (
                      <td key={`availability-${item.id}`} className="px-4 py-3">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${availability.className}`}>
                          {availability.label}
                        </span>
                      </td>
                    );
                  })}
                </tr>
                <tr>
                  <td className="whitespace-nowrap px-4 py-3 font-semibold text-copy">Бренд</td>
                  {items.map((item) => (
                    <td key={`brand-${item.id}`} className="px-4 py-3 text-copy">
                      {item.brandName || 'Не вказано'}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {items.map((item) => {
              const availability = availabilityConfig[item.availabilityStatus];

              return (
                <article
                  key={item.id}
                  className="space-y-4 rounded-2xl border border-border bg-white p-4"
                >
                  <Link href={`/product/${item.slug}`} className="relative block h-48 overflow-hidden rounded-lg border border-border bg-white">
                    {item.imageUrl ? (
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        fill
                        className="object-contain p-2"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-copy-lighter">
                        Фото
                      </div>
                    )}
                  </Link>

                  <div className="space-y-2">
                    <Link
                      href={`/product/${item.slug}`}
                      className="line-clamp-2 text-lg font-bold text-primary-content transition-colors hover:text-primary"
                    >
                      {item.brandName ? `${item.brandName} ` : ''}
                      {item.name}
                    </Link>
                    <p className="text-2xl font-black text-black">
                      {formatMoneyBySettings(item.price, settings)}
                    </p>
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${availability.className}`}>
                      {availability.label}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <AddToCartButton
                      product={{
                        id: item.id,
                        slug: item.slug,
                        name: item.name,
                        imageUrl: item.imageUrl,
                        price: item.price,
                        brandName: item.brandName,
                        availabilityStatus: item.availabilityStatus,
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="inline-flex items-center gap-1 rounded-lg border border-border px-4 py-2 text-sm font-bold text-copy transition-colors hover:border-red-300 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                      Прибрати
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
