'use server';

import { getServerToken } from '@/app/actions/auth';
import { env } from '@/lib/env';

export type JournalEntryMetric = {
  id: string;
  label: string;
  value: number;
  change: string;
  trend: 'up' | 'down' | 'neutral';
};

export type JournalEntryFilterOption = {
  label: string;
  value: string;
};

export type JournalEntryRegisterRow = {
  id: number | string;
  entryNumber: string | null;
  entryDate: string | null;
  postingDate: string | null;
  sourceType: string | null;
  sourceTypeLabel: string | null;
  sourceReference: string | null;
  memo: string | null;
  referenceNumber: string | null;
  status: string | null;
  statusLabel: string | null;
  postingStatus: string | null;
  postingStatusLabel: string | null;
  totalDebit: number | null;
  totalCredit: number | null;
  isBalanced: boolean | null;
  fiscalYearId: number | string | null;
  fiscalYearCode: string | null;
  periodId: number | string | null;
  periodLabel: string | null;
  createdBy: string | null;
  updatedBy: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  cells: Array<string | { text: string; emphasis?: boolean; tone?: string; align?: string }>;
};

export type JournalEntriesRegisterResponse = {
  section: {
    id: string;
    label: string;
    description: string;
    searchPlaceholder: string;
    filters: {
      statuses: JournalEntryFilterOption[];
      sourceTypes: JournalEntryFilterOption[];
      quickFilters: JournalEntryFilterOption[];
    };
    metrics: JournalEntryMetric[];
    table: {
      title: string;
      description: string;
      columns: string[];
      rows: JournalEntryRegisterRow[];
    };
  };
  appliedFilters: { search: string; statuses: string[]; sourceTypes: string[]; isUnbalanced: boolean; quickFilters: string[] };
  pagination: { page: number; limit: number; totalDocs: number; totalPages: number; hasPrevPage: boolean; hasNextPage: boolean };
  totals: { totalEntries: number; filteredEntries: number; draftEntries: number; postedEntries: number; unbalancedEntries: number };
};

export type JournalEntryDetail = {
  id: number | string;
  entryNumber?: string | null;
  entryDate?: string | null;
  postingDate?: string | null;
  sourceType?: string | null;
  sourceReference?: string | null;
  memo?: string | null;
  referenceNumber?: string | null;
  status?: string | null;
  postingStatus?: string | null;
  totalDebit?: number | null;
  totalCredit?: number | null;
  isBalanced?: boolean | null;
  fiscalYear?: { id: number | string; code?: string | null; name?: string | null } | number | string | null;
  period?: { id: number | string; label?: string | null; periodNumber?: number | null } | number | string | null;
  notes?: string | null;
  createdBy?: { id: number | string; firstName?: string | null; lastName?: string | null; middleName?: string | null } | number | string | null;
  updatedBy?: { id: number | string; firstName?: string | null; lastName?: string | null; middleName?: string | null } | number | string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  usageSummary?: { lineCount: number };
};

export type CreateJournalEntryInput = {
  entryDate?: string;
  postingDate?: string;
  sourceType?: string;
  sourceReference?: string | null;
  memo?: string | null;
  referenceNumber?: string | null;
  status?: string;
  notes?: string | null;
};

export type UpdateJournalEntryInput = {
  entryDate?: string;
  postingDate?: string;
  sourceType?: string;
  sourceReference?: string | null;
  memo?: string | null;
  referenceNumber?: string | null;
  status?: string;
  notes?: string | null;
};

type JournalEntriesRegisterQuery = {
  search?: string;
  page?: number;
  statuses?: string[];
  sourceTypes?: string[];
  isUnbalanced?: boolean;
  quickFilters?: string[];
};

async function fetchAccountingAdmin<T>(path: string, init?: RequestInit): Promise<T> {
  const token = await getServerToken();
  if (!token) throw new Error('No admin session available.');
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
    const errorMessage = payload && typeof payload === 'object' && 'error' in payload && typeof payload.error === 'string'
      ? payload.error
      : 'Failed to load accounting data.';
    throw new Error(errorMessage);
  }
  return payload as T;
}

export async function getJournalEntriesRegister(query: JournalEntriesRegisterQuery = {}): Promise<JournalEntriesRegisterResponse> {
  const params = new URLSearchParams();
  if (query.search?.trim()) params.set('search', query.search.trim());
  for (const s of query.statuses || []) params.append('status', s);
  for (const st of query.sourceTypes || []) params.append('sourceType', st);
  if (query.isUnbalanced) params.set('isUnbalanced', 'true');
  for (const q of query.quickFilters || []) params.append('quickFilter', q);
  params.set('page', String(query.page || 1));
  params.set('limit', '10');
  return fetchAccountingAdmin<JournalEntriesRegisterResponse>(
    `/accounting/journal-entries?${params.toString()}`,
  );
}

export async function getJournalEntryDetail(entryId: number | string): Promise<JournalEntryDetail> {
  return fetchAccountingAdmin<JournalEntryDetail>(`/accounting/journal-entries/${entryId}`);
}

export async function createJournalEntry(input: CreateJournalEntryInput): Promise<JournalEntryDetail> {
  const payload: CreateJournalEntryInput = {
    ...input,
    entryDate: input.entryDate || new Date().toISOString().slice(0, 10),
    postingDate: input.postingDate || input.entryDate || new Date().toISOString().slice(0, 10),
    sourceReference: typeof input.sourceReference === 'string' ? input.sourceReference.trim() || null : input.sourceReference,
    memo: typeof input.memo === 'string' ? input.memo.trim() || null : input.memo,
    referenceNumber: typeof input.referenceNumber === 'string' ? input.referenceNumber.trim() || null : input.referenceNumber,
    notes: typeof input.notes === 'string' ? input.notes.trim() || null : input.notes,
  };
  return fetchAccountingAdmin<JournalEntryDetail>('/accounting/journal-entries', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateJournalEntry(entryId: number | string, input: UpdateJournalEntryInput): Promise<JournalEntryDetail> {
  const payload: UpdateJournalEntryInput = {
    ...input,
    entryDate: input.entryDate,
    postingDate: input.postingDate,
    sourceReference: typeof input.sourceReference === 'string' ? input.sourceReference.trim() || null : input.sourceReference,
    memo: typeof input.memo === 'string' ? input.memo.trim() || null : input.memo,
    referenceNumber: typeof input.referenceNumber === 'string' ? input.referenceNumber.trim() || null : input.referenceNumber,
    notes: typeof input.notes === 'string' ? input.notes.trim() || null : input.notes,
  };
  return fetchAccountingAdmin<JournalEntryDetail>(`/accounting/journal-entries/${entryId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function deleteJournalEntry(entryId: number | string): Promise<{ blockers: string[]; id: number | string }> {
  return fetchAccountingAdmin<{ blockers: string[]; id: number | string }>(`/accounting/journal-entries/${entryId}`, {
    method: 'DELETE',
  });
}

// --- Journal Entry Lines ---

export type JournalEntryLineRegisterRow = {
  id: number | string;
  journalEntryId: number | string | null;
  entryNumber: string | null;
  entryDate: string | null;
  lineNumber: number | null;
  accountId: number | string | null;
  accountCode: string | null;
  accountName: string | null;
  description: string | null;
  debit: number | null;
  credit: number | null;
  taxCodeId: number | string | null;
  taxCode: string | null;
  referenceEntityType: string | null;
  referenceEntityId: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  cells: Array<string | { text: string; emphasis?: boolean; tone?: string; align?: string }>;
};

export type JournalEntryLinesRegisterResponse = {
  section: {
    id: string;
    label: string;
    description: string;
    searchPlaceholder: string;
    filters: { quickFilters: JournalEntryFilterOption[] };
    metrics: JournalEntryMetric[];
    table: { title: string; description: string; columns: string[]; rows: JournalEntryLineRegisterRow[] };
  };
  appliedFilters: { search: string; hasTaxCode: boolean; hasReference: boolean; lineTypes: string[]; quickFilters: string[] };
  pagination: { page: number; limit: number; totalDocs: number; totalPages: number; hasPrevPage: boolean; hasNextPage: boolean };
  totals: { totalLines: number; filteredLines: number; taxCodedLines: number; referencedLines: number; debitLines: number };
};

export type JournalEntryLineDetail = {
  id: number | string;
  journalEntry?: { id: number | string; entryNumber?: string | null } | number | string | null;
  lineNumber?: number | null;
  account?: { id: number | string; code?: string | null; name?: string | null } | number | string | null;
  description?: string | null;
  debit?: number | null;
  credit?: number | null;
  taxCode?: { id: number | string; code?: string | null; name?: string | null } | number | string | null;
  referenceEntityType?: string | null;
  referenceEntityId?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type CreateJournalEntryLineInput = {
  journalEntry: number | string;
  lineNumber?: number;
  account: number | string;
  description?: string | null;
  debit?: number;
  credit?: number;
  taxCode?: number | string | null;
  referenceEntityType?: string | null;
  referenceEntityId?: string | null;
};

export type UpdateJournalEntryLineInput = {
  lineNumber?: number;
  account?: number | string;
  description?: string | null;
  debit?: number;
  credit?: number;
  taxCode?: number | string | null;
  referenceEntityType?: string | null;
  referenceEntityId?: string | null;
};

export async function getJournalEntryLinesRegister(query: {
  search?: string;
  page?: number;
  hasTaxCode?: boolean;
  hasReference?: boolean;
  lineTypes?: string[];
  quickFilters?: string[];
} = {}): Promise<JournalEntryLinesRegisterResponse> {
  const params = new URLSearchParams();
  if (query.search?.trim()) params.set('search', query.search.trim());
  if (query.hasTaxCode) params.set('hasTaxCode', 'true');
  if (query.hasReference) params.set('hasReference', 'true');
  for (const lt of query.lineTypes || []) params.append('lineType', lt);
  for (const q of query.quickFilters || []) params.append('quickFilter', q);
  params.set('page', String(query.page || 1));
  params.set('limit', '10');
  return fetchAccountingAdmin<JournalEntryLinesRegisterResponse>(
    `/accounting/journal-entry-lines?${params.toString()}`,
  );
}

export async function getJournalEntryLineDetail(lineId: number | string): Promise<JournalEntryLineDetail> {
  return fetchAccountingAdmin<JournalEntryLineDetail>(`/accounting/journal-entry-lines/${lineId}`);
}

export async function createJournalEntryLine(input: CreateJournalEntryLineInput): Promise<JournalEntryLineDetail> {
  return fetchAccountingAdmin<JournalEntryLineDetail>('/accounting/journal-entry-lines', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function updateJournalEntryLine(lineId: number | string, input: UpdateJournalEntryLineInput): Promise<JournalEntryLineDetail> {
  return fetchAccountingAdmin<JournalEntryLineDetail>(`/accounting/journal-entry-lines/${lineId}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

export async function deleteJournalEntryLine(lineId: number | string): Promise<{ success: boolean }> {
  return fetchAccountingAdmin<{ success: boolean }>(`/accounting/journal-entry-lines/${lineId}`, {
    method: 'DELETE',
  });
}

export type ChoiceItem = { value: number | string; label: string };

export async function getJournalEntryChoices(search?: string): Promise<{ choices: ChoiceItem[] }> {
  const params = search ? `?search=${encodeURIComponent(search)}` : '';
  return fetchAccountingAdmin<{ choices: ChoiceItem[] }>(`/accounting/journal-entry-choices${params}`);
}

export async function getChartAccountChoices(search?: string): Promise<{ choices: ChoiceItem[] }> {
  const params = search ? `?search=${encodeURIComponent(search)}` : '';
  return fetchAccountingAdmin<{ choices: ChoiceItem[] }>(`/accounting/chart-account-choices${params}`);
}

// --- Journal Source Types ---

export type SourceTypeRegisterRow = {
  id: number | string;
  entryNumber: string | null;
  entryDate: string | null;
  postingDate: string | null;
  sourceType: string | null;
  sourceTypeLabel: string | null;
  sourceReference: string | null;
  memo: string | null;
  referenceNumber: string | null;
  status: string | null;
  statusLabel: string | null;
  totalDebit: number | null;
  totalCredit: number | null;
  createdBy: string | null;
  updatedBy: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  cells: Array<string | { text: string; emphasis?: boolean; tone?: string; align?: string }>;
};

export type SourceTypesRegisterResponse = {
  section: {
    id: string;
    label: string;
    description: string;
    searchPlaceholder: string;
    filters: {
      sourceTypes: JournalEntryFilterOption[];
      statuses: JournalEntryFilterOption[];
      quickFilters: JournalEntryFilterOption[];
    };
    metrics: JournalEntryMetric[];
    table: { title: string; description: string; columns: string[]; rows: SourceTypeRegisterRow[] };
  };
  appliedFilters: { search: string; sourceTypes: string[]; statuses: string[]; quickFilters: string[] };
  pagination: { page: number; limit: number; totalDocs: number; totalPages: number; hasPrevPage: boolean; hasNextPage: boolean };
  totals: { totalEntries: number; filteredEntries: number; manualCount: number; openingBalanceCount: number; adjustmentCount: number; reversalCount: number; systemCount: number; draftCount: number; postedCount: number };
};

export async function getSourceTypesRegister(query: {
  search?: string;
  page?: number;
  sourceTypes?: string[];
  statuses?: string[];
  quickFilters?: string[];
} = {}): Promise<SourceTypesRegisterResponse> {
  const params = new URLSearchParams();
  if (query.search?.trim()) params.set('search', query.search.trim());
  for (const st of query.sourceTypes || []) params.append('sourceType', st);
  for (const s of query.statuses || []) params.append('status', s);
  for (const q of query.quickFilters || []) params.append('quickFilter', q);
  params.set('page', String(query.page || 1));
  params.set('limit', '10');
  return fetchAccountingAdmin<SourceTypesRegisterResponse>(
    `/accounting/journal-source-types?${params.toString()}`,
  );
}
