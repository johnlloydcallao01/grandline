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

  const text = await response.text().catch(() => null);
  let payload: unknown = null
  let rawError: string | null = null
  if (text) {
    try { payload = JSON.parse(text); rawError = (payload as Record<string, unknown>)?.error as string | null ?? null }
    catch { rawError = text.slice(0, 500) }
  }
  if (!response.ok) {
    throw new Error(rawError || `HTTP ${response.status}`);
  }

  return payload as T;
}

export type ScheduleFilterOption = {
  label: string;
  value: string;
};

export type ScheduleMetric = {
  id: string;
  label: string;
  value: number | string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
};

export type ScheduleCell =
  | string
  | { text: string; tone?: 'amber' | 'blue' | 'gray' | 'green' | 'red'; emphasis?: boolean; align?: 'left' | 'right' | 'center' };

export type ScheduleRegisterRow = {
  id: string;
  invoiceNumber: string;
  enrollmentBillingLinkLabel: string;
  recognitionMethod: string;
  recognitionMethodLabel: string;
  totalDeferredAmount: number;
  totalDeferredLabel: string;
  recognizedAmount: number;
  recognizedLabel: string;
  remainingDeferredAmount: number;
  remainingLabel: string;
  status: string;
  statusLabel: string;
  statusTone: string;
  startDate: string | null;
  endDate: string | null;
};

export type ScheduleRegisterResponse = {
  rows: ScheduleRegisterRow[];
  metrics: ScheduleMetric[];
  filterOptions: {
    statuses: ScheduleFilterOption[];
    recognitionMethods: ScheduleFilterOption[];
    quickFilters: ScheduleFilterOption[];
  };
  meta: {
    searchPlaceholder: string;
    columns: string[];
    tableTitle: string;
    tableDescription: string;
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
    invoices: Array<{ id: string; invoiceNumber: string; memo: string }>;
    enrollmentBillingLinks: Array<{ id: string; sourceReference: string; enrollmentId: string }>;
  };
};

export type ScheduleDetail = {
  id: string;
  invoiceId: string;
  invoiceNumber: string;
  enrollmentBillingLinkId: string;
  enrollmentBillingLinkLabel: string;
  enrollmentId: string;
  recognitionMethod: string;
  recognitionMethodLabel: string;
  startDate: string | null;
  endDate: string | null;
  totalDeferredAmount: number;
  totalDeferredLabel: string;
  recognizedAmount: number;
  recognizedLabel: string;
  remainingDeferredAmount: number;
  remainingLabel: string;
  status: string;
  statusLabel: string;
  statusTone: string;
  scheduleData: unknown;
  lastRecognitionAt: string | null;
  notes: string;
  createdAt: string | null;
  updatedAt: string | null;
};

export type ScheduleMutationInput = {
  invoice?: string;
  enrollmentBillingLink?: string;
  recognitionMethod?: string;
  startDate?: string | null;
  endDate?: string | null;
  totalDeferredAmount?: number;
  recognizedAmount?: number;
  remainingDeferredAmount?: number;
  status?: string;
  notes?: string;
};

export async function getSchedules(
  query: {
    search?: string;
    page?: number;
    statuses?: string[];
    recognitionMethods?: string[];
    quickFilters?: string[];
  } = {},
): Promise<ScheduleRegisterResponse> {
  const params = new URLSearchParams();
  if (query.search?.trim()) params.set('search', query.search.trim());
  for (const value of query.statuses || []) params.append('status', value);
  for (const value of query.recognitionMethods || []) params.append('recognitionMethod', value);
  for (const value of query.quickFilters || []) params.append('quickFilter', value);
  params.set('page', String(query.page || 1));
  params.set('limit', '100');

  const raw = await fetchAccountingAdmin<ScheduleRegisterResponse>(`/accounting/revenue-recognition-schedules?${params.toString()}`);
  return raw;
}

export async function getScheduleDetail(id: string | number): Promise<ScheduleDetail> {
  return fetchAccountingAdmin<ScheduleDetail>(`/accounting/revenue-recognition-schedules/${id}`);
}

export async function createSchedule(input: ScheduleMutationInput): Promise<ScheduleDetail> {
  return fetchAccountingAdmin<ScheduleDetail>(`/accounting/revenue-recognition-schedules`, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function updateSchedule(id: string | number, input: ScheduleMutationInput): Promise<ScheduleDetail> {
  return fetchAccountingAdmin<ScheduleDetail>(`/accounting/revenue-recognition-schedules/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

export async function deleteSchedule(id: string | number): Promise<{ success: boolean }> {
  return fetchAccountingAdmin<{ success: boolean }>(`/accounting/revenue-recognition-schedules/${id}`, {
    method: 'DELETE',
  });
}
