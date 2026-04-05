import { graphqlRequest } from '@/shared/api/graphql/client';
import { useSessionStore } from '@/entities/session/model/session.store';
import { Banner } from '../model/types';

interface BannersResponse {
  banners: Banner[];
}

interface CreateBannerResponse {
  adminCreateBanner: Banner;
}
interface UpdateBannerResponse {
  adminUpdateBanner: Banner;
}
interface DeleteBannerResponse {
  adminDeleteBanner: boolean;
}

const BANNERS_QUERY = `
  query Banners($activeOnly: Boolean) {
    banners(activeOnly: $activeOnly) {
      id
      title
      description
      imageUrl
      linkUrl
      isActive
      createdAt
      updatedAt
    }
  }
`;

const CREATE_BANNER_MUTATION = `
  mutation AdminCreateBanner($input: CreateBannerInput!) {
    adminCreateBanner(input: $input) {
      id
      title
      description
      imageUrl
      linkUrl
      isActive
      createdAt
      updatedAt
    }
  }
`;
const UPDATE_BANNER_MUTATION = `
  mutation AdminUpdateBanner($input: UpdateBannerInput!) {
    adminUpdateBanner(input: $input) {
      id
      title
      description
      imageUrl
      linkUrl
      isActive
      createdAt
      updatedAt
    }
  }
`;
const DELETE_BANNER_MUTATION = `
  mutation AdminDeleteBanner($id: String!) {
    adminDeleteBanner(id: $id)
  }
`;

const BACKEND_ENDPOINT =
  process.env.NEXT_PUBLIC_BACKEND_URL ??
  (process.env.NEXT_PUBLIC_GRAPHQL_URL
    ? process.env.NEXT_PUBLIC_GRAPHQL_URL.replace(/\/graphql\/?$/, '')
    : 'http://localhost:3001');

export async function getAdminBanners(activeOnly = false): Promise<Banner[]> {
  const data = await graphqlRequest<BannersResponse, { activeOnly: boolean }>(
    BANNERS_QUERY,
    { activeOnly },
  );

  return data.banners;
}

export interface CreateBannerPayload {
  title: string;
  description?: string;
  imageUrl: string;
  linkUrl?: string;
  isActive?: boolean;
}
export interface UpdateBannerPayload {
  id: string;
  title?: string;
  description?: string;
  imageUrl?: string;
  linkUrl?: string;
  isActive?: boolean;
}

export async function createBanner(input: CreateBannerPayload): Promise<Banner> {
  const data = await graphqlRequest<CreateBannerResponse, { input: CreateBannerPayload }>(
    CREATE_BANNER_MUTATION,
    { input },
  );

  return data.adminCreateBanner;
}

export async function updateBanner(input: UpdateBannerPayload): Promise<Banner> {
  const data = await graphqlRequest<UpdateBannerResponse, { input: UpdateBannerPayload }>(
    UPDATE_BANNER_MUTATION,
    { input },
  );

  return data.adminUpdateBanner;
}

export async function deleteBanner(id: string): Promise<boolean> {
  const data = await graphqlRequest<DeleteBannerResponse, { id: string }>(
    DELETE_BANNER_MUTATION,
    { id },
  );
  return data.adminDeleteBanner;
}

export async function uploadBannerImage(file: File): Promise<{ imageUrl: string }> {
  const token = useSessionStore.getState().token;
  if (!token) {
    throw new Error('Unauthorized');
  }

  const formData = new FormData();
  formData.append('file', file);

  let response: Response;
  try {
    response = await fetch(`${BACKEND_ENDPOINT}/banners/upload`, {
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
