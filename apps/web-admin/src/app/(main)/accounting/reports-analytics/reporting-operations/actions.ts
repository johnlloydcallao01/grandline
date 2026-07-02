'use server';

import { getServerToken } from '@/app/actions/auth';
import { env } from '@/lib/env';

async function fetchAccountingAdmin<T>(path: string, init?: RequestInit): Promise<T> {
  const token = await getServerToken();
  if (!token) throw new Error('No admin session available.');
  const response = await fetch(`${env.NEXT_PUBLIC_API_URL}${path}`, {
    ...init, headers: { Authorization: `JWT ${token}`, ...(init?.body ? { 'Content-Type': 'application/json' } : {}), ...(init?.headers || {}) }, cache: 'no-store',
  });
  const payload = (await response.json().catch(() => null)) as T | { error?: string } | null;
  if (!response.ok) { const m = payload && typeof payload === 'object' && 'error' in payload && typeof payload.error === 'string' ? payload.error : 'Failed to load dashboard data.'; throw new Error(m); }
  return payload as T;
}

export type DsMetric = { id: string; label: string; value: number | string; change: string; trend: 'up' | 'down' | 'neutral'; };
export type DsFilterOption = { label: string; value: string };

export type DashboardSummaryRow = {
  id: string; reportType: string; reportTypeLabel: string; reference: string; dateLabel: string;
  partyName: string; type: string; typeTone: string; amount: number; status: string; statusLabel: string; statusTone: string;
  cells: Array<string | { text: string; emphasis?: boolean; tone?: string; align?: string }>;
};

export type DashboardSummaryResponse = {
  section: { id: string; label: string; description: string; searchPlaceholder: string; filters: { types: DsFilterOption[]; quickFilters: DsFilterOption[] }; metrics: DsMetric[]; table: { title: string; description: string; columns: string[]; rows: DashboardSummaryRow[] }; };
  appliedFilters: { search: string; types: string[]; quickFilters: string[] };
  pagination: { page: number; limit: number; totalDocs: number; totalPages: number; hasPrevPage: boolean; hasNextPage: boolean };
  totals: { totalRows: number; filteredRows: number };
};

export async function getDashboardSummary(query: { search?: string; page?: number; types?: string[]; quickFilters?: string[] } = {}): Promise<DashboardSummaryResponse> {
  const params = new URLSearchParams();
  if (query.search?.trim()) params.set('search', query.search.trim());
  for (const t of query.types || []) params.append('type', t);
  for (const q of query.quickFilters || []) params.append('quickFilter', q);
  params.set('page', String(query.page || 1)); params.set('limit', '10');
  return fetchAccountingAdmin<DashboardSummaryResponse>(`/accounting/dashboard-summary?${params.toString()}`);
}

export type RcMetric = { id: string; label: string; value: number | string; change: string; trend: 'up' | 'down' | 'neutral'; };
export type RcFilterOption = { label: string; value: string };

export type ReportCatalogRow = {
  id: string; reportName: string; source: string; sourceLabel: string; scope: string; path: string;
  primaryData: string; status: string; statusTone: string;
  cells: Array<string | { text: string; emphasis?: boolean; tone?: string; align?: string }>;
};

export type ReportCatalogResponse = {
  section: { id: string; label: string; description: string; searchPlaceholder: string; filters: { sources: RcFilterOption[]; scopes: RcFilterOption[]; quickFilters: RcFilterOption[] }; metrics: RcMetric[]; table: { title: string; description: string; columns: string[]; rows: ReportCatalogRow[] }; };
  appliedFilters: { search: string; sources: string[]; scopes: string[]; quickFilters: string[] };
  pagination: { page: number; limit: number; totalDocs: number; totalPages: number; hasPrevPage: boolean; hasNextPage: boolean };
  totals: { totalRows: number; filteredRows: number; routeCount: number; serviceCount: number };
};

export async function getReportCatalog(query: { search?: string; page?: number; sources?: string[]; scopes?: string[]; quickFilters?: string[] } = {}): Promise<ReportCatalogResponse> {
  const params = new URLSearchParams();
  if (query.search?.trim()) params.set('search', query.search.trim());
  for (const s of query.sources || []) params.append('source', s);
  for (const s of query.scopes || []) params.append('scope', s);
  for (const q of query.quickFilters || []) params.append('quickFilter', q);
  params.set('page', String(query.page || 1)); params.set('limit', '50');
  return fetchAccountingAdmin<ReportCatalogResponse>(`/accounting/report-catalog?${params.toString()}`);
}
