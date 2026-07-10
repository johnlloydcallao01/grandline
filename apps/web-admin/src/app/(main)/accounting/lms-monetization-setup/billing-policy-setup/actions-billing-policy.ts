'use server';

import { getServerToken } from '@/app/actions/auth';
import { env } from '@/lib/env';

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
        : `Request failed with status ${response.status}.`;
    throw new Error(errorMessage);
  }

  return payload as T;
}

export type BillingPolicyMetric = {
  id: string;
  label: string;
  value: number | string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
};

export type BillingPolicyCell =
  | string
  | { text: string; tone?: 'amber' | 'blue' | 'gray' | 'green' | 'red'; emphasis?: boolean; align?: 'left' | 'right' | 'center' };

/* ─── Scholarship Sponsor Types ─── */

export type SponsorRow = {
  id: string;
  sponsorCode: string;
  name: string;
  defaultCustomer: string;
  defaultCustomerLabel: string;
  contactName: string;
  email: string;
  phone: string;
  billingAddress: string;
  status: string;
  statusLabel: string;
  notes: string;
  createdAt: string | null;
  updatedAt: string | null;
};

export type SponsorsRegisterResponse = {
  rows: SponsorRow[];
  metrics: BillingPolicyMetric[];
  filterOptions: {
    statuses: Array<{ label: string; value: string }>;
    contactFilters: Array<{ label: string; value: string }>;
  };
  meta: {
    searchPlaceholder: string;
    columns: string[];
    tableTitle: string;
    tableDescription: string;
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
    customers: Array<{ id: string; displayName: string; customerCode: string }>;
  };
};

export type SponsorDetail = {
  id: string;
  sponsorCode: string;
  name: string;
  defaultCustomer: string;
  defaultCustomerLabel: string;
  contactName: string;
  email: string;
  phone: string;
  billingAddress: string;
  status: string;
  notes: string;
  createdAt: string | null;
  updatedAt: string | null;
  usageSummary: {
    scholarshipAwardCount: number;
  };
};

export type SponsorMutationInput = {
  sponsorCode?: string;
  name: string;
  defaultCustomer?: string;
  contactName?: string;
  email?: string;
  phone?: string;
  billingAddress?: string;
  status?: string;
  notes?: string;
};

export async function getSponsors(
  query: {
    search?: string;
    page?: number;
    statuses?: string[];
    quickFilters?: string[];
  } = {},
): Promise<SponsorsRegisterResponse> {
  const params = new URLSearchParams();
  if (query.search?.trim()) params.set('search', query.search.trim());
  for (const value of query.statuses || []) params.append('status', value);
  for (const value of query.quickFilters || []) params.append('quickFilter', value);
  params.set('page', String(query.page || 1));
  params.set('limit', '100');

  return fetchAccountingAdmin<SponsorsRegisterResponse>(`/accounting/scholarship-sponsors?${params.toString()}`);
}

export async function getSponsorDetail(id: string | number): Promise<SponsorDetail> {
  return fetchAccountingAdmin<SponsorDetail>(`/accounting/scholarship-sponsors/${id}`);
}

export async function createSponsor(input: SponsorMutationInput): Promise<SponsorDetail> {
  const created = await fetchAccountingAdmin<{ id: string | number }>(`/accounting/scholarship-sponsors`, {
    method: 'POST',
    body: JSON.stringify(input),
  });
  return getSponsorDetail(created.id);
}

export async function updateSponsor(id: string | number, input: SponsorMutationInput): Promise<SponsorDetail> {
  return fetchAccountingAdmin<SponsorDetail>(`/accounting/scholarship-sponsors/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

export async function deleteSponsor(id: string | number): Promise<{ success: boolean }> {
  return fetchAccountingAdmin<{ success: boolean }>(`/accounting/scholarship-sponsors/${id}`, {
    method: 'DELETE',
  });
}

/* ─── Corporate Account Types ─── */

export type CorporateAccountRow = {
  id: string;
  accountCode: string;
  name: string;
  customer: string;
  customerLabel: string;
  billingContact: string;
  email: string;
  phone: string;
  creditTerms: string;
  paymentTerms: string;
  status: string;
  statusLabel: string;
  notes: string;
  createdAt: string | null;
  updatedAt: string | null;
};

export type CorporateAccountsRegisterResponse = {
  rows: CorporateAccountRow[];
  metrics: BillingPolicyMetric[];
  filterOptions: {
    statuses: Array<{ label: string; value: string }>;
    creditFilters: Array<{ label: string; value: string }>;
  };
  meta: {
    searchPlaceholder: string;
    columns: string[];
    tableTitle: string;
    tableDescription: string;
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
    customers: Array<{ id: string; displayName: string; customerCode: string }>;
  };
};

export type CorporateAccountDetail = {
  id: string;
  accountCode: string;
  name: string;
  customer: string;
  customerLabel: string;
  billingContact: string;
  email: string;
  phone: string;
  creditTerms: string;
  paymentTerms: string;
  status: string;
  notes: string;
  createdAt: string | null;
  updatedAt: string | null;
  usageSummary: {
    corporateBillingLinkCount: number;
  };
};

export type CorporateAccountMutationInput = {
  accountCode?: string;
  name: string;
  customer: string;
  billingContact?: string;
  email?: string;
  phone?: string;
  creditTerms?: string;
  paymentTerms?: string;
  status?: string;
  notes?: string;
};

export async function getCorporateAccounts(
  query: {
    search?: string;
    page?: number;
    statuses?: string[];
    quickFilters?: string[];
  } = {},
): Promise<CorporateAccountsRegisterResponse> {
  const params = new URLSearchParams();
  if (query.search?.trim()) params.set('search', query.search.trim());
  for (const value of query.statuses || []) params.append('status', value);
  for (const value of query.quickFilters || []) params.append('quickFilter', value);
  params.set('page', String(query.page || 1));
  params.set('limit', '100');

  return fetchAccountingAdmin<CorporateAccountsRegisterResponse>(`/accounting/corporate-accounts?${params.toString()}`);
}

export async function getCorporateAccountDetail(id: string | number): Promise<CorporateAccountDetail> {
  return fetchAccountingAdmin<CorporateAccountDetail>(`/accounting/corporate-accounts/${id}`);
}

export async function createCorporateAccount(input: CorporateAccountMutationInput): Promise<CorporateAccountDetail> {
  const created = await fetchAccountingAdmin<{ id: string | number }>(`/accounting/corporate-accounts`, {
    method: 'POST',
    body: JSON.stringify(input),
  });
  return getCorporateAccountDetail(created.id);
}

export async function updateCorporateAccount(id: string | number, input: CorporateAccountMutationInput): Promise<CorporateAccountDetail> {
  return fetchAccountingAdmin<CorporateAccountDetail>(`/accounting/corporate-accounts/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

export async function deleteCorporateAccount(id: string | number): Promise<{ success: boolean }> {
  return fetchAccountingAdmin<{ success: boolean }>(`/accounting/corporate-accounts/${id}`, {
    method: 'DELETE',
  });
}
