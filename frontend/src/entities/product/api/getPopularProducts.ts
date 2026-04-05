import { ProductPreview } from '../model/types';

const GRAPHQL_ENDPOINT =
  process.env.BACKEND_GRAPHQL_URL ??
  process.env.NEXT_PUBLIC_GRAPHQL_URL ??
  'http://localhost:3001/graphql';

const PRODUCTS_QUERY = `
  query Products($activeOnly: Boolean, $take: Int) {
    products(activeOnly: $activeOnly, take: $take) {
      id
      sku
      name
      slug
      variantGroup
      volumeLiters
      imageUrl
      price
      availabilityStatus
      productType
      categorySlug
      brandName
      isPopular
      isNew
    }
  }
`;

export async function getPopularProducts(): Promise<ProductPreview[]> {
  if (!GRAPHQL_ENDPOINT.startsWith('http')) {
    return [];
  }

  try {
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: PRODUCTS_QUERY,
        variables: { activeOnly: true, take: 100 },
      }),
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Network error: ${response.status}`);
    }

    const payload = (await response.json()) as {
      data?: {
        products?: Array<{
          id: string;
          sku: string;
          name: string;
          slug: string;
          variantGroup?: string | null;
          volumeLiters?: number | null;
          imageUrl?: string | null;
          price: string;
          availabilityStatus: 'IN_STOCK' | 'OUT_OF_STOCK' | 'EXPECTED';
          productType: 'OIL' | 'ADDITIVE' | 'FILTER' | 'OTHER';
          categorySlug: string;
          brandName?: string | null;
          isPopular: boolean;
          isNew: boolean;
        }>;
      };
      errors?: Array<{ message: string }>;
    };

    if (payload.errors?.length) {
      throw new Error(payload.errors[0].message);
    }

    const typeLabel: Record<string, string> = {
      OIL: 'Олива',
      ADDITIVE: 'Присадка',
      FILTER: 'Фільтр',
      OTHER: 'Інше',
    };

    return (payload.data?.products ?? [])
      .filter((product) => product.isPopular)
      .slice(0, 6)
      .map((product) => ({
        id: product.id,
        sku: product.sku,
        slug: product.slug,
        variantGroup: product.variantGroup ?? null,
        volumeLiters: product.volumeLiters ?? null,
        name: product.name,
        brand: product.brandName || 'Без бренду',
        imageUrl: product.imageUrl ?? null,
        price: Number(product.price),
        availabilityStatus: product.availabilityStatus,
        rating: 4.9,
        reviews: 0,
        href: `/product/${product.slug}`,
        type: typeLabel[product.productType] || 'Інше',
        isNew: product.isNew,
      }));
  } catch {
    return [];
  }
}
