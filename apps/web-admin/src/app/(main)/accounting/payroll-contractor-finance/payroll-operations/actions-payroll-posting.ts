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
      ? payload.error : 'Failed to load payroll posting data.';
    throw new Error(msg);
  }
  return payload as T;
}

export type PostingCell =
  | string
  | { text: string; tone?: 'amber' | 'blue' | 'gray' | 'green' | 'red'; emphasis?: boolean; align?: 'left' | 'right' | 'center' };

export type PostingRow = {
  id: string;
  payrollCode: string;
  periodStart: string | null;
  periodEnd: string | null;
  paymentDate: string | null;
  status: string;
  statusLabel: string;
  statusTone: string;
  entryCount: number;
  grossTotal: number;
  grossTotalLabel: string;
  netTotal: number;
  netTotalLabel: string;
  journalRef: string | null;
  journalEntryId: string | null;
  postingState: string;
  postingStateLabel: string;
  postingStateTone: string;
  cells: PostingCell[];
};

export type PostingMetric = { id: string; label: string; value: number | string; change: string; trend: 'up' | 'down' | 'neutral' };

export type PostingFilterOption = { label: string; value: string };

export type PostingRegisterResponse = {
  rows: PostingRow[];
  metrics: PostingMetric[];
  filterOptions: {
    statuses: PostingFilterOption[];
    postingStates: PostingFilterOption[];
    quickFilters: PostingFilterOption[];
  };
  meta: {
    searchPlaceholder: string;
    columns: string[];
    tableTitle?: string;
    tableDescription?: string;
  };
  pagination: { page: number; limit: number; totalDocs: number; totalPages: number; hasPrevPage: boolean; hasNextPage: boolean };
  totals: { totalRows: number; filteredRows: number };
};

export type PostingDetail = Record<string, unknown>;

export async function getPostingRegister(query: {
  search?: string; page?: number; postingStates?: string[]; statuses?: string[]; quickFilters?: string[];
} = {}): Promise<PostingRegisterResponse> {
  const params = new URLSearchParams();
  if (query.search?.trim()) params.set('search', query.search.trim());
  for (const v of query.postingStates || []) params.append('postingState', v);
  for (const v of query.statuses || []) params.append('status', v);
  for (const v of query.quickFilters || []) params.append('quickFilter', v);
  params.set('page', String(query.page || 1));
  params.set('limit', '10');
  return fetchAccountingAdmin<PostingRegisterResponse>(`/accounting/payroll/posting?${params.toString()}`);
}

export async function getPostingDetail(id: string | number): Promise<PostingDetail> {
  return fetchAccountingAdmin<PostingDetail>(`/accounting/payroll/runs/${id}`);
}

export async function postPayrollRunToGL(id: string | number): Promise<PostingDetail> {
  return fetchAccountingAdmin<PostingDetail>(`/accounting/payroll/runs/${id}/post`, {
    method: 'POST',
  });
}

export async function voidPayrollRun(id: string | number): Promise<{ success: boolean }> {
  return fetchAccountingAdmin<{ success: boolean }>(`/accounting/payroll/runs/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ status: 'voided' }),
  });
}
