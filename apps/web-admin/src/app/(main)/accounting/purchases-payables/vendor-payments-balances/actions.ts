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

export type PaymentsMadeFilterOption = {
  label: string;
  value: string;
};

export type PaymentsMadeMetric = {
  id: string;
  label: string;
  value: number | string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
};

export type PaymentsMadeCell =
  | string
  | {
      text: string;
      tone?: 'amber' | 'blue' | 'gray' | 'green' | 'red';
      emphasis?: boolean;
      align?: 'left' | 'right' | 'center';
    };

export type PaymentMadeRow = {
  id: string;
  paymentNumber: string;
  paymentDate: string | null;
  paymentDateLabel: string;
  vendorId: string;
  vendorLabel: string;
  paymentMethod: string;
  paymentMethodLabel: string;
  bankAccountId: string;
  bankAccountLabel: string;
  amountPaid: number;
  amountPaidLabel: string;
  appliedAmount: number;
  appliedAmountLabel: string;
  unappliedAmount: number;
  unappliedAmountLabel: string;
  status: string;
  statusLabel: string;
  statusTone: 'amber' | 'blue' | 'gray' | 'green' | 'red';
  referenceNumber: string;
  postedJournalEntryId: string;
  hasApplications: boolean;
  hasUnappliedAmount: boolean;
  searchableText: string;
  cells: PaymentsMadeCell[];
};

export type PaymentsMadeRegisterResponse = {
  rows: PaymentMadeRow[];
  metrics: PaymentsMadeMetric[];
  filterOptions: {
    statuses: PaymentsMadeFilterOption[];
    paymentMethods: PaymentsMadeFilterOption[];
    vendors: PaymentsMadeFilterOption[];
    applicationStates: PaymentsMadeFilterOption[];
    quickFilters: PaymentsMadeFilterOption[];
  };
  appliedFilters: {
    search: string;
    statuses: string[];
    paymentMethods: string[];
    vendorIds: string[];
    applicationStates: string[];
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
    bills: Array<{
      id: number | string;
      billNumber: string | null;
      vendorId: string;
      vendorLabel: string;
      status: string;
      balanceDue: number;
      currency: string;
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
    mutablePaymentIds: string[];
  };
};

export type PaymentMadeDetail = {
  id: string;
  paymentNumber: string;
  vendorId: string;
  vendorLabel: string;
  vendorCurrency: string;
  vendorPaymentTerms: string;
  paymentDate: string | null;
  paymentDateLabel: string;
  postingDate: string | null;
  postingDateLabel: string;
  paymentMethod: string;
  paymentMethodLabel: string;
  bankAccountId: string;
  bankAccountLabel: string;
  bankAccountType: string;
  amountPaid: number;
  amountPaidLabel: string;
  appliedAmount: number;
  appliedAmountLabel: string;
  unappliedAmount: number;
  unappliedAmountLabel: string;
  currency: string;
  exchangeRate: number;
  status: string;
  statusLabel: string;
  statusTone: 'amber' | 'blue' | 'gray' | 'green' | 'red';
  referenceNumber: string;
  notes: string;
  postedJournalEntryId: string;
  fiscalYearId: string;
  fiscalYearLabel: string;
  periodId: string;
  periodLabel: string;
  createdAt: string | null;
  updatedAt: string | null;
  applications: Array<{
    id: string;
    billId: string;
    billLabel: string;
    billBalanceDue: number;
    billBalanceDueLabel: string;
    billStatus: string;
    billStatusLabel: string;
    amountApplied: number;
    amountAppliedLabel: string;
  }>;
  usageSummary: {
    applicationCount: number;
    documentCount: number;
    matchedBankTransactionCount: number;
    hasPostedJournalEntry: boolean;
    canEdit: boolean;
    canDelete: boolean;
  };
};

export type PaymentMadeMutationInput = {
  paymentNumber?: string | null;
  vendor: string;
  paymentDate: string;
  postingDate: string;
  paymentMethod: 'cash' | 'bank_transfer' | 'check' | 'card' | 'e_wallet' | 'other';
  bankAccount: string;
  amountPaid: number;
  currency: string;
  exchangeRate: number;
  referenceNumber?: string | null;
  notes?: string | null;
  applications: Array<{
    bill: string;
    amountApplied: number;
  }>;
};

export async function getPaymentsMade(
  query: {
    search?: string;
    page?: number;
    statuses?: string[];
    paymentMethods?: string[];
    vendorIds?: string[];
    applicationStates?: string[];
    quickFilters?: string[];
  } = {},
): Promise<PaymentsMadeRegisterResponse> {
  const params = new URLSearchParams();
  if (query.search?.trim()) params.set('search', query.search.trim());
  for (const value of query.statuses || []) params.append('status', value);
  for (const value of query.paymentMethods || []) params.append('paymentMethod', value);
  for (const value of query.vendorIds || []) params.append('vendorId', value);
  for (const value of query.applicationStates || []) params.append('applicationState', value);
  for (const value of query.quickFilters || []) params.append('quickFilter', value);
  params.set('page', String(query.page || 1));
  params.set('limit', '10');

  return fetchAccountingAdmin<PaymentsMadeRegisterResponse>(
    `/accounting/purchases-payables/payments-made?${params.toString()}`,
  );
}

export async function getPaymentMadeDetail(id: string | number): Promise<PaymentMadeDetail> {
  return fetchAccountingAdmin<PaymentMadeDetail>(`/accounting/purchases-payables/payments-made/${id}`);
}

export async function createPaymentMade(input: PaymentMadeMutationInput): Promise<PaymentMadeDetail> {
  return fetchAccountingAdmin<PaymentMadeDetail>(`/accounting/purchases-payables/payments-made`, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function updatePaymentMade(
  id: string | number,
  input: PaymentMadeMutationInput,
): Promise<PaymentMadeDetail> {
  return fetchAccountingAdmin<PaymentMadeDetail>(`/accounting/purchases-payables/payments-made/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

export async function deletePaymentMade(id: string | number): Promise<{ success: boolean }> {
  return fetchAccountingAdmin<{ success: boolean }>(`/accounting/purchases-payables/payments-made/${id}`, {
    method: 'DELETE',
  });
}

export async function postPaymentMade(id: string | number): Promise<PaymentMadeDetail> {
  return fetchAccountingAdmin<PaymentMadeDetail>(`/accounting/purchases-payables/payments-made/${id}/post`, {
    method: 'POST',
  });
}

export type VendorBalanceRow = {
  id: string;
  vendorId: string;
  vendorCode: string;
  vendorLabel: string;
  displayName: string;
  legalName: string;
  vendorType: string;
  vendorTypeLabel: string;
  paymentTermId: string;
  paymentTermsLabel: string;
  paymentTermDays: number;
  currencyCode: string;
  currencyLabel: string;
  balanceDue: number;
  balanceDueLabel: string;
  openBillCount: number;
  overdueBillCount: number;
  dueThisWeekCount: number;
  highBalanceThreshold: number;
  highBalanceAmount: number;
  highBalanceAmountLabel: string;
  status: string;
  statusLabel: string;
  statusTone: 'amber' | 'blue' | 'gray' | 'green' | 'red';
  searchableText: string;
  cells: PaymentsMadeCell[];
};

export type VendorBalanceDetail = {
  id: string;
  vendorCode: string | null;
  displayName: string | null;
  legalName: string | null;
  vendorType: string | null;
  vendorTypeLabel: string | null;
  email: string | null;
  phone: string | null;
  billingAddress: string | null;
  taxId: string | null;
  currencyReferenceId: string;
  currencyLabel: string;
  paymentTermReferenceId: string;
  paymentTermsLabel: string;
  currentBalanceDue: number;
  currentBalanceDueLabel: string;
  openBillCount: number;
  overdueBillCount: number;
  dueThisWeekCount: number;
  highBalanceAmount: number;
  highBalanceAmountLabel: string;
  latestBillDate: string | null;
  latestBillDateLabel: string;
  status: string;
  statusLabel: string;
  statusTone: 'amber' | 'blue' | 'gray' | 'green' | 'red';
  notes: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  openBills: Array<{
    id: string;
    billNumber: string;
    billDate: string | null;
    billDateLabel: string;
    dueDate: string | null;
    dueDateLabel: string;
    status: string;
    statusLabel: string;
    statusTone: 'amber' | 'blue' | 'gray' | 'green' | 'red';
    currency: string;
    total: number;
    totalLabel: string;
    balanceDue: number;
    balanceDueLabel: string;
    referenceNumber: string;
    memo: string;
    postedJournalEntryId: string;
  }>;
  usageSummary: {
    billCount: number;
    paymentMadeCount: number;
    vendorCreditCount: number;
    expenseCount: number;
    canDelete: boolean;
  };
};

export type VendorBalanceMutationInput = {
  vendorCode?: string | null;
  displayName?: string;
  legalName?: string | null;
  vendorType?: string;
  email?: string | null;
  phone?: string | null;
  billingAddress?: string | null;
  taxId?: string | null;
  status?: string;
  notes?: string | null;
  currencyReference?: number | string | null;
  paymentTermReference?: number | string | null;
};

export type VendorBalanceRegisterResponse = {
  rows: VendorBalanceRow[];
  metrics: PaymentsMadeMetric[];
  filterOptions: {
    statuses: PaymentsMadeFilterOption[];
    paymentTerms: PaymentsMadeFilterOption[];
    balanceStates: PaymentsMadeFilterOption[];
    quickFilters: PaymentsMadeFilterOption[];
  };
  appliedFilters: {
    search: string;
    statuses: string[];
    paymentTermIds: string[];
    balanceStates: string[];
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
      id: number | string;
      code: string | null;
      name: string | null;
    }>;
    paymentTerms: Array<{
      id: number | string;
      code: string | null;
      name: string | null;
      dueInDays: number;
      label: string;
    }>;
    vendorTypes: PaymentsMadeFilterOption[];
    statuses: PaymentsMadeFilterOption[];
  };
};

function normalizeRelationshipId(value: number | string | null | undefined) {
  if (value === null || value === undefined) {
    return undefined;
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return undefined;
    const numericValue = Number(trimmed);
    return Number.isFinite(numericValue) ? numericValue : trimmed;
  }

  return value;
}

export async function getVendorBalances(
  query: {
    search?: string;
    page?: number;
    statuses?: string[];
    paymentTermIds?: string[];
    balanceStates?: string[];
    quickFilters?: string[];
  } = {},
): Promise<VendorBalanceRegisterResponse> {
  const params = new URLSearchParams();
  if (query.search?.trim()) params.set('search', query.search.trim());
  for (const value of query.statuses || []) params.append('status', value);
  for (const value of query.paymentTermIds || []) params.append('paymentTermId', value);
  for (const value of query.balanceStates || []) params.append('balanceState', value);
  for (const value of query.quickFilters || []) params.append('quickFilter', value);
  params.set('page', String(query.page || 1));
  params.set('limit', '10');

  return fetchAccountingAdmin<VendorBalanceRegisterResponse>(
    `/accounting/purchases-payables/vendor-balances?${params.toString()}`,
  );
}

export async function getVendorBalanceDetail(id: string | number): Promise<VendorBalanceDetail> {
  return fetchAccountingAdmin<VendorBalanceDetail>(`/accounting/purchases-payables/vendor-balances/${id}`);
}

export async function updateVendorBalanceVendor(
  id: string | number,
  input: VendorBalanceMutationInput,
): Promise<VendorBalanceDetail> {
  const payload: VendorBalanceMutationInput = {
    ...input,
    vendorCode:
      typeof input.vendorCode === 'string' ? input.vendorCode.trim().toUpperCase() || null : input.vendorCode,
    displayName: typeof input.displayName === 'string' ? input.displayName.trim() : input.displayName,
    legalName: typeof input.legalName === 'string' ? input.legalName.trim() || null : input.legalName,
    email: typeof input.email === 'string' ? input.email.trim() || null : input.email,
    phone: typeof input.phone === 'string' ? input.phone.trim() || null : input.phone,
    billingAddress:
      typeof input.billingAddress === 'string' ? input.billingAddress.trim() || null : input.billingAddress,
    taxId: typeof input.taxId === 'string' ? input.taxId.trim() || null : input.taxId,
    notes: typeof input.notes === 'string' ? input.notes.trim() || null : input.notes,
    currencyReference: normalizeRelationshipId(input.currencyReference) ?? input.currencyReference,
    paymentTermReference: normalizeRelationshipId(input.paymentTermReference) ?? input.paymentTermReference,
  };

  await fetchAccountingAdmin(`/accounting/vendors/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });

  return getVendorBalanceDetail(id);
}

export async function deleteVendorBalanceVendor(id: string | number): Promise<{ success: boolean }> {
  return fetchAccountingAdmin<{ success: boolean }>(`/accounting/vendors/${id}`, {
    method: 'DELETE',
  });
}
