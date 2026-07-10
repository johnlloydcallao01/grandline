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
      ? payload.error : 'Failed to load payroll runs data.';
    throw new Error(msg);
  }
  return payload as T;
}

export type PayrollRunCell =
  | string
  | { text: string; tone?: 'amber' | 'blue' | 'gray' | 'green' | 'red'; emphasis?: boolean; align?: 'left' | 'right' | 'center' };

export type PayrollRunRow = {
  id: string;
  payrollCode: string;
  periodStart: string | null;
  periodEnd: string | null;
  paymentDate: string | null;
  status: string;
  statusLabel: string;
  statusTone: string;
  journalRef: string | null;
  cells: PayrollRunCell[];
};

export type PayrollRunMetric = { id: string; label: string; value: number | string; change: string; trend: 'up' | 'down' | 'neutral' };

export type PayrollRunFilterOption = { label: string; value: string };

export type PayrollRunsResponse = {
  rows: PayrollRunRow[];
  metrics: PayrollRunMetric[];
  filterOptions: {
    statuses: PayrollRunFilterOption[];
    quickFilters: PayrollRunFilterOption[];
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
    branches: Array<{ id: string; branchCode: string; name: string }>;
    departments: Array<{ id: string; code: string; name: string }>;
  };
};

export type PayrollRunDetail = Record<string, unknown>;

export type PayrollRunMutationInput = {
  payrollCode?: string;
  periodStart: string;
  periodEnd: string;
  paymentDate: string;
  status?: string;
  branch?: string | null;
  department?: string | null;
  notes?: string | null;
};

export async function getPayrollRuns(query: {
  search?: string; page?: number; statuses?: string[]; quickFilters?: string[];
} = {}): Promise<PayrollRunsResponse> {
  const params = new URLSearchParams();
  if (query.search?.trim()) params.set('search', query.search.trim());
  for (const v of query.statuses || []) params.append('status', v);
  for (const v of query.quickFilters || []) params.append('quickFilter', v);
  params.set('page', String(query.page || 1));
  params.set('limit', '10');
  return fetchAccountingAdmin<PayrollRunsResponse>(`/accounting/payroll/runs?${params.toString()}`);
}

export async function getPayrollRunDetail(id: string | number): Promise<PayrollRunDetail> {
  return fetchAccountingAdmin<PayrollRunDetail>(`/accounting/payroll/runs/${id}`);
}

export async function createPayrollRun(input: PayrollRunMutationInput): Promise<PayrollRunDetail> {
  return fetchAccountingAdmin<PayrollRunDetail>('/accounting/payroll/runs', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function updatePayrollRun(id: string | number, input: Partial<PayrollRunMutationInput>): Promise<PayrollRunDetail> {
  return fetchAccountingAdmin<PayrollRunDetail>(`/accounting/payroll/runs/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

export async function deletePayrollRun(id: string | number): Promise<{ success: boolean }> {
  return fetchAccountingAdmin<{ success: boolean }>(`/accounting/payroll/runs/${id}`, {
    method: 'DELETE',
  });
}

export async function postPayrollRun(id: string | number): Promise<PayrollRunDetail> {
  return fetchAccountingAdmin<PayrollRunDetail>(`/accounting/payroll/runs/${id}/post`, {
    method: 'POST',
  });
}
