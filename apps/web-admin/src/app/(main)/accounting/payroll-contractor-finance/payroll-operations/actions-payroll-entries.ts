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
      ? payload.error : 'Failed to load payroll entries data.';
    throw new Error(msg);
  }
  return payload as T;
}

export type PayrollEntryCell =
  | string
  | { text: string; tone?: 'amber' | 'blue' | 'gray' | 'green' | 'red'; emphasis?: boolean; align?: 'left' | 'right' | 'center' };

export type PayrollEntryRow = {
  id: string;
  payrollRunCode: string;
  payrollRunId: string;
  personLabel: string;
  entryType: string;
  entryTypeLabel: string;
  entryTypeTone: string;
  grossAmount: number;
  grossAmountLabel: string;
  deductionAmount: number;
  deductionAmountLabel: string;
  netAmount: number;
  netAmountLabel: string;
  status: string;
  statusLabel: string;
  statusTone: string;
  cells: PayrollEntryCell[];
};

export type PayrollEntryMetric = { id: string; label: string; value: number | string; change: string; trend: 'up' | 'down' | 'neutral' };

export type PayrollEntryFilterOption = { label: string; value: string };

export type PayrollEntriesResponse = {
  rows: PayrollEntryRow[];
  metrics: PayrollEntryMetric[];
  filterOptions: {
    statuses: PayrollEntryFilterOption[];
    entryTypes: PayrollEntryFilterOption[];
    quickFilters: PayrollEntryFilterOption[];
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
    payrollRuns: Array<{ id: string; payrollCode: string; periodStart: string }>;
  };
};

export type PayrollEntryDetail = Record<string, unknown>;

export type PayrollEntryMutationInput = {
  payrollRun: string;
  user?: string | null;
  instructor?: string | null;
  project?: string | null;
  entryType: string;
  grossAmount: number;
  deductionAmount?: number;
  expenseAccount: string;
  payableAccount: string;
  status?: string;
  notes?: string | null;
};

export async function getPayrollEntries(query: {
  search?: string; page?: number; statuses?: string[]; entryTypes?: string[]; quickFilters?: string[];
} = {}): Promise<PayrollEntriesResponse> {
  const params = new URLSearchParams();
  if (query.search?.trim()) params.set('search', query.search.trim());
  for (const v of query.statuses || []) params.append('status', v);
  for (const v of query.entryTypes || []) params.append('entryType', v);
  for (const v of query.quickFilters || []) params.append('quickFilter', v);
  params.set('page', String(query.page || 1));
  params.set('limit', '10');
  return fetchAccountingAdmin<PayrollEntriesResponse>(`/accounting/payroll/entries?${params.toString()}`);
}

export async function getPayrollEntryDetail(id: string | number): Promise<PayrollEntryDetail> {
  return fetchAccountingAdmin<PayrollEntryDetail>(`/accounting/payroll/entries/${id}`);
}

export async function createPayrollEntry(input: PayrollEntryMutationInput): Promise<PayrollEntryDetail> {
  return fetchAccountingAdmin<PayrollEntryDetail>('/accounting/payroll/entries', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function updatePayrollEntry(id: string | number, input: Partial<PayrollEntryMutationInput>): Promise<PayrollEntryDetail> {
  return fetchAccountingAdmin<PayrollEntryDetail>(`/accounting/payroll/entries/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

export async function deletePayrollEntry(id: string | number): Promise<{ success: boolean }> {
  return fetchAccountingAdmin<{ success: boolean }>(`/accounting/payroll/entries/${id}`, {
    method: 'DELETE',
  });
}
