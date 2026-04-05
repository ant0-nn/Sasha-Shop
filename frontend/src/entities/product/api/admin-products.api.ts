import { graphqlRequest } from '@/shared/api/graphql/client';
import { useSessionStore } from '@/entities/session/model/session.store';
import {
  AdminProduct,
  CreateProductPayload,
  UpdateProductPayload,
} from '../model/types';

interface ProductsResponse {
  products: AdminProduct[];
}

interface CreateProductResponse {
  adminCreateProduct: AdminProduct;
}

interface UpdateProductResponse {
  adminUpdateProduct: AdminProduct;
}
interface DeleteProductResponse {
  adminDeleteProduct: boolean;
}

const PRODUCT_FIELDS = `
  id
  name
  slug
  variantGroup
  volumeLiters
  description
  imageUrl
  price
  availabilityStatus
  sku
  productType
  categoryId
  categoryName
  categorySlug
  brandName
  viscosityName
  oilTypeName
  isActive
  isNew
  isPopular
  createdAt
  updatedAt
`;

const PRODUCTS_QUERY = `
  query Products($activeOnly: Boolean, $take: Int) {
    products(activeOnly: $activeOnly, take: $take) {
      ${PRODUCT_FIELDS}
    }
  }
`;

const CREATE_PRODUCT_MUTATION = `
  mutation AdminCreateProduct($input: CreateProductInput!) {
    adminCreateProduct(input: $input) {
      ${PRODUCT_FIELDS}
    }
  }
`;

const UPDATE_PRODUCT_MUTATION = `
  mutation AdminUpdateProduct($input: UpdateProductInput!) {
    adminUpdateProduct(input: $input) {
      ${PRODUCT_FIELDS}
    }
  }
`;

const DELETE_PRODUCT_MUTATION = `
  mutation AdminDeleteProduct($id: String!) {
    adminDeleteProduct(id: $id)
  }
`;

const BACKEND_ENDPOINT =
  process.env.NEXT_PUBLIC_BACKEND_URL ??
  (process.env.NEXT_PUBLIC_GRAPHQL_URL
    ? process.env.NEXT_PUBLIC_GRAPHQL_URL.replace(/\/graphql\/?$/, '')
    : 'http://localhost:3001');

export async function getAdminProducts(
  activeOnly = false,
  take = 100,
): Promise<AdminProduct[]> {
  const data = await graphqlRequest<
    ProductsResponse,
    { activeOnly: boolean; take: number }
  >(PRODUCTS_QUERY, {
    activeOnly,
    take,
  });

  return data.products;
}

export async function createProduct(
  input: CreateProductPayload,
): Promise<AdminProduct> {
  const data = await graphqlRequest<
    CreateProductResponse,
    { input: CreateProductPayload }
  >(CREATE_PRODUCT_MUTATION, { input });

  return data.adminCreateProduct;
}

export async function updateProduct(
  input: UpdateProductPayload,
): Promise<AdminProduct> {
  const data = await graphqlRequest<
    UpdateProductResponse,
    { input: UpdateProductPayload }
  >(UPDATE_PRODUCT_MUTATION, { input });

  return data.adminUpdateProduct;
}

export async function deleteProduct(id: string): Promise<boolean> {
  const data = await graphqlRequest<DeleteProductResponse, { id: string }>(
    DELETE_PRODUCT_MUTATION,
    { id },
  );

  return data.adminDeleteProduct;
}

export async function uploadProductImage(
  file: File,
): Promise<{ imageUrl: string }> {
  const token = useSessionStore.getState().token;
  if (!token) {
    throw new Error('Unauthorized');
  }

  const formData = new FormData();
  formData.append('file', file);

  let response: Response;
  try {
    response = await fetch(`${BACKEND_ENDPOINT}/products/upload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });
  } catch {
    throw new Error('Не вдалося підключитися до backend upload endpoint');
  }

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as
      | { message?: string | string[] }
      | null;

    const message = Array.isArray(payload?.message)
      ? payload?.message[0]
      : payload?.message;

    throw new Error(message || `Upload failed: ${response.status}`);
  }

  return (await response.json()) as { imageUrl: string };
}
