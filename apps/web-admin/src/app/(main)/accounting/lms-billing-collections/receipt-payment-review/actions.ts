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
        : 'Failed to load receipt data.';
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

// === Receipt Row ===
export type ReceiptRow = {
  id: string;
  receiptNumber: string;
  paymentReceivedId: string;
  paymentLabel: string;
  paymentReferenceNumber: string;
  customerId: string;
  customerLabel: string;
  receiptDate: string | null;
  receiptDateLabel: string;
  amount: number;
  amountLabel: string;
  currency: string;
  status: string;
  statusLabel: string;
  statusTone: Tone;
  proofDocumentId: string;
  proofDocumentLabel: string;
  issuedByLabel: string;
  cells: Cell[];
};

// === Receipt Register Response ===
export type ReceiptRegisterResponse = {
  rows: ReceiptRow[];
  metrics: Metric[];
  filterOptions: {
    statuses: FilterOption[];
    customers: FilterOption[];
    proofStates: FilterOption[];
    quickFilters: FilterOption[];
  };
  appliedFilters: {
    search: string;
    statuses: string[];
    customerIds: string[];
    proofStates: string[];
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
    payments: Array<{
      id: number | string;
      receiptNumber: string;
      paymentDate: string | null;
      paymentDateLabel: string;
      amountReceived: number;
      amountReceivedLabel: string;
      currency: string;
      customerId: string;
      customerLabel: string;
      referenceNumber: string;
      status: string;
      statusLabel: string;
      linkedOfficialReceiptId: string;
      label: string;
    }>;
    mediaDocuments: Array<{
      id: number | string;
      filename: string;
      url: string;
    }>;
  };
};

// === Receipt Detail ===
export type ReceiptDetail = {
  id: string;
  receiptNumber: string;
  paymentReceivedId: string;
  paymentReceivedLabel: string;
  paymentReferenceNumber: string;
  paymentStatus: string;
  paymentStatusLabel: string;
  customerId: string;
  customerLabel: string;
  receiptDate: string | null;
  receiptDateLabel: string;
  amount: number;
  amountLabel: string;
  currency: string;
  status: string;
  statusLabel: string;
  statusTone: Tone;
  proofDocumentId: string;
  proofDocumentLabel: string;
  proofDocumentUrl: string;
  issuedByLabel: string;
  voidedAt: string | null;
  voidedAtLabel: string;
  voidedByLabel: string;
  notes: string;
  createdAt: string | null;
  updatedAt: string | null;
  usageSummary: {
    canEdit: boolean;
    canDelete: boolean;
    canIssue: boolean;
    canVoid: boolean;
    hasProofDocument: boolean;
  };
};

// === Receipt Mutation Input ===
export type ReceiptMutationInput = {
  receiptNumber?: string | null;
  paymentReceived: string;
  proofDocument?: string | null;
  notes?: string | null;
};

// === Proof of Payment Row ===
export type ProofOfPaymentRow = {
  id: string;
  receiptNumber: string;
  paymentLabel: string;
  customerLabel: string;
  proofDocumentLabel: string;
  receiptDateLabel: string;
  hasProof: boolean;
  proofStateLabel: string;
  proofStateTone: Tone;
  cells: Cell[];
};

// === Get Receipts ===
export async function getReceipts(
  query: {
    search?: string;
    page?: number;
    statuses?: string[];
    customerIds?: string[];
    proofStates?: string[];
    quickFilters?: string[];
  } = {},
): Promise<ReceiptRegisterResponse> {
  const params = new URLSearchParams();
  if (query.search?.trim()) params.set('search', query.search.trim());
  for (const v of query.statuses || []) params.append('status', v);
  for (const v of query.customerIds || []) params.append('customerId', v);
  for (const v of query.proofStates || []) params.append('proofState', v);
  for (const v of query.quickFilters || []) params.append('quickFilter', v);
  params.set('page', String(query.page || 1));
  params.set('limit', '10');

  return fetchAccountingAdmin<ReceiptRegisterResponse>(`/accounting/sales-receivables/official-receipts?${params.toString()}`);
}

// === Get Receipt Detail ===
export async function getReceiptDetail(id: string | number): Promise<ReceiptDetail> {
  return fetchAccountingAdmin<ReceiptDetail>(`/accounting/sales-receivables/official-receipts/${id}`);
}

// === Create Receipt ===
export async function createReceipt(input: ReceiptMutationInput): Promise<ReceiptDetail> {
  const created = await fetchAccountingAdmin<{ id: string | number }>('/accounting/sales-receivables/official-receipts', {
    method: 'POST',
    body: JSON.stringify(input),
  });
  return getReceiptDetail(created.id);
}

// === Update Receipt ===
export async function updateReceipt(id: string | number, input: ReceiptMutationInput): Promise<ReceiptDetail> {
  return fetchAccountingAdmin<ReceiptDetail>(`/accounting/sales-receivables/official-receipts/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

// === Delete Receipt ===
export async function deleteReceipt(id: string | number): Promise<{ success: boolean }> {
  return fetchAccountingAdmin<{ success: boolean }>(`/accounting/sales-receivables/official-receipts/${id}`, { method: 'DELETE' });
}

// === Issue Receipt ===
export async function issueReceipt(id: string | number): Promise<ReceiptDetail> {
  await fetchAccountingAdmin(`/accounting/sales-receivables/official-receipts/${id}/issue`, { method: 'POST' });
  return getReceiptDetail(id);
}

// === Void Receipt ===
export async function voidReceipt(id: string | number): Promise<ReceiptDetail> {
  await fetchAccountingAdmin(`/accounting/sales-receivables/official-receipts/${id}/void`, { method: 'POST' });
  return getReceiptDetail(id);
}
