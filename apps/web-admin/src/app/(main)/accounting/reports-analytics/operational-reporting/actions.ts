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
      ? payload.error : 'Failed to load sales reports data.';
    throw new Error(errorMessage);
  }
  return payload as T;
}

export type SrMetric = {
  id: string; label: string; value: number | string; change: string; trend: 'up' | 'down' | 'neutral';
};

export type SrFilterOption = { label: string; value: string };

export type SalesReportRow = {
  id: string;
  documentNumber: string;
  documentDate: string | null;
  documentDateLabel: string;
  partyName: string;
  documentType: string;
  documentTypeLabel: string;
  documentTypeTone: string;
  status: string;
  statusLabel: string;
  statusTone: string;
  total: number;
  balanceDue: number;
  dueDate: string | null;
  currency: string;
  searchableText: string;
  cells: Array<string | { text: string; emphasis?: boolean; tone?: string; align?: string }>;
};

export type SalesReportsResponse = {
  section: {
    id: string;
    label: string;
    description: string;
    searchPlaceholder: string;
    filters: {
      types: SrFilterOption[];
      statuses: SrFilterOption[];
      quickFilters: SrFilterOption[];
    };
    metrics: SrMetric[];
    table: { title: string; description: string; columns: string[]; rows: SalesReportRow[] };
  };
  appliedFilters: { search: string; types: string[]; statuses: string[]; quickFilters: string[] };
  pagination: { page: number; limit: number; totalDocs: number; totalPages: number; hasPrevPage: boolean; hasNextPage: boolean };
  totals: { totalRows: number; filteredRows: number; invoiceCount: number; paymentCount: number; openArTotal: number; overdueCount: number };
};

export async function getSalesReports(
  query: { search?: string; page?: number; types?: string[]; statuses?: string[]; quickFilters?: string[] } = {},
): Promise<SalesReportsResponse> {
  const params = new URLSearchParams();
  if (query.search?.trim()) params.set('search', query.search.trim());
  for (const t of query.types || []) params.append('type', t);
  for (const s of query.statuses || []) params.append('status', s);
  for (const q of query.quickFilters || []) params.append('quickFilter', q);
  params.set('page', String(query.page || 1));
  params.set('limit', '10');

  return fetchAccountingAdmin<SalesReportsResponse>(`/accounting/sales-reports?${params.toString()}`);
}

export type PrMetric = {
  id: string; label: string; value: number | string; change: string; trend: 'up' | 'down' | 'neutral';
};

export type PrFilterOption = { label: string; value: string };

export type PurchaseReportRow = {
  id: string;
  documentNumber: string;
  documentDate: string | null;
  documentDateLabel: string;
  partyName: string;
  documentType: string;
  documentTypeLabel: string;
  documentTypeTone: string;
  status: string;
  statusLabel: string;
  statusTone: string;
  total: number;
  balanceDue: number;
  dueDate: string | null;
  currency: string;
  searchableText: string;
  cells: Array<string | { text: string; emphasis?: boolean; tone?: string; align?: string }>;
};

export type PurchaseReportsResponse = {
  section: {
    id: string; label: string; description: string; searchPlaceholder: string;
    filters: { types: PrFilterOption[]; statuses: PrFilterOption[]; quickFilters: PrFilterOption[] };
    metrics: PrMetric[];
    table: { title: string; description: string; columns: string[]; rows: PurchaseReportRow[] };
  };
  appliedFilters: { search: string; types: string[]; statuses: string[]; quickFilters: string[] };
  pagination: { page: number; limit: number; totalDocs: number; totalPages: number; hasPrevPage: boolean; hasNextPage: boolean };
  totals: { totalRows: number; filteredRows: number; billCount: number; paymentCount: number; openApTotal: number; overdueCount: number };
};

export async function getPurchaseReports(
  query: { search?: string; page?: number; types?: string[]; statuses?: string[]; quickFilters?: string[] } = {},
): Promise<PurchaseReportsResponse> {
  const params = new URLSearchParams();
  if (query.search?.trim()) params.set('search', query.search.trim());
  for (const t of query.types || []) params.append('type', t);
  for (const s of query.statuses || []) params.append('status', s);
  for (const q of query.quickFilters || []) params.append('quickFilter', q);
  params.set('page', String(query.page || 1));
  params.set('limit', '10');

  return fetchAccountingAdmin<PurchaseReportsResponse>(`/accounting/purchase-reports?${params.toString()}`);
}

export type ErMetric = {
  id: string; label: string; value: number | string; change: string; trend: 'up' | 'down' | 'neutral';
};

export type ErFilterOption = { label: string; value: string };

export type ExpenseReportRow = {
  id: string;
  documentNumber: string;
  documentDate: string | null;
  documentDateLabel: string;
  partyName: string;
  status: string;
  statusLabel: string;
  statusTone: string;
  total: number;
  currency: string;
  cells: Array<string | { text: string; emphasis?: boolean; tone?: string; align?: string }>;
};

export type ExpenseReportsResponse = {
  section: {
    id: string; label: string; description: string; searchPlaceholder: string;
    filters: { statuses: ErFilterOption[]; quickFilters: ErFilterOption[] };
    metrics: ErMetric[];
    table: { title: string; description: string; columns: string[]; rows: ExpenseReportRow[] };
  };
  appliedFilters: { search: string; statuses: string[]; quickFilters: string[] };
  pagination: { page: number; limit: number; totalDocs: number; totalPages: number; hasPrevPage: boolean; hasNextPage: boolean };
  totals: { totalRows: number; filteredRows: number; totalAmount: number; withVendorCount: number };
};

export async function getExpenseReports(
  query: { search?: string; page?: number; statuses?: string[]; quickFilters?: string[] } = {},
): Promise<ExpenseReportsResponse> {
  const params = new URLSearchParams();
  if (query.search?.trim()) params.set('search', query.search.trim());
  for (const s of query.statuses || []) params.append('status', s);
  for (const q of query.quickFilters || []) params.append('quickFilter', q);
  params.set('page', String(query.page || 1));
  params.set('limit', '10');

  return fetchAccountingAdmin<ExpenseReportsResponse>(`/accounting/expense-reports?${params.toString()}`);
}

export type CtaMetric = {
  id: string; label: string; value: number | string; change: string; trend: 'up' | 'down' | 'neutral';
};

export type CtaFilterOption = { label: string; value: string };

export type CashTaxAgingRow = {
  id: string;
  reportType: string;
  reportTypeLabel: string;
  reference: string;
  partyName: string;
  bucketLabel: string;
  bucketTone: string;
  amount: number;
  status: string;
  statusLabel: string;
  statusTone: string;
  cells: Array<string | { text: string; emphasis?: boolean; tone?: string; align?: string }>;
};

export type CashTaxAgingResponse = {
  section: {
    id: string; label: string; description: string; searchPlaceholder: string;
    filters: { types: CtaFilterOption[]; quickFilters: CtaFilterOption[] };
    metrics: CtaMetric[];
    table: { title: string; description: string; columns: string[]; rows: CashTaxAgingRow[] };
  };
  appliedFilters: { search: string; types: string[]; quickFilters: string[] };
  pagination: { page: number; limit: number; totalDocs: number; totalPages: number; hasPrevPage: boolean; hasNextPage: boolean };
  totals: { totalRows: number; filteredRows: number; cashRows: number; taxRows: number; arRows: number; apRows: number };
};

export async function getCashTaxAging(
  query: { search?: string; page?: number; types?: string[]; quickFilters?: string[] } = {},
): Promise<CashTaxAgingResponse> {
  const params = new URLSearchParams();
  if (query.search?.trim()) params.set('search', query.search.trim());
  for (const t of query.types || []) params.append('type', t);
  for (const q of query.quickFilters || []) params.append('quickFilter', q);
  params.set('page', String(query.page || 1));
  params.set('limit', '10');

  return fetchAccountingAdmin<CashTaxAgingResponse>(`/accounting/cash-tax-aging?${params.toString()}`);
}
