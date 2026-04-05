import { CatalogProduct } from '@/entities/product/model/types';

const CATEGORY_TO_TYPE: Record<string, CatalogProduct['productType'] | undefined> = {
  'motor-oils': 'OIL',
  filters: 'FILTER',
  additives: 'ADDITIVE',
};

const normalize = (value?: string | null) =>
  (value ?? '').trim().toLowerCase();

const searchableText = (product: CatalogProduct) =>
  [
    product.name,
    product.description,
    product.brandName,
    product.categoryName,
    product.categorySlug,
    product.viscosityName,
    product.oilTypeName,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

const SUBCATEGORY_SYNONYMS: Record<string, string[]> = {
  '5w-30': ['5w-30'],
  '5w-40': ['5w-40'],
  '10w-40': ['10w-40'],
  synthetic: ['синтет', 'synthetic'],
  'semi-synthetic': ['напівсинтет', 'semi-synthetic', 'semi synthetic'],
  oil: ['олив', 'oil'],
  air: ['повітр', 'air'],
  cabin: ['салон', 'cabin'],
  fuel: ['палив', 'fuel'],
  coolants: ['антифриз', 'охолодж', 'coolant'],
  brake: ['гальм', 'brake'],
};

export interface CatalogQueryFilters {
  brand?: string;
  viscosity?: string;
  oilType?: string;
  availability?: CatalogProduct['availabilityStatus'];
  minPrice?: number;
  maxPrice?: number;
}

const toNumber = (value?: string | null): number | undefined => {
  if (!value) return undefined;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return undefined;
  return parsed;
};

export function parseCatalogQueryFilters(input: {
  brand?: string;
  viscosity?: string;
  oilType?: string;
  availability?: string;
  minPrice?: string;
  maxPrice?: string;
}): CatalogQueryFilters {
  const availability = normalize(input.availability).toUpperCase();
  const typedAvailability =
    availability === 'IN_STOCK' ||
    availability === 'OUT_OF_STOCK' ||
    availability === 'EXPECTED'
      ? (availability as CatalogProduct['availabilityStatus'])
      : undefined;

  const minPrice = toNumber(input.minPrice);
  const maxPrice = toNumber(input.maxPrice);

  return {
    brand: input.brand?.trim() || undefined,
    viscosity: input.viscosity?.trim() || undefined,
    oilType: input.oilType?.trim() || undefined,
    availability: typedAvailability,
    minPrice: minPrice !== undefined && minPrice >= 0 ? minPrice : undefined,
    maxPrice: maxPrice !== undefined && maxPrice >= 0 ? maxPrice : undefined,
  };
}

export function applyCatalogQueryFilters(
  products: CatalogProduct[],
  filters: CatalogQueryFilters,
): CatalogProduct[] {
  return products.filter((product) => {
    if (
      filters.brand &&
      normalize(product.brandName) !== normalize(filters.brand)
    ) {
      return false;
    }

    if (
      filters.viscosity &&
      normalize(product.viscosityName) !== normalize(filters.viscosity)
    ) {
      return false;
    }

    if (
      filters.oilType &&
      normalize(product.oilTypeName) !== normalize(filters.oilType)
    ) {
      return false;
    }

    if (
      filters.availability &&
      product.availabilityStatus !== filters.availability
    ) {
      return false;
    }

    const productPrice = Number(product.price);
    if (
      filters.minPrice !== undefined &&
      Number.isFinite(productPrice) &&
      productPrice < filters.minPrice
    ) {
      return false;
    }

    if (
      filters.maxPrice !== undefined &&
      Number.isFinite(productPrice) &&
      productPrice > filters.maxPrice
    ) {
      return false;
    }

    return true;
  });
}

const uniqueSorted = (items: Array<string | null | undefined>) =>
  Array.from(new Set(items.map((item) => item?.trim()).filter(Boolean) as string[])).sort(
    (a, b) => a.localeCompare(b, 'uk'),
  );

export function buildCatalogFilterOptions(products: CatalogProduct[]) {
  return {
    brands: uniqueSorted(products.map((product) => product.brandName)),
    viscosities: uniqueSorted(products.map((product) => product.viscosityName)),
    oilTypes: uniqueSorted(products.map((product) => product.oilTypeName)),
  };
}

export function getCatalogPageTitle(
  category?: string,
  subcategory?: string,
): string {
  if (subcategory) {
    return `Каталог: ${decodeSlug(subcategory)}`;
  }

  if (category) {
    return `Каталог: ${decodeSlug(category)}`;
  }

  return 'Каталог товарів';
}

export function decodeSlug(value?: string | null): string {
  return (value ?? '')
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function filterByCategory(
  products: CatalogProduct[],
  category: string,
): CatalogProduct[] {
  const normalizedCategory = normalize(category);
  const mappedType = CATEGORY_TO_TYPE[normalizedCategory];

  return products.filter((product) => {
    if (mappedType) {
      return product.productType === mappedType;
    }

    return normalize(product.categorySlug) === normalizedCategory;
  });
}

export function filterBySubcategory(
  products: CatalogProduct[],
  subcategory: string,
): CatalogProduct[] {
  const normalizedSubcategory = normalize(subcategory);
  const synonyms = SUBCATEGORY_SYNONYMS[normalizedSubcategory] ?? [normalizedSubcategory];

  return products.filter((product) => {
    const haystack = searchableText(product);
    return synonyms.some((token) => haystack.includes(token));
  });
}
