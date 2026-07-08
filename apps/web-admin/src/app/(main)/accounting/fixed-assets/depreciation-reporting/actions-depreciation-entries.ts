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
      ? payload.error : 'Failed to load depreciation entry data.';
    throw new Error(msg);
  }
  return payload as T;
}

export type EntryCell =
  | string
  | { text: string; tone?: 'amber' | 'blue' | 'gray' | 'green' | 'red'; emphasis?: boolean; align?: 'left' | 'right' | 'center' };

export type EntryRow = {
  id: string;
  fixedAssetId: string;
  assetLabel: string;
  periodId: string;
  periodLabel: string;
  depreciationDate: string | null;
  amount: number;
  amountLabel: string;
  status: string;
  statusLabel: string;
  statusTone: string;
  postedJournalEntryId: string;
  journalRef: string | null;
  cells: EntryCell[];
};

export type EntryMetric = { id: string; label: string; value: number | string; change: string; trend: 'up' | 'down' | 'neutral' };

export type EntryFilterOption = { label: string; value: string };

export type EntriesResponse = {
  rows: EntryRow[];
  metrics: EntryMetric[];
  filterOptions: {
    statuses: EntryFilterOption[];
    quickFilters: EntryFilterOption[];
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
    periods: Array<{ id: string; name: string }>;
    fiscalYears: Array<{ id: string; name: string }>;
  };
};

export type EntryDetail = Record<string, unknown>;

export type EntryMutationInput = {
  fixedAsset: string;
  fiscalYear?: string | null;
  period?: string | null;
  depreciationDate: string;
  amount: number;
  status?: string;
  notes?: string | null;
};

export async function getDepreciationEntries(query: {
  search?: string; page?: number; statuses?: string[]; quickFilters?: string[];
} = {}): Promise<EntriesResponse> {
  const params = new URLSearchParams();
  if (query.search?.trim()) params.set('search', query.search.trim());
  for (const v of query.statuses || []) params.append('status', v);
  for (const v of query.quickFilters || []) params.append('quickFilter', v);
  params.set('page', String(query.page || 1));
  params.set('limit', '10');
  return fetchAccountingAdmin<EntriesResponse>(`/accounting/depreciation-entries?${params.toString()}`);
}

export async function getDepreciationEntry(id: string | number): Promise<EntryDetail> {
  return fetchAccountingAdmin<EntryDetail>(`/accounting/depreciation-entries/${id}`);
}

export async function createDepreciationEntry(input: EntryMutationInput): Promise<EntryDetail> {
  return fetchAccountingAdmin<EntryDetail>('/accounting/depreciation-entries', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function updateDepreciationEntry(id: string | number, input: Partial<EntryMutationInput>): Promise<EntryDetail> {
  return fetchAccountingAdmin<EntryDetail>(`/accounting/depreciation-entries/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

export async function deleteDepreciationEntry(id: string | number): Promise<{ success: boolean }> {
  return fetchAccountingAdmin<{ success: boolean }>(`/accounting/depreciation-entries/${id}`, {
    method: 'DELETE',
  });
}

export async function postDepreciationEntry(id: string | number): Promise<EntryDetail> {
  return fetchAccountingAdmin<EntryDetail>(`/accounting/assets/depreciation/${id}/post`, {
    method: 'POST',
  });
}
