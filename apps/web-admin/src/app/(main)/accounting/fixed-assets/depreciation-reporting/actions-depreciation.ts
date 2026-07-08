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
      ? payload.error : 'Failed to load depreciation data.';
    throw new Error(msg);
  }
  return payload as T;
}

export type DepreciationCell =
  | string
  | { text: string; tone?: 'amber' | 'blue' | 'gray' | 'green' | 'red'; emphasis?: boolean; align?: 'left' | 'right' | 'center' };

export type DepreciationRow = {
  id: string;
  fixedAssetId: string;
  assetLabel: string;
  fiscalYearId: string;
  fiscalYearLabel: string;
  periodId: string;
  periodLabel: string;
  depreciationDate: string | null;
  amount: number;
  amountLabel: string;
  status: string;
  statusLabel: string;
  statusTone: string;
  postedJournalEntryId: string;
  cells: DepreciationCell[];
};

export type DepreciationMetric = { id: string; label: string; value: number | string; change: string; trend: 'up' | 'down' | 'neutral' };

export type DepreciationFilterOption = { label: string; value: string };

export type DepreciationsResponse = {
  rows: DepreciationRow[];
  metrics: DepreciationMetric[];
  filterOptions: {
    statuses: DepreciationFilterOption[];
    quickFilters: DepreciationFilterOption[];
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
    fixedAssets: Array<{ id: string; assetCode: string; name: string }>;
    fiscalYears: Array<{ id: string; name: string }>;
    periods: Array<{ id: string; name: string }>;
  };
};

export type DepreciationDetail = Record<string, unknown>;

export type DepreciationMutationInput = {
  fixedAsset: string;
  fiscalYear: string;
  period: string;
  depreciationDate: string;
  amount: number;
  status?: string;
  notes?: string | null;
};

export async function getDepreciationSchedules(query: {
  search?: string; page?: number; statuses?: string[]; quickFilters?: string[];
} = {}): Promise<DepreciationsResponse> {
  const params = new URLSearchParams();
  if (query.search?.trim()) params.set('search', query.search.trim());
  for (const v of query.statuses || []) params.append('status', v);
  for (const v of query.quickFilters || []) params.append('quickFilter', v);
  params.set('page', String(query.page || 1));
  params.set('limit', '10');
  return fetchAccountingAdmin<DepreciationsResponse>(`/accounting/depreciation-schedules?${params.toString()}`);
}

export async function getDepreciationSchedule(id: string | number): Promise<DepreciationDetail> {
  return fetchAccountingAdmin<DepreciationDetail>(`/accounting/depreciation-schedules/${id}`);
}

export async function createDepreciationSchedule(input: DepreciationMutationInput): Promise<DepreciationDetail> {
  return fetchAccountingAdmin<DepreciationDetail>('/accounting/depreciation-schedules', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function updateDepreciationSchedule(id: string | number, input: Partial<DepreciationMutationInput>): Promise<DepreciationDetail> {
  return fetchAccountingAdmin<DepreciationDetail>(`/accounting/depreciation-schedules/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

export async function deleteDepreciationSchedule(id: string | number): Promise<{ success: boolean }> {
  return fetchAccountingAdmin<{ success: boolean }>(`/accounting/depreciation-schedules/${id}`, {
    method: 'DELETE',
  });
}
