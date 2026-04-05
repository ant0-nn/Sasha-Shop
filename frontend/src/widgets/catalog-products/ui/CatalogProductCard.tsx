'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { CatalogProduct } from '@/entities/product/model/types';
import {
  extractVolumeLiters,
  getVolumeLabel,
  sortVariantsByVolume,
} from '@/entities/product/model/volume-variants';
import { AddToCartButton } from '@/features/cart/ui/AddToCartButton';
import { ToggleCompareButton } from '@/features/compare';
import { useShopSettingsQuery } from '@/features/shop-settings/model/use-shop-settings';
import { formatMoneyBySettings } from '@/shared/lib/shop-settings/format';

const availabilityConfig: Record<
  CatalogProduct['availabilityStatus'],
  { label: string; className: string }
> = {
  IN_STOCK: {
    label: 'В наявності',
    className: 'bg-emerald-100 text-emerald-700',
  },
  OUT_OF_STOCK: {
    label: 'Немає в наявності',
    className: 'bg-red-100 text-red-700',
  },
  EXPECTED: {
    label: 'Очікується',
    className: 'bg-amber-100 text-amber-700',
  },
};

const toVolumeLabel = (raw: string) => `${raw.replace(',', '.')}л`;

const getVariantVolumeMeta = (variant: CatalogProduct) => {
  const volume = extractVolumeLiters(variant);
  if (volume !== null) {
    return { label: toVolumeLabel(String(volume)), explicit: true };
  }

  return { label: getVolumeLabel(variant.name), explicit: false };
};

interface CatalogProductCardProps {
  product: CatalogProduct;
  variants?: CatalogProduct[];
}

export const CatalogProductCard = ({ product, variants = [product] }: CatalogProductCardProps) => {
  const sortedVariants = useMemo(() => sortVariantsByVolume(variants), [variants]);
  const volumeVariants = useMemo(() => {
    const map = new Map<string, CatalogProduct>();

    for (const variant of sortedVariants) {
      const meta = getVariantVolumeMeta(variant);
      const key = meta.explicit ? meta.label : `${meta.label}-${variant.id}`;
      const existing = map.get(key);
      if (!existing) {
        map.set(key, variant);
        continue;
      }

      if (
        existing.availabilityStatus !== 'IN_STOCK' &&
        variant.availabilityStatus === 'IN_STOCK'
      ) {
        map.set(key, variant);
      }
    }

    return Array.from(map.entries()).map(([key, variant]) => {
      const meta = getVariantVolumeMeta(variant);
      return { key, label: meta.label, variant };
    });
  }, [sortedVariants]);

  const initialIndex = Math.max(
    sortedVariants.findIndex((variant) => variant.id === product.id),
    0,
  );
  const [selectedIndex, setSelectedIndex] = useState(initialIndex);
  const settingsQuery = useShopSettingsQuery(true);
  const settings = settingsQuery.data;

  const selectedVariant = sortedVariants[selectedIndex] ?? sortedVariants[0] ?? product;
  const availability = availabilityConfig[selectedVariant.availabilityStatus];
  const price = Number(selectedVariant.price);

  return (
    <article className="group overflow-hidden rounded-2xl border border-border bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg">
      <Link href={`/product/${selectedVariant.slug}`} className="relative block h-56 border-b border-border/60 bg-white">
        {selectedVariant.imageUrl ? (
          <Image
            src={selectedVariant.imageUrl}
            alt={selectedVariant.name}
            fill
            className="object-contain p-4 transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-copy-lighter">
            Фото відсутнє
          </div>
        )}

        <div className="absolute left-3 top-3 flex gap-2">
          {selectedVariant.isNew ? (
            <span className="rounded-md bg-primary px-2 py-1 text-xs font-bold text-primary-content">
              Новинка
            </span>
          ) : null}
          {selectedVariant.isPopular ? (
            <span className="rounded-md bg-[#79B53A] px-2 py-1 text-xs font-bold text-white">
              Хіт
            </span>
          ) : null}
        </div>
      </Link>

      <div className="space-y-3 p-4">
        <p className="text-xs uppercase tracking-wider text-copy-lighter">Артикул: {selectedVariant.sku}</p>

        <Link href={`/product/${selectedVariant.slug}`} className="block">
          <h3 className="line-clamp-2 min-h-14 text-xl font-bold text-primary-content transition-colors hover:text-primary">
            {selectedVariant.brandName ? `${selectedVariant.brandName} ` : ''}
            {selectedVariant.name}
          </h3>
        </Link>

        <p className="line-clamp-2 min-h-10 text-sm text-copy-light">
          {selectedVariant.description || 'Опис буде додано пізніше'}
        </p>

        {volumeVariants.length > 1 ? (
          <div className="flex flex-wrap gap-2">
            {volumeVariants.map(({ key, label, variant }) => {
              const isActive = variant.id === selectedVariant.id;
              const index = sortedVariants.findIndex((item) => item.id === variant.id);
              const safeIndex = index >= 0 ? index : 0;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSelectedIndex(safeIndex)}
                  className={`rounded-md border px-2.5 py-1 text-xs font-semibold transition-colors ${
                    isActive
                      ? 'border-[#111] bg-[#111] text-white'
                      : 'border-border bg-white text-copy hover:border-[#111]'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        ) : null}

        <div className="flex items-center justify-between gap-2">
          <p className="text-3xl font-black text-black">
            {formatMoneyBySettings(selectedVariant.price, settings)}
          </p>
          <span className={`rounded-full px-3 py-1 text-xs font-bold ${availability.className}`}>
            {availability.label}
          </span>
        </div>

        <div className="flex items-center justify-between gap-2">
          <AddToCartButton
            product={{
              id: selectedVariant.id,
              slug: selectedVariant.slug,
              name: selectedVariant.name,
              imageUrl: selectedVariant.imageUrl,
              price,
              brandName: selectedVariant.brandName,
              availabilityStatus: selectedVariant.availabilityStatus,
            }}
          />
          <ToggleCompareButton
            product={{
              id: selectedVariant.id,
              slug: selectedVariant.slug,
              name: selectedVariant.name,
              imageUrl: selectedVariant.imageUrl,
              price,
              brandName: selectedVariant.brandName,
              availabilityStatus: selectedVariant.availabilityStatus,
            }}
          />
          <Link
            href={`/product/${selectedVariant.slug}`}
            className="rounded-lg border border-border px-4 py-2 text-sm font-bold text-copy transition-colors hover:border-primary hover:text-primary"
          >
            Деталі
          </Link>
        </div>
      </div>
    </article>
  );
};
