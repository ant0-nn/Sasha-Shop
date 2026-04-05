import { useSessionStore } from '@/entities/session/model/session.store';

interface GraphQLErrorItem {
  message: string;
}

interface GraphQLResponse<T> {
  data?: T;
  errors?: GraphQLErrorItem[];
}

const GRAPHQL_ENDPOINT = process.env.NEXT_PUBLIC_GRAPHQL_URL ?? '/api/graphql';

export async function graphqlRequest<TData, TVariables = Record<string, unknown>>(
  query: string,
  variables?: TVariables,
  token?: string | null,
): Promise<TData> {
  const authToken = token ?? useSessionStore.getState().token;

  const response = await fetch(GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    },
    body: JSON.stringify({ query, variables }),
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Network error: ${response.status}`);
  }

  const json = (await response.json()) as GraphQLResponse<TData>;

  if (json.errors?.length) {
    throw new Error(json.errors[0].message);
  }

  if (!json.data) {
    throw new Error('No data returned from GraphQL API');
  }

  return json.data;
}
