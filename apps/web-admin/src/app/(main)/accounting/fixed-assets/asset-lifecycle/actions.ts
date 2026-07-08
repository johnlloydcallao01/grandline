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
      ? payload.error : 'Failed to load acquisition data.';
    throw new Error(msg);
  }
  return payload as T;
}

export type AcquisitionCell =
  | string
  | { text: string; tone?: 'amber' | 'blue' | 'gray' | 'green' | 'red'; emphasis?: boolean; align?: 'left' | 'right' | 'center' };

export type AcquisitionRow = {
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
  status: string;
  statusLabel: string;
  statusTone: string;
  documentRef: string;
  cells: AcquisitionCell[];
};

export type AcquisitionMetric = { id: string; label: string; value: number | string; change: string; trend: 'up' | 'down' | 'neutral' };

export type AcquisitionFilterOption = { label: string; value: string };

export type AcquisitionsResponse = {
  rows: AcquisitionRow[];
  metrics: AcquisitionMetric[];
  filterOptions: {
    statuses: AcquisitionFilterOption[];
    categories: AcquisitionFilterOption[];
    quickFilters: AcquisitionFilterOption[];
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
    vendors: Array<{ id: string; vendorCode: string; displayName: string }>;
    chartAccounts: Array<{ id: string; code: string; name: string; accountType: string; accountSubType: string }>;
    branches: Array<{ id: string; branchCode: string; name: string; status: string }>;
    departments: Array<{ id: string; code: string; name: string; status: string }>;
    locations: Array<{ id: string; code: string; name: string; status: string }>;
  };
};

export type AcquisitionDetail = Record<string, unknown>;

export type AcquisitionMutationInput = {
  name: string;
  assetCategory?: string;
  purchaseDate: string;
  inServiceDate?: string | null;
  cost: number;
  salvageValue?: number;
  usefulLifeMonths: number;
  depreciationMethod?: string;
  expenseAccount: string;
  assetAccount: string;
  accumulatedDepreciationAccount: string;
  branch?: string | null;
  department?: string | null;
  location?: string | null;
  status?: string;
  notes?: string | null;
  assetCode?: string | null;
  vendor?: string | null;
  purchaseOrderNumber?: string | null;
  invoiceNumber?: string | null;
  receivingDate?: string | null;
};

export async function getAcquisitionDetails(query: {
  search?: string; page?: number; statuses?: string[]; categories?: string[]; quickFilters?: string[];
} = {}): Promise<AcquisitionsResponse> {
  const params = new URLSearchParams();
  if (query.search?.trim()) params.set('search', query.search.trim());
  for (const v of query.statuses || []) params.append('status', v);
  for (const v of query.categories || []) params.append('category', v);
  for (const v of query.quickFilters || []) params.append('quickFilter', v);
  params.set('page', String(query.page || 1));
  params.set('limit', '10');
  return fetchAccountingAdmin<AcquisitionsResponse>(`/accounting/asset-acquisitions?${params.toString()}`);
}

export async function getAcquisitionDetail(id: string | number): Promise<AcquisitionDetail> {
  return fetchAccountingAdmin<AcquisitionDetail>(`/accounting/asset-acquisitions/${id}`);
}

export async function createAcquisition(input: AcquisitionMutationInput): Promise<AcquisitionDetail> {
  return fetchAccountingAdmin<AcquisitionDetail>('/accounting/asset-acquisitions', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function updateAcquisition(id: string | number, input: Partial<AcquisitionMutationInput>): Promise<AcquisitionDetail> {
  return fetchAccountingAdmin<AcquisitionDetail>(`/accounting/asset-acquisitions/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

export async function deleteAcquisition(id: string | number): Promise<{ success: boolean }> {
  return fetchAccountingAdmin<{ success: boolean }>(`/accounting/asset-acquisitions/${id}`, {
    method: 'DELETE',
  });
}
