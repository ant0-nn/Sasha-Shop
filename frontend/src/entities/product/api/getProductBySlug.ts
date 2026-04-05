import { CatalogProduct } from '../model/types';
import {
  isSameProductFamily,
  sortVariantsByVolume,
} from '../model/volume-variants';
import { getCatalogProducts } from './getCatalogProducts';

export interface ProductWithVariants {
  product: CatalogProduct;
  variants: CatalogProduct[];
}

export async function getProductBySlug(
  slug: string,
): Promise<ProductWithVariants | null> {
  const products = await getCatalogProducts(800);
  const product = products.find((candidate) => candidate.slug === slug);

  if (!product) {
    return null;
  }

  const variants = sortVariantsByVolume(
    products.filter((candidate) => isSameProductFamily(product, candidate)),
  );

  return {
    product,
    variants: variants.length ? variants : [product],
  };
}
