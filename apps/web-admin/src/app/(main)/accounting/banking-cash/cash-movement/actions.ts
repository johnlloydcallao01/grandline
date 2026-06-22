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
        : 'Failed to load cash movement data.';
    throw new Error(errorMessage);
  }

  return payload as T;
}

export type DepositFilterOption = {
  label: string;
  value: string;
};

export type DepositMetric = {
  id: string;
  label: string;
  value: string | number;
  change: string;
  trend: 'up' | 'down' | 'neutral';
};

export type DepositCell =
  | string
  | {
      text: string;
      tone?: 'amber' | 'blue' | 'gray' | 'green' | 'red';
      emphasis?: boolean;
      align?: 'left' | 'right' | 'center';
    };

export type DepositRow = {
  id: string;
  depositNumber: string;
  depositDate: string | null;
  depositDateLabel: string;
  bankAccountId: string;
  bankAccountLabel: string;
  bankAccountType: string;
  bankAccountCurrency: string;
  sourceAccountId: string;
  sourceAccountLabel: string;
  sourceAccountType: string;
  amount: number;
  amountLabel: string;
  status: string;
  statusLabel: string;
  statusTone: 'amber' | 'blue' | 'gray' | 'green' | 'red';
  postedJournalEntryId: string;
  postedJournalEntryLabel: string;
  notes: string;
  preparedByLabel: string;
  updatedByLabel: string;
  createdAt: string | null;
  updatedAt: string | null;
  hasJournalLink: boolean;
  hasNotes: boolean;
  isDraft: boolean;
  isPosted: boolean;
  isVoided: boolean;
  isToday: boolean;
  searchableText: string;
  cells: DepositCell[];
};

export type DepositRegisterResponse = {
  rows: DepositRow[];
  metrics: DepositMetric[];
  filterOptions: {
    statuses: DepositFilterOption[];
    bankAccounts: DepositFilterOption[];
    coverageStates: DepositFilterOption[];
    quickFilters: DepositFilterOption[];
  };
  appliedFilters: {
    search: string;
    statuses: string[];
    bankAccounts: string[];
    coverageStates: string[];
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
    sourceAccounts: Array<{
      id: number | string;
      code: string | null;
      name: string | null;
      accountType: string | null;
      accountSubType: string | null;
      isActive: boolean;
    }>;
  };
  flags: {
    mutableDepositIds: string[];
    postableDepositIds: string[];
  };
};

export type DepositDetail = DepositRow & {
  bankLedgerAccountLabel: string;
  usageSummary: {
    canEdit: boolean;
    canDelete: boolean;
    canPost: boolean;
    deleteBlockedReason: string | null;
    postBlockedReason: string | null;
  };
};

export type DepositMutationInput = {
  depositNumber?: string | null;
  depositDate: string;
  bankAccount: string;
  sourceAccount: string;
  amount: number;
  notes?: string | null;
};

export async function getDeposits(
  query: {
    search?: string;
    page?: number;
    statuses?: string[];
    bankAccounts?: string[];
    coverageStates?: string[];
    quickFilters?: string[];
  } = {},
): Promise<DepositRegisterResponse> {
  const params = new URLSearchParams();
  if (query.search?.trim()) params.set('search', query.search.trim());
  for (const value of query.statuses || []) params.append('status', value);
  for (const value of query.bankAccounts || []) params.append('bankAccount', value);
  for (const value of query.coverageStates || []) params.append('coverage', value);
  for (const value of query.quickFilters || []) params.append('quickFilter', value);
  params.set('page', String(query.page || 1));
  params.set('limit', '10');

  return fetchAccountingAdmin<DepositRegisterResponse>(
    `/accounting/banking-cash/cash-movement/deposits?${params.toString()}`,
  );
}

export async function getDepositDetail(id: string | number): Promise<DepositDetail> {
  return fetchAccountingAdmin<DepositDetail>(
    `/accounting/banking-cash/cash-movement/deposits/${id}`,
  );
}

export async function createDeposit(input: DepositMutationInput): Promise<DepositDetail> {
  return fetchAccountingAdmin<DepositDetail>(
    `/accounting/banking-cash/cash-movement/deposits`,
    {
      method: 'POST',
      body: JSON.stringify(input),
    },
  );
}

export async function updateDeposit(
  id: string | number,
  input: DepositMutationInput,
): Promise<DepositDetail> {
  return fetchAccountingAdmin<DepositDetail>(
    `/accounting/banking-cash/cash-movement/deposits/${id}`,
    {
      method: 'PATCH',
      body: JSON.stringify(input),
    },
  );
}

export async function deleteDeposit(id: string | number): Promise<{ success: boolean }> {
  return fetchAccountingAdmin<{ success: boolean }>(
    `/accounting/banking-cash/cash-movement/deposits/${id}`,
    {
      method: 'DELETE',
    },
  );
}

export async function postDeposit(id: string | number): Promise<DepositDetail> {
  return fetchAccountingAdmin<DepositDetail>(
    `/accounting/banking-cash/cash-movement/deposits/${id}/post`,
    {
      method: 'POST',
    },
  );
}

export type TransferFilterOption = {
  label: string;
  value: string;
};

export type TransferMetric = {
  id: string;
  label: string;
  value: string | number;
  change: string;
  trend: 'up' | 'down' | 'neutral';
};

export type TransferCell =
  | string
  | {
      text: string;
      tone?: 'amber' | 'blue' | 'gray' | 'green' | 'red';
      emphasis?: boolean;
      align?: 'left' | 'right' | 'center';
    };

export type TransferRow = {
  id: string;
  transferNumber: string;
  transferDate: string | null;
  transferDateLabel: string;
  fromBankAccountId: string;
  fromBankAccountLabel: string;
  fromBankAccountType: string;
  fromBankAccountCurrency: string;
  toBankAccountId: string;
  toBankAccountLabel: string;
  toBankAccountType: string;
  toBankAccountCurrency: string;
  amount: number;
  amountLabel: string;
  status: string;
  statusLabel: string;
  statusTone: 'amber' | 'blue' | 'gray' | 'green' | 'red';
  postedJournalEntryId: string;
  postedJournalEntryLabel: string;
  notes: string;
  preparedByLabel: string;
  updatedByLabel: string;
  createdAt: string | null;
  updatedAt: string | null;
  hasJournalLink: boolean;
  hasNotes: boolean;
  involvesUndepositedFunds: boolean;
  isBankToBank: boolean;
  isDraft: boolean;
  isPosted: boolean;
  isVoided: boolean;
  isToday: boolean;
  searchableText: string;
  cells: TransferCell[];
};

export type TransferRegisterResponse = {
  rows: TransferRow[];
  metrics: TransferMetric[];
  filterOptions: {
    statuses: TransferFilterOption[];
    bankAccounts: TransferFilterOption[];
    coverageStates: TransferFilterOption[];
    quickFilters: TransferFilterOption[];
  };
  appliedFilters: {
    search: string;
    statuses: string[];
    bankAccounts: string[];
    coverageStates: string[];
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
      accountTypeLabel: string | null;
      currency: string | null;
      ledgerAccountCode: string | null;
      ledgerAccountName: string | null;
      isActive: boolean;
    }>;
  };
  flags: {
    mutableTransferIds: string[];
    postableTransferIds: string[];
  };
};

export type TransferDetail = TransferRow & {
  fromLedgerAccountLabel: string;
  toLedgerAccountLabel: string;
  usageSummary: {
    canEdit: boolean;
    canDelete: boolean;
    canPost: boolean;
    deleteBlockedReason: string | null;
    postBlockedReason: string | null;
  };
};

export type TransferMutationInput = {
  transferNumber?: string | null;
  transferDate: string;
  fromBankAccount: string;
  toBankAccount: string;
  amount: number;
  notes?: string | null;
};

export async function getTransfers(
  query: {
    search?: string;
    page?: number;
    statuses?: string[];
    bankAccounts?: string[];
    coverageStates?: string[];
    quickFilters?: string[];
  } = {},
): Promise<TransferRegisterResponse> {
  const params = new URLSearchParams();
  if (query.search?.trim()) params.set('search', query.search.trim());
  for (const value of query.statuses || []) params.append('status', value);
  for (const value of query.bankAccounts || []) params.append('bankAccount', value);
  for (const value of query.coverageStates || []) params.append('coverage', value);
  for (const value of query.quickFilters || []) params.append('quickFilter', value);
  params.set('page', String(query.page || 1));
  params.set('limit', '10');

  return fetchAccountingAdmin<TransferRegisterResponse>(
    `/accounting/banking-cash/cash-movement/transfers?${params.toString()}`,
  );
}

export async function getTransferDetail(id: string | number): Promise<TransferDetail> {
  return fetchAccountingAdmin<TransferDetail>(
    `/accounting/banking-cash/cash-movement/transfers/${id}`,
  );
}

export async function createTransfer(input: TransferMutationInput): Promise<TransferDetail> {
  return fetchAccountingAdmin<TransferDetail>(
    `/accounting/banking-cash/cash-movement/transfers`,
    {
      method: 'POST',
      body: JSON.stringify(input),
    },
  );
}

export async function updateTransfer(
  id: string | number,
  input: TransferMutationInput,
): Promise<TransferDetail> {
  return fetchAccountingAdmin<TransferDetail>(
    `/accounting/banking-cash/cash-movement/transfers/${id}`,
    {
      method: 'PATCH',
      body: JSON.stringify(input),
    },
  );
}

export async function deleteTransfer(id: string | number): Promise<{ success: boolean }> {
  return fetchAccountingAdmin<{ success: boolean }>(
    `/accounting/banking-cash/cash-movement/transfers/${id}`,
    {
      method: 'DELETE',
    },
  );
}

export async function postTransfer(id: string | number): Promise<TransferDetail> {
  return fetchAccountingAdmin<TransferDetail>(
    `/accounting/banking-cash/cash-movement/transfers/${id}/post`,
    {
      method: 'POST',
    },
  );
}

export type BouncedPaymentFilterOption = {
  label: string;
  value: string;
};

export type BouncedPaymentMetric = {
  id: string;
  label: string;
  value: string | number;
  change: string;
  trend: 'up' | 'down' | 'neutral';
};

export type BouncedPaymentCell =
  | string
  | {
      text: string;
      tone?: 'amber' | 'blue' | 'gray' | 'green' | 'red';
      emphasis?: boolean;
      align?: 'left' | 'right' | 'center';
    };

export type BouncedPaymentRow = {
  id: string;
  caseNumber: string;
  customerId: string;
  customerLabel: string;
  originalPaymentId: string;
  originalReceiptNumber: string;
  originalPaymentAmount: number;
  originalPaymentAmountLabel: string;
  originalPaymentDate: string | null;
  originalPaymentDateLabel: string;
  originalDepositAccountId: string;
  originalDepositAccountLabel: string;
  originalJournalEntryId: string;
  originalJournalEntryLabel: string;
  bounceDate: string | null;
  bounceDateLabel: string;
  bankNoticeDate: string | null;
  bankNoticeDateLabel: string;
  bounceReason: string;
  bounceReasonLabel: string;
  caseStatus: string;
  caseStatusLabel: string;
  caseStatusTone: 'amber' | 'blue' | 'gray' | 'green' | 'red';
  bankChargeAmount: number;
  bankChargeAmountLabel: string;
  chargeExpenseAccountId: string;
  chargeExpenseAccountLabel: string;
  reversalJournalEntryId: string;
  reversalJournalEntryLabel: string;
  chargeJournalEntryId: string;
  chargeJournalEntryLabel: string;
  recoveryPaymentId: string;
  recoveryPaymentLabel: string;
  recoveryAmount: number;
  recoveryAmountLabel: string;
  recoveryDate: string | null;
  recoveryDateLabel: string;
  followUpDate: string | null;
  followUpDateLabel: string;
  resolutionDate: string | null;
  resolutionDateLabel: string;
  exposureAmount: number;
  exposureAmountLabel: string;
  notes: string;
  resolutionNotes: string;
  preparedByLabel: string;
  updatedByLabel: string;
  createdAt: string | null;
  updatedAt: string | null;
  hasReversal: boolean;
  hasChargeJournal: boolean;
  hasRecovery: boolean;
  hasBankCharge: boolean;
  isOpen: boolean;
  needsFollowUp: boolean;
  searchableText: string;
  cells: BouncedPaymentCell[];
};

export type BouncedPaymentRegisterResponse = {
  rows: BouncedPaymentRow[];
  metrics: BouncedPaymentMetric[];
  filterOptions: {
    statuses: BouncedPaymentFilterOption[];
    reasons: BouncedPaymentFilterOption[];
    customers: BouncedPaymentFilterOption[];
    quickFilters: BouncedPaymentFilterOption[];
  };
  appliedFilters: {
    search: string;
    statuses: string[];
    reasons: string[];
    customerIds: string[];
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
    originalPayments: Array<{
      id: number | string;
      receiptNumber: string | null;
      amountReceived: number;
      paymentDate: string | null;
      customerId: string;
      customerLabel: string;
      postedJournalEntryId: string;
      depositAccountLabel: string;
      referenceNumber: string | null;
    }>;
    chargeExpenseAccounts: Array<{
      id: number | string;
      code: string | null;
      name: string | null;
      accountType: string | null;
      accountSubType: string | null;
      isActive: boolean;
    }>;
    customers: Array<{
      id: number | string;
      customerCode: string | null;
      displayName: string | null;
    }>;
  };
  flags: {
    mutableCaseIds: string[];
    reversibleCaseIds: string[];
  };
};

export type BouncedPaymentDetail = BouncedPaymentRow & {
  usageSummary: {
    canEdit: boolean;
    canDelete: boolean;
    canReverse: boolean;
    deleteBlockedReason: string | null;
    reverseBlockedReason: string | null;
    financialLockReason: string | null;
  };
};

export type BouncedPaymentMutationInput = {
  caseNumber?: string | null;
  originalPayment: string;
  bounceDate: string;
  bankNoticeDate?: string | null;
  bounceReason: string;
  caseStatus?: string | null;
  bankChargeAmount?: number | null;
  chargeExpenseAccount?: string | null;
  recoveryPayment?: string | null;
  recoveryDate?: string | null;
  followUpDate?: string | null;
  resolutionDate?: string | null;
  notes?: string | null;
  resolutionNotes?: string | null;
};

export async function getBouncedPayments(
  query: {
    search?: string;
    page?: number;
    statuses?: string[];
    reasons?: string[];
    customerIds?: string[];
    quickFilters?: string[];
  } = {},
): Promise<BouncedPaymentRegisterResponse> {
  const params = new URLSearchParams();
  if (query.search?.trim()) params.set('search', query.search.trim());
  for (const value of query.statuses || []) params.append('status', value);
  for (const value of query.reasons || []) params.append('reason', value);
  for (const value of query.customerIds || []) params.append('customerId', value);
  for (const value of query.quickFilters || []) params.append('quickFilter', value);
  params.set('page', String(query.page || 1));
  params.set('limit', '10');

  return fetchAccountingAdmin<BouncedPaymentRegisterResponse>(
    `/accounting/banking-cash/cash-movement/bounced-payments?${params.toString()}`,
  );
}

export async function getBouncedPaymentDetail(id: string | number): Promise<BouncedPaymentDetail> {
  return fetchAccountingAdmin<BouncedPaymentDetail>(
    `/accounting/banking-cash/cash-movement/bounced-payments/${id}`,
  );
}

export async function createBouncedPayment(
  input: BouncedPaymentMutationInput,
): Promise<BouncedPaymentDetail> {
  return fetchAccountingAdmin<BouncedPaymentDetail>(
    `/accounting/banking-cash/cash-movement/bounced-payments`,
    {
      method: 'POST',
      body: JSON.stringify(input),
    },
  );
}

export async function updateBouncedPayment(
  id: string | number,
  input: BouncedPaymentMutationInput,
): Promise<BouncedPaymentDetail> {
  return fetchAccountingAdmin<BouncedPaymentDetail>(
    `/accounting/banking-cash/cash-movement/bounced-payments/${id}`,
    {
      method: 'PATCH',
      body: JSON.stringify(input),
    },
  );
}

export async function deleteBouncedPayment(id: string | number): Promise<{ success: boolean }> {
  return fetchAccountingAdmin<{ success: boolean }>(
    `/accounting/banking-cash/cash-movement/bounced-payments/${id}`,
    {
      method: 'DELETE',
    },
  );
}

export async function reverseBouncedPayment(
  id: string | number,
): Promise<BouncedPaymentDetail> {
  return fetchAccountingAdmin<BouncedPaymentDetail>(
    `/accounting/banking-cash/cash-movement/bounced-payments/${id}/reverse`,
    {
      method: 'POST',
    },
  );
}
