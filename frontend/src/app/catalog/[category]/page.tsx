import { getCatalogProducts } from '@/entities/product/api/getCatalogProducts';
import { CatalogFiltersPanel } from '@/app/catalog/_ui/CatalogFiltersPanel';
import { CatalogProductsGrid } from '@/widgets/catalog-products';
import {
  applyCatalogQueryFilters,
  buildCatalogFilterOptions,
  decodeSlug,
  filterByCategory,
  getCatalogPageTitle,
  parseCatalogQueryFilters,
} from '../_lib/catalog-filters';

interface CategoryPageProps {
  params: Promise<{
    category: string;
  }>;
  searchParams: Promise<{
    q?: string;
    brand?: string;
    viscosity?: string;
    oilType?: string;
    availability?: string;
    minPrice?: string;
    maxPrice?: string;
  }>;
}

export default async function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  const { category } = await params;
  const { q, brand, viscosity, oilType, availability, minPrice, maxPrice } =
    await searchParams;
  const searchQuery = q?.trim() || '';
  const products = await getCatalogProducts(200, searchQuery);
  const byCategory = filterByCategory(products, category);
  const filters = parseCatalogQueryFilters({
    brand,
    viscosity,
    oilType,
    availability,
    minPrice,
    maxPrice,
  });
  const filtered = applyCatalogQueryFilters(byCategory, filters);
  const filterOptions = buildCatalogFilterOptions(byCategory);

  return (
    <div className="space-y-5">
      <CatalogFiltersPanel options={filterOptions} />
      <CatalogProductsGrid
        products={filtered}
        title={getCatalogPageTitle(category)}
        subtitle={
          searchQuery
            ? `Розділ: ${decodeSlug(category)} • Пошук: "${searchQuery}" • Знайдено: ${filtered.length}`
            : `Розділ: ${decodeSlug(category)}.`
        }
      />
    </div>
  );
}
