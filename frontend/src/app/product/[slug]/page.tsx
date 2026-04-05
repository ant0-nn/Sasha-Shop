import { notFound } from 'next/navigation';
import { getProductBySlug } from '@/entities/product/api/getProductBySlug';
import { ProductDetailsView } from '@/views/product/ui/ProductDetailsView';

interface ProductPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const productData = await getProductBySlug(slug);

  if (!productData) {
    notFound();
  }

  return <ProductDetailsView product={productData.product} variants={productData.variants} />;
}
