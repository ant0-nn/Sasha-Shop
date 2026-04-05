import { getCatalogProducts } from '@/entities/product/api/getCatalogProducts';
import {
  applyCatalogQueryFilters,
  buildCatalogFilterOptions,
  parseCatalogQueryFilters,
} from '@/app/catalog/_lib/catalog-filters';
import { CatalogFiltersPanel } from './_ui/CatalogFiltersPanel';
import { CatalogProductsGrid } from '@/widgets/catalog-products';

interface CatalogPageProps {
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

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
  const { q, brand, viscosity, oilType, availability, minPrice, maxPrice } =
    await searchParams;
  const searchQuery = q?.trim() || '';
  const products = await getCatalogProducts(200, searchQuery);
  const filters = parseCatalogQueryFilters({
    brand,
    viscosity,
    oilType,
    availability,
    minPrice,
    maxPrice,
  });
  const filteredProducts = applyCatalogQueryFilters(products, filters);
  const filterOptions = buildCatalogFilterOptions(products);

  return (
    <div className="space-y-5">
      <CatalogFiltersPanel options={filterOptions} />
      <CatalogProductsGrid
        products={filteredProducts}
        title={searchQuery ? `Результати пошуку: "${searchQuery}"` : 'Каталог товарів'}
        subtitle={
          searchQuery
            ? `Знайдено товарів: ${filteredProducts.length}`
            : 'Всі актуальні товари магазину з цінами та наявністю.'
        }
      />
    </div>
  );
}
