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

export type PaymentsFilterOption = {
  label: string;
  value: string;
};

export type PaymentsMetric = {
  id: string;
  label: string;
  value: number | string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
};

export type PaymentsCell =
  | string
  | {
      text: string;
      tone?: 'amber' | 'blue' | 'gray' | 'green' | 'red';
      emphasis?: boolean;
      align?: 'left' | 'right' | 'center';
    };

export type PaymentReceivedRow = {
  id: string;
  receiptNumber: string;
  paymentDate: string | null;
  paymentDateLabel: string;
  customerId: string;
  customerLabel: string;
  paymentMethod: string;
  paymentMethodLabel: string;
  depositAccountLabel: string;
  undepositedFundsAccountLabel: string;
  amountReceived: number;
  amountReceivedLabel: string;
  appliedAmount: number;
  appliedAmountLabel: string;
  unappliedAmount: number;
  unappliedAmountLabel: string;
  status: string;
  statusLabel: string;
  statusTone: 'amber' | 'blue' | 'gray' | 'green' | 'red';
  referenceNumber: string;
  postedJournalEntryId: string;
  searchableText: string;
  cells: PaymentsCell[];
};

export type PaymentReceivedRegisterResponse = {
  rows: PaymentReceivedRow[];
  metrics: PaymentsMetric[];
  filterOptions: {
    statuses: PaymentsFilterOption[];
    paymentMethods: PaymentsFilterOption[];
    customers: PaymentsFilterOption[];
    quickFilters: PaymentsFilterOption[];
  };
  appliedFilters: {
    search: string;
    statuses: string[];
    paymentMethods: string[];
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
    customers: Array<{ id: number | string; customerCode: string | null; displayName: string | null }>;
    invoices: Array<{
      id: number | string;
      invoiceNumber: string | null;
      status: string;
      balanceDue: number;
      customerId: string;
      customerLabel: string;
    }>;
    bankAccounts: Array<{
      id: number | string;
      accountName: string | null;
      bankName: string | null;
      accountNumberMasked: string | null;
      accountType: string | null;
    }>;
    chartAccounts: Array<{ id: number | string; code: string | null; name: string | null }>;
  };
};

export type PaymentReceivedDetail = {
  id: string;
  receiptNumber: string;
  customerId: string;
  customerLabel: string;
  paymentDate: string | null;
  paymentDateLabel: string;
  postingDate: string | null;
  postingDateLabel: string;
  paymentMethod: string;
  paymentMethodLabel: string;
  depositAccountId: string;
  depositAccountLabel: string;
  undepositedFundsAccountId: string;
  undepositedFundsAccountLabel: string;
  amountReceived: number;
  amountReceivedLabel: string;
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
    invoiceId: string;
    invoiceLabel: string;
    invoiceBalanceDue: number;
    invoiceBalanceDueLabel: string;
    invoiceStatus: string;
    invoiceStatusLabel: string;
    amountApplied: number;
    amountAppliedLabel: string;
  }>;
  usageSummary: {
    applicationCount: number;
    hasPostedJournalEntry: boolean;
    canEdit: boolean;
    canDelete: boolean;
  };
};

export type PaymentReceivedMutationInput = {
  receiptNumber?: string | null;
  customer: string;
  paymentDate: string;
  postingDate: string;
  paymentMethod: string;
  depositAccount?: string | null;
  undepositedFundsAccount?: string | null;
  amountReceived: number;
  currency: string;
  exchangeRate: number;
  referenceNumber?: string | null;
  notes?: string | null;
  applications: Array<{
    invoice: string;
    amountApplied: number;
  }>;
};

export async function getPaymentsReceived(
  query: {
    search?: string;
    page?: number;
    statuses?: string[];
    paymentMethods?: string[];
    customerIds?: string[];
    quickFilters?: string[];
  } = {},
): Promise<PaymentReceivedRegisterResponse> {
  const params = new URLSearchParams();
  if (query.search?.trim()) params.set('search', query.search.trim());
  for (const value of query.statuses || []) params.append('status', value);
  for (const value of query.paymentMethods || []) params.append('paymentMethod', value);
  for (const value of query.customerIds || []) params.append('customerId', value);
  for (const value of query.quickFilters || []) params.append('quickFilter', value);
  params.set('page', String(query.page || 1));
  params.set('limit', '10');

  return fetchAccountingAdmin<PaymentReceivedRegisterResponse>(
    `/accounting/sales-receivables/payments-received?${params.toString()}`,
  );
}

export async function getPaymentReceivedDetail(id: string | number): Promise<PaymentReceivedDetail> {
  return fetchAccountingAdmin<PaymentReceivedDetail>(`/accounting/sales-receivables/payments-received/${id}`);
}

export async function createPaymentReceived(input: PaymentReceivedMutationInput): Promise<PaymentReceivedDetail> {
  const created = await fetchAccountingAdmin<{ id: string | number }>(`/accounting/sales-receivables/payments-received`, {
    method: 'POST',
    body: JSON.stringify(input),
  });

  return getPaymentReceivedDetail(created.id);
}

export async function updatePaymentReceived(
  id: string | number,
  input: PaymentReceivedMutationInput,
): Promise<PaymentReceivedDetail> {
  return fetchAccountingAdmin<PaymentReceivedDetail>(`/accounting/sales-receivables/payments-received/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

export async function deletePaymentReceived(id: string | number): Promise<{ success: boolean }> {
  return fetchAccountingAdmin<{ success: boolean }>(`/accounting/sales-receivables/payments-received/${id}`, {
    method: 'DELETE',
  });
}

export async function postPaymentReceived(id: string | number): Promise<PaymentReceivedDetail> {
  await fetchAccountingAdmin(`/accounting/payments-received/${id}/post`, {
    method: 'POST',
  });

  return getPaymentReceivedDetail(id);
}

export type OfficialReceiptRow = {
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
  statusTone: 'amber' | 'blue' | 'gray' | 'green' | 'red';
  proofDocumentId: string;
  proofDocumentLabel: string;
  issuedByLabel: string;
  searchableText: string;
  cells: PaymentsCell[];
};

export type OfficialReceiptRegisterResponse = {
  rows: OfficialReceiptRow[];
  metrics: PaymentsMetric[];
  filterOptions: {
    statuses: PaymentsFilterOption[];
    customers: PaymentsFilterOption[];
    proofStates: PaymentsFilterOption[];
    quickFilters: PaymentsFilterOption[];
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
      id: string | number;
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
      id: string | number;
      filename: string;
      url: string;
    }>;
  };
};

export type OfficialReceiptDetail = {
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
  statusTone: 'amber' | 'blue' | 'gray' | 'green' | 'red';
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

export type OfficialReceiptMutationInput = {
  receiptNumber?: string | null;
  paymentReceived: string;
  proofDocument?: string | null;
  notes?: string | null;
};

export async function getOfficialReceipts(
  query: {
    search?: string;
    page?: number;
    statuses?: string[];
    customerIds?: string[];
    proofStates?: string[];
    quickFilters?: string[];
  } = {},
): Promise<OfficialReceiptRegisterResponse> {
  const params = new URLSearchParams();
  if (query.search?.trim()) params.set('search', query.search.trim());
  for (const value of query.statuses || []) params.append('status', value);
  for (const value of query.customerIds || []) params.append('customerId', value);
  for (const value of query.proofStates || []) params.append('proofState', value);
  for (const value of query.quickFilters || []) params.append('quickFilter', value);
  params.set('page', String(query.page || 1));
  params.set('limit', '10');

  return fetchAccountingAdmin<OfficialReceiptRegisterResponse>(
    `/accounting/sales-receivables/official-receipts?${params.toString()}`,
  );
}

export async function getOfficialReceiptDetail(id: string | number): Promise<OfficialReceiptDetail> {
  return fetchAccountingAdmin<OfficialReceiptDetail>(`/accounting/sales-receivables/official-receipts/${id}`);
}

export async function createOfficialReceipt(input: OfficialReceiptMutationInput): Promise<OfficialReceiptDetail> {
  const created = await fetchAccountingAdmin<{ id: string | number }>(`/accounting/sales-receivables/official-receipts`, {
    method: 'POST',
    body: JSON.stringify(input),
  });

  return getOfficialReceiptDetail(created.id);
}

export async function updateOfficialReceipt(
  id: string | number,
  input: OfficialReceiptMutationInput,
): Promise<OfficialReceiptDetail> {
  return fetchAccountingAdmin<OfficialReceiptDetail>(`/accounting/sales-receivables/official-receipts/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

export async function deleteOfficialReceipt(id: string | number): Promise<{ success: boolean }> {
  return fetchAccountingAdmin<{ success: boolean }>(`/accounting/sales-receivables/official-receipts/${id}`, {
    method: 'DELETE',
  });
}

export async function issueOfficialReceipt(id: string | number): Promise<OfficialReceiptDetail> {
  return fetchAccountingAdmin<OfficialReceiptDetail>(`/accounting/sales-receivables/official-receipts/${id}/issue`, {
    method: 'POST',
  });
}

export async function voidOfficialReceipt(id: string | number): Promise<OfficialReceiptDetail> {
  return fetchAccountingAdmin<OfficialReceiptDetail>(`/accounting/sales-receivables/official-receipts/${id}/void`, {
    method: 'POST',
  });
}

export type CustomerBalanceRow = {
  id: string;
  customerId: string;
  customerCode: string;
  customerLabel: string;
  displayName: string;
  legalName: string;
  customerType: string;
  customerTypeLabel: string;
  paymentTermId: string;
  paymentTermsLabel: string;
  paymentTermDays: number;
  currencyCode: string;
  currencyLabel: string;
  creditLimit: number;
  creditLimitLabel: string;
  balanceDue: number;
  balanceDueLabel: string;
  availableCredit: number;
  availableCreditLabel: string;
  overCreditLimitAmount: number;
  overCreditLimitAmountLabel: string;
  openInvoiceCount: number;
  overdueInvoiceCount: number;
  dueThisWeekCount: number;
  status: string;
  statusLabel: string;
  statusTone: 'amber' | 'blue' | 'gray' | 'green' | 'red';
  searchableText: string;
  cells: PaymentsCell[];
};

export type CustomerBalanceDetail = {
  id: string;
  customerCode: string | null;
  displayName: string | null;
  legalName: string | null;
  customerType: string | null;
  customerTypeLabel: string | null;
  email: string | null;
  phone: string | null;
  billingAddress: string | null;
  shippingAddress: string | null;
  taxId: string | null;
  currencyReferenceId: string;
  currencyLabel: string;
  paymentTermReferenceId: string;
  paymentTermsLabel: string;
  creditLimit: number;
  creditLimitLabel: string;
  currentBalanceDue: number;
  currentBalanceDueLabel: string;
  availableCredit: number;
  availableCreditLabel: string;
  overCreditLimitAmount: number;
  overCreditLimitAmountLabel: string;
  openInvoiceCount: number;
  overdueInvoiceCount: number;
  dueThisWeekCount: number;
  latestInvoiceDate: string | null;
  latestInvoiceDateLabel: string;
  status: string;
  statusLabel: string;
  statusTone: 'amber' | 'blue' | 'gray' | 'green' | 'red';
  notes: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  openInvoices: Array<{
    id: string;
    invoiceNumber: string;
    invoiceDate: string | null;
    invoiceDateLabel: string;
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
    invoiceCount: number;
    paymentReceivedCount: number;
    creditNoteCount: number;
    canDelete: boolean;
  };
};

export type CustomerBalanceMutationInput = {
  customerCode?: string | null;
  displayName?: string;
  legalName?: string | null;
  customerType?: string;
  email?: string | null;
  phone?: string | null;
  billingAddress?: string | null;
  shippingAddress?: string | null;
  taxId?: string | null;
  creditLimit?: number | null;
  status?: string;
  notes?: string | null;
  currencyReference?: number | string | null;
  paymentTermReference?: number | string | null;
};

export type CustomerBalanceRegisterResponse = {
  rows: CustomerBalanceRow[];
  metrics: PaymentsMetric[];
  filterOptions: {
    statuses: PaymentsFilterOption[];
    paymentTerms: PaymentsFilterOption[];
    balanceStates: PaymentsFilterOption[];
    quickFilters: PaymentsFilterOption[];
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
    customerTypes: PaymentsFilterOption[];
    statuses: PaymentsFilterOption[];
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

export async function getCustomerBalances(
  query: {
    search?: string;
    page?: number;
    statuses?: string[];
    paymentTermIds?: string[];
    balanceStates?: string[];
    quickFilters?: string[];
  } = {},
): Promise<CustomerBalanceRegisterResponse> {
  const params = new URLSearchParams();
  if (query.search?.trim()) params.set('search', query.search.trim());
  for (const value of query.statuses || []) params.append('status', value);
  for (const value of query.paymentTermIds || []) params.append('paymentTermId', value);
  for (const value of query.balanceStates || []) params.append('balanceState', value);
  for (const value of query.quickFilters || []) params.append('quickFilter', value);
  params.set('page', String(query.page || 1));
  params.set('limit', '10');

  return fetchAccountingAdmin<CustomerBalanceRegisterResponse>(
    `/accounting/sales-receivables/customer-balances?${params.toString()}`,
  );
}

export async function getCustomerBalanceDetail(id: string | number): Promise<CustomerBalanceDetail> {
  return fetchAccountingAdmin<CustomerBalanceDetail>(`/accounting/sales-receivables/customer-balances/${id}`);
}

export async function updateCustomerBalanceCustomer(
  id: string | number,
  input: CustomerBalanceMutationInput,
): Promise<CustomerBalanceDetail> {
  const payload: CustomerBalanceMutationInput = {
    ...input,
    customerCode: typeof input.customerCode === 'string' ? input.customerCode.trim().toUpperCase() || null : input.customerCode,
    displayName: typeof input.displayName === 'string' ? input.displayName.trim() : input.displayName,
    legalName: typeof input.legalName === 'string' ? input.legalName.trim() || null : input.legalName,
    email: typeof input.email === 'string' ? input.email.trim() || null : input.email,
    phone: typeof input.phone === 'string' ? input.phone.trim() || null : input.phone,
    billingAddress: typeof input.billingAddress === 'string' ? input.billingAddress.trim() || null : input.billingAddress,
    shippingAddress: typeof input.shippingAddress === 'string' ? input.shippingAddress.trim() || null : input.shippingAddress,
    taxId: typeof input.taxId === 'string' ? input.taxId.trim() || null : input.taxId,
    notes: typeof input.notes === 'string' ? input.notes.trim() || null : input.notes,
    creditLimit: typeof input.creditLimit === 'number' ? input.creditLimit : Number(input.creditLimit || 0),
    currencyReference: normalizeRelationshipId(input.currencyReference) ?? input.currencyReference,
    paymentTermReference: normalizeRelationshipId(input.paymentTermReference) ?? input.paymentTermReference,
  };

  await fetchAccountingAdmin(`/accounting/customers/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });

  return getCustomerBalanceDetail(id);
}

export async function deleteCustomerBalanceCustomer(id: string | number): Promise<{ success: boolean }> {
  return fetchAccountingAdmin<{ success: boolean }>(`/accounting/customers/${id}`, {
    method: 'DELETE',
  });
}
