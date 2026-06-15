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
    const errorMessage = payload && typeof payload === 'object' && 'error' in payload && typeof payload.error === 'string'
      ? payload.error : 'Failed to load accounting data.';
    throw new Error(errorMessage);
  }
  return payload as T;
}

export type TaxCodeGovernanceRow = {
  id: string;
  code: string | null;
  scope: string | null;
  scopeLabel: string | null;
  rate: number | null;
  rateDisplay: string | null;
  method: string | null;
  methodLabel: string | null;
  accountMapping: string;
  isActive: boolean;
  statusLabel: string;
  cells: Array<string | { text: string; emphasis?: boolean; tone?: string; align?: string }>;
};

export type GovernanceMetric = {
  id: string;
  label: string;
  value: number | string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
};

export type GovernanceFilterOption = {
  label: string;
  value: string;
};

export type TaxCodeGovernanceResponse = {
  section: {
    id: string;
    label: string;
    description: string;
    searchPlaceholder: string;
    filters: {
      status: GovernanceFilterOption[];
      mapping: GovernanceFilterOption[];
      quickFilters?: GovernanceFilterOption[];
    };
    metrics: GovernanceMetric[];
    table: {
      title: string;
      description: string;
      columns: Array<string | { label: string; align: string }>;
      rows: TaxCodeGovernanceRow[];
    };
  };
  appliedFilters: {
    search: string;
    status: string[];
    mapping: string[];
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
  referenceData: {
    chartAccounts: Array<{
      id: number | string;
      code: string | null;
      name: string | null;
    }>;
  };
};

export type TaxAuditHistoryRow = {
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
  source: string;
  sourceLabel: string;
  metadataSummary: string;
  beforeData: unknown;
  afterData: unknown;
  metadata: unknown;
  cells: Array<string | { text: string; emphasis?: boolean; tone?: string; align?: string }>;
};

export type TaxAuditHistoryResponse = {
  section: {
    id: string;
    label: string;
    description: string;
    searchPlaceholder: string;
    filters: {
      actionTypes: GovernanceFilterOption[];
      sources: GovernanceFilterOption[];
      quickFilters: GovernanceFilterOption[];
    };
    metrics: GovernanceMetric[];
    table: {
      title: string;
      description: string;
      columns: Array<string | { label: string; align: string }>;
      rows: TaxAuditHistoryRow[];
    };
  };
  appliedFilters: {
    search: string;
    actionTypes: string[];
    sources: string[];
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

export async function getTaxCodeGovernance(
  query: { search?: string; page?: number; status?: string[]; mapping?: string[]; quickFilters?: string[] } = {}
): Promise<TaxCodeGovernanceResponse> {
  const params = new URLSearchParams();
  if (query.search?.trim()) params.set('search', query.search.trim());
  for (const t of query.status || []) params.append('status', t);
  for (const t of query.mapping || []) params.append('mapping', t);
  for (const t of query.quickFilters || []) params.append('quickFilter', t);
  params.set('page', String(query.page || 1));
  params.set('limit', '10');

  return fetchAccountingAdmin<TaxCodeGovernanceResponse>(`/accounting/compliance-controls/tax-code-governance?${params.toString()}`);
}

export async function getTaxAuditHistory(
  query: { search?: string; page?: number; actionTypes?: string[]; sources?: string[]; quickFilters?: string[] } = {}
): Promise<TaxAuditHistoryResponse> {
  const params = new URLSearchParams();
  if (query.search?.trim()) params.set('search', query.search.trim());
  for (const t of query.actionTypes || []) params.append('actionType', t);
  for (const s of query.sources || []) params.append('source', s);
  for (const q of query.quickFilters || []) params.append('quickFilter', q);
  params.set('page', String(query.page || 1));
  params.set('limit', '10');

  return fetchAccountingAdmin<TaxAuditHistoryResponse>(`/accounting/compliance-controls/tax-audit-history?${params.toString()}`);
}
