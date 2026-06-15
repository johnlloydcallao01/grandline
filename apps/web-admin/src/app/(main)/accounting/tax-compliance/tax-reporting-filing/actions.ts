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

export type TaxSummaryReportRow = {
  id: string;
  taxCode: string | null;
  taxName: string | null;
  taxScope: string | null;
  calculationMethod: string | null;
  taxableAmount: number;
  taxAmount: number;
  sourceDocumentCount: number;
  cells: Array<string | { text: string; emphasis?: boolean; tone?: string; align?: string }>;
};

export type TaxSummaryMetric = {
  id: string;
  label: string;
  value: number | string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
};

export type TaxSummaryFilterOption = {
  label: string;
  value: string;
};

export type TaxSummaryReportResponse = {
  section: {
    id: string;
    label: string;
    description: string;
    searchPlaceholder: string;
    filters: {
      scopes: TaxSummaryFilterOption[];
      calculationMethods: TaxSummaryFilterOption[];
      quickFilters: TaxSummaryFilterOption[];
    };
    metrics: TaxSummaryMetric[];
    table: {
      title: string;
      description: string;
      columns: Array<string | { label: string; align: string }>;
      rows: TaxSummaryReportRow[];
    };
  };
  appliedFilters: {
    search: string;
    scopes: string[];
    calculationMethods: string[];
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
    totalTaxable: number;
    totalTax: number;
  };
};

export type TaxExportHistoryRow = {
  id: string;
  entityType: string;
  entityTypeLabel: string;
  entityId: string;
  actionType: string;
  actionLabel: string;
  actionTone: 'amber' | 'blue' | 'gray' | 'green' | 'red';
  performedBy: string;
  exportCategory: string;
  exportCategoryLabel: string;
  format: string;
  formatLabel: string;
  performedAt: string;
  reason: string;
  metadata: any;
  cells: Array<string | { text: string; emphasis?: boolean; tone?: string; align?: string }>;
};

export type TaxExportHistoryResponse = {
  section: {
    id: string;
    label: string;
    description: string;
    searchPlaceholder: string;
    filters: {
      categories: TaxSummaryFilterOption[];
      entityTypes: TaxSummaryFilterOption[];
      quickFilters: TaxSummaryFilterOption[];
    };
    metrics: TaxSummaryMetric[];
    table: {
      title: string;
      description: string;
      columns: Array<string | { label: string; align: string }>;
      rows: TaxExportHistoryRow[];
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

export async function getTaxSummaryReport(
  query: { search?: string; page?: number; scopes?: string[]; calculationMethods?: string[]; quickFilters?: string[] } = {}
): Promise<TaxSummaryReportResponse> {
  const params = new URLSearchParams();
  if (query.search?.trim()) params.set('search', query.search.trim());
  for (const t of query.scopes || []) params.append('scope', t);
  for (const m of query.calculationMethods || []) params.append('calculationMethod', m);
  for (const q of query.quickFilters || []) params.append('quickFilter', q);
  params.set('page', String(query.page || 1));
  params.set('limit', '10');

  return fetchAccountingAdmin<TaxSummaryReportResponse>(`/accounting/reports/tax-summary?${params.toString()}`);
}

export async function getTaxExportHistory(
  query: { search?: string; page?: number; categories?: string[]; entityTypes?: string[]; quickFilters?: string[] } = {}
): Promise<TaxExportHistoryResponse> {
  const params = new URLSearchParams();
  if (query.search?.trim()) params.set('search', query.search.trim());
  for (const c of query.categories || []) params.append('category', c);
  for (const e of query.entityTypes || []) params.append('entityType', e);
  for (const q of query.quickFilters || []) params.append('quickFilter', q);
  params.set('page', String(query.page || 1));
  params.set('limit', '10');

  return fetchAccountingAdmin<TaxExportHistoryResponse>(`/accounting/reports/tax-export-history?${params.toString()}`);
}
