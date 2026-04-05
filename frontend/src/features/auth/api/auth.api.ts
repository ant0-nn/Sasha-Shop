import { User } from '@/entities/user/model/types';
import { graphqlRequest } from '@/shared/api/graphql/client';

interface AuthPayload {
  accessToken: string;
  user: User;
}

interface LoginResponse {
  login: AuthPayload;
}

interface RegisterResponse {
  register: AuthPayload;
}

const LOGIN_MUTATION = `
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      accessToken
      user {
        id
        email
        role
        createdAt
        updatedAt
      }
    }
  }
`;

const REGISTER_MUTATION = `
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      accessToken
      user {
        id
        email
        role
        createdAt
        updatedAt
      }
    }
  }
`;

export async function login(input: {
  email: string;
  password: string;
}): Promise<AuthPayload> {
  const data = await graphqlRequest<LoginResponse, { input: typeof input }>(
    LOGIN_MUTATION,
    { input },
  );

  return data.login;
}

export async function register(input: {
  email: string;
  password: string;
}): Promise<AuthPayload> {
  const data = await graphqlRequest<RegisterResponse, { input: typeof input }>(
    REGISTER_MUTATION,
    { input },
  );

  return data.register;
}
