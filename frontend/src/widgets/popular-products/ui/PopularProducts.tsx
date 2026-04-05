'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Flame, MessageSquare, Star } from 'lucide-react';
import { ProductPreview } from '@/entities/product/model/types';
import { AddToCartButton } from '@/features/cart/ui/AddToCartButton';
import { ToggleCompareButton } from '@/features/compare';
import { useShopSettingsQuery } from '@/features/shop-settings/model/use-shop-settings';
import { formatMoneyBySettings } from '@/shared/lib/shop-settings/format';

interface PopularProductsProps {
  products: ProductPreview[];
}

export const PopularProducts = ({ products }: PopularProductsProps) => {
  const settingsQuery = useShopSettingsQuery(true);
  const settings = settingsQuery.data;

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-primary-content">
            <Flame className="h-3.5 w-3.5" />
            Хіти продажу
          </p>
          <h2 className="mt-3 text-3xl font-black text-primary-content sm:text-4xl">
            Популярні товари
          </h2>
          <p className="mt-2 text-copy-light">
            Найчастіше обирають цього тижня.
          </p>
        </div>

        <Link
          href="/catalog"
          className="w-max rounded-full border border-border bg-white/80 px-5 py-2 text-xs font-bold uppercase tracking-wider text-copy transition-colors hover:border-primary/40 hover:text-primary"
        >
          Дивитись весь каталог
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {products.map((product) => (
          <article
            key={product.id}
            className="group overflow-hidden rounded-2xl border border-border bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg"
          >
            <div className="relative h-64 bg-white">
              {product.imageUrl ? (
                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  fill
                  className="object-contain p-4 transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-copy-lighter">
                  Фото відсутнє
                </div>
              )}

              <span className="absolute bottom-4 left-4 rounded-sm bg-[#79B53A] px-3 py-1 text-2xl text-lg font-medium text-white">
                Хіт
              </span>
            </div>

            <div className="space-y-3 p-4">
              <div className="flex items-center gap-3 text-sm text-copy-lighter">
                <span>Артикул: {product.sku}</span>
                <div className="flex items-center gap-0.5 text-[#d11f3a]">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star
                      key={`${product.id}-star-${index}`}
                      className="h-4 w-4 fill-current"
                    />
                  ))}
                </div>
                <div className="inline-flex items-center gap-1">
                  <MessageSquare className="h-4 w-4" />
                  <span>{product.reviews}</span>
                </div>
              </div>

              <h3 className="line-clamp-2 min-h-16 text-3xl font-medium leading-tight text-primary-content">
                {product.brand} {product.name}
              </h3>

              <div className="flex items-center justify-between gap-3">
                <p className="text-4xl font-black text-black">
                  {formatMoneyBySettings(product.price, settings)}
                </p>

                <AddToCartButton
                  product={{
                    id: product.id,
                    slug: product.slug,
                    name: product.name,
                    imageUrl: product.imageUrl,
                    price: product.price,
                    brandName: product.brand,
                    availabilityStatus: product.availabilityStatus,
                  }}
                  className="inline-flex items-center gap-2 bg-[#E31B3D] px-6 py-3 text-2xl font-bold text-white transition-colors hover:bg-[#c91534]"
                />
              </div>

              <div className="flex items-center justify-between">
                <p className="text-2xl font-medium text-black">В наявності</p>
                <div className="flex items-center gap-2">
                  <ToggleCompareButton
                    product={{
                      id: product.id,
                      slug: product.slug,
                      name: product.name,
                      imageUrl: product.imageUrl,
                      price: product.price,
                      brandName: product.brand,
                      availabilityStatus: product.availabilityStatus,
                    }}
                    className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-xs font-bold text-copy transition-colors hover:border-primary hover:text-primary"
                  />
                  <Link href={product.href} className="text-sm font-bold text-copy-light hover:text-primary">
                    Деталі
                  </Link>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};
