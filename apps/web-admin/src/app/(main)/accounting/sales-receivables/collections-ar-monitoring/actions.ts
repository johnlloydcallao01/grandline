'use server';

import { getServerToken } from '@/app/actions/auth';
import { env } from '@/lib/env';
import {
  deleteSalesInvoice as deleteSharedSalesInvoice,
  getSalesInvoiceDetail as getSharedSalesInvoiceDetail,
  type SalesInvoiceDetail,
} from '../sales-documents/actions';

async function fetchAccountingAdmin<T>(path: string, init?: RequestInit): Promise<T> {
  const token = await getServerToken();
  if (!token) {
    throw new Error('No admin session available.');
  }

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

export type CollectionsFilterOption = {
  label: string;
  value: string;
};

export type CollectionsMetric = {
  id: string;
  label: string;
  value: number | string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
};

export type CollectionsCell =
  | string
  | {
      text: string;
      tone?: 'amber' | 'blue' | 'gray' | 'green' | 'red';
      emphasis?: boolean;
      align?: 'left' | 'right' | 'center';
    };

export type OverdueInvoiceRow = {
  id: string;
  invoiceNumber: string;
  invoiceDate: string | null;
  invoiceDateLabel: string;
  customerId: string;
  customerCode: string;
  customerLabel: string;
  dueDate: string | null;
  dueDateLabel: string;
  balanceDue: number;
  balanceDueLabel: string;
  total: number;
  totalLabel: string;
  daysOverdue: number;
  daysOverdueLabel: string;
  agingBucket: string;
  agingBucketLabel: string;
  status: string;
  statusLabel: string;
  statusTone: 'amber' | 'blue' | 'gray' | 'green' | 'red';
  isDueToday: boolean;
  isHighBalance: boolean;
  referenceNumber: string;
  memo: string;
  postedJournalEntryId: string;
  searchableText: string;
  cells: CollectionsCell[];
};

export type OverdueInvoiceRegisterResponse = {
  rows: OverdueInvoiceRow[];
  metrics: CollectionsMetric[];
  filterOptions: {
    statuses: CollectionsFilterOption[];
    customers: CollectionsFilterOption[];
    agingBuckets: CollectionsFilterOption[];
    quickFilters: CollectionsFilterOption[];
  };
  appliedFilters: {
    search: string;
    statuses: string[];
    customerIds: string[];
    agingBuckets: string[];
    quickFilters: string[];
  };
  meta: {
    id: string;
    label: string;
    description: string;
    searchPlaceholder: string;
    tableTitle: string;
    tableDescription: string;
    columns: Array<string | { label: string; align: string }>;
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
    customers: Array<{
      id: number | string;
      customerCode: string | null;
      displayName: string | null;
    }>;
  };
};

export type AgingInvoiceRow = {
  id: string;
  invoiceNumber: string;
  invoiceDate: string | null;
  invoiceDateLabel: string;
  customerId: string;
  customerCode: string;
  customerLabel: string;
  dueDate: string | null;
  dueDateLabel: string;
  balanceDue: number;
  balanceDueLabel: string;
  total: number;
  totalLabel: string;
  daysOverdue: number;
  daysOverdueLabel: string;
  agingBucket: string;
  agingBucketLabel: string;
  status: string;
  statusLabel: string;
  statusTone: 'amber' | 'blue' | 'gray' | 'green' | 'red';
  isCurrent: boolean;
  isDueToday: boolean;
  isHighBalance: boolean;
  currentAmount: number;
  currentAmountLabel: string;
  bucket1To30Amount: number;
  bucket1To30AmountLabel: string;
  bucket31To60Amount: number;
  bucket31To60AmountLabel: string;
  bucket61To90Amount: number;
  bucket61To90AmountLabel: string;
  bucketOver90Amount: number;
  bucketOver90AmountLabel: string;
  referenceNumber: string;
  memo: string;
  postedJournalEntryId: string;
  searchableText: string;
  cells: CollectionsCell[];
};

export type AgingInvoiceRegisterResponse = {
  rows: AgingInvoiceRow[];
  metrics: CollectionsMetric[];
  filterOptions: {
    statuses: CollectionsFilterOption[];
    customers: CollectionsFilterOption[];
    agingBuckets: CollectionsFilterOption[];
    quickFilters: CollectionsFilterOption[];
  };
  appliedFilters: {
    search: string;
    statuses: string[];
    customerIds: string[];
    agingBuckets: string[];
    quickFilters: string[];
  };
  meta: {
    id: string;
    label: string;
    description: string;
    searchPlaceholder: string;
    tableTitle: string;
    tableDescription: string;
    columns: Array<string | { label: string; align: string }>;
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
    customers: Array<{
      id: number | string;
      customerCode: string | null;
      displayName: string | null;
    }>;
  };
};

export async function getOverdueInvoices(
  query: {
    search?: string;
    page?: number;
    statuses?: string[];
    customerIds?: string[];
    agingBuckets?: string[];
    quickFilters?: string[];
  } = {},
): Promise<OverdueInvoiceRegisterResponse> {
  const params = new URLSearchParams();
  if (query.search?.trim()) params.set('search', query.search.trim());
  for (const value of query.statuses || []) params.append('status', value);
  for (const value of query.customerIds || []) params.append('customerId', value);
  for (const value of query.agingBuckets || []) params.append('agingBucket', value);
  for (const value of query.quickFilters || []) params.append('quickFilter', value);
  params.set('page', String(query.page || 1));
  params.set('limit', '10');

  return fetchAccountingAdmin<OverdueInvoiceRegisterResponse>(
    `/accounting/sales-receivables/overdue-invoices?${params.toString()}`,
  );
}

export async function getOverdueInvoiceDetail(id: string | number): Promise<SalesInvoiceDetail> {
  return getSharedSalesInvoiceDetail(id);
}

export async function deleteOverdueInvoice(id: string | number): Promise<{ success: boolean }> {
  return deleteSharedSalesInvoice(id);
}

export async function getAccountsReceivableAging(
  query: {
    search?: string;
    page?: number;
    statuses?: string[];
    customerIds?: string[];
    agingBuckets?: string[];
    quickFilters?: string[];
  } = {},
): Promise<AgingInvoiceRegisterResponse> {
  const params = new URLSearchParams();
  if (query.search?.trim()) params.set('search', query.search.trim());
  for (const value of query.statuses || []) params.append('status', value);
  for (const value of query.customerIds || []) params.append('customerId', value);
  for (const value of query.agingBuckets || []) params.append('agingBucket', value);
  for (const value of query.quickFilters || []) params.append('quickFilter', value);
  params.set('page', String(query.page || 1));
  params.set('limit', '10');

  return fetchAccountingAdmin<AgingInvoiceRegisterResponse>(
    `/accounting/sales-receivables/accounts-receivable-aging?${params.toString()}`,
  );
}
