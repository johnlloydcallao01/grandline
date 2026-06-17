'use server';

import { getServerToken } from '@/app/actions/auth';
import { env } from '@/lib/env';
import {
  createBill as createSharedBill,
  deleteBill as deleteSharedBill,
  getBillDetail as getSharedBillDetail,
  postBill as postSharedBill,
  type BillMutationInput,
  type BillDetail,
  updateBill as updateSharedBill,
} from '../purchase-documents/actions';

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

export type ApMonitoringFilterOption = {
  label: string;
  value: string;
};

export type ApMonitoringMetric = {
  id: string;
  label: string;
  value: number | string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
};

export type ApMonitoringCell =
  | string
  | {
      text: string;
      tone?: 'amber' | 'blue' | 'gray' | 'green' | 'red';
      emphasis?: boolean;
      align?: 'left' | 'right' | 'center';
    };

export type AccountsPayableAgingRow = {
  id: string;
  billNumber: string;
  billDate: string | null;
  billDateLabel: string;
  vendorId: string;
  vendorCode: string;
  vendorLabel: string;
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
  cells: ApMonitoringCell[];
};

export type AccountsPayableAgingRegisterResponse = {
  rows: AccountsPayableAgingRow[];
  metrics: ApMonitoringMetric[];
  filterOptions: {
    statuses: ApMonitoringFilterOption[];
    vendors: ApMonitoringFilterOption[];
    agingBuckets: ApMonitoringFilterOption[];
    quickFilters: ApMonitoringFilterOption[];
  };
  appliedFilters: {
    search: string;
    statuses: string[];
    vendorIds: string[];
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
    vendors: Array<{
      id: number | string;
      vendorCode: string | null;
      displayName: string | null;
    }>;
  };
};

export type DueDateQueueRow = {
  id: string;
  billNumber: string;
  billDate: string | null;
  billDateLabel: string;
  vendorId: string;
  vendorCode: string;
  vendorLabel: string;
  dueDate: string | null;
  dueDateLabel: string;
  balanceDue: number;
  balanceDueLabel: string;
  total: number;
  totalLabel: string;
  status: string;
  statusLabel: string;
  statusTone: 'amber' | 'blue' | 'gray' | 'green' | 'red';
  postingStatus: string;
  postingStatusLabel: string;
  dueState: 'overdue' | 'due_today' | 'due_this_week' | 'due_later';
  dueStateLabel: string;
  daysUntilDue: number;
  daysUntilDueLabel: string;
  isOverdue: boolean;
  isDueToday: boolean;
  isDueThisWeek: boolean;
  isDueLater: boolean;
  isPartiallyPaid: boolean;
  isApprovedUnposted: boolean;
  isMutable: boolean;
  referenceNumber: string;
  memo: string;
  postedJournalEntryId: string;
  searchableText: string;
  cells: ApMonitoringCell[];
};

export type DueDateQueueRegisterResponse = {
  rows: DueDateQueueRow[];
  metrics: ApMonitoringMetric[];
  filterOptions: {
    statuses: ApMonitoringFilterOption[];
    vendors: ApMonitoringFilterOption[];
    dueStates: ApMonitoringFilterOption[];
    quickFilters: ApMonitoringFilterOption[];
  };
  appliedFilters: {
    search: string;
    statuses: string[];
    vendorIds: string[];
    dueStates: string[];
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
    vendors: Array<{
      id: number | string;
      vendorCode: string | null;
      displayName: string | null;
      paymentTerms: string | null;
      currency: string | null;
      status: string | null;
    }>;
    chartAccounts: Array<{
      id: number | string;
      code: string | null;
      name: string | null;
      accountType: string | null;
      accountSubType: string | null;
    }>;
    taxCodes: Array<{
      id: number | string;
      code: string | null;
      name: string | null;
      rate: number;
      calculationMethod: string;
      isActive: boolean;
    }>;
  };
  flags: {
    mutableBillIds: string[];
  };
};

export async function getAccountsPayableAging(
  query: {
    search?: string;
    page?: number;
    statuses?: string[];
    vendorIds?: string[];
    agingBuckets?: string[];
    quickFilters?: string[];
  } = {},
): Promise<AccountsPayableAgingRegisterResponse> {
  const params = new URLSearchParams();
  if (query.search?.trim()) params.set('search', query.search.trim());
  for (const value of query.statuses || []) params.append('status', value);
  for (const value of query.vendorIds || []) params.append('vendorId', value);
  for (const value of query.agingBuckets || []) params.append('agingBucket', value);
  for (const value of query.quickFilters || []) params.append('quickFilter', value);
  params.set('page', String(query.page || 1));
  params.set('limit', '10');

  return fetchAccountingAdmin<AccountsPayableAgingRegisterResponse>(
    `/accounting/purchases-payables/accounts-payable-aging?${params.toString()}`,
  );
}

export async function getAccountsPayableAgingBillDetail(id: string | number): Promise<BillDetail> {
  return getSharedBillDetail(id);
}

export async function getDueDateQueue(
  query: {
    search?: string;
    page?: number;
    statuses?: string[];
    vendorIds?: string[];
    dueStates?: string[];
    quickFilters?: string[];
  } = {},
): Promise<DueDateQueueRegisterResponse> {
  const params = new URLSearchParams();
  if (query.search?.trim()) params.set('search', query.search.trim());
  for (const value of query.statuses || []) params.append('status', value);
  for (const value of query.vendorIds || []) params.append('vendorId', value);
  for (const value of query.dueStates || []) params.append('dueState', value);
  for (const value of query.quickFilters || []) params.append('quickFilter', value);
  params.set('page', String(query.page || 1));
  params.set('limit', '10');

  return fetchAccountingAdmin<DueDateQueueRegisterResponse>(
    `/accounting/purchases-payables/due-date-queue?${params.toString()}`,
  );
}

export async function getDueDateQueueBillDetail(id: string | number): Promise<BillDetail> {
  return getSharedBillDetail(id);
}

export async function createDueDateQueueBill(input: BillMutationInput): Promise<BillDetail> {
  return createSharedBill(input);
}

export async function updateDueDateQueueBill(id: string | number, input: BillMutationInput): Promise<BillDetail> {
  return updateSharedBill(id, input);
}

export async function deleteDueDateQueueBill(id: string | number): Promise<{ success: boolean }> {
  return deleteSharedBill(id);
}

export async function postDueDateQueueBill(id: string | number): Promise<BillDetail> {
  return postSharedBill(id);
}
