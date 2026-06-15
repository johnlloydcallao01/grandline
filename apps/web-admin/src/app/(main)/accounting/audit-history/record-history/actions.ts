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

export type HistoryMetric = {
  id: string;
  label: string;
  value: number | string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
};

export type HistoryFilterOption = {
  label: string;
  value: string;
};

export type EntityHistoryRow = {
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
  sourceField: string;
  sourceFieldSummary: string;
  reason: string;
  metadataSummary: string;
  metadata: unknown;
  beforeData: unknown;
  afterData: unknown;
  cells: Array<string | { text: string; emphasis?: boolean; tone?: string; align?: string }>;
};

export type EntityHistoryResponse = {
  section: {
    id: string;
    label: string;
    description: string;
    searchPlaceholder: string;
    filters: {
      actionTypes: HistoryFilterOption[];
      entityTypes: HistoryFilterOption[];
      quickFilters: HistoryFilterOption[];
    };
    metrics: HistoryMetric[];
    table: {
      title: string;
      description: string;
      columns: Array<string | { label: string; align: string }>;
      rows: EntityHistoryRow[];
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

export type BeforeAfterHistoryRow = {
  id: string;
  performedAt: string | null;
  performedAtLabel: string;
  entityType: string;
  entityId: string;
  actionType: string;
  actionLabel: string;
  actionTone: 'amber' | 'blue' | 'gray' | 'green' | 'red';
  performedBy: string;
  beforeSummary: string;
  afterSummary: string;
  reason: string;
  snapshotType: string;
  snapshotTypeLabel: string;
  changedFieldCount: number;
  metadata: unknown;
  beforeData: unknown;
  afterData: unknown;
  cells: Array<string | { text: string; emphasis?: boolean; tone?: string; align?: string }>;
};

export type BeforeAfterHistoryResponse = {
  section: {
    id: string;
    label: string;
    description: string;
    searchPlaceholder: string;
    filters: {
      actionTypes: HistoryFilterOption[];
      snapshotTypes: HistoryFilterOption[];
      quickFilters: HistoryFilterOption[];
    };
    metrics: HistoryMetric[];
    table: {
      title: string;
      description: string;
      columns: Array<string | { label: string; align: string }>;
      rows: BeforeAfterHistoryRow[];
    };
  };
  appliedFilters: {
    search: string;
    actionTypes: string[];
    snapshotTypes: string[];
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

export async function getEntityHistory(
  query: { search?: string; page?: number; actionTypes?: string[]; entityTypes?: string[]; quickFilters?: string[] } = {}
): Promise<EntityHistoryResponse> {
  const params = new URLSearchParams();
  if (query.search?.trim()) params.set('search', query.search.trim());
  for (const value of query.actionTypes || []) params.append('actionType', value);
  for (const value of query.entityTypes || []) params.append('entityType', value);
  for (const value of query.quickFilters || []) params.append('quickFilter', value);
  params.set('page', String(query.page || 1));
  params.set('limit', '10');

  return fetchAccountingAdmin<EntityHistoryResponse>(`/accounting/audit-history/entity-history?${params.toString()}`);
}

export async function getBeforeAfterHistory(
  query: { search?: string; page?: number; actionTypes?: string[]; snapshotTypes?: string[]; quickFilters?: string[] } = {}
): Promise<BeforeAfterHistoryResponse> {
  const params = new URLSearchParams();
  if (query.search?.trim()) params.set('search', query.search.trim());
  for (const value of query.actionTypes || []) params.append('actionType', value);
  for (const value of query.snapshotTypes || []) params.append('snapshotType', value);
  for (const value of query.quickFilters || []) params.append('quickFilter', value);
  params.set('page', String(query.page || 1));
  params.set('limit', '10');

  return fetchAccountingAdmin<BeforeAfterHistoryResponse>(`/accounting/audit-history/before-after-history?${params.toString()}`);
}
