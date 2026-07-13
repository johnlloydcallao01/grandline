'use server';

import { getServerToken } from '@/app/actions/auth';
import { env } from '@/lib/env';

export type SponsorMetric = {
  id: string;
  label: string;
  value: number | string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
};

export type SponsorFilterOption = {
  label: string;
  value: string;
};

export type SponsorCell = string | {
  text: string;
  tone?: 'amber' | 'blue' | 'gray' | 'green' | 'red';
  emphasis?: boolean;
  align?: 'left' | 'right' | 'center';
};

export type SponsorRow = {
  id: string;
  sponsorCode: string;
  name: string;
  defaultCustomerId: string;
  defaultCustomerLabel: string;
  contactName: string;
  email: string;
  phone: string;
  billingAddress: string;
  status: string;
  notes: string;
  createdAt: string | null;
  updatedAt: string | null;
  cells: SponsorCell[];
};

export type SponsorRegisterResponse = {
  section: {
    id: string;
    label: string;
    description: string;
    searchPlaceholder: string;
    filters: {
      statuses: SponsorFilterOption[];
      contactFilters: SponsorFilterOption[];
      quickFilters: SponsorFilterOption[];
    };
    metrics: SponsorMetric[];
    table: {
      title: string;
      description: string;
      columns: string[];
      rows: SponsorRow[];
    };
  };
  appliedFilters: {
    search: string;
    statuses: string[];
    contactFilter: string;
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
  referenceData?: {
    customers: Array<{ id: string; displayName: string; customerCode: string }>;
  };
};

export type SponsorDetail = {
  id: number | string;
  sponsorCode?: string | null;
  name?: string | null;
  contactName?: string | null;
  email?: string | null;
  phone?: string | null;
  billingAddress?: string | null;
  defaultCustomer?: {
    id: number | string;
    displayName?: string | null;
    customerCode?: string | null;
  } | number | string | null;
  status?: string | null;
  notes?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  usageSummary?: {
    scholarshipAwardCount: number;
  };
};

export type CreateSponsorInput = {
  sponsorCode: string;
  name: string;
  contactName?: string | null;
  email?: string | null;
  phone?: string | null;
  billingAddress?: string | null;
  defaultCustomer?: number | string | null;
  status: string;
  notes?: string | null;
};

export type UpdateSponsorInput = {
  sponsorCode?: string;
  name?: string;
  contactName?: string | null;
  email?: string | null;
  phone?: string | null;
  billingAddress?: string | null;
  defaultCustomer?: number | string | null;
  status?: string;
  notes?: string | null;
};

export type CorporateAccountRow = {
  id: string;
  accountCode: string;
  name: string;
  customerLabel: string;
  billingContact: string;
  creditTerms: string;
  paymentTerms: string;
  creditTermsLabel: string;
  status: string;
  statusLabel: string;
  email: string;
  phone: string;
  notes: string;
  createdAt: string | null;
  updatedAt: string | null;
  cells: SponsorCell[];
};

export type CorporateAccountRegisterResponse = {
  section: {
    id: string;
    label: string;
    description: string;
    searchPlaceholder: string;
    filters: {
      statuses: SponsorFilterOption[];
      creditFilters: SponsorFilterOption[];
      quickFilters: SponsorFilterOption[];
    };
    metrics: SponsorMetric[];
    table: {
      title: string;
      description: string;
      columns: string[];
      rows: CorporateAccountRow[];
    };
  };
  appliedFilters: {
    search: string;
    statuses: string[];
    creditFilter: string;
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
  referenceData?: {
    customers: Array<{ id: string; displayName: string; customerCode: string }>;
  };
};

export type CorporateAccountDetail = {
  id: number | string;
  accountCode?: string | null;
  name?: string | null;
  customer?: {
    id: number | string;
    displayName?: string | null;
    customerCode?: string | null;
  } | number | string | null;
  billingContact?: string | null;
  email?: string | null;
  phone?: string | null;
  creditTerms?: string | null;
  paymentTerms?: string | null;
  negotiatedPricingPolicy?: Record<string, unknown> | null;
  status?: string | null;
  notes?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  usageSummary?: {
    corporateBillingLinkCount: number;
  };
};

export type CreateCorporateAccountInput = {
  accountCode: string;
  name: string;
  customer: number | string;
  billingContact?: string | null;
  email?: string | null;
  phone?: string | null;
  creditTerms?: string | null;
  paymentTerms?: string | null;
  status: string;
  notes?: string | null;
};

export type UpdateCorporateAccountInput = {
  accountCode?: string;
  name?: string;
  customer?: number | string;
  billingContact?: string | null;
  email?: string | null;
  phone?: string | null;
  creditTerms?: string | null;
  paymentTerms?: string | null;
  status?: string;
  notes?: string | null;
};

type SponsorRegisterQuery = {
  search?: string;
  page?: number;
  statuses?: string[];
  contactFilter?: string;
  quickFilters?: string[];
};

type CorporateAccountRegisterQuery = {
  search?: string;
  page?: number;
  limit?: number;
  statuses?: string[];
  creditFilter?: string;
  quickFilters?: string[];
};

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

export async function getSponsorRegister(query: SponsorRegisterQuery = {}): Promise<SponsorRegisterResponse> {
  const params = new URLSearchParams();

  if (query.search?.trim()) {
    params.set('search', query.search.trim());
  }

  for (const status of query.statuses || []) {
    params.append('status', status);
  }

  if (query.contactFilter) {
    params.set('contactFilter', query.contactFilter);
  }

  for (const quickFilter of query.quickFilters || []) {
    params.append('quickFilter', quickFilter);
  }

  params.set('page', String(query.page || 1));
  params.set('limit', '10');

  return fetchAccountingAdmin<SponsorRegisterResponse>(
    `/accounting/scholarship-sponsors?${params.toString()}`,
  );
}

export async function getSponsorDetail(sponsorId: number | string): Promise<SponsorDetail> {
  return fetchAccountingAdmin<SponsorDetail>(`/accounting/scholarship-sponsors/${sponsorId}`);
}

export async function createSponsor(input: CreateSponsorInput): Promise<SponsorDetail> {
  const payload: CreateSponsorInput = {
    ...input,
    sponsorCode: input.sponsorCode.trim().toUpperCase(),
    name: input.name.trim(),
    contactName: typeof input.contactName === 'string' ? input.contactName.trim() || null : input.contactName,
    email: typeof input.email === 'string' ? input.email.trim() || null : input.email,
    phone: typeof input.phone === 'string' ? input.phone.trim() || null : input.phone,
    billingAddress: typeof input.billingAddress === 'string' ? input.billingAddress.trim() || null : input.billingAddress,
    notes: typeof input.notes === 'string' ? input.notes.trim() || null : input.notes,
  };

  return fetchAccountingAdmin<SponsorDetail>(`/accounting/scholarship-sponsors`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateSponsor(
  sponsorId: number | string,
  input: UpdateSponsorInput,
): Promise<SponsorDetail> {
  const payload: UpdateSponsorInput = {
    ...input,
    sponsorCode: typeof input.sponsorCode === 'string' ? input.sponsorCode.trim().toUpperCase() : input.sponsorCode,
    name: typeof input.name === 'string' ? input.name.trim() : input.name,
    contactName: typeof input.contactName === 'string' ? input.contactName.trim() || null : input.contactName,
    email: typeof input.email === 'string' ? input.email.trim() || null : input.email,
    phone: typeof input.phone === 'string' ? input.phone.trim() || null : input.phone,
    billingAddress: typeof input.billingAddress === 'string' ? input.billingAddress.trim() || null : input.billingAddress,
    notes: typeof input.notes === 'string' ? input.notes.trim() || null : input.notes,
  };

  return fetchAccountingAdmin<SponsorDetail>(`/accounting/scholarship-sponsors/${sponsorId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function deleteSponsor(
  sponsorId: number | string,
): Promise<{ success: boolean }> {
  return fetchAccountingAdmin<{ success: boolean }>(`/accounting/scholarship-sponsors/${sponsorId}`, {
    method: 'DELETE',
  });
}

export async function getCorporateAccountRegister(
  query: CorporateAccountRegisterQuery = {},
): Promise<CorporateAccountRegisterResponse> {
  const params = new URLSearchParams();

  if (query.search?.trim()) {
    params.set('search', query.search.trim());
  }

  for (const status of query.statuses || []) {
    params.append('status', status);
  }

  if (query.creditFilter) {
    params.set('creditFilter', query.creditFilter);
  }

  for (const quickFilter of query.quickFilters || []) {
    params.append('quickFilter', quickFilter);
  }

  params.set('page', String(query.page || 1));
  params.set('limit', String(query.limit || 10));

  return fetchAccountingAdmin<CorporateAccountRegisterResponse>(
    `/accounting/corporate-accounts?${params.toString()}`,
  );
}

export async function getCorporateAccountDetail(
  accountId: number | string,
): Promise<CorporateAccountDetail> {
  return fetchAccountingAdmin<CorporateAccountDetail>(`/accounting/corporate-accounts/${accountId}`);
}

export async function createCorporateAccount(
  input: CreateCorporateAccountInput,
): Promise<CorporateAccountDetail> {
  const payload: CreateCorporateAccountInput = {
    ...input,
    accountCode: input.accountCode.trim().toUpperCase(),
    name: input.name.trim(),
    billingContact: typeof input.billingContact === 'string' ? input.billingContact.trim() || null : input.billingContact,
    email: typeof input.email === 'string' ? input.email.trim() || null : input.email,
    phone: typeof input.phone === 'string' ? input.phone.trim() || null : input.phone,
    creditTerms: typeof input.creditTerms === 'string' ? input.creditTerms.trim() || null : input.creditTerms,
    paymentTerms: typeof input.paymentTerms === 'string' ? input.paymentTerms.trim() || null : input.paymentTerms,
    notes: typeof input.notes === 'string' ? input.notes.trim() || null : input.notes,
  };

  return fetchAccountingAdmin<CorporateAccountDetail>(`/accounting/corporate-accounts`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateCorporateAccount(
  accountId: number | string,
  input: UpdateCorporateAccountInput,
): Promise<CorporateAccountDetail> {
  const payload: UpdateCorporateAccountInput = {
    ...input,
    accountCode: typeof input.accountCode === 'string' ? input.accountCode.trim().toUpperCase() : input.accountCode,
    name: typeof input.name === 'string' ? input.name.trim() : input.name,
    billingContact: typeof input.billingContact === 'string' ? input.billingContact.trim() || null : input.billingContact,
    email: typeof input.email === 'string' ? input.email.trim() || null : input.email,
    phone: typeof input.phone === 'string' ? input.phone.trim() || null : input.phone,
    creditTerms: typeof input.creditTerms === 'string' ? input.creditTerms.trim() || null : input.creditTerms,
    paymentTerms: typeof input.paymentTerms === 'string' ? input.paymentTerms.trim() || null : input.paymentTerms,
    notes: typeof input.notes === 'string' ? input.notes.trim() || null : input.notes,
  };

  return fetchAccountingAdmin<CorporateAccountDetail>(`/accounting/corporate-accounts/${accountId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function deleteCorporateAccount(
  accountId: number | string,
): Promise<{ success: boolean }> {
  return fetchAccountingAdmin<{ success: boolean }>(`/accounting/corporate-accounts/${accountId}`, {
    method: 'DELETE',
  });
}

export type CoverageLinkRow = {
  id: string;
  linkType: string;
  entity: string;
  coverageType: string;
  coveredAmount: number;
  traineeShareAmount: number;
  status: string;
  cells: SponsorCell[];
};

export type CoverageLinkRegisterResponse = {
  section: {
    id: string;
    label: string;
    description: string;
    searchPlaceholder: string;
    filters: {
      quickFilters: SponsorFilterOption[];
    };
    metrics: SponsorMetric[];
    table: {
      title: string;
      description: string;
      columns: string[];
      rows: CoverageLinkRow[];
    };
  };
  appliedFilters: {
    search: string;
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
    totalRows: number;
    filteredRows: number;
  };
};

type CoverageLinkRegisterQuery = {
  search?: string;
  page?: number;
  limit?: number;
  statuses?: string[];
  quickFilters?: string[];
};

export async function getCoverageLinkRegister(
  query: CoverageLinkRegisterQuery = {},
): Promise<CoverageLinkRegisterResponse> {
  const params = new URLSearchParams();
  if (query.search?.trim()) {
    params.set('search', query.search.trim());
  }
  for (const status of query.statuses || []) {
    params.append('status', status);
  }
  for (const quickFilter of query.quickFilters || []) {
    params.append('quickFilter', quickFilter);
  }
  params.set('page', String(query.page || 1));
  params.set('limit', String(query.limit || 10));
  return fetchAccountingAdmin<CoverageLinkRegisterResponse>(
    `/accounting/coverage-links?${params.toString()}`,
  );
}

export type CustomerChoice = {
  value: number | string;
  label: string;
};

export async function getCustomerChoices(search?: string): Promise<CustomerChoice[]> {
  const params = search ? `?search=${encodeURIComponent(search)}` : '';
  const res = await fetchAccountingAdmin<{ choices: CustomerChoice[] }>(`/accounting/customer-choices${params}`);
  return res.choices;
}

export type ScholarshipAwardRegisterRow = {
  id: number | string;
  awardType: string | null;
  sponsorName: string;
  traineeName: string;
  awardAmount: number;
  awardPercent: number | null;
  traineeShareAmount: number;
  effectiveDate: string | null;
  status: string | null;
  statusLabel: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  cells: Array<string | number>;
};

export type ScholarshipAwardRegisterResponse = {
  section: {
    id: string;
    label: string;
    description: string;
    searchPlaceholder: string;
    filters: SponsorFilterOption[];
    metrics: SponsorMetric[];
    table: {
      title: string;
      description: string;
      columns: string[];
      rows: ScholarshipAwardRegisterRow[];
    };
  };
  pagination: {
    page: number;
    limit: number;
    totalDocs: number;
    totalPages: number;
    hasPrevPage: boolean;
    hasNextPage: boolean;
  };
  totals?: {
    totalAwards: number;
    filteredAwards: number;
  };
};

export type ScholarshipAwardDetail = Record<string, unknown>;

export type CreateScholarshipAwardInput = {
  enrollmentBillingLink: number | string;
  scholarshipSponsor: number | string;
  trainee: number | string;
  awardType: string;
  awardAmount?: number | null;
  awardPercent?: number | null;
  traineeShareAmount?: number | null;
  effectiveDate: string;
  status: string;
  notes?: string | null;
};

export type UpdateScholarshipAwardInput = Partial<CreateScholarshipAwardInput>;

export async function getScholarshipAwardRegister(params?: {
  search?: string;
  page?: number;
  limit?: number;
  statuses?: string[];
}): Promise<ScholarshipAwardRegisterResponse> {
  const searchParams = new URLSearchParams();
  if (params?.search) searchParams.set('search', params.search);
  if (params?.page) searchParams.set('page', String(params.page));
  if (params?.limit) searchParams.set('limit', String(params.limit));
  if (params?.statuses?.length) searchParams.set('status', params.statuses.join(','));
  const qs = searchParams.toString();
  return fetchAccountingAdmin<ScholarshipAwardRegisterResponse>(`/accounting/scholarship-awards${qs ? `?${qs}` : ''}`);
}

export async function getScholarshipAwardDetail(awardId: number | string): Promise<ScholarshipAwardDetail> {
  return fetchAccountingAdmin<ScholarshipAwardDetail>(`/accounting/scholarship-awards/${awardId}`);
}

export async function createScholarshipAward(input: CreateScholarshipAwardInput): Promise<ScholarshipAwardDetail> {
  return fetchAccountingAdmin<ScholarshipAwardDetail>(`/accounting/scholarship-awards`, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function updateScholarshipAward(
  awardId: number | string,
  input: UpdateScholarshipAwardInput,
): Promise<ScholarshipAwardDetail> {
  return fetchAccountingAdmin<ScholarshipAwardDetail>(`/accounting/scholarship-awards/${awardId}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

export async function deleteScholarshipAward(awardId: number | string): Promise<{ success: boolean }> {
  return fetchAccountingAdmin<{ success: boolean }>(`/accounting/scholarship-awards/${awardId}`, {
    method: 'DELETE',
  });
}

export type CorporateBillingLinkRegisterRow = {
  id: number | string;
  coverageType: string | null;
  accountName: string;
  coveredAmount: number;
  traineeShareAmount: number;
  status: string | null;
  statusLabel: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  cells: Array<string | number>;
};

export type CorporateBillingLinkRegisterResponse = {
  section: {
    id: string;
    label: string;
    description: string;
    searchPlaceholder: string;
    filters: SponsorFilterOption[];
    metrics: SponsorMetric[];
    table: {
      title: string;
      description: string;
      columns: string[];
      rows: CorporateBillingLinkRegisterRow[];
    };
  };
  pagination: {
    page: number;
    limit: number;
    totalDocs: number;
    totalPages: number;
    hasPrevPage: boolean;
    hasNextPage: boolean;
  };
  totals?: {
    totalLinks: number;
    filteredLinks: number;
  };
};

export type CorporateBillingLinkDetail = Record<string, unknown>;

export type CreateCorporateBillingLinkInput = {
  corporateAccount: number | string;
  enrollmentBillingLink: number | string;
  invoice?: number | string | null;
  coverageType: string;
  coveredAmount?: number | null;
  traineeShareAmount?: number | null;
  status: string;
  notes?: string | null;
};

export type UpdateCorporateBillingLinkInput = Partial<CreateCorporateBillingLinkInput>;

export async function getCorporateBillingLinkRegister(params?: {
  search?: string;
  page?: number;
  limit?: number;
  statuses?: string[];
}): Promise<CorporateBillingLinkRegisterResponse> {
  const searchParams = new URLSearchParams();
  if (params?.search) searchParams.set('search', params.search);
  if (params?.page) searchParams.set('page', String(params.page));
  if (params?.limit) searchParams.set('limit', String(params.limit));
  if (params?.statuses?.length) searchParams.set('status', params.statuses.join(','));
  const qs = searchParams.toString();
  return fetchAccountingAdmin<CorporateBillingLinkRegisterResponse>(`/accounting/corporate-billing-links${qs ? `?${qs}` : ''}`);
}

export async function getCorporateBillingLinkDetail(linkId: number | string): Promise<CorporateBillingLinkDetail> {
  return fetchAccountingAdmin<CorporateBillingLinkDetail>(`/accounting/corporate-billing-links/${linkId}`);
}

export async function createCorporateBillingLink(input: CreateCorporateBillingLinkInput): Promise<CorporateBillingLinkDetail> {
  return fetchAccountingAdmin<CorporateBillingLinkDetail>(`/accounting/corporate-billing-links`, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function updateCorporateBillingLink(
  linkId: number | string,
  input: UpdateCorporateBillingLinkInput,
): Promise<CorporateBillingLinkDetail> {
  return fetchAccountingAdmin<CorporateBillingLinkDetail>(`/accounting/corporate-billing-links/${linkId}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

export async function deleteCorporateBillingLink(linkId: number | string): Promise<{ success: boolean }> {
  return fetchAccountingAdmin<{ success: boolean }>(`/accounting/corporate-billing-links/${linkId}`, {
    method: 'DELETE',
  });
}

export async function getEnrollmentBillingLinkChoices(search?: string): Promise<CustomerChoice[]> {
  const params = search ? `?search=${encodeURIComponent(search)}` : '';
  const res = await fetchAccountingAdmin<{ choices: CustomerChoice[] }>(`/accounting/enrollment-billing-link-choices${params}`);
  return res.choices;
}

export async function getTraineeChoices(search?: string): Promise<CustomerChoice[]> {
  const params = search ? `?search=${encodeURIComponent(search)}` : '';
  const res = await fetchAccountingAdmin<{ choices: CustomerChoice[] }>(`/accounting/trainee-choices${params}`);
  return res.choices;
}
