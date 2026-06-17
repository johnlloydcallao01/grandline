'use server';

import { getServerToken } from '@/app/actions/auth';
import { env } from '@/lib/env';
import { getExportActivity as getSharedExportActivity } from '../audit-logs/actions';

type HistoryCell = string | { text: string; tone?: string; emphasis?: boolean; align?: string };

export type AuditMetric = {
  id: string;
  label: string;
  value: number | string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
};

export type AuditFilterOption = {
  label: string;
  value: string;
};

export type ExportActivityRow = {
  id: string;
  performedAt: string | null;
  performedAtLabel: string;
  entityType: string;
  entityTypeLabel: string;
  entityId: string;
  actionType: string;
  actionLabel: string;
  actionTone: 'amber' | 'blue' | 'gray' | 'green' | 'red';
  performedBy: string;
  metadataSummary: string;
  exportCategory: string;
  exportCategoryLabel: string;
  format: string;
  formatLabel: string;
  reason: string;
  metadata: unknown;
  beforeData: unknown;
  afterData: unknown;
  cells: Array<string | { text: string; emphasis?: boolean; tone?: string; align?: string }>;
};

export type ExportActivityResponse = {
  section: {
    id: string;
    label: string;
    description: string;
    searchPlaceholder: string;
    filters: {
      categories: AuditFilterOption[];
      entityTypes: AuditFilterOption[];
      quickFilters: AuditFilterOption[];
    };
    metrics: AuditMetric[];
    table: {
      title: string;
      description: string;
      columns: Array<string | { label: string; align: string }>;
      rows: ExportActivityRow[];
    };
  };
  appliedFilters: {
    search: string;
    categories: string[];
    entityTypes: string[];
    quickFilters: string[];
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
};

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
    const errorMessage =
      payload && typeof payload === 'object' && 'error' in payload && typeof payload.error === 'string'
        ? payload.error
        : 'Failed to load accounting data.';
    throw new Error(errorMessage);
  }

  return payload as T;
}

export type PeriodFiscalHistoryRow = {
  id: string;
  sourceId: string;
  controlType: 'fiscal_year' | 'period';
  controlTypeLabel: string;
  controlLabel: string;
  fiscalYearLabel: string;
  rangeLabel: string;
  status: string;
  statusLabel: string;
  statusTone: 'amber' | 'blue' | 'gray' | 'green' | 'red';
  lockedFromDate: string | null;
  lockedFromLabel: string;
  closedAt: string | null;
  closedAtLabel: string;
  closedBy: string;
  closeMode: string | null;
  closeModeLabel: string;
  notes: string;
  cells: HistoryCell[];
};

export type PeriodFiscalHistoryResponse = {
  section: {
    id: string;
    label: string;
    description: string;
    searchPlaceholder: string;
    filters: {
      statuses: Array<{ label: string; value: string }>;
      controlTypes: Array<{ label: string; value: string }>;
      closeModes: Array<{ label: string; value: string }>;
      quickFilters: Array<{ label: string; value: string }>;
    };
    metrics: Array<{
      id: string;
      label: string;
      value: number | string;
      change: string;
      trend: 'up' | 'down' | 'neutral';
    }>;
    table: {
      title: string;
      description: string;
      columns: Array<string | { label: string; align: string }>;
      rows: PeriodFiscalHistoryRow[];
    };
  };
  appliedFilters: {
    search: string;
    statuses: string[];
    controlTypes: string[];
    closeModes: string[];
    quickFilters: string[];
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
    fiscalYears: number;
    periods: number;
  };
};

export type ReconciliationHistoryRow = {
  id: string;
  sourceId: string;
  sessionLabel: string;
  bankAccountId: string;
  bankAccountLabel: string;
  statementStartDate: string | null;
  statementStartLabel: string;
  statementEndDate: string | null;
  statementEndLabel: string;
  statementClosingBalance: number;
  bookClosingBalance: number;
  differenceAmount: number;
  differenceLabel: string;
  status: string;
  statusLabel: string;
  statusTone: 'amber' | 'blue' | 'gray' | 'green' | 'red';
  completedAt: string | null;
  completedAtLabel: string;
  completedBy: string;
  notes: string;
  cells: HistoryCell[];
};

export type ReconciliationHistoryResponse = {
  section: {
    id: string;
    label: string;
    description: string;
    searchPlaceholder: string;
    filters: {
      statuses: Array<{ label: string; value: string }>;
      bankAccounts: Array<{ label: string; value: string }>;
      quickFilters: Array<{ label: string; value: string }>;
    };
    metrics: Array<{
      id: string;
      label: string;
      value: number | string;
      change: string;
      trend: 'up' | 'down' | 'neutral';
    }>;
    table: {
      title: string;
      description: string;
      columns: Array<string | { label: string; align: string }>;
      rows: ReconciliationHistoryRow[];
    };
  };
  appliedFilters: {
    search: string;
    statuses: string[];
    bankAccountIds: string[];
    quickFilters: string[];
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
};

export async function getPeriodFiscalHistory(query: {
  search?: string;
  page?: number;
  statuses?: string[];
  controlTypes?: string[];
  closeModes?: string[];
  quickFilters?: string[];
} = {}): Promise<PeriodFiscalHistoryResponse> {
  const params = new URLSearchParams();
  if (query.search?.trim()) params.set('search', query.search.trim());
  for (const value of query.statuses || []) params.append('status', value);
  for (const value of query.controlTypes || []) params.append('controlType', value);
  for (const value of query.closeModes || []) params.append('closeMode', value);
  for (const value of query.quickFilters || []) params.append('quickFilter', value);
  params.set('page', String(query.page || 1));
  params.set('limit', '10');

  return fetchAccountingAdmin<PeriodFiscalHistoryResponse>(`/accounting/audit-history/period-fiscal-history?${params.toString()}`);
}

export async function getReconciliationHistory(query: {
  search?: string;
  page?: number;
  statuses?: string[];
  bankAccountIds?: string[];
  quickFilters?: string[];
} = {}): Promise<ReconciliationHistoryResponse> {
  const params = new URLSearchParams();
  if (query.search?.trim()) params.set('search', query.search.trim());
  for (const value of query.statuses || []) params.append('status', value);
  for (const value of query.bankAccountIds || []) params.append('bankAccountId', value);
  for (const value of query.quickFilters || []) params.append('quickFilter', value);
  params.set('page', String(query.page || 1));
  params.set('limit', '10');

  return fetchAccountingAdmin<ReconciliationHistoryResponse>(`/accounting/audit-history/reconciliation-history?${params.toString()}`);
}

export async function getExportActivity(query: {
  search?: string;
  page?: number;
  categories?: string[];
  entityTypes?: string[];
  quickFilters?: string[];
} = {}): Promise<ExportActivityResponse> {
  return getSharedExportActivity(query);
}
