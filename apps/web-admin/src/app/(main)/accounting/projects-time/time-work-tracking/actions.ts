'use server';

import { getServerToken } from '@/app/actions/auth';
import { env } from '@/lib/env';

async function fetchAccountingAdmin<T>(path: string, init?: RequestInit): Promise<T> {
  const token = await getServerToken(); if (!token) throw new Error('No admin session available.');
  const response = await fetch(`${env.NEXT_PUBLIC_API_URL}${path}`, { ...init, headers: { Authorization: `JWT ${token}`, ...(init?.body ? { 'Content-Type': 'application/json' } : {}), ...(init?.headers || {}) }, cache: 'no-store' });
  const payload = (await response.json().catch(() => null)) as T | { error?: string } | null;
  if (!response.ok) { const m = payload && typeof payload === 'object' && 'error' in payload && typeof payload.error === 'string' ? payload.error : 'Failed to load time data.'; throw new Error(m); }
  return payload as T;
}

export type TmFilterOption = { label: string; value: string };
export type TmMetric = { id: string; label: string; value: number | string; change: string; trend: 'up' | 'down' | 'neutral' };

export type TimeEntryRow = {
  id: string; entryDate: string | null; entryDateLabel: string; status: string; statusLabel: string; statusTone: string;
  sourceType: string; sourceTypeLabel: string; sourceTypeTone: string;
  userId: string; userLabel: string;
  projectId: string; projectLabel: string;
  projectTaskId: string; projectTaskLabel: string;
  courseId: string; courseLabel: string;
  instructorId: string; instructorLabel: string;
  timesheetId: string; timesheetLabel: string;
  hours: number; hoursLabel: string; minutes: number;
  isBillable: boolean; billableLabel: string;
  billingRate: number; costRate: number;
  startedAt: string | null; startedAtLabel: string;
  endedAt: string | null; endedAtLabel: string;
  approvedByLabel: string; approvedAt: string | null; approvedAtLabel: string;
  notes: string;
  cells: Array<string | { text: string; emphasis?: boolean; tone?: string; align?: string }>;
};

export type TimeEntryDetail = {
  id: string; entryDate: string | null; entryDateLabel: string; status: string; sourceType: string;
  userId: string; userLabel: string;
  projectId: string; projectLabel: string;
  projectTaskId: string; projectTaskLabel: string;
  courseId: string; courseLabel: string;
  instructorId: string; instructorLabel: string;
  timesheetId: string; hours: number; hoursLabel: string; minutes: number; billable: boolean;
  billingRate: number; costRate: number;
  startedAt: string | null; startedAtLabel: string;
  endedAt: string | null; endedAtLabel: string;
  approvedByLabel: string; approvedAt: string | null; approvedAtLabel: string;
  notes: string; createdAt: string | null; updatedAt: string | null;
};

export type TimeEntriesResponse = {
  section: { id: string; label: string; description: string; searchPlaceholder: string; filters: { statuses: TmFilterOption[]; billableOptions: TmFilterOption[]; sourceTypes: TmFilterOption[]; quickFilters: TmFilterOption[] }; metrics: TmMetric[]; table: { title: string; description: string; columns: string[]; rows: TimeEntryRow[] } };
  appliedFilters: { search: string; statuses: string[]; billableFilter: string[]; sourceTypes: string[]; projectIds: string[]; quickFilters: string[] };
  pagination: { page: number; limit: number; totalDocs: number; totalPages: number; hasPrevPage: boolean; hasNextPage: boolean };
  totals: { totalRows: number; filteredRows: number; billableCount: number; totalHours: number; approvedHours: number };
  referenceData: { projects: Array<{ id: string; label: string }>; users: Array<{ id: string; label: string }>; tasks: Array<{ id: string; label: string }>; courses: Array<{ id: string; label: string }>; instructors: Array<{ id: string; label: string }>; timesheets: Array<{ id: string; label: string }>; statusOptions: TmFilterOption[]; sourceTypeOptions: TmFilterOption[] };
};

export async function getTimeEntries(query: { search?: string; page?: number; statuses?: string[]; billable?: string[]; sourceTypes?: string[]; projectIds?: string[]; quickFilters?: string[] } = {}): Promise<TimeEntriesResponse> {
  const p = new URLSearchParams(); if (query.search?.trim()) p.set('search', query.search.trim());
  for (const v of query.statuses || []) p.append('status', v); for (const v of query.billable || []) p.append('billable', v); for (const v of query.sourceTypes || []) p.append('sourceType', v); for (const v of query.projectIds || []) p.append('projectId', v); for (const v of query.quickFilters || []) p.append('quickFilter', v);
  p.set('page', String(query.page || 1)); p.set('limit', '10');
  return fetchAccountingAdmin<TimeEntriesResponse>(`/accounting/time-entries?${p.toString()}`);
}

export async function getTimeEntryDetail(id: string | number): Promise<TimeEntryDetail> { return fetchAccountingAdmin<TimeEntryDetail>(`/accounting/time-entries/${encodeURIComponent(String(id))}`); }
export async function createTimeEntry(input: Record<string, unknown>): Promise<{ id: string }> { return fetchAccountingAdmin<{ id: string }>('/accounting/time-entries', { method: 'POST', body: JSON.stringify(input) }); }
export async function updateTimeEntry(id: string | number, input: Record<string, unknown>): Promise<{ id: string }> { return fetchAccountingAdmin<{ id: string }>(`/accounting/time-entries/${encodeURIComponent(String(id))}`, { method: 'PATCH', body: JSON.stringify(input) }); }
export async function deleteTimeEntry(id: string | number): Promise<{ success: boolean }> { return fetchAccountingAdmin<{ success: boolean }>(`/accounting/time-entries/${encodeURIComponent(String(id))}`, { method: 'DELETE' }); }

export type TimerEntryRow = {
  id: string; entryDate: string | null; entryDateLabel: string; status: string; statusLabel: string; statusTone: string;
  userId: string; userLabel: string; projectId: string; projectLabel: string; projectTaskId: string; projectTaskLabel: string;
  hours: number; hoursLabel: string; minutes: number; isBillable: boolean; billableLabel: string;
  billingRate: number; costRate: number;
  startedAt: string | null; startedAtLabel: string; endedAt: string | null; endedAtLabel: string;
  isRunning: boolean; computedHours: number; notes: string;
  cells: Array<string | { text: string; emphasis?: boolean; tone?: string; align?: string }>;
};

export type TimerEntriesResponse = {
  section: { id: string; label: string; description: string; searchPlaceholder: string; filters: { statuses: TmFilterOption[]; billableOptions: TmFilterOption[]; quickFilters: TmFilterOption[] }; metrics: TmMetric[]; table: { title: string; description: string; columns: string[]; rows: TimerEntryRow[] } };
  appliedFilters: { search: string; statuses: string[]; billableFilter: string[]; projectIds: string[]; quickFilters: string[] };
  pagination: { page: number; limit: number; totalDocs: number; totalPages: number; hasPrevPage: boolean; hasNextPage: boolean };
  totals: { totalRows: number; filteredRows: number; runningCount: number; billableCount: number; totalHours: number; avgDuration: number };
  referenceData: { projects: Array<{ id: string; label: string }>; users: Array<{ id: string; label: string }>; statusOptions: TmFilterOption[] };
};

export async function getTimerEntries(query: { search?: string; page?: number; statuses?: string[]; billable?: string[]; projectIds?: string[]; quickFilters?: string[] } = {}): Promise<TimerEntriesResponse> {
  const p = new URLSearchParams(); if (query.search?.trim()) p.set('search', query.search.trim());
  for (const v of query.statuses || []) p.append('status', v); for (const v of query.billable || []) p.append('billable', v); for (const v of query.projectIds || []) p.append('projectId', v); for (const v of query.quickFilters || []) p.append('quickFilter', v);
  p.set('page', String(query.page || 1)); p.set('limit', '10');
  return fetchAccountingAdmin<TimerEntriesResponse>(`/accounting/timer-entries?${p.toString()}`);
}

export type TimesheetRow = {
  id: string; periodStart: string | null; periodStartLabel: string; periodEnd: string | null; periodEndLabel: string;
  status: string; statusLabel: string; statusTone: string;
  userId: string; userLabel: string;
  totalHours: number; totalHoursLabel: string;
  approvedByLabel: string; approvedAt: string | null; approvedAtLabel: string;
  notes: string;
  cells: Array<string | { text: string; emphasis?: boolean; tone?: string; align?: string }>;
};

export type TimesheetDetail = {
  id: string; periodStart: string | null; periodStartLabel: string; periodEnd: string | null; periodEndLabel: string;
  status: string; totalHours: number;
  userId: string; userLabel: string;
  approvedByLabel: string; approvedAt: string | null; approvedAtLabel: string;
  notes: string; createdAt: string | null; updatedAt: string | null;
};

export type TimesheetsResponse = {
  section: { id: string; label: string; description: string; searchPlaceholder: string; filters: { statuses: TmFilterOption[]; quickFilters: TmFilterOption[] }; metrics: TmMetric[]; table: { title: string; description: string; columns: string[]; rows: TimesheetRow[] } };
  appliedFilters: { search: string; statuses: string[]; quickFilters: string[] };
  pagination: { page: number; limit: number; totalDocs: number; totalPages: number; hasPrevPage: boolean; hasNextPage: boolean };
  totals: { totalRows: number; filteredRows: number; approvedCount: number; totalHours: number; pendingCount: number };
  referenceData: { users: Array<{ id: string; label: string }>; statusOptions: TmFilterOption[] };
};

export async function getTimesheets(query: { search?: string; page?: number; statuses?: string[]; quickFilters?: string[] } = {}): Promise<TimesheetsResponse> {
  const p = new URLSearchParams(); if (query.search?.trim()) p.set('search', query.search.trim());
  for (const v of query.statuses || []) p.append('status', v); for (const v of query.quickFilters || []) p.append('quickFilter', v);
  p.set('page', String(query.page || 1)); p.set('limit', '10');
  return fetchAccountingAdmin<TimesheetsResponse>(`/accounting/timesheets?${p.toString()}`);
}

export async function getTimesheetDetail(id: string | number): Promise<TimesheetDetail> { return fetchAccountingAdmin<TimesheetDetail>(`/accounting/timesheets/${encodeURIComponent(String(id))}`); }
export async function createTimesheet(input: Record<string, unknown>): Promise<{ id: string }> { return fetchAccountingAdmin<{ id: string }>('/accounting/timesheets', { method: 'POST', body: JSON.stringify(input) }); }
export async function updateTimesheet(id: string | number, input: Record<string, unknown>): Promise<{ id: string }> { return fetchAccountingAdmin<{ id: string }>(`/accounting/timesheets/${encodeURIComponent(String(id))}`, { method: 'PATCH', body: JSON.stringify(input) }); }
export async function deleteTimesheet(id: string | number): Promise<{ success: boolean }> { return fetchAccountingAdmin<{ success: boolean }>(`/accounting/timesheets/${encodeURIComponent(String(id))}`, { method: 'DELETE' }); }
