'use server';

import { getServerToken } from '@/app/actions/auth';
import { env } from '@/lib/env';

export type OpeningBalMetric = {
  id: string; label: string; value: number; change: string; trend: 'up' | 'down' | 'neutral';
};

export type OpeningBalFilterOption = {
  label: string; value: string;
};

export type OpeningBalRegisterRow = {
  id: number | string; entryNumber: string | null; postingDate: string | null;
  sourceReference: string | null; memo: string | null; status: string | null;
  statusLabel: string | null; totalDebit: number | null; isBalanced: boolean | null;
  createdBy: string | null; createdAt: string | null; updatedAt: string | null;
  cells: Array<string | { text: string; emphasis?: boolean; tone?: string; align?: string }>;
};

export type OpeningBalRegisterResponse = {
  section: {
    id: string; label: string; description: string; searchPlaceholder: string;
    filters: { statuses: OpeningBalFilterOption[]; quickFilters: OpeningBalFilterOption[] };
    metrics: OpeningBalMetric[];
    table: { title: string; description: string; columns: string[]; rows: OpeningBalRegisterRow[] };
  };
  appliedFilters: { search: string; statuses: string[]; balancedFilters: string[]; quickFilters: string[] };
  pagination: { page: number; limit: number; totalDocs: number; totalPages: number; hasPrevPage: boolean; hasNextPage: boolean };
  totals: { totalEntries: number; filteredEntries: number; postedEntries: number; draftEntries: number; balancedEntries: number };
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
      ? payload.error : 'Failed to load accounting data.';
    throw new Error(errorMessage);
  }
  return payload as T;
}

export async function getOpeningBalRegister(query: { search?: string; page?: number; statuses?: string[]; balancedFilters?: string[]; quickFilters?: string[] } = {}): Promise<OpeningBalRegisterResponse> {
  const params = new URLSearchParams();
  if (query.search?.trim()) params.set('search', query.search.trim());
  for (const s of query.statuses || []) params.append('status', s);
  for (const bf of query.balancedFilters || []) params.append('balancedFilter', bf);
  for (const q of query.quickFilters || []) params.append('quickFilter', q);
  params.set('page', String(query.page || 1)); params.set('limit', '10');
  return fetchAccountingAdmin<OpeningBalRegisterResponse>(`/accounting/opening-balance-journals?${params.toString()}`);
}

// --- Adjustment Entries ---

export type AdjustmentMetric = {
  id: string; label: string; value: number; change: string; trend: 'up' | 'down' | 'neutral';
};

export type AdjustmentFilterOption = {
  label: string; value: string;
};

export type AdjustmentRegisterRow = {
  id: number | string; entryNumber: string | null; postingDate: string | null;
  referenceNumber: string | null; memo: string | null; status: string | null;
  statusLabel: string | null; totalDebit: number | null; isBalanced: boolean | null;
  createdBy: string | null; createdAt: string | null; updatedAt: string | null;
  cells: Array<string | { text: string; emphasis?: boolean; tone?: string; align?: string }>;
};

export type AdjustmentRegisterResponse = {
  section: {
    id: string; label: string; description: string; searchPlaceholder: string;
    filters: { statuses: AdjustmentFilterOption[]; quickFilters: AdjustmentFilterOption[] };
    metrics: AdjustmentMetric[];
    table: { title: string; description: string; columns: string[]; rows: AdjustmentRegisterRow[] };
  };
  appliedFilters: { search: string; statuses: string[]; balancedFilters: string[]; quickFilters: string[] };
  pagination: { page: number; limit: number; totalDocs: number; totalPages: number; hasPrevPage: boolean; hasNextPage: boolean };
  totals: { totalEntries: number; filteredEntries: number; postedEntries: number; draftEntries: number; referencedEntries: number; balancedEntries: number };
};

export async function getAdjustmentEntriesRegister(query: { search?: string; page?: number; statuses?: string[]; balancedFilters?: string[]; quickFilters?: string[] } = {}): Promise<AdjustmentRegisterResponse> {
  const params = new URLSearchParams();
  if (query.search?.trim()) params.set('search', query.search.trim());
  for (const s of query.statuses || []) params.append('status', s);
  for (const bf of query.balancedFilters || []) params.append('balancedFilter', bf);
  for (const q of query.quickFilters || []) params.append('quickFilter', q);
  params.set('page', String(query.page || 1)); params.set('limit', '10');
  return fetchAccountingAdmin<AdjustmentRegisterResponse>(`/accounting/adjustment-journals?${params.toString()}`);
}

// --- Reversal Entries ---

export type ReversalMetric = {
  id: string; label: string; value: number; change: string; trend: 'up' | 'down' | 'neutral';
};

export type ReversalFilterOption = {
  label: string; value: string;
};

export type ReversalRegisterRow = {
  id: number | string; entryNumber: string | null; originalEntry: string | null; postingDate: string | null;
  memo: string | null; status: string | null;
  statusLabel: string | null; isBalanced: boolean | null; createdBy: string | null; createdAt: string | null; updatedAt: string | null;
  cells: Array<string | { text: string; emphasis?: boolean; tone?: string; align?: string }>;
};

export type ReversalRegisterResponse = {
  section: {
    id: string; label: string; description: string; searchPlaceholder: string;
    filters: { statuses: ReversalFilterOption[]; quickFilters: ReversalFilterOption[] };
    metrics: ReversalMetric[];
    table: { title: string; description: string; columns: string[]; rows: ReversalRegisterRow[] };
  };
  appliedFilters: { search: string; statuses: string[]; quickFilters: string[] };
  pagination: { page: number; limit: number; totalDocs: number; totalPages: number; hasPrevPage: boolean; hasNextPage: boolean };
  totals: { totalEntries: number; filteredEntries: number; postedEntries: number; draftEntries: number; balancedEntries: number };
};

export async function getReversalEntriesRegister(query: { search?: string; page?: number; statuses?: string[]; quickFilters?: string[] } = {}): Promise<ReversalRegisterResponse> {
  const params = new URLSearchParams();
  if (query.search?.trim()) params.set('search', query.search.trim());
  for (const s of query.statuses || []) params.append('status', s);
  for (const q of query.quickFilters || []) params.append('quickFilter', q);
  params.set('page', String(query.page || 1)); params.set('limit', '10');
  return fetchAccountingAdmin<ReversalRegisterResponse>(`/accounting/reversal-journals?${params.toString()}`);
}

// --- Reused from journal-management for CRUD ---

export type JournalEntryDetail = {
  id: number | string; entryNumber?: string | null; entryDate?: string | null;
  postingDate?: string | null; sourceType?: string | null; sourceReference?: string | null;
  memo?: string | null; referenceNumber?: string | null; status?: string | null;
  postingStatus?: string | null; totalDebit?: number | null; totalCredit?: number | null;
  isBalanced?: boolean | null; notes?: string | null;
  createdBy?: Record<string, unknown> | number | string | null;
  updatedBy?: Record<string, unknown> | number | string | null;
  createdAt?: string | null; updatedAt?: string | null;
};

export async function createJournalEntry(input: {
  entryDate?: string; postingDate?: string; sourceType?: string;
  sourceReference?: string | null; memo?: string | null; referenceNumber?: string | null;
  status?: string; notes?: string | null;
}): Promise<JournalEntryDetail> {
  return fetchAccountingAdmin<JournalEntryDetail>('/accounting/journal-entries', {
    method: 'POST',
    body: JSON.stringify({
      ...input,
      entryDate: input.entryDate || new Date().toISOString().slice(0, 10),
      postingDate: input.postingDate || input.entryDate || new Date().toISOString().slice(0, 10),
      sourceReference: typeof input.sourceReference === 'string' ? input.sourceReference.trim() || null : input.sourceReference,
      memo: typeof input.memo === 'string' ? input.memo.trim() || null : input.memo,
      referenceNumber: typeof input.referenceNumber === 'string' ? input.referenceNumber.trim() || null : input.referenceNumber,
      notes: typeof input.notes === 'string' ? input.notes.trim() || null : input.notes,
    }),
  });
}

export async function getJournalEntryDetail(entryId: number | string): Promise<JournalEntryDetail> {
  return fetchAccountingAdmin<JournalEntryDetail>(`/accounting/journal-entries/${entryId}`);
}

export async function updateJournalEntry(entryId: number | string, input: Record<string, unknown>): Promise<JournalEntryDetail> {
  return fetchAccountingAdmin<JournalEntryDetail>(`/accounting/journal-entries/${entryId}`, {
    method: 'PATCH', body: JSON.stringify(input),
  });
}

export async function deleteJournalEntry(entryId: number | string): Promise<{ blockers: string[]; id: number | string }> {
  return fetchAccountingAdmin<{ blockers: string[]; id: number | string }>(`/accounting/journal-entries/${entryId}`, {
    method: 'DELETE',
  });
}
