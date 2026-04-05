import { Banner } from '../model/types';

const GRAPHQL_ENDPOINT =
  process.env.BACKEND_GRAPHQL_URL ??
  process.env.NEXT_PUBLIC_GRAPHQL_URL ??
  'http://localhost:3001/graphql';

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

export async function getBanners(activeOnly = true): Promise<Banner[]> {
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
        query: BANNERS_QUERY,
        variables: { activeOnly },
      }),
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Network error: ${response.status}`);
    }

    const payload = (await response.json()) as {
      data?: { banners?: Banner[] };
      errors?: Array<{ message: string }>;
    };

    if (payload.errors?.length) {
      throw new Error(payload.errors[0].message);
    }

    return payload.data?.banners ?? [];
  } catch {
    return [];
  }
}
