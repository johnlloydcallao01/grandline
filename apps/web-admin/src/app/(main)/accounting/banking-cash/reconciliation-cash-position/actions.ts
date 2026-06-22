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
        : 'Failed to load reconciliation data.';
    throw new Error(errorMessage);
  }

  return payload as T;
}

export type ReconciliationFilterOption = {
  label: string;
  value: string;
};

export type ReconciliationMetric = {
  id: string;
  label: string;
  value: string | number;
  change: string;
  trend: 'up' | 'down' | 'neutral';
};

export type ReconciliationCell =
  | string
  | {
      text: string;
      tone?: 'amber' | 'blue' | 'gray' | 'green' | 'red';
      emphasis?: boolean;
      align?: 'left' | 'right' | 'center';
    };

export type ReconciliationSnapshotMatchRow = {
  id: string;
  bankTransactionId: string;
  transactionDate: string | null;
  transactionDateLabel: string;
  referenceNumber: string;
  description: string;
  directionLabel: string;
  amount: number;
  amountLabel: string;
  runningBalance: number;
  runningBalanceLabel: string;
  matchStatus: string;
  matchStatusLabel: string;
  matchStatusTone: 'amber' | 'blue' | 'gray' | 'green' | 'red';
  matchedEntityLabel: string;
  cells: ReconciliationCell[];
};

export type ReconciliationRow = {
  id: string;
  sessionLabel: string;
  bankAccountId: string;
  bankAccountLabel: string;
  bankAccountType: string;
  bankAccountCurrency: string;
  statementStartDate: string | null;
  statementStartDateLabel: string;
  statementEndDate: string | null;
  statementEndDateLabel: string;
  statementPeriodLabel: string;
  statementClosingBalance: number;
  statementClosingBalanceLabel: string;
  bookClosingBalance: number;
  bookClosingBalanceLabel: string;
  differenceAmount: number;
  differenceLabel: string;
  status: string;
  statusLabel: string;
  statusTone: 'amber' | 'blue' | 'gray' | 'green' | 'red';
  completedAt: string | null;
  completedAtLabel: string;
  completedByLabel: string;
  preparedByLabel: string;
  updatedByLabel: string;
  notes: string;
  createdAt: string | null;
  updatedAt: string | null;
  isDraft: boolean;
  isInProgress: boolean;
  isCompleted: boolean;
  isLocked: boolean;
  hasDifference: boolean;
  zeroDifference: boolean;
  searchableText: string;
  cells: ReconciliationCell[];
};

export type ReconciliationRegisterResponse = {
  rows: ReconciliationRow[];
  metrics: ReconciliationMetric[];
  filterOptions: {
    statuses: ReconciliationFilterOption[];
    bankAccounts: ReconciliationFilterOption[];
    differenceStates: ReconciliationFilterOption[];
    quickFilters: ReconciliationFilterOption[];
  };
  appliedFilters: {
    search: string;
    statuses: string[];
    bankAccountIds: string[];
    differenceStates: string[];
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
    bankAccounts: Array<{
      id: number | string;
      accountName: string | null;
      bankName: string | null;
      accountNumberMasked: string | null;
      accountType: string | null;
      currency: string | null;
      ledgerAccountCode: string | null;
      ledgerAccountName: string | null;
      isActive: boolean;
    }>;
  };
  flags: {
    mutableReconciliationIds: string[];
    completableReconciliationIds: string[];
  };
};

export type ReconciliationDetail = ReconciliationRow & {
  bankLedgerAccountLabel: string;
  snapshot: {
    bankTransactionCount: number;
    matchedTransactionCount: number;
    unmatchedTransactionCount: number;
    statementActivityNet: number;
    statementActivityNetLabel: string;
    statementClosingBalance: number;
    statementClosingBalanceLabel: string;
    bookClosingBalance: number;
    bookClosingBalanceLabel: string;
    differenceAmount: number;
    differenceLabel: string;
    canComplete: boolean;
    rows: ReconciliationSnapshotMatchRow[];
  };
  usageSummary: {
    canEdit: boolean;
    canDelete: boolean;
    canComplete: boolean;
    deleteBlockedReason: string | null;
    completeBlockedReason: string | null;
  };
};

export type ReconciliationMutationInput = {
  bankAccount: string;
  statementStartDate: string;
  statementEndDate: string;
  statementClosingBalance: number;
  status?: string | null;
  notes?: string | null;
};

export async function getReconciliations(
  query: {
    search?: string;
    page?: number;
    statuses?: string[];
    bankAccountIds?: string[];
    differenceStates?: string[];
    quickFilters?: string[];
  } = {},
): Promise<ReconciliationRegisterResponse> {
  const params = new URLSearchParams();
  if (query.search?.trim()) params.set('search', query.search.trim());
  for (const value of query.statuses || []) params.append('status', value);
  for (const value of query.bankAccountIds || []) params.append('bankAccountId', value);
  for (const value of query.differenceStates || []) params.append('difference', value);
  for (const value of query.quickFilters || []) params.append('quickFilter', value);
  params.set('page', String(query.page || 1));
  params.set('limit', '10');

  return fetchAccountingAdmin<ReconciliationRegisterResponse>(
    `/accounting/banking-cash/reconciliation-cash-position/reconciliations?${params.toString()}`,
  );
}

export async function getReconciliationDetail(id: string | number): Promise<ReconciliationDetail> {
  return fetchAccountingAdmin<ReconciliationDetail>(
    `/accounting/banking-cash/reconciliation-cash-position/reconciliations/${id}`,
  );
}

export async function createReconciliation(
  input: ReconciliationMutationInput,
): Promise<ReconciliationDetail> {
  return fetchAccountingAdmin<ReconciliationDetail>(
    `/accounting/banking-cash/reconciliation-cash-position/reconciliations`,
    {
      method: 'POST',
      body: JSON.stringify(input),
    },
  );
}

export async function updateReconciliation(
  id: string | number,
  input: ReconciliationMutationInput,
): Promise<ReconciliationDetail> {
  return fetchAccountingAdmin<ReconciliationDetail>(
    `/accounting/banking-cash/reconciliation-cash-position/reconciliations/${id}`,
    {
      method: 'PATCH',
      body: JSON.stringify(input),
    },
  );
}

export async function deleteReconciliation(id: string | number): Promise<{ success: boolean }> {
  return fetchAccountingAdmin<{ success: boolean }>(
    `/accounting/banking-cash/reconciliation-cash-position/reconciliations/${id}`,
    {
      method: 'DELETE',
    },
  );
}

export async function completeReconciliation(
  id: string | number,
): Promise<ReconciliationDetail> {
  return fetchAccountingAdmin<ReconciliationDetail>(
    `/accounting/banking-cash/reconciliation-cash-position/reconciliations/${id}/complete`,
    {
      method: 'POST',
    },
  );
}
