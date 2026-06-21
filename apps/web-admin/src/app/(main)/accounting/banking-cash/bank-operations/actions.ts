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

export type BankTransactionFilterOption = {
  label: string;
  value: string;
};

export type BankTransactionMetric = {
  id: string;
  label: string;
  value: string | number;
  change: string;
  trend: 'up' | 'down' | 'neutral';
};

export type BankTransactionCell =
  | string
  | {
      text: string;
      tone?: 'amber' | 'blue' | 'gray' | 'green' | 'red';
      emphasis?: boolean;
      align?: 'left' | 'right' | 'center';
    };

export type BankTransactionRow = {
  id: string;
  bankAccountId: string;
  bankAccountLabel: string;
  bankAccountType: string;
  currency: string;
  transactionDate: string | null;
  transactionDateLabel: string;
  valueDate: string | null;
  valueDateLabel: string;
  referenceNumber: string;
  description: string;
  amountIn: number;
  amountInLabel: string;
  amountOut: number;
  amountOutLabel: string;
  netAmount: number;
  netAmountLabel: string;
  runningBalance: number;
  runningBalanceLabel: string;
  direction: 'incoming' | 'outgoing' | 'mixed';
  directionLabel: string;
  matchStatus: string;
  matchStatusLabel: string;
  matchStatusTone: 'amber' | 'blue' | 'gray' | 'green' | 'red';
  matchedEntityType: string;
  matchedEntityTypeLabel: string;
  matchedEntityId: string;
  hasMatchLink: boolean;
  hasValueDate: boolean;
  hasRunningBalance: boolean;
  searchableText: string;
  cells: BankTransactionCell[];
};

export type BankTransactionRegisterResponse = {
  rows: BankTransactionRow[];
  metrics: BankTransactionMetric[];
  filterOptions: {
    statuses: BankTransactionFilterOption[];
    directions: BankTransactionFilterOption[];
    coverageStates: BankTransactionFilterOption[];
    quickFilters: BankTransactionFilterOption[];
  };
  appliedFilters: {
    search: string;
    statuses: string[];
    directions: string[];
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
    matchedEntityTypes: Array<{
      label: string;
      value: string;
    }>;
  };
  flags: {
    mutableTransactionIds: string[];
  };
};

export type BankTransactionDetail = {
  id: string;
  bankAccountId: string;
  bankAccountLabel: string;
  bankAccountType: string;
  bankAccountCurrency: string;
  bankLedgerAccountLabel: string;
  transactionDate: string | null;
  transactionDateLabel: string;
  valueDate: string | null;
  valueDateLabel: string;
  referenceNumber: string;
  description: string;
  amountIn: number;
  amountInLabel: string;
  amountOut: number;
  amountOutLabel: string;
  netAmount: number;
  netAmountLabel: string;
  runningBalance: number;
  runningBalanceLabel: string;
  direction: 'incoming' | 'outgoing' | 'mixed';
  directionLabel: string;
  matchStatus: string;
  matchStatusLabel: string;
  matchStatusTone: 'amber' | 'blue' | 'gray' | 'green' | 'red';
  matchedEntityType: string;
  matchedEntityTypeLabel: string;
  matchedEntityId: string;
  metadata: Record<string, unknown> | null;
  createdAt: string | null;
  updatedAt: string | null;
  usageSummary: {
    hasEntityMatch: boolean;
    canEdit: boolean;
    canDelete: boolean;
  };
};

export type BankTransactionMutationInput = {
  bankAccount: string;
  transactionDate: string;
  valueDate?: string | null;
  description: string;
  referenceNumber?: string | null;
  amountIn: number;
  amountOut: number;
  runningBalance?: number | null;
  matchStatus: string;
  matchedEntityType?: string | null;
  matchedEntityId?: string | null;
  metadata?: Record<string, unknown> | null;
};

export type StatementImportFilterOption = {
  label: string;
  value: string;
};

export type StatementImportMetric = {
  id: string;
  label: string;
  value: string | number;
  change: string;
  trend: 'up' | 'down' | 'neutral';
};

export type StatementImportRow = {
  id: string;
  importBatchNumber: string;
  bankAccountId: string;
  bankAccountLabel: string;
  sourceFormat: string;
  sourceFormatLabel: string;
  importStatus: string;
  importStatusLabel: string;
  importStatusTone: 'amber' | 'blue' | 'gray' | 'green' | 'red';
  statementFileId: string;
  statementFilename: string;
  statementFileUrl: string;
  statementDateFrom: string | null;
  statementDateTo: string | null;
  statementDateRangeLabel: string;
  uploadedAt: string | null;
  uploadedAtLabel: string;
  uploadedByLabel: string;
  importedAt: string | null;
  importedAtLabel: string;
  importedByLabel: string;
  totalLines: number;
  importedLines: number;
  failedLines: number;
  duplicateLines: number;
  importedTransactionCount: number;
  parseErrorSummary: string;
  notes: string;
  hasErrors: boolean;
  hasImportedTransactions: boolean;
  requiresFollowUp: boolean;
  searchableText: string;
  cells: BankTransactionCell[];
};

export type StatementImportRegisterResponse = {
  rows: StatementImportRow[];
  metrics: StatementImportMetric[];
  filterOptions: {
    statuses: StatementImportFilterOption[];
    bankAccounts: StatementImportFilterOption[];
    coverageStates: StatementImportFilterOption[];
    quickFilters: StatementImportFilterOption[];
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
      isActive: boolean;
    }>;
    sourceFormats: Array<{
      label: string;
      value: string;
    }>;
    importStatuses: Array<{
      label: string;
      value: string;
    }>;
  };
  flags: {
    retryableImportIds: string[];
  };
};

export type StatementImportDetail = StatementImportRow & {
  statementFile: {
    id: string;
    filename: string;
    url: string;
    mimeType: string;
    filesize: number;
    alt: string;
  } | null;
  bankLedgerAccountLabel: string;
  bankAccountType: string;
  currency: string;
  metadata: Record<string, unknown> | null;
  createdAt: string | null;
  updatedAt: string | null;
  usageSummary: {
    canEdit: boolean;
    canDelete: boolean;
    canRetry: boolean;
  };
};

export type StatementImportMutationInput = {
  importBatchNumber?: string | null;
  bankAccount: string;
  statementFile: string;
  statementDateFrom?: string | null;
  statementDateTo?: string | null;
  sourceFormat: string;
  importStatus: string;
  totalLines: number;
  importedLines: number;
  failedLines: number;
  duplicateLines: number;
  importedTransactionCount: number;
  parseErrorSummary?: string | null;
  notes?: string | null;
  metadata?: Record<string, unknown> | null;
};

export async function getBankTransactions(
  query: {
    search?: string;
    page?: number;
    statuses?: string[];
    directions?: string[];
    coverageStates?: string[];
    quickFilters?: string[];
  } = {},
): Promise<BankTransactionRegisterResponse> {
  const params = new URLSearchParams();
  if (query.search?.trim()) params.set('search', query.search.trim());
  for (const value of query.statuses || []) params.append('status', value);
  for (const value of query.directions || []) params.append('direction', value);
  for (const value of query.coverageStates || []) params.append('coverage', value);
  for (const value of query.quickFilters || []) params.append('quickFilter', value);
  params.set('page', String(query.page || 1));
  params.set('limit', '10');

  return fetchAccountingAdmin<BankTransactionRegisterResponse>(
    `/accounting/banking-cash/bank-operations/bank-transactions?${params.toString()}`,
  );
}

export async function getBankTransactionDetail(id: string | number): Promise<BankTransactionDetail> {
  return fetchAccountingAdmin<BankTransactionDetail>(
    `/accounting/banking-cash/bank-operations/bank-transactions/${id}`,
  );
}

export async function createBankTransaction(
  input: BankTransactionMutationInput,
): Promise<BankTransactionDetail> {
  return fetchAccountingAdmin<BankTransactionDetail>(
    `/accounting/banking-cash/bank-operations/bank-transactions`,
    {
      method: 'POST',
      body: JSON.stringify(input),
    },
  );
}

export async function updateBankTransaction(
  id: string | number,
  input: BankTransactionMutationInput,
): Promise<BankTransactionDetail> {
  return fetchAccountingAdmin<BankTransactionDetail>(
    `/accounting/banking-cash/bank-operations/bank-transactions/${id}`,
    {
      method: 'PATCH',
      body: JSON.stringify(input),
    },
  );
}

export async function deleteBankTransaction(id: string | number): Promise<{ success: boolean }> {
  return fetchAccountingAdmin<{ success: boolean }>(
    `/accounting/banking-cash/bank-operations/bank-transactions/${id}`,
    {
      method: 'DELETE',
    },
  );
}

export async function getStatementImports(
  query: {
    search?: string;
    page?: number;
    statuses?: string[];
    bankAccounts?: string[];
    coverageStates?: string[];
    quickFilters?: string[];
  } = {},
): Promise<StatementImportRegisterResponse> {
  const params = new URLSearchParams();
  if (query.search?.trim()) params.set('search', query.search.trim());
  for (const value of query.statuses || []) params.append('status', value);
  for (const value of query.bankAccounts || []) params.append('bankAccount', value);
  for (const value of query.coverageStates || []) params.append('coverage', value);
  for (const value of query.quickFilters || []) params.append('quickFilter', value);
  params.set('page', String(query.page || 1));
  params.set('limit', '10');

  return fetchAccountingAdmin<StatementImportRegisterResponse>(
    `/accounting/banking-cash/bank-operations/statement-imports?${params.toString()}`,
  );
}

export async function getStatementImportDetail(id: string | number): Promise<StatementImportDetail> {
  return fetchAccountingAdmin<StatementImportDetail>(
    `/accounting/banking-cash/bank-operations/statement-imports/${id}`,
  );
}

export async function createStatementImport(
  input: StatementImportMutationInput,
): Promise<StatementImportDetail> {
  return fetchAccountingAdmin<StatementImportDetail>(
    `/accounting/banking-cash/bank-operations/statement-imports`,
    {
      method: 'POST',
      body: JSON.stringify(input),
    },
  );
}

export async function updateStatementImport(
  id: string | number,
  input: StatementImportMutationInput,
): Promise<StatementImportDetail> {
  return fetchAccountingAdmin<StatementImportDetail>(
    `/accounting/banking-cash/bank-operations/statement-imports/${id}`,
    {
      method: 'PATCH',
      body: JSON.stringify(input),
    },
  );
}

export async function deleteStatementImport(id: string | number): Promise<{ success: boolean }> {
  return fetchAccountingAdmin<{ success: boolean }>(
    `/accounting/banking-cash/bank-operations/statement-imports/${id}`,
    {
      method: 'DELETE',
    },
  );
}

export async function retryStatementImports(ids: Array<string | number>): Promise<{ success: boolean; retriedCount: number }> {
  return fetchAccountingAdmin<{ success: boolean; retriedCount: number }>(
    `/accounting/banking-cash/bank-operations/statement-imports/retry`,
    {
      method: 'POST',
      body: JSON.stringify({ ids }),
    },
  );
}
