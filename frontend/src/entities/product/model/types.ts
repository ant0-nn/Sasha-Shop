export interface ProductPreview {
  id: string;
  sku: string;
  slug: string;
  name: string;
  brand: string;
  variantGroup?: string | null;
  volumeLiters?: number | null;
  imageUrl?: string | null;
  price: number;
  availabilityStatus: AvailabilityStatus;
  rating: number;
  reviews: number;
  href: string;
  type: string;
  isNew?: boolean;
}

export type ProductKind = 'OIL' | 'ADDITIVE' | 'FILTER' | 'OTHER';
export type AvailabilityStatus = 'IN_STOCK' | 'OUT_OF_STOCK' | 'EXPECTED';

export interface CatalogProduct {
  id: string;
  sku: string;
  name: string;
  slug: string;
  variantGroup?: string | null;
  volumeLiters?: number | null;
  description: string;
  imageUrl?: string | null;
  price: string;
  productType: ProductKind;
  categorySlug: string;
  categoryName: string;
  brandName?: string | null;
  viscosityName?: string | null;
  oilTypeName?: string | null;
  availabilityStatus: AvailabilityStatus;
  isNew: boolean;
  isPopular: boolean;
}

export interface AdminProduct {
  id: string;
  name: string;
  slug: string;
  variantGroup?: string | null;
  volumeLiters?: number | null;
  description: string;
  imageUrl?: string | null;
  price: string;
  availabilityStatus: AvailabilityStatus;
  sku: string;
  productType: ProductKind;
  categoryId: string;
  categoryName: string;
  categorySlug: string;
  brandName?: string | null;
  viscosityName?: string | null;
  oilTypeName?: string | null;
  isActive: boolean;
  isNew: boolean;
  isPopular: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductPayload {
  name: string;
  slug?: string;
  variantGroup?: string;
  volumeLiters?: number;
  description: string;
  imageUrl?: string;
  price: number;
  availabilityStatus?: AvailabilityStatus;
  sku: string;
  productType?: ProductKind;
  categorySlug: string;
  categoryName: string;
  brandName?: string;
  viscosityName?: string;
  oilTypeName?: string;
  isActive?: boolean;
  isNew?: boolean;
  isPopular?: boolean;
}

export interface UpdateProductPayload {
  id: string;
  name?: string;
  slug?: string;
  variantGroup?: string;
  volumeLiters?: number;
  description?: string;
  imageUrl?: string;
  price?: number;
  availabilityStatus?: AvailabilityStatus;
  sku?: string;
  productType?: ProductKind;
  categorySlug?: string;
  categoryName?: string;
  brandName?: string;
  viscosityName?: string;
  oilTypeName?: string;
  isActive?: boolean;
  isNew?: boolean;
  isPopular?: boolean;
}
