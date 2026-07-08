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
      ? payload.error : 'Failed to load disposal data.';
    throw new Error(msg);
  }
  return payload as T;
}

export type DisposalCell =
  | string
  | { text: string; tone?: 'amber' | 'blue' | 'gray' | 'green' | 'red'; emphasis?: boolean; align?: 'left' | 'right' | 'center' };

export type DisposalRow = {
  id: string;
  fixedAssetId: string;
  assetLabel: string;
  disposalDate: string | null;
  disposalType: string;
  disposalTypeLabel: string;
  proceedsAmount: number;
  proceedsLabel: string;
  bookValueAtDisposal: number;
  bookValueLabel: string;
  gainOrLossAmount: number;
  gainOrLossLabel: string;
  gainLossSign: 'gain' | 'loss';
  status: string;
  statusLabel: string;
  statusTone: string;
  cells: DisposalCell[];
};

export type DisposalMetric = { id: string; label: string; value: number | string; change: string; trend: 'up' | 'down' | 'neutral' };

export type DisposalFilterOption = { label: string; value: string };

export type DisposalsResponse = {
  rows: DisposalRow[];
  metrics: DisposalMetric[];
  filterOptions: {
    statuses: DisposalFilterOption[];
    disposalTypes: DisposalFilterOption[];
    quickFilters: DisposalFilterOption[];
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
    chartAccounts: Array<{ id: string; code: string; name: string; accountType: string; accountSubType: string }>;
  };
};

export type DisposalDetail = Record<string, unknown>;

export type DisposalMutationInput = {
  fixedAsset: string;
  disposalDate: string;
  disposalType: string;
  proceedsAmount?: number;
  bookValueAtDisposal?: number;
  gainOrLossAmount?: number;
  proceedsAccount?: string | null;
  gainAccount?: string | null;
  lossAccount?: string | null;
  status?: string;
  notes?: string | null;
};

export async function getDisposalDetails(query: {
  search?: string; page?: number; statuses?: string[]; disposalTypes?: string[]; quickFilters?: string[];
} = {}): Promise<DisposalsResponse> {
  const params = new URLSearchParams();
  if (query.search?.trim()) params.set('search', query.search.trim());
  for (const v of query.statuses || []) params.append('status', v);
  for (const v of query.disposalTypes || []) params.append('disposalType', v);
  for (const v of query.quickFilters || []) params.append('quickFilter', v);
  params.set('page', String(query.page || 1));
  params.set('limit', '10');
  return fetchAccountingAdmin<DisposalsResponse>(`/accounting/asset-disposals?${params.toString()}`);
}

export async function getDisposalDetail(id: string | number): Promise<DisposalDetail> {
  return fetchAccountingAdmin<DisposalDetail>(`/accounting/asset-disposals/${id}`);
}

export async function createDisposal(input: DisposalMutationInput): Promise<DisposalDetail> {
  return fetchAccountingAdmin<DisposalDetail>('/accounting/asset-disposals', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function updateDisposal(id: string | number, input: Partial<DisposalMutationInput>): Promise<DisposalDetail> {
  return fetchAccountingAdmin<DisposalDetail>(`/accounting/asset-disposals/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

export async function deleteDisposal(id: string | number): Promise<{ success: boolean }> {
  return fetchAccountingAdmin<{ success: boolean }>(`/accounting/asset-disposals/${id}`, {
    method: 'DELETE',
  });
}
