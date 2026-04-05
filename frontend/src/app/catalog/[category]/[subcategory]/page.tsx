import { getCatalogProducts } from '@/entities/product/api/getCatalogProducts';
import { CatalogFiltersPanel } from '@/app/catalog/_ui/CatalogFiltersPanel';
import { CatalogProductsGrid } from '@/widgets/catalog-products';
import {
  applyCatalogQueryFilters,
  buildCatalogFilterOptions,
  decodeSlug,
  filterByCategory,
  filterBySubcategory,
  getCatalogPageTitle,
  parseCatalogQueryFilters,
} from '../../_lib/catalog-filters';

interface SubcategoryPageProps {
  params: Promise<{
    category: string;
    subcategory: string;
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

export default async function SubcategoryPage({
  params,
  searchParams,
}: SubcategoryPageProps) {
  const { category, subcategory } = await params;
  const { q, brand, viscosity, oilType, availability, minPrice, maxPrice } =
    await searchParams;
  const searchQuery = q?.trim() || '';
  const products = await getCatalogProducts(200, searchQuery);
  const byCategory = filterByCategory(products, category);
  const bySubcategory = filterBySubcategory(byCategory, subcategory);
  const filters = parseCatalogQueryFilters({
    brand,
    viscosity,
    oilType,
    availability,
    minPrice,
    maxPrice,
  });
  const filtered = applyCatalogQueryFilters(bySubcategory, filters);
  const filterOptions = buildCatalogFilterOptions(bySubcategory);

  return (
    <div className="space-y-5">
      <CatalogFiltersPanel options={filterOptions} />
      <CatalogProductsGrid
        products={filtered}
        title={getCatalogPageTitle(category, subcategory)}
        subtitle={
          searchQuery
            ? `${decodeSlug(category)} / ${decodeSlug(subcategory)} • Пошук: "${searchQuery}" • Знайдено: ${filtered.length}`
            : `${decodeSlug(category)} / ${decodeSlug(subcategory)}`
        }
      />
    </div>
  );
}
