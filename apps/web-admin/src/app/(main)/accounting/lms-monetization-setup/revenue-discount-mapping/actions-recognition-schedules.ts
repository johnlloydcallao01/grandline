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

export type RecognitionScheduleFilterOption = {
  label: string;
  value: string;
};

export type RecognitionScheduleMetric = {
  id: string;
  label: string;
  value: number | string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
};

export type RecognitionScheduleCell =
  | string
  | { text: string; tone?: 'amber' | 'blue' | 'gray' | 'green' | 'red'; emphasis?: boolean; align?: 'left' | 'right' | 'center' };

export type RecognitionScheduleRow = {
  id: string;
  invoiceId: string;
  invoiceNumber: string;
  enrollmentBillingLinkId: string;
  enrollmentBillingLinkLabel: string;
  recognitionMethod: string;
  recognitionMethodLabel: string;
  startDate: string | null;
  startDateLabel: string;
  endDate: string | null;
  endDateLabel: string;
  totalDeferredAmount: number;
  totalDeferredLabel: string;
  recognizedAmount: number;
  recognizedLabel: string;
  remainingDeferredAmount: number;
  remainingDeferredLabel: string;
  status: string;
  statusLabel: string;
  statusTone: 'amber' | 'blue' | 'gray' | 'green' | 'red';
  notes: string;
  cells: RecognitionScheduleCell[];
};

export type RecognitionSchedulesResponse = {
  section: {
    id: string;
    label: string;
    description: string;
    searchPlaceholder: string;
    filters: {
      statuses: RecognitionScheduleFilterOption[];
      recognitionMethods: RecognitionScheduleFilterOption[];
      quickFilters: RecognitionScheduleFilterOption[];
    };
    metrics: RecognitionScheduleMetric[];
    table: {
      title: string;
      description: string;
      columns: Array<string | { label: string; align: string }>;
      rows: RecognitionScheduleRow[];
    };
  };
  appliedFilters: {
    search: string;
    statuses: string[];
    recognitionMethods: string[];
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
    invoices: Array<{ id: number | string; invoiceNumber: string | null; status: string; total: number; balanceDue: number }>;
    enrollmentBillingLinks: Array<{ id: number | string; sourceReference: string | null; finalChargeSnapshot: number }>;
  };
};

export type RecognitionScheduleDetail = {
  id: string;
  invoiceId: string;
  invoiceNumber: string;
  enrollmentBillingLinkId: string;
  enrollmentBillingLinkLabel: string;
  recognitionMethod: string;
  recognitionMethodLabel: string;
  startDate: string | null;
  startDateLabel: string;
  endDate: string | null;
  endDateLabel: string;
  totalDeferredAmount: number;
  totalDeferredLabel: string;
  recognizedAmount: number;
  recognizedLabel: string;
  remainingDeferredAmount: number;
  remainingDeferredLabel: string;
  status: string;
  statusLabel: string;
  lastRecognitionAt: string | null;
  lastRecognitionAtLabel: string;
  notes: string;
  createdAt: string | null;
  updatedAt: string | null;
};

export type RecognitionScheduleMutationInput = {
  invoice: string;
  enrollmentBillingLink: string;
  recognitionMethod: string;
  startDate: string;
  endDate: string;
  totalDeferredAmount: number;
  recognizedAmount: number;
  remainingDeferredAmount: number;
  status: string;
  notes?: string | null;
};

export async function getSchedules(
  query: {
    search?: string;
    page?: number;
    statuses?: string[];
    recognitionMethods?: string[];
    quickFilters?: string[];
  } = {},
): Promise<RecognitionSchedulesResponse> {
  const params = new URLSearchParams();
  if (query.search?.trim()) params.set('search', query.search.trim());
  for (const value of query.statuses || []) params.append('status', value);
  for (const value of query.recognitionMethods || []) params.append('recognitionMethod', value);
  for (const value of query.quickFilters || []) params.append('quickFilter', value);
  params.set('page', String(query.page || 1));
  params.set('limit', '10');

  return fetchAccountingAdmin<RecognitionSchedulesResponse>(`/accounting/revenue-recognition-schedules?${params.toString()}`);
}

export async function getScheduleDetail(id: string | number): Promise<RecognitionScheduleDetail> {
  return fetchAccountingAdmin<RecognitionScheduleDetail>(`/accounting/revenue-recognition-schedules/${id}`);
}

export async function createSchedule(input: RecognitionScheduleMutationInput): Promise<RecognitionScheduleDetail> {
  const created = await fetchAccountingAdmin<{ id: string | number }>(`/accounting/revenue-recognition-schedules`, {
    method: 'POST',
    body: JSON.stringify(input),
  });

  return getScheduleDetail(created.id);
}

export async function updateSchedule(id: string | number, input: Partial<RecognitionScheduleMutationInput>): Promise<RecognitionScheduleDetail> {
  return fetchAccountingAdmin<RecognitionScheduleDetail>(`/accounting/revenue-recognition-schedules/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

export async function deleteSchedule(id: string | number): Promise<{ success: boolean }> {
  return fetchAccountingAdmin<{ success: boolean }>(`/accounting/revenue-recognition-schedules/${id}`, {
    method: 'DELETE',
  });
}
