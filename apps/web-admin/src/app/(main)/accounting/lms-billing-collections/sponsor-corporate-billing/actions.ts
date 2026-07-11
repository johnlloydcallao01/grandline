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
        : 'Failed to load data.';
    throw new Error(errorMessage);
  }

  return payload as T;
}

function formatDate(value: string | null | undefined): string {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return new Intl.DateTimeFormat('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(date);
}

function titleCase(value: string | null | undefined): string {
  return String(value || '')
    .split('_')
    .join(' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function relLabel(val: unknown, ...labelFields: string[]): string {
  if (!val || typeof val !== 'object') return '-';
  const obj = val as Record<string, unknown>;
  for (const field of labelFields) {
    const v = obj[field];
    if (v && typeof v === 'string') return v;
  }
  return String(obj.id || '-');
}

export type Tone = 'amber' | 'blue' | 'gray' | 'green' | 'red';

export type FilterOption = { label: string; value: string };

export type Cell =
  | string
  | { text: string; tone?: Tone; emphasis?: boolean; align?: 'left' | 'right' | 'center' };

export type Metric = {
  id: string; label: string; value: number | string; change: string; trend: 'up' | 'down' | 'neutral';
};

// === Scholarship Awards ===

export type ScholarshipAwardRow = {
  id: string;
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
  cells: Cell[];
};

export type ScholarshipAwardsResponse = {
  section: {
    id: string; label: string; description: string; searchPlaceholder: string;
    filters: FilterOption[];
    metrics: Metric[];
    table: { title: string; description: string; columns: string[]; rows: ScholarshipAwardRow[] };
  };
  pagination: { page: number; limit: number; totalDocs: number; totalPages: number; hasPrevPage: boolean; hasNextPage: boolean };
  totals: { totalAwards: number; filteredAwards: number };
};

export type ScholarshipAwardDetail = {
  id: string;
  enrollmentBillingLinkId: string;
  enrollmentBillingLinkLabel: string;
  scholarshipSponsorId: string;
  scholarshipSponsorLabel: string;
  traineeId: string;
  traineeLabel: string;
  awardType: string;
  awardAmount: number;
  awardPercent: number | null;
  traineeShareAmount: number;
  effectiveDate: string | null;
  effectiveDateLabel: string;
  status: string;
  statusLabel: string;
  notes: string;
  createdAt: string | null;
  updatedAt: string | null;
};

export type ScholarshipAwardMutationInput = {
  enrollmentBillingLink?: number | null;
  scholarshipSponsor?: number | null;
  trainee?: number | null;
  awardType?: string;
  awardAmount?: number;
  awardPercent?: number | null;
  traineeShareAmount?: number;
  effectiveDate?: string | null;
  status?: string;
  notes?: string | null;
};

export async function getScholarshipAwards(
  query: { search?: string; page?: number; statuses?: string[] } = {},
): Promise<ScholarshipAwardsResponse> {
  const params = new URLSearchParams();
  if (query.search?.trim()) params.set('search', query.search.trim());
  for (const v of query.statuses || []) params.append('status', v);
  params.set('page', String(query.page || 1));
  params.set('limit', '10');

  return fetchAccountingAdmin<ScholarshipAwardsResponse>(`/accounting/scholarship-awards?${params.toString()}`);
}

export async function getScholarshipAwardDetail(id: string | number): Promise<ScholarshipAwardDetail> {
  const doc = await fetchAccountingAdmin<Record<string, unknown>>(`/accounting/scholarship-awards/${id}`);

  const enrollmentBillingLink = doc.enrollmentBillingLink as Record<string, unknown> | undefined;
  const scholarshipSponsor = doc.scholarshipSponsor as Record<string, unknown> | undefined;
  const trainee = doc.trainee as Record<string, unknown> | undefined;
  const traineeUser = trainee?.user as Record<string, unknown> | undefined;

  return {
    id: String(doc.id),
    enrollmentBillingLinkId: String(enrollmentBillingLink?.id ?? doc.enrollmentBillingLink ?? ''),
    enrollmentBillingLinkLabel: relLabel(enrollmentBillingLink, 'sourceReference'),
    scholarshipSponsorId: String(scholarshipSponsor?.id ?? doc.scholarshipSponsor ?? ''),
    scholarshipSponsorLabel: relLabel(scholarshipSponsor, 'name', 'sponsorCode'),
    traineeId: String(trainee?.id ?? doc.trainee ?? ''),
    traineeLabel: relLabel(traineeUser, 'email', 'name') !== '-' ? relLabel(traineeUser, 'email', 'name') : `Trainee #${trainee?.id ?? doc.trainee}`,
    awardType: String(doc.awardType || ''),
    awardAmount: Number(doc.awardAmount || 0),
    awardPercent: doc.awardPercent != null ? Number(doc.awardPercent) : null,
    traineeShareAmount: Number(doc.traineeShareAmount || 0),
    effectiveDate: doc.effectiveDate ? String(doc.effectiveDate) : null,
    effectiveDateLabel: formatDate(doc.effectiveDate ? String(doc.effectiveDate) : null),
    status: String(doc.status || ''),
    statusLabel: titleCase(doc.status ? String(doc.status) : ''),
    notes: doc.notes ? String(doc.notes) : '',
    createdAt: doc.createdAt ? String(doc.createdAt) : null,
    updatedAt: doc.updatedAt ? String(doc.updatedAt) : null,
  };
}

export async function createScholarshipAward(input: ScholarshipAwardMutationInput): Promise<ScholarshipAwardDetail> {
  const created = await fetchAccountingAdmin<{ id: string | number }>('/accounting/scholarship-awards', {
    method: 'POST',
    body: JSON.stringify(input),
  });
  return getScholarshipAwardDetail(created.id);
}

export async function updateScholarshipAward(id: string | number, input: ScholarshipAwardMutationInput): Promise<ScholarshipAwardDetail> {
  const doc = await fetchAccountingAdmin<{ id: string | number }>(`/accounting/scholarship-awards/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
  return getScholarshipAwardDetail(doc.id);
}

export async function deleteScholarshipAward(id: string | number): Promise<{ success: boolean }> {
  return fetchAccountingAdmin<{ success: boolean }>(`/accounting/scholarship-awards/${id}`, { method: 'DELETE' });
}

// === Corporate Billing Links ===

export type CorporateBillingLinkRow = {
  id: string;
  coverageType: string | null;
  accountName: string;
  coveredAmount: number;
  traineeShareAmount: number;
  status: string | null;
  statusLabel: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  cells: Cell[];
};

export type CorporateBillingLinksResponse = {
  section: {
    id: string; label: string; description: string; searchPlaceholder: string;
    filters: FilterOption[];
    metrics: Metric[];
    table: { title: string; description: string; columns: string[]; rows: CorporateBillingLinkRow[] };
  };
  pagination: { page: number; limit: number; totalDocs: number; totalPages: number; hasPrevPage: boolean; hasNextPage: boolean };
  totals: { totalLinks: number; filteredLinks: number };
};

export type CorporateBillingLinkDetail = {
  id: string;
  corporateAccountId: string;
  corporateAccountLabel: string;
  enrollmentBillingLinkId: string;
  enrollmentBillingLinkLabel: string;
  invoiceId: string;
  invoiceLabel: string;
  coverageType: string;
  coverageTypeLabel: string;
  coveredAmount: number;
  traineeShareAmount: number;
  effectiveDate: string | null;
  effectiveDateLabel: string;
  status: string;
  statusLabel: string;
  notes: string;
  createdAt: string | null;
  updatedAt: string | null;
};

export type CorporateBillingLinkMutationInput = {
  corporateAccount?: number | null;
  enrollmentBillingLink?: number | null;
  invoice?: number | null;
  coverageType?: string;
  coveredAmount?: number;
  traineeShareAmount?: number;
  effectiveDate?: string | null;
  status?: string;
  notes?: string | null;
};

export async function getCorporateBillingLinks(
  query: { search?: string; page?: number; statuses?: string[] } = {},
): Promise<CorporateBillingLinksResponse> {
  const params = new URLSearchParams();
  if (query.search?.trim()) params.set('search', query.search.trim());
  for (const v of query.statuses || []) params.append('status', v);
  params.set('page', String(query.page || 1));
  params.set('limit', '10');

  return fetchAccountingAdmin<CorporateBillingLinksResponse>(`/accounting/corporate-billing-links?${params.toString()}`);
}

export async function getCorporateBillingLinkDetail(id: string | number): Promise<CorporateBillingLinkDetail> {
  const doc = await fetchAccountingAdmin<Record<string, unknown>>(`/accounting/corporate-billing-links/${id}`);

  const corporateAccount = doc.corporateAccount as Record<string, unknown> | undefined;
  const enrollmentBillingLink = doc.enrollmentBillingLink as Record<string, unknown> | undefined;
  const invoice = doc.invoice as Record<string, unknown> | undefined;

  return {
    id: String(doc.id),
    corporateAccountId: String(corporateAccount?.id ?? doc.corporateAccount ?? ''),
    corporateAccountLabel: relLabel(corporateAccount, 'name', 'accountCode'),
    enrollmentBillingLinkId: String(enrollmentBillingLink?.id ?? doc.enrollmentBillingLink ?? ''),
    enrollmentBillingLinkLabel: relLabel(enrollmentBillingLink, 'sourceReference'),
    invoiceId: String(invoice?.id ?? doc.invoice ?? ''),
    invoiceLabel: relLabel(invoice, 'invoiceNumber', 'label'),
    coverageType: String(doc.coverageType || ''),
    coverageTypeLabel: titleCase(doc.coverageType ? String(doc.coverageType) : ''),
    coveredAmount: Number(doc.coveredAmount || 0),
    traineeShareAmount: Number(doc.traineeShareAmount || 0),
    effectiveDate: doc.effectiveDate ? String(doc.effectiveDate) : null,
    effectiveDateLabel: formatDate(doc.effectiveDate ? String(doc.effectiveDate) : null),
    status: String(doc.status || ''),
    statusLabel: titleCase(doc.status ? String(doc.status) : ''),
    notes: doc.notes ? String(doc.notes) : '',
    createdAt: doc.createdAt ? String(doc.createdAt) : null,
    updatedAt: doc.updatedAt ? String(doc.updatedAt) : null,
  };
}

export async function createCorporateBillingLink(input: CorporateBillingLinkMutationInput): Promise<CorporateBillingLinkDetail> {
  const created = await fetchAccountingAdmin<{ id: string | number }>('/accounting/corporate-billing-links', {
    method: 'POST',
    body: JSON.stringify(input),
  });
  return getCorporateBillingLinkDetail(created.id);
}

export async function updateCorporateBillingLink(id: string | number, input: CorporateBillingLinkMutationInput): Promise<CorporateBillingLinkDetail> {
  const doc = await fetchAccountingAdmin<{ id: string | number }>(`/accounting/corporate-billing-links/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
  return getCorporateBillingLinkDetail(doc.id);
}

export async function deleteCorporateBillingLink(id: string | number): Promise<{ success: boolean }> {
  return fetchAccountingAdmin<{ success: boolean }>(`/accounting/corporate-billing-links/${id}`, { method: 'DELETE' });
}

// === Reference Data for Form Picklists ===

export type FormReferenceData = {
  sponsors: Array<{ id: string; label: string }>;
  corporateAccounts: Array<{ id: string; label: string }>;
  billingLinks: Array<{ id: string; label: string }>;
  trainees: Array<{ id: string; label: string }>;
  invoices: Array<{ id: string; label: string }>;
};

type SponsorRow = { id: string; name: string; sponsorCode: string };
type AccountRow = { id: string; name: string; accountCode: string };
type EnrBillingLinkRow = { id: string; sourceReference: string };
type EnrResp = { section: { table: { rows: EnrBillingLinkRow[] } }; referenceData: { invoices: Array<{ id: string; label: string }> } };

export async function getFormReferenceData(): Promise<FormReferenceData> {
  const [sponsorsRes, accountsRes, billingRes, traineeChoicesRes] = await Promise.all([
    fetchAccountingAdmin<{ rows: SponsorRow[] }>('/accounting/scholarship-sponsors?limit=10000'),
    fetchAccountingAdmin<{ rows: AccountRow[] }>('/accounting/corporate-accounts?limit=10000'),
    fetchAccountingAdmin<EnrResp>('/accounting/enrollment-billing-links?limit=10000'),
    fetchAccountingAdmin<{ choices: Array<{ value: string; label: string }> }>('/accounting/trainee-choices?limit=10000'),
  ]);

  return {
    sponsors: (sponsorsRes.rows || []).map((r) => ({
      id: r.id,
      label: `#${r.sponsorCode} — ${r.name}`,
    })),
    corporateAccounts: (accountsRes.rows || []).map((r) => ({
      id: r.id,
      label: `#${r.accountCode} — ${r.name}`,
    })),
    billingLinks: (billingRes.section?.table?.rows || []).map((r) => ({
      id: r.id,
      label: r.sourceReference || `Link #${r.id}`,
    })),
    trainees: (traineeChoicesRes.choices || []).map((c) => ({
      id: c.value,
      label: c.label,
    })),
    invoices: billingRes.referenceData?.invoices || [],
  };
}
