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

export type TaxCodeMetric = {
  id: string;
  label: string;
  value: number | string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
};

export type TaxCodeFilterOption = {
  label: string;
  value: string;
};

export type TaxCodeRegisterRow = {
  id: number | string;
  code: string | null;
  name: string | null;
  scope: string | null;
  scopeLabel: string | null;
  rate: number | null;
  rateDisplay: string | null;
  calculationMethod: string | null;
  calculationMethodLabel: string | null;
  purchaseAccountId: number | string | null;
  purchaseAccountCode: string | null;
  purchaseAccountName: string | null;
  salesAccountId: number | string | null;
  salesAccountCode: string | null;
  salesAccountName: string | null;
  isActive: boolean;
  isActiveLabel: string;
  description: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  cells: Array<string | { text: string; emphasis?: boolean; tone?: string; align?: string }>;
};

export type TaxCodesRegisterResponse = {
  section: {
    id: string;
    label: string;
    description: string;
    searchPlaceholder: string;
    filters: {
      scopes: TaxCodeFilterOption[];
      calculationMethods: TaxCodeFilterOption[];
      quickFilters: TaxCodeFilterOption[];
    };
    metrics: TaxCodeMetric[];
    table: {
      title: string;
      description: string;
      columns: Array<string | { label: string; align: string }>;
      rows: TaxCodeRegisterRow[];
    };
  };
  appliedFilters: {
    search: string;
    scopes: string[];
    calculationMethods: string[];
    statuses: string[];
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
    totalCodes: number;
    filteredCodes: number;
    activeCodes: number;
    inactiveCodes: number;
    salesScope: number;
    purchaseScope: number;
    bothScope: number;
  };
  referenceData: {
    chartAccounts: Array<{
      id: number | string;
      code: string | null;
      name: string | null;
    }>;
  };
};

export async function getTaxCodesRegister(
  query: { search?: string; page?: number; scopes?: string[]; calculationMethods?: string[]; statuses?: string[]; quickFilters?: string[] } = {}
): Promise<TaxCodesRegisterResponse> {
  const params = new URLSearchParams();
  if (query.search?.trim()) params.set('search', query.search.trim());
  for (const s of query.scopes || []) params.append('scope', s);
  for (const m of query.calculationMethods || []) params.append('calculationMethod', m);
  for (const s of query.statuses || []) params.append('status', s);
  for (const q of query.quickFilters || []) params.append('quickFilter', q);
  params.set('page', String(query.page || 1));
  params.set('limit', '10');

  return fetchAccountingAdmin<TaxCodesRegisterResponse>(`/accounting/tax-codes?${params.toString()}`);
}

export type TaxCodeDetail = {
  id: number | string;
  code: string | null;
  name: string | null;
  scope: string | null;
  rate: number | null;
  calculationMethod: string | null;
  purchaseAccount: { id: number | string; code?: string | null; name?: string | null } | number | string | null;
  salesAccount: { id: number | string; code?: string | null; name?: string | null } | number | string | null;
  isActive: boolean;
  description: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  usageSummary: {
    expenseCount: number;
    billLineItemCount: number;
    invoiceLineItemCount: number;
    journalEntryLineCount: number;
  };
};

export type TaxCodeMutationInput = {
  code: string;
  name: string;
  scope: string;
  rate: number;
  calculationMethod: string;
  purchaseAccount?: number | string | null;
  salesAccount?: number | string | null;
  isActive: boolean;
  description: string;
};

export async function getTaxCodeDetail(id: string | number): Promise<TaxCodeDetail> {
  return fetchAccountingAdmin<TaxCodeDetail>(`/accounting/tax-codes/${id}`);
}

export async function createTaxCode(data: TaxCodeMutationInput): Promise<TaxCodeDetail> {
  return fetchAccountingAdmin<TaxCodeDetail>('/accounting/tax-codes', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateTaxCode(
  id: string | number,
  data: TaxCodeMutationInput
): Promise<TaxCodeDetail> {
  return fetchAccountingAdmin<TaxCodeDetail>(`/accounting/tax-codes/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function deleteTaxCode(id: string | number): Promise<{ success: boolean }> {
  return fetchAccountingAdmin<{ success: boolean }>(`/accounting/tax-codes/${id}`, { method: 'DELETE' });
}

export type TaxUsageRegisterRow = {
  id: string;
  sourceType: string;
  document: string | null;
  taxCode: string | null;
  taxScope: string | null;
  taxableAmount: number;
  taxAmount: number;
  cells: Array<string | { text: string; emphasis?: boolean; tone?: string; align?: string }>;
};

export type TaxUsageMetric = {
  id: string;
  label: string;
  value: number | string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
};

export type TaxUsageFilterOption = {
  label: string;
  value: string;
};

export type TaxUsageRegisterResponse = {
  section: {
    id: string;
    label: string;
    description: string;
    searchPlaceholder: string;
    filters: {
      sourceTypes: TaxUsageFilterOption[];
      quickFilters: TaxUsageFilterOption[];
    };
    metrics: TaxUsageMetric[];
    table: {
      title: string;
      description: string;
      columns: Array<string | { label: string; align: string }>;
      rows: TaxUsageRegisterRow[];
    };
  };
  appliedFilters: {
    search: string;
    sourceTypes: string[];
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
    totalUsages: number;
    filteredUsages: number;
    invoiceLineUsage: number;
    billLineUsage: number;
    expenseUsage: number;
    journalLineUsage: number;
  };
};

export async function getTaxUsageRegister(
  query: { search?: string; page?: number; sourceTypes?: string[]; quickFilters?: string[] } = {}
): Promise<TaxUsageRegisterResponse> {
  const params = new URLSearchParams();
  if (query.search?.trim()) params.set('search', query.search.trim());
  for (const t of query.sourceTypes || []) params.append('sourceType', t);
  for (const q of query.quickFilters || []) params.append('quickFilter', q);
  params.set('page', String(query.page || 1));
  params.set('limit', '10');

  return fetchAccountingAdmin<TaxUsageRegisterResponse>(`/accounting/tax-usage?${params.toString()}`);
}
