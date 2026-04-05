'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Check, ChevronRight, Heart, Star } from 'lucide-react';
import { CatalogProduct } from '@/entities/product/model/types';
import { extractVolumeLiters } from '@/entities/product/model/volume-variants';
import { AddToCartButton } from '@/features/cart/ui/AddToCartButton';
import { ToggleCompareButton } from '@/features/compare';
import { useShopSettingsQuery } from '@/features/shop-settings/model/use-shop-settings';
import { formatMoneyBySettings } from '@/shared/lib/shop-settings/format';

const availabilityConfig = {
  IN_STOCK: { label: 'В наявності', className: 'bg-emerald-100 text-emerald-700' },
  OUT_OF_STOCK: { label: 'Немає в наявності', className: 'bg-red-100 text-red-700' },
  EXPECTED: { label: 'Очікується', className: 'bg-amber-100 text-amber-700' },
};

interface ProductDetailsViewProps {
  product: CatalogProduct;
  variants: CatalogProduct[];
}

const getVolumeLabel = (variant: CatalogProduct) => {
  const volume = extractVolumeLiters(variant);
  if (volume === null) {
    return '1л';
  }

  return `${String(volume).replace('.', ',')}л`;
};

export const ProductDetailsView = ({ product, variants }: ProductDetailsViewProps) => {
  const gallery = useMemo(() => {
    return product.imageUrl ? [product.imageUrl] : [];
  }, [product.imageUrl]);

  const [activeIndex, setActiveIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomOrigin, setZoomOrigin] = useState('50% 50%');
  const settingsQuery = useShopSettingsQuery(true);
  const settings = settingsQuery.data;

  const activeImage = gallery[activeIndex] ?? product.imageUrl ?? null;
  const availability = availabilityConfig[product.availabilityStatus];
  const price = Number(product.price);
  const variantOptions = variants.length ? variants : [product];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
        <section className="rounded-md border border-border bg-white p-4 sm:p-6">
          <div className="grid gap-3 sm:grid-cols-[72px_1fr]">
            <div className="flex gap-2 sm:flex-col">
              {(gallery.length ? gallery : [null]).map((image, index) => (
                <button
                  key={`thumb-${index}`}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  className={`relative h-[72px] w-[72px] overflow-hidden rounded-md border bg-white ${
                    index === activeIndex ? 'border-primary-content' : 'border-border'
                  }`}
                >
                  {image ? (
                    <Image src={image} alt={`${product.name} ${index + 1}`} fill className="object-contain p-1.5" />
                  ) : (
                    <span className="text-[10px] text-copy-lighter">Фото</span>
                  )}
                </button>
              ))}
            </div>

            <div
              className="relative min-h-[460px] overflow-hidden rounded-sm border border-border bg-white"
              onMouseEnter={() => setIsZoomed(true)}
              onMouseLeave={() => {
                setIsZoomed(false);
                setZoomOrigin('50% 50%');
              }}
              onMouseMove={(event) => {
                const rect = event.currentTarget.getBoundingClientRect();
                const x = ((event.clientX - rect.left) / rect.width) * 100;
                const y = ((event.clientY - rect.top) / rect.height) * 100;
                setZoomOrigin(`${Math.min(Math.max(x, 0), 100)}% ${Math.min(Math.max(y, 0), 100)}%`);
              }}
            >
              {activeImage ? (
                <Image
                  src={activeImage}
                  alt={product.name}
                  fill
                  priority
                  className="object-contain p-5 transition-transform duration-150 ease-out"
                  style={{
                    transform: isZoomed ? 'scale(2.1)' : 'scale(1)',
                    transformOrigin: zoomOrigin,
                  }}
                />
              ) : (
                <div className="flex h-full items-center justify-center text-copy-lighter">Фото відсутнє</div>
              )}
            </div>
          </div>

          <div className="mt-6 border-t border-border pt-4 text-copy">
            <p className="leading-relaxed">
              {product.description ||
                'Продукт з перевіреними характеристиками для стабільного захисту двигуна в міському та трасовому режимі.'}
            </p>

            <ul className="mt-4 space-y-2 text-sm">
              <li className="inline-flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-600" />
                Оригінальний товар
              </li>
              <li className="inline-flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-600" />
                Повернення та обмін 14 днів
              </li>
            </ul>
          </div>
        </section>

        <section className="rounded-md border border-border bg-white p-6">
          <div className="mb-3 flex items-center gap-2 text-sm text-copy-lighter">
            <Link href="/" className="hover:text-primary-content">Головна</Link>
            <ChevronRight className="h-4 w-4" />
            <Link href="/catalog" className="hover:text-primary-content">Каталог</Link>
            <ChevronRight className="h-4 w-4" />
            <span className="line-clamp-1">{product.name}</span>
          </div>

          <div className="mb-4 flex items-start justify-between gap-4">
            <h1 className="text-4xl font-medium leading-tight text-[#111]">
              {product.brandName ? `${product.brandName} ` : ''}
              {product.name}
            </h1>

            <div className="rounded-md bg-background px-4 py-3 text-sm text-copy-light">
              Артикул
              <p className="text-3xl text-xl font-semibold leading-none text-[#111]">{product.sku}</p>
            </div>
          </div>

          <div className="mb-5 flex flex-wrap items-center gap-4 text-sm">
            <span className="font-medium text-black">{availability.label}</span>
            <span className="inline-flex items-center gap-0.5 text-[#d11f3a]">
              {Array.from({ length: 5 }).map((_, index) => (
                <Star key={`star-${index}`} className="h-4 w-4 fill-current" />
              ))}
            </span>
            <span className="text-copy">42 відгуки</span>
          </div>

          <div className="mb-6 flex items-center justify-between gap-4">
            <p className="text-4xl font-medium text-black">
              {formatMoneyBySettings(product.price, settings)}
            </p>
            <div className="flex items-center gap-3 text-sm text-copy">
              <ToggleCompareButton
                product={{
                  id: product.id,
                  slug: product.slug,
                  name: product.name,
                  imageUrl: product.imageUrl,
                  price,
                  brandName: product.brandName,
                  availabilityStatus: product.availabilityStatus,
                }}
                className="inline-flex items-center gap-2 hover:text-primary-content"
              />
              <button type="button" className="inline-flex items-center gap-2 hover:text-primary-content">
                <Heart className="h-5 w-5" />
                В бажання
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-2xl text-2xl text-[#111]">Об&apos;єм, літрів</p>
            <div className="flex flex-wrap gap-2">
              {variantOptions.map((variant) => {
                const isActiveVariant = variant.id === product.id;
                return (
                  <Link
                    key={variant.id}
                    href={`/product/${variant.slug}`}
                    className={`rounded-md border px-4 py-2 text-lg transition-colors ${
                      isActiveVariant
                        ? 'border-[#111] bg-[#111] text-white'
                        : 'border-border bg-white text-[#111] hover:border-[#111]'
                    }`}
                  >
                    {getVolumeLabel(variant)}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="mt-6">
            <p className="mb-3 text-2xl text-[#111]">Доступні варіанти</p>
            <div className="flex flex-wrap gap-3">
              {variantOptions.map((variant) => {
                const isActiveVariant = variant.id === product.id;
                return (
                  <Link
                    key={variant.id}
                    href={`/product/${variant.slug}`}
                    className={`w-[140px] rounded-md border bg-white p-2 transition-colors ${
                      isActiveVariant ? 'border-primary-content' : 'border-border hover:border-primary-content'
                    }`}
                  >
                    <div className="relative h-[86px] w-full overflow-hidden rounded-sm bg-white">
                      {variant.imageUrl ? (
                        <Image src={variant.imageUrl} alt={variant.name} fill className="object-contain" />
                      ) : (
                        <span className="flex h-full items-center justify-center text-xs text-copy-lighter">Фото</span>
                      )}
                    </div>
                    <p className="mt-2 text-sm font-medium text-[#111]">{getVolumeLabel(variant)}</p>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3 border-t border-border pt-6">
            <AddToCartButton
              product={{
                id: product.id,
                slug: product.slug,
                name: product.name,
                imageUrl: product.imageUrl,
                price,
                brandName: product.brandName,
                availabilityStatus: product.availabilityStatus,
              }}
              className="inline-flex items-center gap-2 rounded-none bg-[#E31B3D] px-9 py-3 text-xl font-bold text-white transition-colors hover:bg-[#c91534]"
            />

            <Link
              href="/cart"
              className="inline-flex items-center rounded-none border border-[#B9BBBE] px-9 py-3 text-xl text-[#111] transition-colors hover:border-primary-content"
            >
              Швидке замовлення
            </Link>
          </div>

        </section>
      </div>
    </div>
  );
};
