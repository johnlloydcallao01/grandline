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

export type BillsFilterOption = {
  label: string;
  value: string;
};

export type BillsMetric = {
  id: string;
  label: string;
  value: number | string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
};

export type BillsCell =
  | string
  | {
      text: string;
      tone?: 'amber' | 'blue' | 'gray' | 'green' | 'red';
      emphasis?: boolean;
      align?: 'left' | 'right' | 'center';
    };

export type BillRow = {
  id: string;
  billNumber: string;
  vendorId: string;
  vendorCode: string;
  vendorLabel: string;
  billDate: string | null;
  billDateLabel: string;
  dueDate: string | null;
  dueDateLabel: string;
  total: number;
  totalLabel: string;
  balanceDue: number;
  balanceDueLabel: string;
  status: string;
  statusLabel: string;
  statusTone: 'amber' | 'blue' | 'gray' | 'green' | 'red';
  postingStatus: string;
  postingStatusLabel: string;
  referenceNumber: string;
  memo: string;
  postedJournalEntryId: string;
  isDueThisWeek: boolean;
  isOpenPayable: boolean;
  searchableText: string;
  cells: BillsCell[];
};

export type BillDetailRow = {
  id: string;
  billNumber: string;
  vendorId: string;
  vendorLabel: string;
  status: string;
  statusLabel: string;
  statusTone: 'amber' | 'blue' | 'gray' | 'green' | 'red';
  postingStatus: string;
  postingStatusLabel: string;
  taxTotal: number;
  taxTotalLabel: string;
  balanceDue: number;
  balanceDueLabel: string;
  lineItemCount: number;
  lineItemCountLabel: string;
  documentCount: number;
  hasDocuments: boolean;
  hasJournalLink: boolean;
  hasLines: boolean;
  hasTax: boolean;
  searchableText: string;
  cells: BillsCell[];
};

export type BillsRegisterResponse = {
  rows: BillRow[];
  metrics: BillsMetric[];
  filterOptions: {
    statuses: BillsFilterOption[];
    vendors: BillsFilterOption[];
    quickFilters: BillsFilterOption[];
  };
  appliedFilters: {
    search: string;
    statuses: string[];
    vendorIds: string[];
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
    billIdsWithLines: string[];
  };
};

export type BillDetailRegisterResponse = {
  rows: BillDetailRow[];
  metrics: BillsMetric[];
  filterOptions: {
    statuses: BillsFilterOption[];
    vendors: BillsFilterOption[];
    coverageStates: BillsFilterOption[];
    quickFilters: BillsFilterOption[];
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
  referenceData: BillsRegisterResponse['referenceData'];
};

export type BillLineDetail = {
  id: string;
  lineNumber: number;
  description: string;
  quantity: number;
  unitPrice: number;
  lineSubtotal: number;
  lineTax: number;
  lineTotal: number;
  taxCodeId: string;
  taxCodeLabel: string;
  taxRate: number;
  taxCalculationMethod: string;
  expenseAccountId: string;
  expenseAccountLabel: string;
  assetAccountId: string;
  assetAccountLabel: string;
  accountType: 'expense' | 'asset';
  accountId: string;
  accountLabel: string;
  payableAccountOverrideId: string;
  payableAccountOverrideLabel: string;
  lineSubtotalLabel: string;
  lineTaxLabel: string;
  lineTotalLabel: string;
};

export type BillDetail = {
  id: string;
  billNumber: string;
  vendorId: string;
  vendorLabel: string;
  vendorCurrency: string;
  vendorPaymentTerms: string;
  billDate: string | null;
  billDateLabel: string;
  postingDate: string | null;
  postingDateLabel: string;
  dueDate: string | null;
  dueDateLabel: string;
  status: string;
  statusLabel: string;
  postingStatus: string;
  postingStatusLabel: string;
  currency: string;
  exchangeRate: number;
  subtotal: number;
  subtotalLabel: string;
  taxTotal: number;
  taxTotalLabel: string;
  total: number;
  totalLabel: string;
  balanceDue: number;
  balanceDueLabel: string;
  referenceNumber: string;
  memo: string;
  payableAccountOverrideId: string;
  payableAccountOverrideLabel: string;
  postedJournalEntryId: string;
  notes: string;
  createdAt: string | null;
  updatedAt: string | null;
  lineItems: BillLineDetail[];
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
    lineItemCount: number;
    appliedPaymentsCount: number;
    appliedVendorCreditsCount: number;
    documentCount: number;
    hasDependents: boolean;
  };
};

export type BillMutationInput = {
  billNumber?: string | null;
  vendor: string;
  billDate: string;
  postingDate: string;
  dueDate: string;
  status: 'draft' | 'approved';
  currency: string;
  exchangeRate: number;
  referenceNumber?: string | null;
  memo?: string | null;
  payableAccountOverride?: string | null;
  notes?: string | null;
  lines: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    taxCode?: string | null;
    accountType: 'expense' | 'asset';
    accountId: string;
    payableAccountOverride?: string | null;
  }>;
};

export type VendorCreditRow = {
  id: string;
  vendorCreditNumber: string;
  creditDate: string | null;
  creditDateLabel: string;
  vendorId: string;
  vendorLabel: string;
  sourceBillId: string;
  sourceBillLabel: string;
  total: number;
  totalLabel: string;
  appliedAmount: number;
  appliedAmountLabel: string;
  remainingAmount: number;
  remainingAmountLabel: string;
  status: string;
  statusLabel: string;
  statusTone: 'amber' | 'blue' | 'gray' | 'green' | 'red';
  postedJournalEntryId: string;
  reason: string;
  hasApplications: boolean;
  hasSourceBill: boolean;
  hasRemainingCredit: boolean;
  searchableText: string;
  cells: BillsCell[];
};

export type VendorCreditRegisterResponse = {
  rows: VendorCreditRow[];
  metrics: BillsMetric[];
  filterOptions: {
    statuses: BillsFilterOption[];
    vendors: BillsFilterOption[];
    balanceStates: BillsFilterOption[];
    quickFilters: BillsFilterOption[];
  };
  appliedFilters: {
    search: string;
    statuses: string[];
    vendorIds: string[];
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
  referenceData: BillsRegisterResponse['referenceData'] & {
    bills: Array<{
      id: number | string;
      billNumber: string | null;
      vendorId: number | string | null;
      vendorLabel: string;
      status: string | null;
      billDate: string | null;
      dueDate: string | null;
      total: number;
      balanceDue: number;
      currency: string;
    }>;
  };
};

export type VendorCreditDetail = {
  id: string;
  vendorCreditNumber: string;
  vendorId: string;
  vendorLabel: string;
  vendorCurrency: string;
  vendorPaymentTerms: string;
  creditDate: string | null;
  creditDateLabel: string;
  postingDate: string | null;
  postingDateLabel: string;
  status: string;
  statusLabel: string;
  currency: string;
  subtotal: number;
  subtotalLabel: string;
  taxTotal: number;
  taxTotalLabel: string;
  total: number;
  totalLabel: string;
  appliedAmount: number;
  appliedAmountLabel: string;
  remainingAmount: number;
  remainingAmountLabel: string;
  sourceBillId: string;
  sourceBillLabel: string;
  sourceBillBalanceDue: number;
  sourceBillBalanceDueLabel: string;
  adjustmentAccountId: string;
  adjustmentAccountLabel: string;
  postedJournalEntryId: string;
  reason: string;
  notes: string;
  createdAt: string | null;
  updatedAt: string | null;
  applications: Array<{
    id: string;
    billId: string;
    billLabel: string;
    amountApplied: number;
    amountAppliedLabel: string;
    billBalanceDue: number;
    billBalanceDueLabel: string;
  }>;
  usageSummary: {
    applicationCount: number;
    hasPostedJournalEntry: boolean;
    hasBlockingDependents: boolean;
  };
};

export type VendorCreditMutationInput = {
  vendorCreditNumber?: string | null;
  vendor: string;
  creditDate: string;
  postingDate: string;
  status: 'draft' | 'approved';
  currency: string;
  subtotal: number;
  taxTotal: number;
  sourceBill?: string | null;
  adjustmentAccount: string;
  reason?: string | null;
  notes?: string | null;
  applications: Array<{
    bill: string;
    amountApplied: number;
  }>;
};

export async function getBills(
  query: {
    search?: string;
    page?: number;
    statuses?: string[];
    vendorIds?: string[];
    quickFilters?: string[];
  } = {},
): Promise<BillsRegisterResponse> {
  const params = new URLSearchParams();
  if (query.search?.trim()) params.set('search', query.search.trim());
  for (const value of query.statuses || []) params.append('status', value);
  for (const value of query.vendorIds || []) params.append('vendorId', value);
  for (const value of query.quickFilters || []) params.append('quickFilter', value);
  params.set('page', String(query.page || 1));
  params.set('limit', '10');

  return fetchAccountingAdmin<BillsRegisterResponse>(
    `/accounting/purchases-payables/bills?${params.toString()}`,
  );
}

export async function getBillDetail(id: string | number): Promise<BillDetail> {
  return fetchAccountingAdmin<BillDetail>(`/accounting/purchases-payables/bills/${id}`);
}

export async function getBillDetailRegister(
  query: {
    search?: string;
    page?: number;
    statuses?: string[];
    vendorIds?: string[];
    coverageStates?: string[];
    quickFilters?: string[];
  } = {},
): Promise<BillDetailRegisterResponse> {
  const params = new URLSearchParams();
  if (query.search?.trim()) params.set('search', query.search.trim());
  for (const value of query.statuses || []) params.append('status', value);
  for (const value of query.vendorIds || []) params.append('vendorId', value);
  for (const value of query.coverageStates || []) params.append('coverage', value);
  for (const value of query.quickFilters || []) params.append('quickFilter', value);
  params.set('page', String(query.page || 1));
  params.set('limit', '10');

  return fetchAccountingAdmin<BillDetailRegisterResponse>(
    `/accounting/purchases-payables/bill-detail?${params.toString()}`,
  );
}

export async function createBill(input: BillMutationInput): Promise<BillDetail> {
  return fetchAccountingAdmin<BillDetail>(`/accounting/purchases-payables/bills`, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function updateBill(id: string | number, input: BillMutationInput): Promise<BillDetail> {
  return fetchAccountingAdmin<BillDetail>(`/accounting/purchases-payables/bills/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

export async function deleteBill(id: string | number): Promise<{ success: boolean }> {
  return fetchAccountingAdmin<{ success: boolean }>(`/accounting/purchases-payables/bills/${id}`, {
    method: 'DELETE',
  });
}

export async function postBill(id: string | number): Promise<BillDetail> {
  return fetchAccountingAdmin<BillDetail>(`/accounting/purchases-payables/bills/${id}/post`, {
    method: 'POST',
  });
}

export async function getVendorCredits(
  query: {
    search?: string;
    page?: number;
    statuses?: string[];
    vendorIds?: string[];
    balanceStates?: string[];
    quickFilters?: string[];
  } = {},
): Promise<VendorCreditRegisterResponse> {
  const params = new URLSearchParams();
  if (query.search?.trim()) params.set('search', query.search.trim());
  for (const value of query.statuses || []) params.append('status', value);
  for (const value of query.vendorIds || []) params.append('vendorId', value);
  for (const value of query.balanceStates || []) params.append('balance', value);
  for (const value of query.quickFilters || []) params.append('quickFilter', value);
  params.set('page', String(query.page || 1));
  params.set('limit', '10');

  return fetchAccountingAdmin<VendorCreditRegisterResponse>(
    `/accounting/purchases-payables/vendor-credits?${params.toString()}`,
  );
}

export async function getVendorCreditDetail(id: string | number): Promise<VendorCreditDetail> {
  return fetchAccountingAdmin<VendorCreditDetail>(`/accounting/purchases-payables/vendor-credits/${id}`);
}

export async function createVendorCredit(input: VendorCreditMutationInput): Promise<VendorCreditDetail> {
  return fetchAccountingAdmin<VendorCreditDetail>(`/accounting/purchases-payables/vendor-credits`, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function updateVendorCredit(
  id: string | number,
  input: VendorCreditMutationInput,
): Promise<VendorCreditDetail> {
  return fetchAccountingAdmin<VendorCreditDetail>(`/accounting/purchases-payables/vendor-credits/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

export async function deleteVendorCredit(id: string | number): Promise<{ success: boolean }> {
  return fetchAccountingAdmin<{ success: boolean }>(`/accounting/purchases-payables/vendor-credits/${id}`, {
    method: 'DELETE',
  });
}

export async function postVendorCredit(id: string | number): Promise<VendorCreditDetail> {
  return fetchAccountingAdmin<VendorCreditDetail>(
    `/accounting/purchases-payables/vendor-credits/${id}/post`,
    {
      method: 'POST',
    },
  );
}
