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
    const errorMessage =
      payload && typeof payload === 'object' && 'error' in payload && typeof payload.error === 'string'
        ? payload.error
        : 'Failed to load accounting data.';
    throw new Error(errorMessage);
  }

  return payload as T;
}

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

export type FinanceAuditLogRow = {
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
  reason: string;
  metadataSummary: string;
  beforeData: unknown;
  afterData: unknown;
  metadata: unknown;
  cells: Array<string | { text: string; emphasis?: boolean; tone?: string; align?: string }>;
};

export type FinanceAuditLogResponse = {
  section: {
    id: string;
    label: string;
    description: string;
    searchPlaceholder: string;
    filters: {
      actionTypes: AuditFilterOption[];
      entityTypes: AuditFilterOption[];
      quickFilters: AuditFilterOption[];
    };
    metrics: AuditMetric[];
    table: {
      title: string;
      description: string;
      columns: Array<string | { label: string; align: string }>;
      rows: FinanceAuditLogRow[];
    };
  };
  appliedFilters: {
    search: string;
    actionTypes: string[];
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

export async function getFinanceAuditLog(
  query: { search?: string; page?: number; actionTypes?: string[]; entityTypes?: string[]; quickFilters?: string[] } = {}
): Promise<FinanceAuditLogResponse> {
  const params = new URLSearchParams();
  if (query.search?.trim()) params.set('search', query.search.trim());
  for (const value of query.actionTypes || []) params.append('actionType', value);
  for (const value of query.entityTypes || []) params.append('entityType', value);
  for (const value of query.quickFilters || []) params.append('quickFilter', value);
  params.set('page', String(query.page || 1));
  params.set('limit', '10');

  return fetchAccountingAdmin<FinanceAuditLogResponse>(`/accounting/audit-history/finance-audit-log?${params.toString()}`);
}

export async function getExportActivity(
  query: { search?: string; page?: number; categories?: string[]; entityTypes?: string[]; quickFilters?: string[] } = {}
): Promise<ExportActivityResponse> {
  const params = new URLSearchParams();
  if (query.search?.trim()) params.set('search', query.search.trim());
  for (const value of query.categories || []) params.append('category', value);
  for (const value of query.entityTypes || []) params.append('entityType', value);
  for (const value of query.quickFilters || []) params.append('quickFilter', value);
  params.set('page', String(query.page || 1));
  params.set('limit', '10');

  return fetchAccountingAdmin<ExportActivityResponse>(`/accounting/audit-history/export-activity?${params.toString()}`);
}
