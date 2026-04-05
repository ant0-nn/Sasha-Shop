import { CatalogProduct } from '../model/types';

const GRAPHQL_ENDPOINT =
  process.env.BACKEND_GRAPHQL_URL ??
  process.env.NEXT_PUBLIC_GRAPHQL_URL ??
  'http://localhost:3001/graphql';

const PRODUCTS_QUERY = `
  query Products($activeOnly: Boolean, $take: Int, $search: String) {
    products(activeOnly: $activeOnly, take: $take, search: $search) {
      id
      sku
      name
      slug
      variantGroup
      volumeLiters
      description
      imageUrl
      price
      productType
      categorySlug
      categoryName
      brandName
      viscosityName
      oilTypeName
      availabilityStatus
      isNew
      isPopular
    }
  }
`;

interface ProductsPayload {
  data?: {
    products?: CatalogProduct[];
  };
  errors?: Array<{ message: string }>;
}

export async function getCatalogProducts(
  take = 200,
  search?: string,
): Promise<CatalogProduct[]> {
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
        variables: { activeOnly: true, take, search: search?.trim() || undefined },
      }),
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Network error: ${response.status}`);
    }

    const payload = (await response.json()) as ProductsPayload;
    if (payload.errors?.length) {
      throw new Error(payload.errors[0].message);
    }

    return payload.data?.products ?? [];
  } catch {
    return [];
  }
}
