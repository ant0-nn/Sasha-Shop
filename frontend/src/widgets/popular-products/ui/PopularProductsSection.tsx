import { getPopularProducts } from '@/entities/product/api/getPopularProducts';
import { PopularProducts } from './PopularProducts';

export const PopularProductsSection = async () => {
  const products = await getPopularProducts();

  return <PopularProducts products={products} />;
};
