'use server';

import { getServerToken } from '@/app/actions/auth';
import { env } from '@/lib/env';

export type CoreAccountingMetric = {
  id: string;
  label: string;
  value: number;
  change: string;
  trend: 'up' | 'down' | 'neutral';
};

export type CoreAccountingFilterOption = {
  label: string;
  value: string;
};

export type ChartOfAccountRegisterRow = {
  id: number | string;
  accountId: number | string;
  code: string | null;
  name: string | null;
  accountType: string | null;
  accountTypeLabel: string | null;
  accountSubType: string | null;
  accountSubTypeLabel: string | null;
  parentAccountId: number | string | null;
  parentAccountCode: string | null;
  parentAccountName: string | null;
  parentAccountDisplay: string | null;
  hierarchyLevel: number;
  normalBalance: string | null;
  normalBalanceLabel: string | null;
  status: string;
  statusLabel: string;
  allowManualEntries: boolean;
  isControlAccount: boolean;
  isRetainedEarnings: boolean;
  isSuspenseAccount: boolean;
  description: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  cells: Array<string | null>;
};

export type ChartOfAccountsRegisterResponse = {
  section: {
    id: string;
    label: string;
    description: string;
    searchPlaceholder: string;
    filters: {
      statuses: CoreAccountingFilterOption[];
      accountTypes: CoreAccountingFilterOption[];
      accountSubTypes: CoreAccountingFilterOption[];
      quickFilters: CoreAccountingFilterOption[];
    };
    metrics: CoreAccountingMetric[];
    table: {
      title: string;
      description: string;
      columns: string[];
      rows: ChartOfAccountRegisterRow[];
    };
  };
  appliedFilters: {
    search: string;
    statuses: string[];
    accountTypes: string[];
    accountSubTypes: string[];
    controlAccountsOnly: boolean;
    manualEntriesOnly: boolean;
    retainedEarningsOnly: boolean;
    parentAccountsOnly: boolean;
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
    parentAccounts: Array<{
      id: number | string;
      code: string | null;
      name: string | null;
      accountType: string | null;
      isActive: boolean;
    }>;
  };
  totals: {
    totalAccounts: number;
    filteredAccounts: number;
    activeAccounts: number;
    controlAccounts: number;
    manualEntryAllowed: number;
    parentAccounts: number;
  };
};

export type ChartOfAccountDetail = {
  id: number | string;
  code?: string | null;
  name?: string | null;
  accountType?: string | null;
  accountSubType?: string | null;
  normalBalance?: string | null;
  isActive?: boolean | null;
  allowManualEntries?: boolean | null;
  isControlAccount?: boolean | null;
  isRetainedEarnings?: boolean | null;
  isSuspenseAccount?: boolean | null;
  description?: string | null;
  sortOrder?: number | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  parentAccount?: {
    id: number | string;
    code?: string | null;
    name?: string | null;
  } | null;
  usageSummary?: {
    journalLineCount: number;
    childAccountCount: number;
    taxCodeCount: number;
    hasTransactions: boolean;
  };
  editPermissions?: {
    canEdit: boolean;
    canEditAccountType: boolean;
    canEditNormalBalance: boolean;
    canEditParentAccount: boolean;
    restrictionReason?: string | null;
  };
};

export type CreateChartOfAccountInput = {
  code: string;
  name: string;
  accountType: string;
  accountSubType?: string | null;
  normalBalance: string;
  parentAccount?: number | string | null;
  isActive: boolean;
  allowManualEntries: boolean;
  isControlAccount: boolean;
  isRetainedEarnings: boolean;
  isSuspenseAccount: boolean;
  description?: string | null;
  sortOrder?: number | null;
};

export type UpdateChartOfAccountInput = {
  code: string;
  name: string;
  accountType: string;
  accountSubType?: string | null;
  normalBalance: string;
  parentAccount?: number | string | null;
  isActive: boolean;
  allowManualEntries: boolean;
  isControlAccount: boolean;
  isRetainedEarnings: boolean;
  isSuspenseAccount: boolean;
  description?: string | null;
  sortOrder?: number | null;
};

type ChartOfAccountsRegisterQuery = {
  search?: string;
  page?: number;
  statuses?: string[];
  accountTypes?: string[];
  accountSubTypes?: string[];
  controlAccountsOnly?: boolean;
  manualEntriesOnly?: boolean;
  retainedEarningsOnly?: boolean;
  parentAccountsOnly?: boolean;
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

async function getAuthHeaders(contentType = false) {
  const token = await getServerToken();

  if (!token) {
    throw new Error('No admin session available.');
  }

  return {
    Authorization: `JWT ${token}`,
    ...(contentType ? { 'Content-Type': 'application/json' } : {}),
  };
}

async function fetchAccountingAdmin<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${env.NEXT_PUBLIC_API_URL}${path}`, {
    ...init,
    headers: {
      ...(await getAuthHeaders(init?.body ? true : false)),
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

export async function getChartOfAccountsRegister(
  query: ChartOfAccountsRegisterQuery = {},
): Promise<ChartOfAccountsRegisterResponse> {
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

  for (const accountSubType of query.accountSubTypes || []) {
    params.append('accountSubType', accountSubType);
  }

  if (query.controlAccountsOnly) {
    params.set('controlAccountsOnly', 'true');
  }

  if (query.manualEntriesOnly) {
    params.set('manualEntriesOnly', 'true');
  }

  if (query.retainedEarningsOnly) {
    params.set('retainedEarningsOnly', 'true');
  }

  if (query.parentAccountsOnly) {
    params.set('parentAccountsOnly', 'true');
  }

  for (const quickFilter of query.quickFilters || []) {
    params.append('quickFilter', quickFilter);
  }

  params.set('page', String(query.page || 1));
  params.set('limit', '10');

  return fetchAccountingAdmin<ChartOfAccountsRegisterResponse>(
    `/accounting/master-records/core-accounting-masters/chart-of-accounts?${params.toString()}`,
  );
}

export async function getChartOfAccountDetail(
  accountId: number | string,
): Promise<ChartOfAccountDetail> {
  return fetchAccountingAdmin<ChartOfAccountDetail>(`/accounting/chart-of-accounts/${accountId}`);
}

export async function createChartOfAccount(
  input: CreateChartOfAccountInput,
): Promise<ChartOfAccountDetail> {
  const payload: CreateChartOfAccountInput = {
    ...input,
    code: input.code.trim().toUpperCase(),
    name: input.name.trim(),
    accountSubType:
      typeof input.accountSubType === 'string' ? input.accountSubType.trim() || null : input.accountSubType,
    parentAccount: normalizeRelationshipId(input.parentAccount),
    description: typeof input.description === 'string' ? input.description.trim() || null : input.description,
  };

  return fetchAccountingAdmin<ChartOfAccountDetail>(`/accounting/chart-of-accounts`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateChartOfAccount(
  accountId: number | string,
  input: UpdateChartOfAccountInput,
): Promise<ChartOfAccountDetail> {
  const payload: UpdateChartOfAccountInput = {
    ...input,
    code: input.code.trim().toUpperCase(),
    name: input.name.trim(),
    accountSubType:
      typeof input.accountSubType === 'string' ? input.accountSubType.trim() || null : input.accountSubType,
    parentAccount: normalizeRelationshipId(input.parentAccount),
    description: typeof input.description === 'string' ? input.description.trim() || null : input.description,
  };

  return fetchAccountingAdmin<ChartOfAccountDetail>(`/accounting/chart-of-accounts/${accountId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function deleteChartOfAccount(
  accountId: number | string,
): Promise<{ success: boolean }> {
  return fetchAccountingAdmin<{ success: boolean }>(`/accounting/chart-of-accounts/${accountId}`, {
    method: 'DELETE',
  });
}

export type FiscalYearRegisterRow = {
  id: number | string;
  code: string | null;
  name: string | null;
  startDate: string | null;
  endDate: string | null;
  dateRange: string | null;
  status: string | null;
  statusLabel: string | null;
  closeMode: string | null;
  closeModeLabel: string | null;
  lockedFromDate: string | null;
  closedAt: string | null;
  closedByName: string | null;
  periodCount: number;
  notes: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  cells: Array<string | null>;
};

export type FiscalYearsRegisterResponse = {
  section: {
    id: string;
    label: string;
    description: string;
    searchPlaceholder: string;
    filters: {
      statuses: CoreAccountingFilterOption[];
      closeModes: CoreAccountingFilterOption[];
      quickFilters: CoreAccountingFilterOption[];
    };
    metrics: CoreAccountingMetric[];
    table: {
      title: string;
      description: string;
      columns: string[];
      rows: FiscalYearRegisterRow[];
    };
  };
  appliedFilters: {
    search: string;
    statuses: string[];
    closeModes: string[];
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
    totalYears: number;
    filteredYears: number;
    configuredYears: number;
    closedYears: number;
    openYears: number;
    lockedFromDates: number;
  };
};

export type FiscalYearDetail = {
  id: number | string;
  code?: string | null;
  name?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  status?: string | null;
  closeMode?: string | null;
  lockedFromDate?: string | null;
  closedAt?: string | null;
  closedBy?: { id: number | string; name?: string | null } | number | null;
  notes?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  usageSummary?: {
    periodCount: number;
    budgetCount: number;
    journalEntryCount: number;
    hasPeriods: boolean;
  };
  editPermissions?: {
    canEdit: boolean;
    canEditStartDate: boolean;
    canEditEndDate: boolean;
    restrictionReason?: string | null;
  };
};

export type CreateFiscalYearInput = {
  code: string;
  name: string;
  startDate: string;
  endDate: string;
  status: string;
  closeMode: string;
  lockedFromDate?: string | null;
  notes?: string | null;
};

export type UpdateFiscalYearInput = {
  code: string;
  name: string;
  startDate: string;
  endDate: string;
  status: string;
  closeMode: string;
  lockedFromDate?: string | null;
  notes?: string | null;
};

type FiscalYearsRegisterQuery = {
  search?: string;
  page?: number;
  statuses?: string[];
  closeModes?: string[];
  quickFilters?: string[];
};

export async function getFiscalYearsRegister(
  query: FiscalYearsRegisterQuery = {},
): Promise<FiscalYearsRegisterResponse> {
  const params = new URLSearchParams();

  if (query.search?.trim()) {
    params.set('search', query.search.trim());
  }

  for (const status of query.statuses || []) {
    params.append('status', status);
  }

  for (const closeMode of query.closeModes || []) {
    params.append('closeMode', closeMode);
  }

  for (const quickFilter of query.quickFilters || []) {
    params.append('quickFilter', quickFilter);
  }

  params.set('page', String(query.page || 1));
  params.set('limit', '10');

  return fetchAccountingAdmin<FiscalYearsRegisterResponse>(
    `/accounting/master-records/core-accounting-masters/fiscal-years?${params.toString()}`,
  );
}

export async function getFiscalYearDetail(
  fiscalYearId: number | string,
): Promise<FiscalYearDetail> {
  return fetchAccountingAdmin<FiscalYearDetail>(`/accounting/fiscal-years/${fiscalYearId}`);
}

export async function createFiscalYear(
  input: CreateFiscalYearInput,
): Promise<FiscalYearDetail> {
  const payload: CreateFiscalYearInput = {
    ...input,
    code: input.code.trim().toUpperCase(),
    name: input.name.trim(),
    notes: typeof input.notes === 'string' ? input.notes.trim() || null : null,
    lockedFromDate: typeof input.lockedFromDate === 'string' ? input.lockedFromDate.trim() || null : null,
  };

  return fetchAccountingAdmin<FiscalYearDetail>(`/accounting/fiscal-years`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateFiscalYear(
  fiscalYearId: number | string,
  input: UpdateFiscalYearInput,
): Promise<FiscalYearDetail> {
  const payload: UpdateFiscalYearInput = {
    ...input,
    code: input.code.trim().toUpperCase(),
    name: input.name.trim(),
    notes: typeof input.notes === 'string' ? input.notes.trim() || null : null,
    lockedFromDate: typeof input.lockedFromDate === 'string' ? input.lockedFromDate.trim() || null : null,
  };

  return fetchAccountingAdmin<FiscalYearDetail>(`/accounting/fiscal-years/${fiscalYearId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function deleteFiscalYear(
  fiscalYearId: number | string,
): Promise<{ success: boolean }> {
  return fetchAccountingAdmin<{ success: boolean }>(`/accounting/fiscal-years/${fiscalYearId}`, {
    method: 'DELETE',
  });
}

export type PeriodRegisterRow = {
  id: number | string;
  label: string | null;
  periodNumber: number | null;
  fiscalYearId: number | string | null;
  fiscalYearCode: string | null;
  fiscalYearName: string | null;
  startDate: string | null;
  endDate: string | null;
  dateRange: string | null;
  status: string | null;
  statusLabel: string | null;
  lockedFromDate: string | null;
  closedAt: string | null;
  closedByName: string | null;
  notes: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  cells: Array<string | null>;
};

export type PeriodsRegisterResponse = {
  section: {
    id: string;
    label: string;
    description: string;
    searchPlaceholder: string;
    filters: {
      statuses: CoreAccountingFilterOption[];
      fiscalYears: CoreAccountingFilterOption[];
      quickFilters: CoreAccountingFilterOption[];
    };
    metrics: CoreAccountingMetric[];
    table: {
      title: string;
      description: string;
      columns: string[];
      rows: PeriodRegisterRow[];
    };
  };
  appliedFilters: {
    search: string;
    statuses: string[];
    fiscalYearId: string;
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
    totalPeriods: number;
    filteredPeriods: number;
    openPeriods: number;
    closedPeriods: number;
    softLockedPeriods: number;
    draftPeriods: number;
  };
};

export type PeriodDetail = {
  id: number | string;
  fiscalYear?:
    | { id: number | string; code?: string | null; name?: string | null }
    | number
    | string
    | null;
  periodNumber?: number | null;
  label?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  status?: string | null;
  lockedFromDate?: string | null;
  closedAt?: string | null;
  closedBy?: { id: number | string; name?: string | null } | number | null;
  notes?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  usageSummary?: {
    journalEntryCount: number;
    depreciationEntryCount: number;
    budgetLineCount: number;
  };
};

export type CreatePeriodInput = {
  label: string;
  periodNumber: number;
  fiscalYear: number | string;
  startDate: string;
  endDate: string;
  status: string;
  lockedFromDate?: string | null;
  notes?: string | null;
};

export type UpdatePeriodInput = {
  label: string;
  periodNumber: number;
  fiscalYear?: number | string;
  startDate: string;
  endDate: string;
  status: string;
  lockedFromDate?: string | null;
  notes?: string | null;
};

type PeriodsRegisterQuery = {
  search?: string;
  page?: number;
  statuses?: string[];
  fiscalYearId?: string;
  quickFilters?: string[];
};

export async function getPeriodsRegister(
  query: PeriodsRegisterQuery = {},
): Promise<PeriodsRegisterResponse> {
  const params = new URLSearchParams();

  if (query.search?.trim()) {
    params.set('search', query.search.trim());
  }

  for (const status of query.statuses || []) {
    params.append('status', status);
  }

  if (query.fiscalYearId?.trim()) {
    params.set('fiscalYearId', query.fiscalYearId.trim());
  }

  for (const quickFilter of query.quickFilters || []) {
    params.append('quickFilter', quickFilter);
  }

  params.set('page', String(query.page || 1));
  params.set('limit', '10');

  return fetchAccountingAdmin<PeriodsRegisterResponse>(
    `/accounting/master-records/core-accounting-masters/accounting-periods?${params.toString()}`,
  );
}

export async function getPeriodDetail(
  periodId: number | string,
): Promise<PeriodDetail> {
  return fetchAccountingAdmin<PeriodDetail>(`/accounting/periods/${periodId}`);
}

export async function createPeriod(
  input: CreatePeriodInput,
): Promise<PeriodDetail> {
  const payload: CreatePeriodInput = {
    ...input,
    label: input.label.trim(),
    notes: typeof input.notes === 'string' ? input.notes.trim() || null : null,
    lockedFromDate: typeof input.lockedFromDate === 'string' ? input.lockedFromDate.trim() || null : null,
  };

  return fetchAccountingAdmin<PeriodDetail>(`/accounting/periods`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updatePeriod(
  periodId: number | string,
  input: UpdatePeriodInput,
): Promise<PeriodDetail> {
  const payload: UpdatePeriodInput = {
    ...input,
    label: input.label.trim(),
    notes: typeof input.notes === 'string' ? input.notes.trim() || null : null,
    lockedFromDate: typeof input.lockedFromDate === 'string' ? input.lockedFromDate.trim() || null : null,
  };

  return fetchAccountingAdmin<PeriodDetail>(`/accounting/periods/${periodId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function deletePeriod(
  periodId: number | string,
): Promise<{ success: boolean }> {
  return fetchAccountingAdmin<{ success: boolean }>(`/accounting/periods/${periodId}`, {
    method: 'DELETE',
  });
}

export type TaxCodeRegisterRow = {
  id: number | string;
  code: string | null;
  name: string | null;
  scope: string | null;
  scopeLabel: string | null;
  rate: number | null;
  rateDisplay: string | null;
  calculationMethod: string | null;
  calculationMethodLabel: string | null;
  purchaseAccountId: number | string | null;
  purchaseAccountCode: string | null;
  purchaseAccountName: string | null;
  salesAccountId: number | string | null;
  salesAccountCode: string | null;
  salesAccountName: string | null;
  isActive: boolean;
  isActiveLabel: string;
  description: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  cells: Array<string | null>;
};

export type TaxCodesRegisterResponse = {
  section: {
    id: string;
    label: string;
    description: string;
    searchPlaceholder: string;
    filters: {
      scopes: CoreAccountingFilterOption[];
      calculationMethods: CoreAccountingFilterOption[];
      quickFilters: CoreAccountingFilterOption[];
    };
    metrics: CoreAccountingMetric[];
    table: {
      title: string;
      description: string;
      columns: string[];
      rows: TaxCodeRegisterRow[];
    };
  };
  appliedFilters: {
    search: string;
    scopes: string[];
    calculationMethods: string[];
    statuses: string[];
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
    totalCodes: number;
    filteredCodes: number;
    activeCodes: number;
    inactiveCodes: number;
    salesScope: number;
    purchaseScope: number;
    bothScope: number;
  };
  referenceData: {
    chartAccounts: Array<{
      id: number | string;
      code: string | null;
      name: string | null;
    }>;
  };
};

export type TaxCodeDetail = {
  id: number | string;
  code?: string | null;
  name?: string | null;
  scope?: string | null;
  rate?: number | null;
  calculationMethod?: string | null;
  purchaseAccount?:
    | { id: number | string; code?: string | null; name?: string | null }
    | number
    | string
    | null;
  salesAccount?:
    | { id: number | string; code?: string | null; name?: string | null }
    | number
    | string
    | null;
  isActive?: boolean | null;
  description?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  usageSummary?: {
    expenseCount: number;
    billLineItemCount: number;
    invoiceLineItemCount: number;
    journalEntryLineCount: number;
  };
};

export type CreateTaxCodeInput = {
  code: string;
  name: string;
  scope: string;
  rate: number;
  calculationMethod: string;
  purchaseAccount?: number | string | null;
  salesAccount?: number | string | null;
  isActive: boolean;
  description?: string | null;
};

export type UpdateTaxCodeInput = {
  code: string;
  name: string;
  scope: string;
  rate: number;
  calculationMethod: string;
  purchaseAccount?: number | string | null;
  salesAccount?: number | string | null;
  isActive: boolean;
  description?: string | null;
};

type TaxCodesRegisterQuery = {
  search?: string;
  page?: number;
  scopes?: string[];
  calculationMethods?: string[];
  statuses?: string[];
  quickFilters?: string[];
};

export async function getTaxCodesRegister(
  query: TaxCodesRegisterQuery = {},
): Promise<TaxCodesRegisterResponse> {
  const params = new URLSearchParams();

  if (query.search?.trim()) {
    params.set('search', query.search.trim());
  }

  for (const scope of query.scopes || []) {
    params.append('scope', scope);
  }

  for (const method of query.calculationMethods || []) {
    params.append('calculationMethod', method);
  }

  for (const status of query.statuses || []) {
    params.append('status', status);
  }

  for (const quickFilter of query.quickFilters || []) {
    params.append('quickFilter', quickFilter);
  }

  params.set('page', String(query.page || 1));
  params.set('limit', '10');

  return fetchAccountingAdmin<TaxCodesRegisterResponse>(
    `/accounting/master-records/core-accounting-masters/tax-codes?${params.toString()}`,
  );
}

export async function getTaxCodeDetail(
  taxCodeId: number | string,
): Promise<TaxCodeDetail> {
  return fetchAccountingAdmin<TaxCodeDetail>(`/accounting/tax-codes/${taxCodeId}`);
}

export async function createTaxCode(
  input: CreateTaxCodeInput,
): Promise<TaxCodeDetail> {
  const payload: CreateTaxCodeInput = {
    ...input,
    code: input.code.trim().toUpperCase(),
    name: input.name.trim(),
    purchaseAccount: input.purchaseAccount !== undefined && input.purchaseAccount !== '' ? input.purchaseAccount : null,
    salesAccount: input.salesAccount !== undefined && input.salesAccount !== '' ? input.salesAccount : null,
    description: typeof input.description === 'string' ? input.description.trim() || null : null,
  };

  return fetchAccountingAdmin<TaxCodeDetail>(`/accounting/tax-codes`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateTaxCode(
  taxCodeId: number | string,
  input: UpdateTaxCodeInput,
): Promise<TaxCodeDetail> {
  const payload: UpdateTaxCodeInput = {
    ...input,
    code: input.code.trim().toUpperCase(),
    name: input.name.trim(),
    purchaseAccount: input.purchaseAccount !== undefined && input.purchaseAccount !== '' ? input.purchaseAccount : null,
    salesAccount: input.salesAccount !== undefined && input.salesAccount !== '' ? input.salesAccount : null,
    description: typeof input.description === 'string' ? input.description.trim() || null : null,
  };

  return fetchAccountingAdmin<TaxCodeDetail>(`/accounting/tax-codes/${taxCodeId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function deleteTaxCode(
  taxCodeId: number | string,
): Promise<{ success: boolean }> {
  return fetchAccountingAdmin<{ success: boolean }>(`/accounting/tax-codes/${taxCodeId}`, {
    method: 'DELETE',
  });
}
