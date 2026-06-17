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

export type SalesDocumentsFilterOption = {
  label: string;
  value: string;
};

export type SalesDocumentsMetric = {
  id: string;
  label: string;
  value: number | string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
};

export type SalesDocumentsCell =
  | string
  | { text: string; tone?: 'amber' | 'blue' | 'gray' | 'green' | 'red'; emphasis?: boolean; align?: 'left' | 'right' | 'center' };

export type SalesInvoiceRow = {
  id: string;
  invoiceNumber: string;
  invoiceDate: string | null;
  invoiceDateLabel: string;
  customerId: string;
  customerCode: string;
  customerLabel: string;
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
  sourceType: string;
  sourceReference: string;
  receivableAccountLabel: string;
  postedJournalEntryId: string;
  cells: SalesDocumentsCell[];
};

export type SalesInvoiceRegisterResponse = {
  section: {
    id: string;
    label: string;
    description: string;
    searchPlaceholder: string;
    filters: {
      statuses: SalesDocumentsFilterOption[];
      postingStatuses: SalesDocumentsFilterOption[];
      customers: SalesDocumentsFilterOption[];
      quickFilters: SalesDocumentsFilterOption[];
    };
    metrics: SalesDocumentsMetric[];
    table: {
      title: string;
      description: string;
      columns: Array<string | { label: string; align: string }>;
      rows: SalesInvoiceRow[];
    };
  };
  appliedFilters: {
    search: string;
    statuses: string[];
    postingStatuses: string[];
    customerIds: string[];
    quickFilters: string[];
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
    chartAccounts: Array<{ id: number | string; code: string | null; name: string | null }>;
    taxCodes: Array<{ id: number | string; code: string | null; name: string | null; rate: number; calculationMethod: string }>;
  };
};

export type SalesInvoiceLineDetail = {
  id: string;
  lineNumber: number;
  description: string;
  itemType: string;
  quantity: number;
  unitPrice: number;
  discountAmount: number;
  lineSubtotal: number;
  lineTax: number;
  lineTotal: number;
  taxCodeId: string;
  taxCodeLabel: string;
  taxRate: number;
  taxCalculationMethod: string;
  incomeAccountId: string;
  incomeAccountLabel: string;
  receivableAccountOverrideId: string;
  receivableAccountOverrideLabel: string;
  lineSubtotalLabel: string;
  lineTaxLabel: string;
  lineTotalLabel: string;
};

export type SalesInvoiceDetail = {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customerLabel: string;
  invoiceDate: string | null;
  invoiceDateLabel: string;
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
  discountTotal: number;
  discountTotalLabel: string;
  total: number;
  totalLabel: string;
  balanceDue: number;
  balanceDueLabel: string;
  referenceNumber: string;
  memo: string;
  sourceType: string;
  sourceReference: string;
  receivableAccountOverrideId: string;
  receivableAccountOverrideLabel: string;
  postedJournalEntryId: string;
  notes: string;
  createdAt: string | null;
  updatedAt: string | null;
  lineItems: SalesInvoiceLineDetail[];
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
    appliedCreditNotesCount: number;
    documentCount: number;
    hasDependents: boolean;
  };
};

export type SalesInvoiceDetailRow = {
  id: string;
  invoiceNumber: string;
  customerLabel: string;
  lineItemCount: number;
  lineItemLabel: string;
  taxTotal: number;
  taxTotalLabel: string;
  balanceDue: number;
  balanceDueLabel: string;
  status: string;
  statusLabel: string;
  statusTone: 'amber' | 'blue' | 'gray' | 'green' | 'red';
  documentCount: number;
  documentCountLabel: string;
  journalLinked: boolean;
  postedJournalEntryId: string;
  hasTax: boolean;
  lineDescriptions: string[];
  taxCodeLabels: string[];
  cells: SalesDocumentsCell[];
};

export type SalesInvoiceDetailRegisterResponse = {
  section: {
    id: string;
    label: string;
    description: string;
    searchPlaceholder: string;
    filters: {
      statuses: SalesDocumentsFilterOption[];
      coverage: SalesDocumentsFilterOption[];
      quickFilters: SalesDocumentsFilterOption[];
    };
    metrics: SalesDocumentsMetric[];
    table: {
      title: string;
      description: string;
      columns: Array<string | { label: string; align: string }>;
      rows: SalesInvoiceDetailRow[];
    };
  };
  appliedFilters: {
    search: string;
    statuses: string[];
    coverage: string[];
    quickFilters: string[];
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
};

export type SalesInvoiceMutationInput = {
  invoiceNumber?: string | null;
  customer: string;
  invoiceDate: string;
  postingDate: string;
  dueDate: string;
  status: 'draft' | 'approved';
  currency: string;
  exchangeRate: number;
  referenceNumber?: string | null;
  memo?: string | null;
  sourceType?: string | null;
  sourceReference?: string | null;
  receivableAccountOverride?: string | null;
  notes?: string | null;
  lines: Array<{
    description: string;
    itemType: string;
    quantity: number;
    unitPrice: number;
    discountAmount: number;
    taxCode?: string | null;
    incomeAccount: string;
    receivableAccountOverride?: string | null;
  }>;
};

export type SalesCreditNoteRow = {
  id: string;
  creditNoteNumber: string;
  creditDate: string | null;
  creditDateLabel: string;
  customerId: string;
  customerLabel: string;
  sourceInvoiceId: string;
  sourceInvoiceLabel: string;
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
  cells: SalesDocumentsCell[];
};

export type SalesCreditNoteRegisterResponse = {
  section: {
    id: string;
    label: string;
    description: string;
    searchPlaceholder: string;
    filters: {
      statuses: SalesDocumentsFilterOption[];
      customers: SalesDocumentsFilterOption[];
      quickFilters: SalesDocumentsFilterOption[];
    };
    metrics: SalesDocumentsMetric[];
    table: {
      title: string;
      description: string;
      columns: Array<string | { label: string; align: string }>;
      rows: SalesCreditNoteRow[];
    };
  };
  appliedFilters: {
    search: string;
    statuses: string[];
    customerIds: string[];
    quickFilters: string[];
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
    invoices: Array<{ id: number | string; invoiceNumber: string | null; status: string; balanceDue: number; customerId: string; customerLabel: string }>;
    chartAccounts: Array<{ id: number | string; code: string | null; name: string | null }>;
  };
};

export type SalesCreditNoteDetail = {
  id: string;
  creditNoteNumber: string;
  customerId: string;
  customerLabel: string;
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
  sourceInvoiceId: string;
  sourceInvoiceLabel: string;
  adjustmentAccountId: string;
  adjustmentAccountLabel: string;
  postedJournalEntryId: string;
  reason: string;
  notes: string;
  createdAt: string | null;
  updatedAt: string | null;
  applications: Array<{
    id: string;
    invoiceId: string;
    invoiceLabel: string;
    amountApplied: number;
    amountAppliedLabel: string;
    invoiceBalanceDue: number;
    invoiceBalanceDueLabel: string;
  }>;
  usageSummary: {
    applicationCount: number;
    hasPostedJournalEntry: boolean;
    hasBlockingDependents: boolean;
  };
};

export type SalesCreditNoteMutationInput = {
  creditNoteNumber?: string | null;
  customer: string;
  creditDate: string;
  postingDate: string;
  status: 'draft' | 'approved';
  currency: string;
  subtotal: number;
  taxTotal: number;
  sourceInvoice?: string | null;
  adjustmentAccount: string;
  reason?: string | null;
  notes?: string | null;
  applications: Array<{
    invoice: string;
    amountApplied: number;
  }>;
};

export async function getSalesInvoices(
  query: {
    search?: string;
    page?: number;
    statuses?: string[];
    postingStatuses?: string[];
    customerIds?: string[];
    quickFilters?: string[];
  } = {},
): Promise<SalesInvoiceRegisterResponse> {
  const params = new URLSearchParams();
  if (query.search?.trim()) params.set('search', query.search.trim());
  for (const value of query.statuses || []) params.append('status', value);
  for (const value of query.postingStatuses || []) params.append('postingStatus', value);
  for (const value of query.customerIds || []) params.append('customerId', value);
  for (const value of query.quickFilters || []) params.append('quickFilter', value);
  params.set('page', String(query.page || 1));
  params.set('limit', '10');

  return fetchAccountingAdmin<SalesInvoiceRegisterResponse>(`/accounting/sales-documents/invoices?${params.toString()}`);
}

export async function getSalesInvoiceDetail(id: string | number): Promise<SalesInvoiceDetail> {
  return fetchAccountingAdmin<SalesInvoiceDetail>(`/accounting/sales-documents/invoices/${id}`);
}

export async function getSalesInvoiceDetailRegister(
  query: {
    search?: string;
    page?: number;
    statuses?: string[];
    coverage?: string[];
    quickFilters?: string[];
  } = {},
): Promise<SalesInvoiceDetailRegisterResponse> {
  const params = new URLSearchParams();
  if (query.search?.trim()) params.set('search', query.search.trim());
  for (const value of query.statuses || []) params.append('status', value);
  for (const value of query.coverage || []) params.append('coverage', value);
  for (const value of query.quickFilters || []) params.append('quickFilter', value);
  params.set('page', String(query.page || 1));
  params.set('limit', '10');

  return fetchAccountingAdmin<SalesInvoiceDetailRegisterResponse>(`/accounting/sales-documents/invoice-detail?${params.toString()}`);
}

export async function getSalesCreditNotes(
  query: {
    search?: string;
    page?: number;
    statuses?: string[];
    customerIds?: string[];
    quickFilters?: string[];
  } = {},
): Promise<SalesCreditNoteRegisterResponse> {
  const params = new URLSearchParams();
  if (query.search?.trim()) params.set('search', query.search.trim());
  for (const value of query.statuses || []) params.append('status', value);
  for (const value of query.customerIds || []) params.append('customerId', value);
  for (const value of query.quickFilters || []) params.append('quickFilter', value);
  params.set('page', String(query.page || 1));
  params.set('limit', '10');

  return fetchAccountingAdmin<SalesCreditNoteRegisterResponse>(`/accounting/sales-documents/credit-notes?${params.toString()}`);
}

export async function getSalesCreditNoteDetail(id: string | number): Promise<SalesCreditNoteDetail> {
  return fetchAccountingAdmin<SalesCreditNoteDetail>(`/accounting/sales-documents/credit-notes/${id}`);
}

export async function createSalesInvoice(input: SalesInvoiceMutationInput): Promise<SalesInvoiceDetail> {
  const created = await fetchAccountingAdmin<{ id: string | number }>(`/accounting/invoices`, {
    method: 'POST',
    body: JSON.stringify(input),
  });

  return getSalesInvoiceDetail(created.id);
}

export async function createSalesCreditNote(input: SalesCreditNoteMutationInput): Promise<SalesCreditNoteDetail> {
  const created = await fetchAccountingAdmin<{ id: string | number }>(`/accounting/sales-documents/credit-notes`, {
    method: 'POST',
    body: JSON.stringify(input),
  });

  return getSalesCreditNoteDetail(created.id);
}

export async function updateSalesInvoice(id: string | number, input: SalesInvoiceMutationInput): Promise<SalesInvoiceDetail> {
  return fetchAccountingAdmin<SalesInvoiceDetail>(`/accounting/sales-documents/invoices/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

export async function updateSalesCreditNote(id: string | number, input: SalesCreditNoteMutationInput): Promise<SalesCreditNoteDetail> {
  return fetchAccountingAdmin<SalesCreditNoteDetail>(`/accounting/sales-documents/credit-notes/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

export async function deleteSalesInvoice(id: string | number): Promise<{ success: boolean }> {
  return fetchAccountingAdmin<{ success: boolean }>(`/accounting/sales-documents/invoices/${id}`, {
    method: 'DELETE',
  });
}

export async function deleteSalesCreditNote(id: string | number): Promise<{ success: boolean }> {
  return fetchAccountingAdmin<{ success: boolean }>(`/accounting/sales-documents/credit-notes/${id}`, {
    method: 'DELETE',
  });
}

export async function postSalesInvoice(id: string | number): Promise<SalesInvoiceDetail> {
  await fetchAccountingAdmin(`/accounting/invoices/${id}/post`, {
    method: 'POST',
  });

  return getSalesInvoiceDetail(id);
}

export async function postSalesCreditNote(id: string | number): Promise<SalesCreditNoteDetail> {
  await fetchAccountingAdmin(`/accounting/credit-notes/${id}/post`, {
    method: 'POST',
  });

  return getSalesCreditNoteDetail(id);
}
