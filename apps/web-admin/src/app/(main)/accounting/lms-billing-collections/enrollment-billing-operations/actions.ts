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
        : 'Failed to load accounting data.';
    throw new Error(errorMessage);
  }

  return payload as T;
}

export type Tone = 'amber' | 'blue' | 'gray' | 'green' | 'red';

export type FilterOption = { label: string; value: string };

export type Cell =
  | string
  | { text: string; tone?: 'amber' | 'blue' | 'gray' | 'green' | 'red'; emphasis?: boolean; align?: 'left' | 'right' | 'center' };

export type Metric = {
  id: string; label: string; value: number | string; change: string; trend: 'up' | 'down' | 'neutral';
};

// === Billing Link Types ===

export type BillingLinkRow = {
  id: string; sourceReference: string; courseLabel: string; customerLabel: string; invoiceLabel: string;
  billingStatus: string; billingStatusLabel: string; billingStatusTone: Tone;
  finalCharge: number; finalChargeLabel: string; cells: Cell[];
  searchableText?: string;
};

export type BillingLinksResponse = {
  section: {
    id: string; label: string; description: string; searchPlaceholder: string;
    filters: { statuses: FilterOption[]; courses: FilterOption[]; quickFilters: FilterOption[] };
    metrics: Metric[];
    table: { title: string; description: string; columns: Array<string | { label: string; align: string }>; rows: BillingLinkRow[] };
  };
  appliedFilters: { search: string; statuses: string[]; courseIds: string[]; quickFilters: string[] };
  pagination: { page: number; limit: number; totalDocs: number; totalPages: number; hasPrevPage: boolean; hasNextPage: boolean };
  totals: { totalRows: number; filteredRows: number };
  referenceData: {
    statuses: FilterOption[];
    courses?: Array<{ id: number | string; title: string | null }>;
    enrollments?: Array<{ id: string; label: string; courseId: string; traineeId: string }>;
    trainees?: Array<{ id: string; label: string }>;
    invoices?: Array<{ id: string; label: string }>;
    customers?: Array<{ id: string; label: string }>;
  };
};

export type BillingLinkDetail = {
  id: string; enrollmentId: string; courseId: string; traineeId: string; customerId: string; invoiceId: string;
  sourceReference: string; courseLabel: string; traineeLabel: string; userLabel: string;
  customerLabel: string; invoiceLabel: string; billingStatus: string; billingStatusLabel: string;
  listPriceSnapshot: number; salePriceSnapshot: number; couponDiscountSnapshot: number;
  scholarshipDiscountSnapshot: number; corporateCoverageSnapshot: number; adjustmentsNetSnapshot: number;
  finalChargeSnapshot: number; recognizedRevenueSnapshot: number; currency: string;
  linkedAtLabel: string; linkedAt: string | null; notes: string;
};

export type BillingLinkMutationInput = {
  enrollment: string; course: string; trainee: string; sourceReference: string;
  billingStatus: string; user?: string | null; invoice?: string | null; customer?: string | null;
  listPriceSnapshot?: number; salePriceSnapshot?: number; couponDiscountSnapshot?: number;
  scholarshipDiscountSnapshot?: number; corporateCoverageSnapshot?: number; adjustmentsNetSnapshot?: number;
  finalChargeSnapshot?: number; recognizedRevenueSnapshot?: number; currency?: string;
  notes?: string | null;
};

// === Finance Summary Types ===

export type FinanceSummaryRow = {
  id: string; enrollmentLabel: string; salePrice: number; salePriceLabel: string;
  discountsTotal: number; discountsTotalLabel: string; corporateCoverage: number; corporateCoverageLabel: string;
  amountPaid: number; amountPaidLabel: string; balanceDue: number; balanceDueLabel: string;
  billingStatus: string; billingStatusLabel: string; billingStatusTone: Tone; cells: Cell[];
};

export type FinanceSummaryResponse = {
  section: {
    id: string; label: string; description: string; searchPlaceholder: string;
    filters: { statuses: FilterOption[]; quickFilters: FilterOption[] };
    metrics: Metric[];
    table: { title: string; description: string; columns: Array<string | { label: string; align: string }>; rows: FinanceSummaryRow[] };
  };
  appliedFilters: { search: string; statuses: string[]; quickFilters: string[] };
  pagination: { page: number; limit: number; totalDocs: number; totalPages: number; hasPrevPage: boolean; hasNextPage: boolean };
  totals: { totalRows: number; filteredRows: number };
};

// === Payment Allocation Types ===

export type PaymentAllocationRow = {
  id: string; paymentLabel: string; invoiceLabel: string; billingLinkLabel: string;
  allocationDateLabel: string; allocatedAmount: number; allocatedAmountLabel: string;
  allocationType: string; allocationTypeLabel: string; allocationTypeTone: Tone; cells: Cell[];
};

export type PaymentAllocationResponse = {
  section: {
    id: string; label: string; description: string; searchPlaceholder: string;
    filters: { allocationTypes: FilterOption[]; quickFilters: FilterOption[] };
    metrics: Metric[];
    table: { title: string; description: string; columns: Array<string | { label: string; align: string }>; rows: PaymentAllocationRow[] };
  };
  appliedFilters: { search: string; allocationTypes: string[]; quickFilters: string[] };
  pagination: { page: number; limit: number; totalDocs: number; totalPages: number; hasPrevPage: boolean; hasNextPage: boolean };
  totals: { totalRows: number; filteredRows: number };
  referenceData: {
    payments: Array<{ id: string; label: string }>;
    billingLinks: Array<{ id: string; label: string }>;
    invoices: Array<{ id: string; label: string }>;
    allocationTypes: Array<{ label: string; value: string }>;
  };
};

// === Enrollment Billing Links ===

export async function getEnrollmentBillingLinks(
  query: { search?: string; page?: number; statuses?: string[]; courseIds?: string[]; quickFilters?: string[] } = {},
): Promise<BillingLinksResponse> {
  const params = new URLSearchParams();
  if (query.search?.trim()) params.set('search', query.search.trim());
  for (const v of query.statuses || []) params.append('status', v);
  for (const v of query.courseIds || []) params.append('courseId', v);
  for (const v of query.quickFilters || []) params.append('quickFilter', v);
  params.set('page', String(query.page || 1));
  params.set('limit', '10');

  return fetchAccountingAdmin<BillingLinksResponse>(`/accounting/enrollment-billing-links?${params.toString()}`);
}

export async function getEnrollmentBillingLinkDetail(id: string | number): Promise<BillingLinkDetail> {
  return fetchAccountingAdmin<BillingLinkDetail>(`/accounting/enrollment-billing-links/${id}`);
}

export async function createEnrollmentBillingLink(input: BillingLinkMutationInput): Promise<BillingLinkDetail> {
  const created = await fetchAccountingAdmin<{ id: string | number }>('/accounting/enrollment-billing-links', {
    method: 'POST',
    body: JSON.stringify(input),
  });
  return getEnrollmentBillingLinkDetail(created.id);
}

export async function updateEnrollmentBillingLink(id: string | number, input: BillingLinkMutationInput): Promise<BillingLinkDetail> {
  return fetchAccountingAdmin<BillingLinkDetail>(`/accounting/enrollment-billing-links/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

export async function deleteEnrollmentBillingLink(id: string | number): Promise<{ success: boolean }> {
  return fetchAccountingAdmin<{ success: boolean }>(`/accounting/enrollment-billing-links/${id}`, { method: 'DELETE' });
}

export async function syncEnrollmentBillingLink(id: string | number): Promise<BillingLinkDetail> {
  await fetchAccountingAdmin(`/accounting/enrollment-billing-links/${id}/sync`, { method: 'POST' });
  return getEnrollmentBillingLinkDetail(id);
}

// === Enrollment Finance Summary ===

export async function getEnrollmentFinanceSummary(
  query: { search?: string; page?: number; statuses?: string[]; quickFilters?: string[] } = {},
): Promise<FinanceSummaryResponse> {
  const params = new URLSearchParams();
  if (query.search?.trim()) params.set('search', query.search.trim());
  for (const v of query.statuses || []) params.append('status', v);
  for (const v of query.quickFilters || []) params.append('quickFilter', v);
  params.set('page', String(query.page || 1));
  params.set('limit', '10');

  return fetchAccountingAdmin<FinanceSummaryResponse>(`/accounting/enrollment-finance-summary?${params.toString()}`);
}

export async function getEnrollmentFinanceSummaryDetail(id: string | number): Promise<BillingLinkDetail> {
  return getEnrollmentBillingLinkDetail(id);
}

// === Payment Allocations ===

export async function getPaymentAllocations(
  query: { search?: string; page?: number; allocationTypes?: string[]; quickFilters?: string[] } = {},
): Promise<PaymentAllocationResponse> {
  const params = new URLSearchParams();
  if (query.search?.trim()) params.set('search', query.search.trim());
  for (const v of query.allocationTypes || []) params.append('allocationType', v);
  for (const v of query.quickFilters || []) params.append('quickFilter', v);
  params.set('page', String(query.page || 1));
  params.set('limit', '10');

  return fetchAccountingAdmin<PaymentAllocationResponse>(`/accounting/payment-allocations?${params.toString()}`);
}

export type PaymentAllocationDetail = {
  id: string; paymentReceivedId: string; paymentLabel: string;
  invoiceId: string; invoiceLabel: string;
  billingLinkId: string; billingLinkLabel: string;
  allocationDate: string | null; allocationDateLabel: string;
  allocatedAmount: number; allocatedAmountLabel: string;
  allocationType: string; allocationTypeLabel: string;
  notes: string;
  createdByLabel: string; updatedByLabel: string;
  createdAtLabel: string; updatedAtLabel: string;
};

export type PaymentAllocationMutationInput = {
  paymentReceived: string;
  invoice?: string | null;
  enrollmentBillingLink?: string | null;
  allocationDate?: string;
  allocatedAmount: number;
  allocationType?: string;
  notes?: string | null;
};

export async function getPaymentAllocationDetail(id: string | number): Promise<PaymentAllocationDetail> {
  return fetchAccountingAdmin<PaymentAllocationDetail>(`/accounting/payment-allocations/${id}`);
}

export async function createPaymentAllocation(input: PaymentAllocationMutationInput): Promise<PaymentAllocationDetail> {
  const created = await fetchAccountingAdmin<{ id: string | number }>('/accounting/payment-allocations', {
    method: 'POST',
    body: JSON.stringify(input),
  });
  return getPaymentAllocationDetail(created.id);
}

export async function updatePaymentAllocation(id: string | number, input: PaymentAllocationMutationInput): Promise<PaymentAllocationDetail> {
  return fetchAccountingAdmin<PaymentAllocationDetail>(`/accounting/payment-allocations/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

export async function deletePaymentAllocation(id: string | number): Promise<{ success: boolean }> {
  return fetchAccountingAdmin<{ success: boolean }>(`/accounting/payment-allocations/${id}`, { method: 'DELETE' });
}
