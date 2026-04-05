import { graphqlRequest } from '@/shared/api/graphql/client';
import { User } from '@/entities/user/model/types';

interface MeResponse {
  me: User;
}

interface AdminUsersResponse {
  adminUsers: User[];
}

interface AdminStatsResponse {
  adminStats: {
    usersCount: number;
    adminsCount: number;
    ordersCount: number;
    totalRevenue: string;
  };
}

interface SetUserRoleResponse {
  adminSetUserRole: User;
}

const ME_QUERY = `
  query Me {
    me {
      id
      email
      role
      createdAt
      updatedAt
    }
  }
`;

const ADMIN_USERS_QUERY = `
  query AdminUsers($take: Int) {
    adminUsers(take: $take) {
      id
      email
      role
      createdAt
      updatedAt
    }
  }
`;

const ADMIN_STATS_QUERY = `
  query AdminStats {
    adminStats {
      usersCount
      adminsCount
      ordersCount
      totalRevenue
    }
  }
`;

const SET_USER_ROLE_MUTATION = `
  mutation AdminSetUserRole($input: UpdateUserRoleInput!) {
    adminSetUserRole(input: $input) {
      id
      email
      role
      createdAt
      updatedAt
    }
  }
`;

export async function getMe(): Promise<User> {
  const data = await graphqlRequest<MeResponse>(ME_QUERY);
  return data.me;
}

export async function getAdminUsers(take = 50): Promise<User[]> {
  const data = await graphqlRequest<AdminUsersResponse, { take: number }>(
    ADMIN_USERS_QUERY,
    { take },
  );
  return data.adminUsers;
}

export async function getAdminStats(): Promise<AdminStatsResponse['adminStats']> {
  const data = await graphqlRequest<AdminStatsResponse>(ADMIN_STATS_QUERY);
  return data.adminStats;
}

export async function setUserRole(input: {
  userId: string;
  role: 'CUSTOMER' | 'ADMIN';
}): Promise<User> {
  const data = await graphqlRequest<
    SetUserRoleResponse,
    { input: { userId: string; role: 'CUSTOMER' | 'ADMIN' } }
  >(SET_USER_ROLE_MUTATION, { input });

  return data.adminSetUserRole;
}
