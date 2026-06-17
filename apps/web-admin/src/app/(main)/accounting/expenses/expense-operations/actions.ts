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

export type ExpenseFilterOption = {
  label: string;
  value: string;
};

export type ExpenseMetric = {
  id: string;
  label: string;
  value: number | string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
};

export type ExpenseCell =
  | string
  | {
      text: string;
      tone?: 'amber' | 'blue' | 'gray' | 'green' | 'red';
      emphasis?: boolean;
      align?: 'left' | 'right' | 'center';
    };

export type ExpenseRow = {
  id: string;
  expenseNumber: string;
  expenseDate: string | null;
  expenseDateLabel: string;
  postingDate: string | null;
  postingDateLabel: string;
  vendorId: string;
  vendorCode: string;
  vendorLabel: string;
  expenseCategory: string;
  paymentMethod: string;
  paymentMethodLabel: string;
  status: string;
  statusLabel: string;
  statusTone: 'amber' | 'blue' | 'gray' | 'green' | 'red';
  currency: string;
  subtotal: number;
  subtotalLabel: string;
  taxTotal: number;
  taxTotalLabel: string;
  total: number;
  totalLabel: string;
  projectId: string;
  projectLabel: string;
  expenseAccountId: string;
  expenseAccountLabel: string;
  taxCodeId: string;
  taxCodeLabel: string;
  paymentAccountId: string;
  paymentAccountLabel: string;
  bankAccountId: string;
  bankAccountLabel: string;
  postedJournalEntryId: string;
  notes: string;
  hasTaxCode: boolean;
  isCash: boolean;
  searchableText: string;
  cells: ExpenseCell[];
};

export type ExpenseDetail = {
  id: string;
  expenseNumber: string;
  expenseDate: string | null;
  expenseDateLabel: string;
  postingDate: string | null;
  postingDateLabel: string;
  vendorId: string;
  vendorLabel: string;
  expenseCategory: string;
  paymentMethod: string;
  paymentMethodLabel: string;
  status: string;
  statusLabel: string;
  statusTone: 'amber' | 'blue' | 'gray' | 'green' | 'red';
  currency: string;
  subtotal: number;
  subtotalLabel: string;
  taxTotal: number;
  taxTotalLabel: string;
  total: number;
  totalLabel: string;
  projectId: string;
  projectLabel: string;
  expenseAccountId: string;
  expenseAccountLabel: string;
  taxCodeId: string;
  taxCodeLabel: string;
  taxRate: number;
  taxCalculationMethod: string;
  paymentAccountId: string;
  paymentAccountLabel: string;
  bankAccountId: string;
  bankAccountLabel: string;
  postedJournalEntryId: string;
  notes: string;
  createdAt: string | null;
  updatedAt: string | null;
  documentLinks: Array<{
    id: string;
    documentCategory: string;
    documentCategoryLabel: string;
    documentDate: string | null;
    documentDateLabel: string;
    isPrimary: boolean;
    notes: string;
  }>;
  usageSummary: {
    documentCount: number;
    hasJournalLink: boolean;
    hasDependents: boolean;
  };
};

export type ExpenseMutationInput = {
  expenseNumber?: string | null;
  expenseDate: string;
  postingDate: string;
  vendor?: string | null;
  expenseCategory?: string | null;
  paymentMethod: 'cash' | 'bank' | 'card' | 'other';
  currency: string;
  subtotal: number;
  project?: string | null;
  expenseAccount: string;
  taxCode?: string | null;
  paymentAccount?: string | null;
  bankAccount?: string | null;
  notes?: string | null;
  autoPost?: boolean;
};

export type ExpenseDetailRegisterRow = {
  id: string;
  expenseNumber: string;
  vendorId: string;
  vendorLabel: string;
  taxCodeId: string;
  taxCodeLabel: string;
  taxTotal: number;
  taxTotalLabel: string;
  total: number;
  totalLabel: string;
  status: string;
  statusLabel: string;
  statusTone: 'amber' | 'blue' | 'gray' | 'green' | 'red';
  documentCount: number;
  documentCountLabel: string;
  hasJournalLink: boolean;
  journalLinkLabel: string;
  searchableText: string;
  cells: ExpenseCell[];
};

export type ExpensesRegisterResponse = {
  rows: ExpenseRow[];
  metrics: ExpenseMetric[];
  filterOptions: {
    statuses: ExpenseFilterOption[];
    paymentMethods: ExpenseFilterOption[];
    taxStates: ExpenseFilterOption[];
    quickFilters: ExpenseFilterOption[];
  };
  appliedFilters: {
    search: string;
    statuses: string[];
    paymentMethods: string[];
    taxStates: string[];
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
};

export type ExpenseDetailRegisterResponse = {
  rows: ExpenseDetailRegisterRow[];
  metrics: ExpenseMetric[];
  filterOptions: {
    statuses: ExpenseFilterOption[];
    vendors: ExpenseFilterOption[];
    coverageStates: ExpenseFilterOption[];
    quickFilters: ExpenseFilterOption[];
  };
  appliedFilters: {
    search: string;
    statuses: string[];
    vendorIds: string[];
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
  referenceData: ExpensesRegisterResponse['referenceData'];
  flags: ExpensesRegisterResponse['flags'];
};

export async function getExpenses(
  query: {
    search?: string;
    page?: number;
    statuses?: string[];
    paymentMethods?: string[];
    taxStates?: string[];
    quickFilters?: string[];
  } = {},
): Promise<ExpensesRegisterResponse> {
  const params = new URLSearchParams();
  if (query.search?.trim()) params.set('search', query.search.trim());
  for (const value of query.statuses || []) params.append('status', value);
  for (const value of query.paymentMethods || []) params.append('paymentMethod', value);
  for (const value of query.taxStates || []) params.append('taxState', value);
  for (const value of query.quickFilters || []) params.append('quickFilter', value);
  params.set('page', String(query.page || 1));
  params.set('limit', '10');

  return fetchAccountingAdmin<ExpensesRegisterResponse>(`/accounting/expenses?${params.toString()}`);
}

export async function getExpenseDetail(id: string | number): Promise<ExpenseDetail> {
  return fetchAccountingAdmin<ExpenseDetail>(`/accounting/expenses/${id}`);
}

export async function getExpenseDetailRegister(
  query: {
    search?: string;
    page?: number;
    statuses?: string[];
    vendorIds?: string[];
    coverageStates?: string[];
    quickFilters?: string[];
  } = {},
): Promise<ExpenseDetailRegisterResponse> {
  const params = new URLSearchParams();
  if (query.search?.trim()) params.set('search', query.search.trim());
  for (const value of query.statuses || []) params.append('status', value);
  for (const value of query.vendorIds || []) params.append('vendorId', value);
  for (const value of query.coverageStates || []) params.append('coverage', value);
  for (const value of query.quickFilters || []) params.append('quickFilter', value);
  params.set('page', String(query.page || 1));
  params.set('limit', '10');

  return fetchAccountingAdmin<ExpenseDetailRegisterResponse>(
    `/accounting/expenses/expense-detail?${params.toString()}`,
  );
}

export async function createExpense(input: ExpenseMutationInput): Promise<ExpenseDetail> {
  return fetchAccountingAdmin<ExpenseDetail>(`/accounting/expenses`, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function updateExpense(id: string | number, input: ExpenseMutationInput): Promise<ExpenseDetail> {
  return fetchAccountingAdmin<ExpenseDetail>(`/accounting/expenses/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

export async function deleteExpense(id: string | number): Promise<{ success: boolean }> {
  return fetchAccountingAdmin<{ success: boolean }>(`/accounting/expenses/${id}`, {
    method: 'DELETE',
  });
}

export async function postExpense(id: string | number): Promise<ExpenseDetail> {
  return fetchAccountingAdmin<ExpenseDetail>(`/accounting/expenses/${id}/post`, {
    method: 'POST',
  });
}
