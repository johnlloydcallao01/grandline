'use server';

import { getServerToken } from '@/app/actions/auth';
import { env } from '@/lib/env';

export type BusinessPartyMetric = {
  id: string;
  label: string;
  value: number;
  change: string;
  trend: 'up' | 'down' | 'neutral';
};

export type BusinessPartyFilterOption = {
  label: string;
  value: string;
};

export type CustomerRegisterRow = {
  id: number | string;
  customerId: number | string;
  customerCode: string | null;
  displayName: string | null;
  type: string | null;
  typeLabel: string | null;
  currency: string | null;
  currencyReferenceId: number | string | null;
  paymentTerms: string | null;
  paymentTermReferenceId: number | string | null;
  status: string | null;
  statusLabel: string | null;
  creditLimit: number;
  hasCreditLimit: boolean;
  email: string | null;
  legalName: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  cells: Array<string | null>;
};

export type CustomerRegisterResponse = {
  section: {
    id: string;
    label: string;
    description: string;
    searchPlaceholder: string;
    filters: {
      statuses: BusinessPartyFilterOption[];
      customerTypes: BusinessPartyFilterOption[];
      quickFilters: BusinessPartyFilterOption[];
    };
    metrics: BusinessPartyMetric[];
    table: {
      title: string;
      description: string;
      columns: string[];
      rows: CustomerRegisterRow[];
    };
  };
  appliedFilters: {
    search: string;
    statuses: string[];
    customerTypes: string[];
    hasCreditLimit: boolean;
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
    }>;
  };
  totals: {
    totalCustomers: number;
    filteredCustomers: number;
  };
};

export type CustomerDetail = {
  id: number | string;
  customerCode?: string | null;
  displayName?: string | null;
  legalName?: string | null;
  customerType?: string | null;
  email?: string | null;
  phone?: string | null;
  billingAddress?: string | null;
  shippingAddress?: string | null;
  taxId?: string | null;
  creditLimit?: number | null;
  status?: string | null;
  notes?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  currencyReference?: {
    id: number | string;
    code?: string | null;
    name?: string | null;
  } | null;
  paymentTermReference?: {
    id: number | string;
    code?: string | null;
    name?: string | null;
    dueInDays?: number | null;
  } | null;
  usageSummary?: {
    invoiceCount: number;
    paymentReceivedCount: number;
    creditNoteCount: number;
  };
};

export type CreateCustomerInput = {
  customerCode?: string | null;
  displayName: string;
  legalName?: string | null;
  customerType: string;
  email?: string | null;
  phone?: string | null;
  billingAddress?: string | null;
  shippingAddress?: string | null;
  taxId?: string | null;
  creditLimit?: number | null;
  status: string;
  notes?: string | null;
  currencyReference: number | string;
  paymentTermReference: number | string;
};

export type UpdateCustomerInput = {
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


export type VendorRegisterRow = {
  id: number | string;
  vendorId: number | string;
  vendorCode: string | null;
  displayName: string | null;
  type: string | null;
  typeLabel: string | null;
  currency: string | null;
  currencyReferenceId: number | string | null;
  paymentTerms: string | null;
  paymentTermReferenceId: number | string | null;
  status: string | null;
  statusLabel: string | null;
  email: string | null;
  legalName: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  cells: Array<string | null>;
};

export type VendorRegisterResponse = {
  section: {
    id: string;
    label: string;
    description: string;
    searchPlaceholder: string;
    filters: {
      statuses: BusinessPartyFilterOption[];
      vendorTypes: BusinessPartyFilterOption[];
      quickFilters: BusinessPartyFilterOption[];
    };
    metrics: BusinessPartyMetric[];
    table: {
      title: string;
      description: string;
      columns: string[];
      rows: VendorRegisterRow[];
    };
  };
  appliedFilters: {
    search: string;
    statuses: string[];
    vendorTypes: string[];
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
    }>;
  };
  totals: {
    totalVendors: number;
    filteredVendors: number;
  };
};

export type VendorDetail = {
  id: number | string;
  vendorCode?: string | null;
  displayName?: string | null;
  legalName?: string | null;
  vendorType?: string | null;
  email?: string | null;
  phone?: string | null;
  billingAddress?: string | null;
  taxId?: string | null;
  status?: string | null;
  notes?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  currencyReference?: {
    id: number | string;
    code?: string | null;
    name?: string | null;
  } | null;
  paymentTermReference?: {
    id: number | string;
    code?: string | null;
    name?: string | null;
    dueInDays?: number | null;
  } | null;
  usageSummary?: {
    billCount: number;
    paymentMadeCount: number;
    vendorCreditCount: number;
    expenseCount: number;
  };
};

export type CreateVendorInput = {
  vendorCode?: string | null;
  displayName: string;
  legalName?: string | null;
  vendorType: string;
  email?: string | null;
  phone?: string | null;
  billingAddress?: string | null;
  taxId?: string | null;
  status: string;
  notes?: string | null;
  currencyReference: number | string;
  paymentTermReference: number | string;
};

export type UpdateVendorInput = {
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

export type BankAccountRegisterRow = {
  id: number | string;
  bankAccountId: number | string;
  accountName: string | null;
  bankName: string | null;
  type: string | null;
  typeLabel: string | null;
  currency: string | null;
  currencyReferenceId: number | string | null;
  ledgerAccountId: number | string | null;
  ledgerAccountCode: string | null;
  ledgerAccountName: string | null;
  ledgerAccountDisplay: string | null;
  status: string | null;
  statusLabel: string | null;
  isDefaultReceiptAccount: boolean;
  isDefaultDisbursementAccount: boolean;
  isLedgerMapped: boolean;
  accountNumberMasked: string | null;
  branchName: string | null;
  notes: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  cells: Array<string | null>;
};

export type BankAccountRegisterResponse = {
  section: {
    id: string;
    label: string;
    description: string;
    searchPlaceholder: string;
    filters: {
      statuses: BusinessPartyFilterOption[];
      accountTypes: BusinessPartyFilterOption[];
      quickFilters: BusinessPartyFilterOption[];
    };
    metrics: BusinessPartyMetric[];
    table: {
      title: string;
      description: string;
      columns: string[];
      rows: BankAccountRegisterRow[];
    };
  };
  appliedFilters: {
    search: string;
    statuses: string[];
    accountTypes: string[];
    defaultReceiptOnly: boolean;
    defaultDisbursementOnly: boolean;
    ledgerMappedOnly: boolean;
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
  referenceData: {
    currencies: Array<{
      id: number | string;
      code: string | null;
      name: string | null;
    }>;
    ledgerAccounts: Array<{
      id: number | string;
      code: string | null;
      name: string | null;
    }>;
  };
  totals: {
    totalBankAccounts: number;
    filteredBankAccounts: number;
  };
};

export type BankAccountDetail = {
  id: number | string;
  accountName?: string | null;
  accountNumberMasked?: string | null;
  bankName?: string | null;
  branchName?: string | null;
  accountType?: string | null;
  isDefaultReceiptAccount?: boolean | null;
  isDefaultDisbursementAccount?: boolean | null;
  isActive?: boolean | null;
  notes?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  currencyReference?: {
    id: number | string;
    code?: string | null;
    name?: string | null;
  } | null;
  ledgerAccount?: {
    id: number | string;
    code?: string | null;
    name?: string | null;
    isActive?: boolean | null;
  } | null;
  usageSummary?: {
    bankTransactionCount: number;
    bankReconciliationCount: number;
    paymentMadeCount: number;
    paymentReceivedCount: number;
    depositCount: number;
  };
};

export type CreateBankAccountInput = {
  accountName: string;
  accountNumberMasked?: string | null;
  bankName?: string | null;
  branchName?: string | null;
  accountType: string;
  isDefaultReceiptAccount: boolean;
  isDefaultDisbursementAccount: boolean;
  isActive: boolean;
  notes?: string | null;
  currencyReference: number | string;
  ledgerAccount: number | string;
};

type CustomerRegisterQuery = {
  search?: string;
  page?: number;
  statuses?: string[];
  customerTypes?: string[];
  hasCreditLimit?: boolean;
  quickFilters?: string[];
};

type VendorRegisterQuery = {
  search?: string;
  page?: number;
  statuses?: string[];
  vendorTypes?: string[];
  quickFilters?: string[];
};

type BankAccountRegisterQuery = {
  search?: string;
  page?: number;
  statuses?: string[];
  accountTypes?: string[];
  defaultReceiptOnly?: boolean;
  defaultDisbursementOnly?: boolean;
  ledgerMappedOnly?: boolean;
  quickFilters?: string[];
};

function normalizeRelationshipId(value: number | string | null | undefined) {
  if (value === null || value === undefined) {
    return undefined;
  }

  if (typeof value === 'string') {
    const trimmedValue = value.trim();
    if (!trimmedValue) {
      return undefined;
    }

    const numericValue = Number(trimmedValue);
    return Number.isFinite(numericValue) ? numericValue : trimmedValue;
  }

  return value;
}

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

export async function getCustomerRegister(query: CustomerRegisterQuery = {}): Promise<CustomerRegisterResponse> {
  const params = new URLSearchParams();

  if (query.search?.trim()) {
    params.set('search', query.search.trim());
  }

  for (const status of query.statuses || []) {
    params.append('status', status);
  }

  for (const customerType of query.customerTypes || []) {
    params.append('customerType', customerType);
  }

  if (query.hasCreditLimit) {
    params.set('hasCreditLimit', 'true');
  }

  for (const quickFilter of query.quickFilters || []) {
    params.append('quickFilter', quickFilter);
  }

  params.set('page', String(query.page || 1));
  params.set('limit', '10');

  return fetchAccountingAdmin<CustomerRegisterResponse>(
    `/accounting/master-records/business-parties/customers?${params.toString()}`,
  );
}

export async function getCustomerDetail(customerId: number | string): Promise<CustomerDetail> {
  return fetchAccountingAdmin<CustomerDetail>(`/accounting/customers/${customerId}`);
}

export async function createCustomer(input: CreateCustomerInput): Promise<CustomerDetail> {
  const payload: CreateCustomerInput = {
    ...input,
    customerCode: typeof input.customerCode === 'string' ? input.customerCode.trim().toUpperCase() || null : null,
    displayName: input.displayName.trim(),
    legalName: typeof input.legalName === 'string' ? input.legalName.trim() || null : input.legalName,
    email: typeof input.email === 'string' ? input.email.trim() || null : input.email,
    phone: typeof input.phone === 'string' ? input.phone.trim() || null : input.phone,
    billingAddress:
      typeof input.billingAddress === 'string' ? input.billingAddress.trim() || null : input.billingAddress,
    shippingAddress:
      typeof input.shippingAddress === 'string' ? input.shippingAddress.trim() || null : input.shippingAddress,
    taxId: typeof input.taxId === 'string' ? input.taxId.trim() || null : input.taxId,
    notes: typeof input.notes === 'string' ? input.notes.trim() || null : input.notes,
    creditLimit: typeof input.creditLimit === 'number' ? input.creditLimit : Number(input.creditLimit || 0),
    currencyReference: normalizeRelationshipId(input.currencyReference) || input.currencyReference,
    paymentTermReference: normalizeRelationshipId(input.paymentTermReference) || input.paymentTermReference,
  };

  return fetchAccountingAdmin<CustomerDetail>(`/accounting/customers`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateCustomer(
  customerId: number | string,
  input: UpdateCustomerInput,
): Promise<CustomerDetail> {
  const payload: UpdateCustomerInput = {
    ...input,
    customerCode: typeof input.customerCode === 'string' ? input.customerCode.trim().toUpperCase() || null : input.customerCode,
    displayName: typeof input.displayName === 'string' ? input.displayName.trim() : input.displayName,
    legalName: typeof input.legalName === 'string' ? input.legalName.trim() || null : input.legalName,
    email: typeof input.email === 'string' ? input.email.trim() || null : input.email,
    phone: typeof input.phone === 'string' ? input.phone.trim() || null : input.phone,
    billingAddress:
      typeof input.billingAddress === 'string' ? input.billingAddress.trim() || null : input.billingAddress,
    shippingAddress:
      typeof input.shippingAddress === 'string' ? input.shippingAddress.trim() || null : input.shippingAddress,
    taxId: typeof input.taxId === 'string' ? input.taxId.trim() || null : input.taxId,
    notes: typeof input.notes === 'string' ? input.notes.trim() || null : input.notes,
    creditLimit: typeof input.creditLimit === 'number' ? input.creditLimit : Number(input.creditLimit || 0),
    currencyReference: normalizeRelationshipId(input.currencyReference) ?? input.currencyReference,
    paymentTermReference: normalizeRelationshipId(input.paymentTermReference) ?? input.paymentTermReference,
  };

  return fetchAccountingAdmin<CustomerDetail>(`/accounting/customers/${customerId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function deleteCustomer(
  customerId: number | string,
): Promise<{ success: boolean }> {
  return fetchAccountingAdmin<{ success: boolean }>(`/accounting/customers/${customerId}`, {
    method: 'DELETE',
  });
}

export async function getVendorRegister(query: VendorRegisterQuery = {}): Promise<VendorRegisterResponse> {
  const params = new URLSearchParams();

  if (query.search?.trim()) {
    params.set('search', query.search.trim());
  }

  for (const status of query.statuses || []) {
    params.append('status', status);
  }

  for (const vendorType of query.vendorTypes || []) {
    params.append('vendorType', vendorType);
  }

  for (const quickFilter of query.quickFilters || []) {
    params.append('quickFilter', quickFilter);
  }

  params.set('page', String(query.page || 1));
  params.set('limit', '10');

  return fetchAccountingAdmin<VendorRegisterResponse>(
    `/accounting/master-records/business-parties/vendors?${params.toString()}`,
  );
}

export async function getVendorDetail(vendorId: number | string): Promise<VendorDetail> {
  return fetchAccountingAdmin<VendorDetail>(`/accounting/vendors/${vendorId}`);
}

export async function createVendor(input: CreateVendorInput): Promise<VendorDetail> {
  const payload: CreateVendorInput = {
    ...input,
    vendorCode: typeof input.vendorCode === 'string' ? input.vendorCode.trim().toUpperCase() || null : null,
    displayName: input.displayName.trim(),
    legalName: typeof input.legalName === 'string' ? input.legalName.trim() || null : input.legalName,
    email: typeof input.email === 'string' ? input.email.trim() || null : input.email,
    phone: typeof input.phone === 'string' ? input.phone.trim() || null : input.phone,
    billingAddress:
      typeof input.billingAddress === 'string' ? input.billingAddress.trim() || null : input.billingAddress,
    taxId: typeof input.taxId === 'string' ? input.taxId.trim() || null : input.taxId,
    notes: typeof input.notes === 'string' ? input.notes.trim() || null : input.notes,
    currencyReference: normalizeRelationshipId(input.currencyReference) || input.currencyReference,
    paymentTermReference: normalizeRelationshipId(input.paymentTermReference) || input.paymentTermReference,
  };

  return fetchAccountingAdmin<VendorDetail>(`/accounting/vendors`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateVendor(
  vendorId: number | string,
  input: UpdateVendorInput,
): Promise<VendorDetail> {
  const payload: UpdateVendorInput = {
    ...input,
    vendorCode: typeof input.vendorCode === 'string' ? input.vendorCode.trim().toUpperCase() || null : input.vendorCode,
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

  return fetchAccountingAdmin<VendorDetail>(`/accounting/vendors/${vendorId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function deleteVendor(
  vendorId: number | string,
): Promise<{ success: boolean }> {
  return fetchAccountingAdmin<{ success: boolean }>(`/accounting/vendors/${vendorId}`, {
    method: 'DELETE',
  });
}

export type UpdateBankAccountInput = {
  accountName?: string;
  accountNumberMasked?: string | null;
  bankName?: string | null;
  branchName?: string | null;
  accountType?: string;
  isDefaultReceiptAccount?: boolean;
  isDefaultDisbursementAccount?: boolean;
  isActive?: boolean;
  notes?: string | null;
  currencyReference?: number | string | null;
  ledgerAccount?: number | string | null;
};

export async function getBankAccountRegister(
  query: BankAccountRegisterQuery = {},
): Promise<BankAccountRegisterResponse> {
  const params = new URLSearchParams();

  if (query.search?.trim()) {
    params.set('search', query.search.trim());
  }

  for (const status of query.statuses || []) {
    params.append('status', status);
  }

  for (const accountType of query.accountTypes || []) {
    params.append('accountType', accountType);
  }

  if (query.defaultReceiptOnly) {
    params.set('defaultReceiptOnly', 'true');
  }

  if (query.defaultDisbursementOnly) {
    params.set('defaultDisbursementOnly', 'true');
  }

  if (query.ledgerMappedOnly) {
    params.set('ledgerMappedOnly', 'true');
  }

  for (const quickFilter of query.quickFilters || []) {
    params.append('quickFilter', quickFilter);
  }

  params.set('page', String(query.page || 1));
  params.set('limit', '10');

  return fetchAccountingAdmin<BankAccountRegisterResponse>(
    `/accounting/master-records/business-parties/bank-accounts?${params.toString()}`,
  );
}

export async function getBankAccountDetail(
  bankAccountId: number | string,
): Promise<BankAccountDetail> {
  return fetchAccountingAdmin<BankAccountDetail>(`/accounting/bank-accounts/${bankAccountId}`);
}

export async function createBankAccount(input: CreateBankAccountInput): Promise<BankAccountDetail> {
  const payload: CreateBankAccountInput = {
    ...input,
    accountName: input.accountName.trim(),
    accountNumberMasked:
      typeof input.accountNumberMasked === 'string' ? input.accountNumberMasked.trim() || null : input.accountNumberMasked,
    bankName: typeof input.bankName === 'string' ? input.bankName.trim() || null : input.bankName,
    branchName: typeof input.branchName === 'string' ? input.branchName.trim() || null : input.branchName,
    notes: typeof input.notes === 'string' ? input.notes.trim() || null : input.notes,
    currencyReference: normalizeRelationshipId(input.currencyReference) || input.currencyReference,
    ledgerAccount: normalizeRelationshipId(input.ledgerAccount) || input.ledgerAccount,
  };

  return fetchAccountingAdmin<BankAccountDetail>(`/accounting/bank-accounts`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function deleteBankAccount(
  bankAccountId: number | string,
): Promise<{ success: boolean }> {
  return fetchAccountingAdmin<{ success: boolean }>(`/accounting/bank-accounts/${bankAccountId}`, {
    method: 'DELETE',
  });
}

export async function updateBankAccount(
  bankAccountId: number | string,
  input: UpdateBankAccountInput,
): Promise<BankAccountDetail> {
  const payload: UpdateBankAccountInput = {
    ...input,
    accountName: typeof input.accountName === 'string' ? input.accountName.trim() : input.accountName,
    accountNumberMasked:
      typeof input.accountNumberMasked === 'string' ? input.accountNumberMasked.trim() || null : input.accountNumberMasked,
    bankName: typeof input.bankName === 'string' ? input.bankName.trim() || null : input.bankName,
    branchName: typeof input.branchName === 'string' ? input.branchName.trim() || null : input.branchName,
    notes: typeof input.notes === 'string' ? input.notes.trim() || null : input.notes,
    currencyReference: normalizeRelationshipId(input.currencyReference) ?? input.currencyReference,
    ledgerAccount: normalizeRelationshipId(input.ledgerAccount) ?? input.ledgerAccount,
  };

  return fetchAccountingAdmin<BankAccountDetail>(`/accounting/bank-accounts/${bankAccountId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}
