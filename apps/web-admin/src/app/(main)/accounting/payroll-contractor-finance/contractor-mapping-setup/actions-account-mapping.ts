'use server';

import { getServerToken } from '@/app/actions/auth';
import { env } from '@/lib/env';

async function fetchAccountingAdmin<T>(path: string, init?: RequestInit): Promise<T> {
  const token = await getServerToken();
  if (!token) {
    throw new Error('No admin session available.');
  }

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
    const errorMessage =
      payload && typeof payload === 'object' && 'error' in payload && typeof payload.error === 'string'
        ? payload.error
        : 'Failed to load payroll account mappings.';
    throw new Error(errorMessage);
  }

  return payload as T;
}

export type AccountMappingFilterOption = {
  label: string;
  value: string;
};

export type AccountMappingMetric = {
  id: string;
  label: string;
  value: number | string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
};

export type AccountMappingCell =
  | string
  | { text: string; tone?: 'amber' | 'blue' | 'gray' | 'green' | 'red'; emphasis?: boolean; align?: 'left' | 'right' | 'center' };

export type AccountMappingRow = {
  id: string;
  entryType: string;
  person: string;
  expenseAccountId: string;
  expenseAccountLabel: string;
  payableAccountId: string;
  payableAccountLabel: string;
  deductionAmount: number;
  status: string;
  notes: string;
};

export type AccountMappingRegisterResponse = {
  rows: AccountMappingRow[];
  metrics: AccountMappingMetric[];
  filterOptions: {
    entryTypes: AccountMappingFilterOption[];
    statuses: AccountMappingFilterOption[];
    quickFilters: AccountMappingFilterOption[];
  };
  meta: {
    searchPlaceholder: string;
    columns: string[];
    tableTitle: string;
    tableDescription: string;
  };
  pagination: {
    page: number;
    limit: number;
    totalDocs: number;
    totalPages: number;
    hasPrevPage: boolean;
    hasNextPage: boolean;
  };
  totals: {
    totalRows: number;
    filteredRows: number;
  };
  referenceData: {
    chartAccounts: Array<{ id: string; code: string; name: string }>;
  };
};

export type AccountMappingDetail = {
  id: string;
  entryType: string;
  person: string;
  expenseAccount: string;
  payableAccount: string;
  deductionAmount: number;
  status: string;
  notes: string;
  createdAt: string | null;
  updatedAt: string | null;
  expenseAccountLabel?: string;
  payableAccountLabel?: string;
};

export type AccountMappingMutationInput = {
  entryType: string;
  person: string;
  expenseAccount: string;
  payableAccount: string;
  deductionAmount?: number;
  status?: string;
  notes?: string;
};

export async function getAccountMappings(
  query: {
    search?: string;
    page?: number;
    statuses?: string[];
    entryTypes?: string[];
    quickFilters?: string[];
  } = {},
): Promise<AccountMappingRegisterResponse> {
  const params = new URLSearchParams();
  if (query.search?.trim()) params.set('search', query.search.trim());
  for (const value of query.statuses || []) params.append('status', value);
  for (const value of query.entryTypes || []) params.append('entryType', value);
  for (const value of query.quickFilters || []) params.append('quickFilter', value);
  params.set('page', String(query.page || 1));
  params.set('limit', '10');

  return fetchAccountingAdmin<AccountMappingRegisterResponse>(`/accounting/payroll-account-mappings?${params.toString()}`);
}

export async function getAccountMappingDetail(id: string | number): Promise<AccountMappingDetail> {
  return fetchAccountingAdmin<AccountMappingDetail>(`/accounting/payroll-account-mappings/${id}`);
}

export async function createAccountMapping(input: AccountMappingMutationInput): Promise<AccountMappingDetail> {
  const created = await fetchAccountingAdmin<{ id: string | number }>(`/accounting/payroll-account-mappings`, {
    method: 'POST',
    body: JSON.stringify(input),
  });
  return getAccountMappingDetail(created.id);
}

export async function updateAccountMapping(id: string | number, input: AccountMappingMutationInput): Promise<AccountMappingDetail> {
  return fetchAccountingAdmin<AccountMappingDetail>(`/accounting/payroll-account-mappings/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

export async function deleteAccountMapping(id: string | number): Promise<{ success: boolean }> {
  return fetchAccountingAdmin<{ success: boolean }>(`/accounting/payroll-account-mappings/${id}`, {
    method: 'DELETE',
  });
}
