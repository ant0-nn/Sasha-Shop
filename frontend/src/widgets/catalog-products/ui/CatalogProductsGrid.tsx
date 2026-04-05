import { CatalogProduct } from '@/entities/product/model/types';
import { groupCatalogProductsByVariants } from '@/entities/product/model/volume-variants';
import { CatalogProductCard } from './CatalogProductCard';

interface CatalogProductsGridProps {
  products: CatalogProduct[];
  title: string;
  subtitle?: string;
}

export const CatalogProductsGrid = ({
  products,
  title,
  subtitle,
}: CatalogProductsGridProps) => {
  const groupedProducts = groupCatalogProductsByVariants(products);

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-primary-content sm:text-4xl">{title}</h1>
        {subtitle ? <p className="mt-2 text-copy-light">{subtitle}</p> : null}
      </div>

      {groupedProducts.length ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {groupedProducts.map(({ base, variants }) => (
            <CatalogProductCard key={base.id} product={base} variants={variants} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-white p-8 text-copy-light">
          Товарів поки що немає.
        </div>
      )}
    </section>
  );
};
