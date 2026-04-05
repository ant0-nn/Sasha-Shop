'use client';

import { useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { CatalogProduct } from '@/entities/product/model/types';

interface CatalogFiltersPanelProps {
  options: {
    brands: string[];
    viscosities: string[];
    oilTypes: string[];
  };
}

const AVAILABILITY_OPTIONS: Array<{
  value: CatalogProduct['availabilityStatus'];
  label: string;
}> = [
  { value: 'IN_STOCK', label: 'Є в наявності' },
  { value: 'EXPECTED', label: 'Очікується' },
  { value: 'OUT_OF_STOCK', label: 'Немає в наявності' },
];

export function CatalogFiltersPanel({ options }: CatalogFiltersPanelProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const values = useMemo(
    () => ({
      brand: searchParams.get('brand') ?? '',
      viscosity: searchParams.get('viscosity') ?? '',
      oilType: searchParams.get('oilType') ?? '',
      availability: searchParams.get('availability') ?? '',
      minPrice: searchParams.get('minPrice') ?? '',
      maxPrice: searchParams.get('maxPrice') ?? '',
    }),
    [searchParams],
  );

  const patchQuery = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (!value.trim()) {
      params.delete(key);
    } else {
      params.set(key, value.trim());
    }

    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const clearFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    ['brand', 'viscosity', 'oilType', 'availability', 'minPrice', 'maxPrice'].forEach((key) =>
      params.delete(key),
    );
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="text-sm font-bold uppercase tracking-wide text-primary-content">Фільтри каталогу</p>
        <button
          type="button"
          onClick={clearFilters}
          className="text-xs font-semibold text-copy-light transition-colors hover:text-primary-content"
        >
          Скинути
        </button>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
        <select
          value={values.brand}
          onChange={(event) => patchQuery('brand', event.target.value)}
          className="rounded-xl border border-border bg-white px-3 py-2 text-sm text-copy outline-none focus:border-primary"
        >
          <option value="">Бренд</option>
          {options.brands.map((brand) => (
            <option key={brand} value={brand}>
              {brand}
            </option>
          ))}
        </select>

        <select
          value={values.viscosity}
          onChange={(event) => patchQuery('viscosity', event.target.value)}
          className="rounded-xl border border-border bg-white px-3 py-2 text-sm text-copy outline-none focus:border-primary"
        >
          <option value="">В&apos;язкість</option>
          {options.viscosities.map((viscosity) => (
            <option key={viscosity} value={viscosity}>
              {viscosity}
            </option>
          ))}
        </select>

        <select
          value={values.oilType}
          onChange={(event) => patchQuery('oilType', event.target.value)}
          className="rounded-xl border border-border bg-white px-3 py-2 text-sm text-copy outline-none focus:border-primary"
        >
          <option value="">Тип оливи</option>
          {options.oilTypes.map((oilType) => (
            <option key={oilType} value={oilType}>
              {oilType}
            </option>
          ))}
        </select>

        <select
          value={values.availability}
          onChange={(event) => patchQuery('availability', event.target.value)}
          className="rounded-xl border border-border bg-white px-3 py-2 text-sm text-copy outline-none focus:border-primary"
        >
          <option value="">Наявність</option>
          {AVAILABILITY_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <input
          type="number"
          min="0"
          value={values.minPrice}
          onChange={(event) => patchQuery('minPrice', event.target.value)}
          placeholder="Ціна від"
          className="rounded-xl border border-border bg-white px-3 py-2 text-sm text-copy outline-none focus:border-primary"
        />

        <input
          type="number"
          min="0"
          value={values.maxPrice}
          onChange={(event) => patchQuery('maxPrice', event.target.value)}
          placeholder="Ціна до"
          className="rounded-xl border border-border bg-white px-3 py-2 text-sm text-copy outline-none focus:border-primary"
        />
      </div>
    </div>
  );
}
