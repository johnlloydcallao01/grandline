'use server';

import { getServerToken } from '@/app/actions/auth';
import { env } from '@/lib/env';
import {
  createExpense,
  deleteExpense,
  getExpenseDetail,
  postExpense,
  updateExpense,
  type ExpenseDetail,
  type ExpenseMetric,
  type ExpenseMutationInput,
} from '../expense-operations/actions';
import {
  createBankAccount,
  deleteBankAccount,
  getBankAccountDetail,
  updateBankAccount,
  type BankAccountDetail,
  type CreateBankAccountInput,
  type UpdateBankAccountInput,
} from '../../master-records/business-parties/actions';

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
        : 'Failed to load petty cash data.';
    throw new Error(errorMessage);
  }

  return payload as T;
}

export type PettyCashFilterOption = {
  label: string;
  value: string;
};

export type PettyCashCell =
  | string
  | {
      text: string;
      tone?: 'amber' | 'blue' | 'gray' | 'green' | 'red';
      emphasis?: boolean;
      align?: 'left' | 'right' | 'center';
    };

export type PettyCashRow = {
  id: string;
  expenseNumber: string;
  vendorLabel: string;
  expenseCategory: string;
  cashAccountId: string;
  cashAccountLabel: string;
  total: number;
  totalLabel: string;
  status: string;
  statusLabel: string;
  statusTone: 'amber' | 'blue' | 'gray' | 'green' | 'red';
  taxCodeId: string;
  hasLinkedCashAccount: boolean;
  hasDocuments: boolean;
  documentCount: number;
  postedJournalEntryId: string;
  searchableText: string;
  cells: PettyCashCell[];
};

export type PettyCashRegisterResponse = {
  rows: PettyCashRow[];
  metrics: ExpenseMetric[];
  filterOptions: {
    statuses: PettyCashFilterOption[];
    taxStates: PettyCashFilterOption[];
    coverageStates: PettyCashFilterOption[];
    quickFilters: PettyCashFilterOption[];
  };
  appliedFilters: {
    search: string;
    statuses: string[];
    taxStates: string[];
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
    vendors: Array<{
      id: number | string;
      vendorCode: string | null;
      displayName: string | null;
      status: string | null;
    }>;
    projects: Array<{
      id: number | string;
      projectCode: string | null;
      name: string | null;
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
      purchaseAccountId: number | string | null;
      isActive: boolean;
    }>;
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
    mutableExpenseIds: string[];
    postableExpenseIds: string[];
    postBlockedByExpenseId: Record<string, string[]>;
    hasDefaultInputTaxAccount: boolean;
  };
  summary: {
    totalDocuments: number;
    linkedCashAccounts: number;
    journalLinked: number;
  };
  rowMetadata: Array<{
    id: string;
    documentCount: number;
    hasDocuments: boolean;
    hasLinkedCashAccount: boolean;
    cashAccountLabel: string;
    journalLinkLabel: string;
    taxStateLabel: string;
    statusLabel: string;
  }>;
};

export type PettyCashAccountRow = {
  id: string;
  accountName: string;
  accountNumberMasked: string;
  bankName: string;
  branchName: string;
  accountType: 'cash_on_hand' | 'undeposited_funds';
  accountTypeLabel: string;
  currency: string;
  currencyReferenceId: string;
  ledgerAccountId: string;
  ledgerAccountCode: string;
  ledgerAccountName: string;
  ledgerAccountDisplay: string;
  isDefaultReceiptAccount: boolean;
  isDefaultDisbursementAccount: boolean;
  isLedgerMapped: boolean;
  status: 'active' | 'inactive';
  statusLabel: string;
  statusTone: 'gray' | 'green';
  notes: string;
  createdAt: string;
  updatedAt: string;
  searchableText: string;
  cells: PettyCashCell[];
};

export type PettyCashAccountRegisterResponse = {
  rows: PettyCashAccountRow[];
  metrics: ExpenseMetric[];
  filterOptions: {
    statuses: PettyCashFilterOption[];
    accountTypes: PettyCashFilterOption[];
    coverageStates: PettyCashFilterOption[];
    quickFilters: PettyCashFilterOption[];
  };
  appliedFilters: {
    search: string;
    statuses: string[];
    accountTypes: string[];
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
    currencies: Array<{
      id: string;
      code: string | null;
      name: string | null;
    }>;
    ledgerAccounts: Array<{
      id: string;
      code: string | null;
      name: string | null;
    }>;
  };
  summary: {
    defaultReceiptCount: number;
    defaultDisbursementCount: number;
    ledgerMappedCount: number;
  };
  rowMetadata: Array<{
    id: string;
    defaultsLabel: string;
    ledgerMappingLabel: string;
    statusLabel: string;
  }>;
};

export async function getPettyCashExpenses(
  query: {
    search?: string;
    page?: number;
    statuses?: string[];
    taxStates?: string[];
    coverageStates?: string[];
    quickFilters?: string[];
  } = {},
): Promise<PettyCashRegisterResponse> {
  const params = new URLSearchParams();
  if (query.search?.trim()) params.set('search', query.search.trim());
  for (const value of query.statuses || []) params.append('status', value);
  for (const value of query.taxStates || []) params.append('taxState', value);
  for (const value of query.coverageStates || []) params.append('coverage', value);
  for (const value of query.quickFilters || []) params.append('quickFilter', value);
  params.set('page', String(query.page || 1));
  params.set('limit', '10');

  return fetchAccountingAdmin<PettyCashRegisterResponse>(`/accounting/expenses/petty-cash?${params.toString()}`);
}

export async function getPettyCashAccounts(
  query: {
    search?: string;
    page?: number;
    statuses?: string[];
    accountTypes?: string[];
    coverageStates?: string[];
    quickFilters?: string[];
  } = {},
): Promise<PettyCashAccountRegisterResponse> {
  const params = new URLSearchParams();
  if (query.search?.trim()) params.set('search', query.search.trim());
  for (const value of query.statuses || []) params.append('status', value);
  for (const value of query.accountTypes || []) params.append('accountType', value);
  for (const value of query.coverageStates || []) params.append('coverage', value);
  for (const value of query.quickFilters || []) params.append('quickFilter', value);
  params.set('page', String(query.page || 1));
  params.set('limit', '10');

  return fetchAccountingAdmin<PettyCashAccountRegisterResponse>(
    `/accounting/expenses/petty-cash/cash-accounts?${params.toString()}`,
  );
}

export {
  createBankAccount,
  createExpense,
  deleteBankAccount,
  deleteExpense,
  getBankAccountDetail,
  type BankAccountDetail,
  type CreateBankAccountInput,
  type ExpenseMetric,
  getExpenseDetail,
  postExpense,
  type UpdateBankAccountInput,
  updateBankAccount,
  updateExpense,
  type ExpenseDetail,
  type ExpenseMutationInput,
};
