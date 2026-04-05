import { graphqlRequest } from '@/shared/api/graphql/client';
import { defaultShopSettings } from '../model/defaults';
import { Currency, ShopSettings } from '../model/types';

interface ShopSettingsResponse {
  shopSettings: ShopSettings;
}

interface AdminUpdateShopSettingsResponse {
  adminUpdateShopSettings: ShopSettings;
}

interface GraphQLErrorItem {
  message: string;
}

interface GraphQLResponse<T> {
  data?: T;
  errors?: GraphQLErrorItem[];
}

const SHOP_SETTINGS_QUERY = `
  query ShopSettings {
    shopSettings {
      storeName
      supportEmail
      supportPhone
      managerTelegram
      seoDescription
      currency
      timezone
      orderPrefix
    }
  }
`;

const UPDATE_SHOP_SETTINGS_MUTATION = `
  mutation AdminUpdateShopSettings($input: UpdateShopSettingsInput!) {
    adminUpdateShopSettings(input: $input) {
      storeName
      supportEmail
      supportPhone
      managerTelegram
      seoDescription
      currency
      timezone
      orderPrefix
    }
  }
`;

const SERVER_GRAPHQL_ENDPOINT =
  process.env.BACKEND_GRAPHQL_URL ??
  process.env.NEXT_PUBLIC_GRAPHQL_URL ??
  'http://localhost:3001/graphql';

export async function getShopSettings(): Promise<ShopSettings> {
  const data = await graphqlRequest<ShopSettingsResponse>(SHOP_SETTINGS_QUERY);
  return data.shopSettings;
}

export async function adminUpdateShopSettings(
  input: ShopSettings,
): Promise<ShopSettings> {
  const data = await graphqlRequest<
    AdminUpdateShopSettingsResponse,
    { input: ShopSettings }
  >(UPDATE_SHOP_SETTINGS_MUTATION, {
    input: {
      ...input,
      supportEmail: input.supportEmail.trim().toLowerCase(),
      orderPrefix: input.orderPrefix.trim().toUpperCase(),
      currency: input.currency as Currency,
    },
  });

  return data.adminUpdateShopSettings;
}

export async function getShopSettingsServer(): Promise<ShopSettings> {
  if (!SERVER_GRAPHQL_ENDPOINT.startsWith('http')) {
    return defaultShopSettings;
  }

  try {
    const response = await fetch(SERVER_GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: SHOP_SETTINGS_QUERY,
      }),
      cache: 'no-store',
    });

    if (!response.ok) {
      return defaultShopSettings;
    }

    const payload = (await response.json()) as GraphQLResponse<ShopSettingsResponse>;

    if (payload.errors?.length) {
      return defaultShopSettings;
    }

    return payload.data?.shopSettings ?? defaultShopSettings;
  } catch {
    return defaultShopSettings;
  }
}
