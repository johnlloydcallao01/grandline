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
      ? payload.error : 'Failed to load fixed assets data.';
    throw new Error(msg);
  }
  return payload as T;
}

export type FixedAssetCell =
  | string
  | { text: string; tone?: 'amber' | 'blue' | 'gray' | 'green' | 'red'; emphasis?: boolean; align?: 'left' | 'right' | 'center' };

export type FixedAssetRow = {
  id: string;
  assetCode: string;
  name: string;
  assetCategory: string;
  categoryLabel: string;
  purchaseDate: string | null;
  inServiceDate: string | null;
  cost: number;
  costLabel: string;
  salvageValue: number;
  salvageValueLabel: string;
  usefulLifeMonths: number;
  usefulLifeLabel: string;
  depreciationMethod: string;
  methodLabel: string;
  expenseAccountId: string | null;
  expenseAccountLabel: string;
  assetAccountId: string | null;
  assetAccountLabel: string;
  accumulatedDepreciationAccountId: string | null;
  accumulatedDepreciationAccountLabel: string;
  branchId: string | null;
  branchLabel: string;
  departmentId: string | null;
  departmentLabel: string;
  locationId: string | null;
  locationLabel: string;
  status: string;
  statusLabel: string;
  statusTone: string;
  notes: string;
  cells: FixedAssetCell[];
  setupCells: FixedAssetCell[];
};

export type FixedAssetMetric = { id: string; label: string; value: number | string; change: string; trend: 'up' | 'down' | 'neutral' };

export type FixedAssetFilterOption = { label: string; value: string };

export type FixedAssetsResponse = {
  rows: FixedAssetRow[];
  metrics: FixedAssetMetric[];
  filterOptions: {
    statuses: FixedAssetFilterOption[];
    categories: FixedAssetFilterOption[];
    quickFilters: FixedAssetFilterOption[];
  };
  meta: {
    searchPlaceholder: string;
    columns: string[];
    setupColumns: string[];
    tableTitle?: string;
    tableDescription?: string;
  };
  pagination: { page: number; limit: number; totalDocs: number; totalPages: number; hasPrevPage: boolean; hasNextPage: boolean };
  totals: { totalRows: number; filteredRows: number };
  referenceData: {
    chartAccounts: Array<{ id: string; code: string; name: string; accountType: string; accountSubType: string }>;
    branches: Array<{ id: string; branchCode: string; name: string; status: string }>;
    departments: Array<{ id: string; code: string; name: string; status: string }>;
    locations: Array<{ id: string; code: string; name: string; status: string }>;
  };
};

export type FixedAssetDetail = Record<string, unknown>;

export type FixedAssetMutationInput = {
  name: string;
  assetCategory: string;
  purchaseDate: string;
  inServiceDate?: string | null;
  cost: number;
  salvageValue?: number;
  usefulLifeMonths: number;
  depreciationMethod: string;
  expenseAccount: string;
  assetAccount: string;
  accumulatedDepreciationAccount: string;
  branch?: string | null;
  department?: string | null;
  location?: string | null;
  status?: string;
  notes?: string | null;
  assetCode?: string | null;
};

export async function getFixedAssets(query: {
  search?: string; page?: number; statuses?: string[]; categories?: string[]; quickFilters?: string[];
} = {}): Promise<FixedAssetsResponse> {
  const params = new URLSearchParams();
  if (query.search?.trim()) params.set('search', query.search.trim());
  for (const v of query.statuses || []) params.append('status', v);
  for (const v of query.categories || []) params.append('category', v);
  for (const v of query.quickFilters || []) params.append('quickFilter', v);
  params.set('page', String(query.page || 1));
  params.set('limit', '10');
  return fetchAccountingAdmin<FixedAssetsResponse>(`/accounting/fixed-assets?${params.toString()}`);
}

export async function getFixedAssetDetail(id: string | number): Promise<FixedAssetDetail> {
  return fetchAccountingAdmin<FixedAssetDetail>(`/accounting/fixed-assets/${id}`);
}

export async function createFixedAsset(input: FixedAssetMutationInput): Promise<FixedAssetDetail> {
  return fetchAccountingAdmin<FixedAssetDetail>('/accounting/fixed-assets', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function updateFixedAsset(id: string | number, input: Partial<FixedAssetMutationInput>): Promise<FixedAssetDetail> {
  return fetchAccountingAdmin<FixedAssetDetail>(`/accounting/fixed-assets/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

export async function deleteFixedAsset(id: string | number): Promise<{ success: boolean }> {
  return fetchAccountingAdmin<{ success: boolean }>(`/accounting/fixed-assets/${id}`, {
    method: 'DELETE',
  });
}
