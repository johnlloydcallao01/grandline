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

export type Tone = 'amber' | 'blue' | 'gray' | 'green' | 'red';

export type FilterOption = { label: string; value: string };

export type Cell =
  | string
  | { text: string; tone?: Tone; emphasis?: boolean; align?: 'left' | 'right' | 'center' };

export type Metric = {
  id: string; label: string; value: number | string; change: string; trend: 'up' | 'down' | 'neutral';
};

// === Billing Adjustments ===

export type BillingAdjustmentRow = {
  id: string;
  enrollmentBillingLinkLabel: string;
  adjustmentType: string;
  adjustmentTypeLabel: string;
  reason: string;
  amount: number;
  amountLabel: string;
  direction: string;
  directionLabel: string;
  directionTone: Tone;
  approvedByLabel: string;
  appliedAt: string;
  appliedAtLabel: string;
  searchableText: string;
  cells: Cell[];
};

export type BillingAdjustmentsResponse = {
  section: {
    id: string; label: string; description: string; searchPlaceholder: string;
    filters: { adjustmentTypes: FilterOption[]; directions: FilterOption[]; quickFilters: FilterOption[] };
    metrics: Metric[];
    table: { title: string; description: string; columns: string[]; rows: BillingAdjustmentRow[] };
  };
  pagination: { page: number; limit: number; totalDocs: number; totalPages: number; hasPrevPage: boolean; hasNextPage: boolean };
  totals: { totalRows: number; filteredRows: number };
  referenceData: {
    enrollmentBillingLinks: Array<{ id: string | number; sourceReference: string | null; finalChargeSnapshot: number | null }>;
  };
};

export type BillingAdjustmentDetail = {
  id: string;
  enrollmentBillingLinkId: string;
  enrollmentBillingLinkLabel: string;
  adjustmentType: string;
  adjustmentTypeLabel: string;
  reason: string;
  amount: number;
  amountLabel: string;
  direction: string;
  directionLabel: string;
  approvedById: string;
  approvedByLabel: string;
  appliedAt: string | null;
  appliedAtLabel: string;
  notes: string;
  createdAt: string | null;
  updatedAt: string | null;
};

export type BillingAdjustmentMutationInput = {
  enrollmentBillingLink?: number | null;
  adjustmentType?: string;
  reason?: string | null;
  amount?: number;
  direction?: string;
  approvedBy?: number | null;
  appliedAt?: string | null;
  notes?: string | null;
};

export async function getBillingAdjustments(
  query: { search?: string; page?: number; adjustmentTypes?: string[]; directions?: string[]; quickFilters?: string[] } = {},
): Promise<BillingAdjustmentsResponse> {
  const params = new URLSearchParams();
  if (query.search?.trim()) params.set('search', query.search.trim());
  for (const v of query.adjustmentTypes || []) params.append('adjustmentType', v);
  for (const v of query.directions || []) params.append('direction', v);
  for (const v of query.quickFilters || []) params.append('quickFilter', v);
  params.set('page', String(query.page || 1));
  params.set('limit', '10');

  return fetchAccountingAdmin<BillingAdjustmentsResponse>(`/accounting/billing-adjustments?${params.toString()}`);
}

export async function getBillingAdjustmentDetail(id: string | number): Promise<BillingAdjustmentDetail> {
  return fetchAccountingAdmin<BillingAdjustmentDetail>(`/accounting/billing-adjustments/${id}`);
}

export async function createBillingAdjustment(input: BillingAdjustmentMutationInput): Promise<BillingAdjustmentDetail> {
  const created = await fetchAccountingAdmin<{ id: string | number }>('/accounting/billing-adjustments', {
    method: 'POST',
    body: JSON.stringify(input),
  });
  return getBillingAdjustmentDetail(created.id);
}

export async function updateBillingAdjustment(id: string | number, input: BillingAdjustmentMutationInput): Promise<BillingAdjustmentDetail> {
  return fetchAccountingAdmin<BillingAdjustmentDetail>(`/accounting/billing-adjustments/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

export async function deleteBillingAdjustment(id: string | number): Promise<{ success: boolean }> {
  return fetchAccountingAdmin<{ success: boolean }>(`/accounting/billing-adjustments/${id}`, { method: 'DELETE' });
}

// === Certificate Charges (filtered billing-adjustments) ===

export type CertificateChargeRow = BillingAdjustmentRow;
export type CertificateChargesResponse = BillingAdjustmentsResponse & {
  section: BillingAdjustmentsResponse['section'] & { id: string; label: string };
};

export async function getCertificateCharges(
  query: { search?: string; page?: number; adjustmentTypes?: string[]; directions?: string[]; quickFilters?: string[] } = {},
): Promise<CertificateChargesResponse> {
  const params = new URLSearchParams();
  if (query.search?.trim()) params.set('search', query.search.trim());
  params.set('adjustmentType', 'certificate_fee');
  for (const v of query.adjustmentTypes || []) params.append('adjustmentType', v);
  for (const v of query.directions || []) params.append('direction', v);
  for (const v of query.quickFilters || []) params.append('quickFilter', v);
  params.set('page', String(query.page || 1));
  params.set('limit', '10');

  return fetchAccountingAdmin<CertificateChargesResponse>(`/accounting/billing-adjustments?${params.toString()}`);
}

// === Refunds ===

export type RefundRow = {
  id: string;
  refundNumber: string;
  enrollmentBillingLinkLabel: string;
  invoiceLabel: string;
  approvedAmount: number;
  approvedAmountLabel: string;
  creditNoteLabel: string;
  status: string;
  statusLabel: string;
  statusTone: Tone;
  searchableText: string;
  cells: Cell[];
};

export type RefundsResponse = {
  section: {
    id: string; label: string; description: string; searchPlaceholder: string;
    filters: { statuses: FilterOption[]; refundTypes: FilterOption[]; quickFilters: FilterOption[] };
    metrics: Metric[];
    table: { title: string; description: string; columns: string[]; rows: RefundRow[] };
  };
  pagination: { page: number; limit: number; totalDocs: number; totalPages: number; hasPrevPage: boolean; hasNextPage: boolean };
  totals: { totalRows: number; filteredRows: number };
  referenceData: {
    invoices: Array<{ id: string | number; invoiceNumber: string | null; status: string; total: number; balanceDue: number }>;
    enrollmentBillingLinks: Array<{ id: string | number; sourceReference: string | null; finalChargeSnapshot: number | null }>;
  };
};

export type RefundDetail = {
  id: string;
  refundNumber: string;
  enrollmentBillingLinkId: string;
  enrollmentBillingLinkLabel: string;
  invoiceId: string;
  invoiceLabel: string;
  paymentReceivedId: string;
  creditNoteId: string;
  creditNoteLabel: string | null;
  refundDate: string | null;
  refundDateLabel: string;
  refundReason: string;
  refundType: string;
  refundTypeLabel: string;
  requestedAmount: number;
  requestedAmountLabel: string;
  approvedAmount: number | null;
  approvedAmountLabel: string;
  currency: string;
  status: string;
  statusLabel: string;
  notes: string;
  createdAt: string | null;
  updatedAt: string | null;
};

export type RefundMutationInput = {
  enrollmentBillingLink?: number | null;
  invoice?: number | null;
  paymentReceived?: number | null;
  refundDate?: string | null;
  refundReason?: string | null;
  refundType?: string;
  requestedAmount?: number;
  approvedAmount?: number | null;
  currency?: string;
  status?: string;
  notes?: string | null;
};

export async function getRefunds(
  query: { search?: string; page?: number; statuses?: string[]; refundTypes?: string[]; quickFilters?: string[] } = {},
): Promise<RefundsResponse> {
  const params = new URLSearchParams();
  if (query.search?.trim()) params.set('search', query.search.trim());
  for (const v of query.statuses || []) params.append('status', v);
  for (const v of query.refundTypes || []) params.append('refundType', v);
  for (const v of query.quickFilters || []) params.append('quickFilter', v);
  params.set('page', String(query.page || 1));
  params.set('limit', '10');

  return fetchAccountingAdmin<RefundsResponse>(`/accounting/refunds?${params.toString()}`);
}

export async function getRefundDetail(id: string | number): Promise<RefundDetail> {
  return fetchAccountingAdmin<RefundDetail>(`/accounting/refunds/${id}`);
}

export async function createRefund(input: RefundMutationInput): Promise<RefundDetail> {
  const created = await fetchAccountingAdmin<{ id: string | number }>('/accounting/refunds', {
    method: 'POST',
    body: JSON.stringify(input),
  });
  return getRefundDetail(created.id);
}

export async function updateRefund(id: string | number, input: RefundMutationInput): Promise<RefundDetail> {
  return fetchAccountingAdmin<RefundDetail>(`/accounting/refunds/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

export async function deleteRefund(id: string | number): Promise<{ success: boolean }> {
  return fetchAccountingAdmin<{ success: boolean }>(`/accounting/refunds/${id}`, { method: 'DELETE' });
}

// === Deferred Revenue Schedules (reuses existing CMS API) ===

export type RevenueScheduleRow = {
  id: string;
  invoiceNumber: string;
  enrollmentBillingLinkLabel: string;
  recognitionMethod: string;
  recognitionMethodLabel: string;
  startDateLabel: string;
  endDateLabel: string;
  totalDeferredLabel: string;
  recognizedLabel: string;
  remainingDeferredLabel: string;
  status: string;
  statusLabel: string;
  statusTone: Tone;
  searchableText: string;
  cells: Cell[];
};

export type RevenueSchedulesResponse = {
  section: {
    id: string; label: string; description: string; searchPlaceholder: string;
    filters: { statuses: FilterOption[]; recognitionMethods: FilterOption[]; quickFilters: FilterOption[] };
    metrics: Metric[];
    table: { title: string; description: string; columns: string[]; rows: RevenueScheduleRow[] };
  };
  pagination: { page: number; limit: number; totalDocs: number; totalPages: number; hasPrevPage: boolean; hasNextPage: boolean };
  totals: { totalRows: number; filteredRows: number };
  referenceData: {
    invoices: Array<{ id: string | number; invoiceNumber: string | null; status: string; total: number; balanceDue: number }>;
    enrollmentBillingLinks: Array<{ id: string | number; sourceReference: string | null; finalChargeSnapshot: number | null }>;
  };
};

export type RevenueScheduleDetail = {
  id: string;
  invoiceId: string;
  invoiceNumber: string;
  enrollmentBillingLinkId: string;
  enrollmentBillingLinkLabel: string;
  recognitionMethod: string;
  recognitionMethodLabel: string;
  startDate: string | null;
  startDateLabel: string;
  endDate: string | null;
  endDateLabel: string;
  totalDeferredAmount: number;
  totalDeferredLabel: string;
  recognizedAmount: number;
  recognizedLabel: string;
  remainingDeferredAmount: number;
  remainingDeferredLabel: string;
  status: string;
  statusLabel: string;
  lastRecognitionAt: string | null;
  lastRecognitionAtLabel: string;
  notes: string;
  createdAt: string | null;
  updatedAt: string | null;
};

export type RevenueScheduleMutationInput = {
  invoice?: number | null;
  enrollmentBillingLink?: number | null;
  recognitionMethod?: string;
  startDate?: string | null;
  endDate?: string | null;
  totalDeferredAmount?: number;
  recognizedAmount?: number;
  remainingDeferredAmount?: number;
  status?: string;
  notes?: string | null;
};

export async function getRevenueSchedules(
  query: { search?: string; page?: number; statuses?: string[]; recognitionMethods?: string[]; quickFilters?: string[] } = {},
): Promise<RevenueSchedulesResponse> {
  const params = new URLSearchParams();
  if (query.search?.trim()) params.set('search', query.search.trim());
  for (const v of query.statuses || []) params.append('status', v);
  for (const v of query.recognitionMethods || []) params.append('recognitionMethod', v);
  for (const v of query.quickFilters || []) params.append('quickFilter', v);
  params.set('page', String(query.page || 1));
  params.set('limit', '10');

  return fetchAccountingAdmin<RevenueSchedulesResponse>(`/accounting/revenue-recognition-schedules?${params.toString()}`);
}

export async function getRevenueScheduleDetail(id: string | number): Promise<RevenueScheduleDetail> {
  return fetchAccountingAdmin<RevenueScheduleDetail>(`/accounting/revenue-recognition-schedules/${id}`);
}

export async function createRevenueSchedule(input: RevenueScheduleMutationInput): Promise<RevenueScheduleDetail> {
  const created = await fetchAccountingAdmin<{ id: string | number }>('/accounting/revenue-recognition-schedules', {
    method: 'POST',
    body: JSON.stringify(input),
  });
  return getRevenueScheduleDetail(created.id);
}

export async function updateRevenueSchedule(id: string | number, input: RevenueScheduleMutationInput): Promise<RevenueScheduleDetail> {
  return fetchAccountingAdmin<RevenueScheduleDetail>(`/accounting/revenue-recognition-schedules/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

export async function deleteRevenueSchedule(id: string | number): Promise<{ success: boolean }> {
  return fetchAccountingAdmin<{ success: boolean }>(`/accounting/revenue-recognition-schedules/${id}`, { method: 'DELETE' });
}

// === Reference Data ===

type EnrBillingLinkRow = { id: string; sourceReference: string };

export type FormReferenceData = {
  billingLinks: Array<{ id: string; label: string }>;
  invoices: Array<{ id: string | number; invoiceNumber: string | null; status: string; total: number; balanceDue: number }>;
};

export async function getFormReferenceData(): Promise<FormReferenceData> {
  const billingRes = await fetchAccountingAdmin<{ section: { table: { rows: EnrBillingLinkRow[] } } }>('/accounting/enrollment-billing-links?limit=10000');
  const refundRes = await fetchAccountingAdmin<RefundsResponse>('/accounting/refunds?limit=1');

  return {
    billingLinks: (billingRes.section?.table?.rows || []).map((r) => ({
      id: r.id,
      label: r.sourceReference || `Link #${r.id}`,
    })),
    invoices: refundRes.referenceData?.invoices || [],
  };
}
