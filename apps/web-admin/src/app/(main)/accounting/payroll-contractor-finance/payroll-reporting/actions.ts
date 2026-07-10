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
      ? payload.error
      : 'Failed to load payroll posting report data.';
    throw new Error(msg);
  }
  return payload as T;
}

export type PayrollPostingReportCell =
  | string
  | { text: string; tone?: 'amber' | 'blue' | 'gray' | 'green' | 'red'; emphasis?: boolean; align?: 'left' | 'right' | 'center' };

export type PayrollPostingReportMetric = {
  id: string;
  label: string;
  value: number | string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
};

export type PayrollPostingReportFilterOption = {
  label: string;
  value: string;
};

export type PayrollPostingReportRow = {
  id: string;
  payrollCode: string;
  periodStart: string | null;
  periodEnd: string | null;
  paymentDate: string | null;
  status: string;
  statusLabel: string;
  statusTone: 'amber' | 'blue' | 'gray' | 'green' | 'red';
  entryCount: number;
  grossAmount: number;
  grossAmountLabel: string;
  deductionAmount: number;
  deductionAmountLabel: string;
  netAmount: number;
  netAmountLabel: string;
  postedJournalEntryId: string | null;
  postingState: string;
  postingStateLabel: string;
  postingStateTone: 'amber' | 'blue' | 'gray' | 'green' | 'red';
  cells: PayrollPostingReportCell[];
};

export type PayrollPostingReportResponse = {
  rows: PayrollPostingReportRow[];
  metrics: PayrollPostingReportMetric[];
  filterOptions: {
    statuses: PayrollPostingReportFilterOption[];
    postingStates: PayrollPostingReportFilterOption[];
    quickFilters: PayrollPostingReportFilterOption[];
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

export type PayrollRunReferenceData = {
  branches: Array<{ id: string; branchCode: string; name: string }>;
  departments: Array<{ id: string; code: string; name: string }>;
};

type PostingRegisterResponse = {
  rows: Array<{
    id: string;
    payrollCode: string;
    periodStart: string | null;
    periodEnd: string | null;
    paymentDate: string | null;
    status: string;
    statusLabel: string;
    statusTone: 'amber' | 'blue' | 'gray' | 'green' | 'red';
    entryCount: number;
    grossTotal: number;
    grossTotalLabel: string;
    netTotal: number;
    netTotalLabel: string;
    journalRef: string | null;
    journalEntryId: string | null;
    postingState: string;
    postingStateLabel: string;
    postingStateTone: 'amber' | 'blue' | 'gray' | 'green' | 'red';
  }>;
  metrics: PayrollPostingReportMetric[];
  filterOptions: PayrollPostingReportResponse['filterOptions'];
  pagination: PayrollPostingReportResponse['pagination'];
  totals: PayrollPostingReportResponse['totals'];
};

type PayrollRunsResponse = {
  referenceData: PayrollRunReferenceData;
};

export type PayrollRunDetail = Record<string, unknown> & {
  id?: string | number;
  payrollCode?: string;
  periodStart?: string;
  periodEnd?: string;
  paymentDate?: string;
  status?: string;
  branch?: unknown;
  department?: unknown;
  postedJournalEntry?: unknown;
  notes?: string;
  entries?: Array<Record<string, unknown>>;
};

export type PayrollRunMutationInput = {
  payrollCode?: string | null;
  periodStart: string;
  periodEnd: string;
  paymentDate: string;
  status?: string;
  branch?: string | null;
  department?: string | null;
  notes?: string | null;
};

const fmt = (value: number) =>
  new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value || 0));

export async function getPayrollPostingReport(query: {
  search?: string;
  page?: number;
  postingStates?: string[];
  statuses?: string[];
  quickFilters?: string[];
} = {}): Promise<PayrollPostingReportResponse> {
  const params = new URLSearchParams();
  if (query.search?.trim()) params.set('search', query.search.trim());
  for (const value of query.postingStates || []) params.append('postingState', value);
  for (const value of query.statuses || []) params.append('status', value);
  for (const value of query.quickFilters || []) params.append('quickFilter', value);
  params.set('page', String(query.page || 1));
  params.set('limit', '10');

  const response = await fetchAccountingAdmin<PostingRegisterResponse>(`/accounting/payroll/posting?${params.toString()}`);
  const rows = response.rows.map((row) => {
    const deductionAmount = Math.max(0, Number(row.grossTotal || 0) - Number(row.netTotal || 0));
    const deductionAmountLabel = fmt(deductionAmount);

    return {
      id: row.id,
      payrollCode: row.payrollCode,
      periodStart: row.periodStart,
      periodEnd: row.periodEnd,
      paymentDate: row.paymentDate,
      status: row.status,
      statusLabel: row.statusLabel,
      statusTone: row.statusTone,
      entryCount: row.entryCount,
      grossAmount: row.grossTotal,
      grossAmountLabel: row.grossTotalLabel,
      deductionAmount,
      deductionAmountLabel,
      netAmount: row.netTotal,
      netAmountLabel: row.netTotalLabel,
      postedJournalEntryId: row.journalRef || row.journalEntryId,
      postingState: row.postingState,
      postingStateLabel: row.postingStateLabel,
      postingStateTone: row.postingStateTone,
      cells: [
        { text: row.payrollCode, emphasis: true },
        row.paymentDate || '-',
        { text: row.grossTotalLabel, align: 'right' },
        { text: deductionAmountLabel, align: 'right' },
        { text: row.netTotalLabel, align: 'right', emphasis: true },
        { text: row.statusLabel, tone: row.statusTone },
        String(row.entryCount),
        row.journalRef || '-',
        { text: row.postingStateLabel, tone: row.postingStateTone },
      ] satisfies PayrollPostingReportCell[],
    };
  });

  const grossAmount = rows.reduce((sum, row) => sum + row.grossAmount, 0);
  const deductionAmount = rows.reduce((sum, row) => sum + row.deductionAmount, 0);
  const netAmount = rows.reduce((sum, row) => sum + row.netAmount, 0);
  const postedCount = rows.filter((row) => row.postingState === 'posted').length;

  return {
    ...response,
    rows,
    metrics: [
      { id: 'reported-runs', label: 'Reported Runs', value: response.totals.filteredRows, change: 'Payroll runs included in the current posting report', trend: response.totals.filteredRows > 0 ? 'up' : 'neutral' },
      { id: 'gross-amount', label: 'Gross Amount', value: fmt(grossAmount), change: 'Gross payroll expense before deductions', trend: grossAmount > 0 ? 'up' : 'neutral' },
      { id: 'deduction-amount', label: 'Deduction Amount', value: fmt(deductionAmount), change: 'Employee deductions retained as payroll liabilities', trend: deductionAmount > 0 ? 'neutral' : 'down' },
      { id: 'net-amount', label: 'Net Amount', value: fmt(netAmount), change: `${postedCount} posted run(s) linked to journal entries`, trend: netAmount > 0 ? 'up' : 'neutral' },
    ],
    meta: {
      searchPlaceholder: 'Search payroll code, payment date, posting state, status, entry count, or journal',
      columns: ['Payroll Code', 'Payment Date', 'Gross Amount', 'Deduction Amount', 'Net Amount', 'Status', 'Entries', 'Posted Journal', 'Posting State'],
      tableTitle: 'Payroll Posting Report',
      tableDescription: 'Run-level payroll posting report showing gross payroll expense, deductions, net payable, entry count, approval status, and posted journal linkage.',
    },
  };
}

export async function getPayrollRunReferenceData(): Promise<PayrollRunReferenceData> {
  const response = await fetchAccountingAdmin<PayrollRunsResponse>('/accounting/payroll/runs?page=1&limit=1');
  return response.referenceData;
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

export async function updatePayrollRun(id: string | number, input: PayrollRunMutationInput): Promise<PayrollRunDetail> {
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
