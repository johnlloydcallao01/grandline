'use server';

import { getServerToken } from '@/app/actions/auth';
import { env } from '@/lib/env';

async function fetchAccountingAdmin<T>(path: string, init?: RequestInit): Promise<T> {
  const token = await getServerToken();
  if (!token) throw new Error('No admin session available.');
  const response = await fetch(`${env.NEXT_PUBLIC_API_URL}${path}`, {
    ...init,
    headers: {
      Authorization: `JWT ${token}`,
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
      ...(init?.headers || {}),
    },
    cache: 'no-store',
  });
  const payload = (await response.json().catch(() => null)) as T | { error?: string } | null;
  if (!response.ok) {
    const msg = payload && typeof payload === 'object' && 'error' in payload && typeof payload.error === 'string'
      ? payload.error : 'Failed to load asset register data.';
    throw new Error(msg);
  }
  return payload as T;
}

export type RegisterCell =
  | string
  | { text: string; tone?: 'amber' | 'blue' | 'gray' | 'green' | 'red'; emphasis?: boolean; align?: 'left' | 'right' | 'center' };

export type RegisterRow = {
  id: string;
  assetCode: string;
  name: string;
  assetCategory: string;
  categoryLabel: string;
  branchName: string | null;
  departmentName: string | null;
  locationName: string | null;
  cost: number;
  costLabel: string;
  accumulatedDepreciation: number;
  accumulatedDepreciationLabel: string;
  netBookValue: number;
  netBookValueLabel: string;
  status: string;
  statusLabel: string;
  statusTone: string;
  cells: RegisterCell[];
};

export type RegisterMetric = { id: string; label: string; value: number | string; change: string; trend: 'up' | 'down' | 'neutral' };

export type RegisterFilterOption = { label: string; value: string };

export type RegisterResponse = {
  rows: RegisterRow[];
  metrics: RegisterMetric[];
  filterOptions: {
    statuses: RegisterFilterOption[];
    categories: RegisterFilterOption[];
    quickFilters: RegisterFilterOption[];
  };
  meta: {
    searchPlaceholder: string;
    columns: string[];
    tableTitle?: string;
    tableDescription?: string;
  };
  pagination: { page: number; limit: number; totalDocs: number; totalPages: number; hasPrevPage: boolean; hasNextPage: boolean };
  totals: { totalRows: number; filteredRows: number };
  referenceData: {
    chartAccounts: Array<{ id: string; code: string; name: string }>;
    branches: Array<{ id: string; branchCode: string; name: string }>;
    departments: Array<{ id: string; code: string; name: string }>;
    locations: Array<{ id: string; code: string; name: string }>;
  };
};

export type RegisterDetail = Record<string, unknown>;

export type RegisterMutationInput = {
  name: string;
  assetCategory?: string;
  purchaseDate: string;
  inServiceDate?: string | null;
  cost: number;
  salvageValue?: number;
  usefulLifeMonths: number;
  depreciationMethod?: string;
  expenseAccount?: string | null;
  assetAccount?: string | null;
  accumulatedDepreciationAccount?: string | null;
  branch?: string | null;
  department?: string | null;
  location?: string | null;
  status?: string;
  notes?: string | null;
  assetCode?: string | null;
};

export async function getAssetRegister(query: {
  search?: string; page?: number; statuses?: string[]; categories?: string[]; quickFilters?: string[];
} = {}): Promise<RegisterResponse> {
  const params = new URLSearchParams();
  if (query.search?.trim()) params.set('search', query.search.trim());
  for (const v of query.statuses || []) params.append('status', v);
  for (const v of query.categories || []) params.append('category', v);
  for (const v of query.quickFilters || []) params.append('quickFilter', v);
  params.set('page', String(query.page || 1));
  params.set('limit', '10');
  return fetchAccountingAdmin<RegisterResponse>(`/accounting/asset-register-report?${params.toString()}`);
}

export async function getRegisterItem(id: string | number): Promise<RegisterDetail> {
  return fetchAccountingAdmin<RegisterDetail>(`/accounting/asset-register-report/${id}`);
}

export async function createRegisterItem(input: RegisterMutationInput): Promise<RegisterDetail> {
  return fetchAccountingAdmin<RegisterDetail>('/accounting/asset-register-report', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function updateRegisterItem(id: string | number, input: Partial<RegisterMutationInput>): Promise<RegisterDetail> {
  return fetchAccountingAdmin<RegisterDetail>(`/accounting/asset-register-report/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

export async function deleteRegisterItem(id: string | number): Promise<{ success: boolean }> {
  return fetchAccountingAdmin<{ success: boolean }>(`/accounting/asset-register-report/${id}`, {
    method: 'DELETE',
  });
}
