'use server';

import { getServerToken } from '@/app/actions/auth';
import { env } from '@/lib/env';

export type UserSummary = {
  id: number | string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  lastLogin: string | null;
  enableAPIKey: boolean;
};

export type UserDetail = UserSummary & {
  middleName: string;
  nameExtension: string;
  username: string;
  gender: string;
  phone: string;
  securityAlertsEmailEnabled: boolean;
  pushNotificationsEnabled: boolean;
  createdAt: string;
  updatedAt: string;
};

export type UserCounts = {
  admin: number;
  service: number;
  active: number;
  apiKeyEnabled: number;
};

export type UsersListResponse = {
  users: UserSummary[];
  total: number;
  page: number;
  limit: number;
  counts: UserCounts;
};

export type UserDetailResponse = {
  user: UserDetail;
};

export type CreateUserData = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive?: boolean;
};

export type UpdateUserData = {
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: string;
  isActive?: boolean;
  phone?: string;
  username?: string;
  gender?: string;
  middleName?: string;
  nameExtension?: string;
  securityAlertsEmailEnabled?: boolean;
  pushNotificationsEnabled?: boolean;
  enableAPIKey?: boolean;
  resetPassword?: string;
};

async function fetchAccountingAdmin<T>(path: string, init?: RequestInit): Promise<T> {
  const token = await getServerToken();
  if (!token) {
    throw new Error('No admin session available.');
  }

  const response = await fetch(`${env.NEXT_PUBLIC_API_URL}${path}`, {
    ...init,
    headers: {
      Authorization: `JWT ${token}`,
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
    cache: 'no-store',
  });

  const payload = (await response.json().catch(() => null)) as T | { error?: string } | null;
  if (!response.ok) {
    const errorMessage =
      payload && typeof payload === 'object' && 'error' in payload && typeof payload.error === 'string'
        ? payload.error
        : 'Request failed.';
    throw new Error(errorMessage);
  }

  return payload as T;
}

export async function fetchAccessPermissions(params?: {
  search?: string;
  role?: string;
  status?: string;
  page?: number;
  limit?: number;
}): Promise<UsersListResponse> {
  const qs = new URLSearchParams();
  if (params?.search) qs.set('search', params.search);
  if (params?.role) qs.set('role', params.role);
  if (params?.status) qs.set('status', params.status);
  if (params?.page) qs.set('page', String(params.page));
  if (params?.limit) qs.set('limit', String(params.limit));
  const query = qs.toString();
  return fetchAccountingAdmin<UsersListResponse>(
    `/accounting/setup-controls/access-permissions${query ? `?${query}` : ''}`,
  );
}

export async function fetchUserDetail(id: number | string): Promise<UserDetailResponse> {
  return fetchAccountingAdmin<UserDetailResponse>(
    `/accounting/setup-controls/access-permissions/${id}`,
  );
}

export async function createUser(data: CreateUserData): Promise<UserDetailResponse> {
  return fetchAccountingAdmin<UserDetailResponse>(
    '/accounting/setup-controls/access-permissions',
    { method: 'POST', body: JSON.stringify(data) },
  );
}

export async function updateUser(id: number | string, data: UpdateUserData): Promise<UserDetailResponse> {
  return fetchAccountingAdmin<UserDetailResponse>(
    `/accounting/setup-controls/access-permissions/${id}`,
    { method: 'PUT', body: JSON.stringify(data) },
  );
}

export async function deleteUser(id: number | string): Promise<{ success: boolean }> {
  return fetchAccountingAdmin<{ success: boolean }>(
    `/accounting/setup-controls/access-permissions/${id}`,
    { method: 'DELETE' },
  );
}
