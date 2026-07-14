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
        : 'Failed to load instructor payouts.';
    throw new Error(errorMessage);
  }

  return payload as T;
}

export type InstructorPayoutsFilterOption = {
  label: string;
  value: string;
};

export type InstructorPayoutsMetric = {
  id: string;
  label: string;
  value: number | string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
};

export type InstructorPayoutsCell =
  | string
  | { text: string; tone?: 'amber' | 'blue' | 'gray' | 'green' | 'red'; emphasis?: boolean; align?: 'left' | 'right' | 'center' };

export type InstructorPayoutRow = {
  id: string;
  instructorName: string;
  instructorId: string;
  courseName: string;
  courseId: string;
  periodStart: string | null;
  periodEnd: string | null;
  sourceReference: string;
  calculatedAmount: number;
  calculatedAmountLabel: string;
  approvedAmount: number;
  approvedAmountLabel: string;
  status: string;
  statusLabel: string;
  statusTone: 'amber' | 'blue' | 'gray' | 'green' | 'red';
  cells: InstructorPayoutsCell[];
};

export type InstructorPayoutsRegisterResponse = {
  rows: InstructorPayoutRow[];
  metrics: InstructorPayoutsMetric[];
  filterOptions: {
    statuses: InstructorPayoutsFilterOption[];
    quickFilters: InstructorPayoutsFilterOption[];
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
    instructors: Array<{ id: string; name: string }>;
    courses: Array<{ id: string; name: string }>;
  };
};

export type InstructorPayoutDetail = {
  id: string;
  instructor: string;
  course: string;
  periodStart: string | null;
  periodEnd: string | null;
  sourceType: string;
  sourceReference: string;
  calculatedAmount: number;
  approvedAmount: number;
  status: string;
  statusLabel: string;
  notes: string;
  createdAt: string | null;
  updatedAt: string | null;
  instructorName?: string;
  courseName?: string;
};

export type InstructorPayoutMutationInput = {
  instructor: string;
  course: string;
  periodStart: string;
  periodEnd: string;
  sourceType?: string;
  sourceReference?: string;
  calculatedAmount: number;
  approvedAmount?: number;
  status?: string;
  notes?: string;
};

export async function getInstructorPayouts(
  query: {
    search?: string;
    page?: number;
    statuses?: string[];
    quickFilters?: string[];
  } = {},
): Promise<InstructorPayoutsRegisterResponse> {
  const params = new URLSearchParams();
  if (query.search?.trim()) params.set('search', query.search.trim());
  for (const value of query.statuses || []) params.append('status', value);
  for (const value of query.quickFilters || []) params.append('quickFilter', value);
  params.set('page', String(query.page || 1));
  params.set('limit', '10');

  type SectionResponse = {
    section: {
      metrics: InstructorPayoutsMetric[];
      searchPlaceholder: string;
      filters: { statuses: InstructorPayoutsFilterOption[]; quickFilters: InstructorPayoutsFilterOption[] };
      table: { title: string; description: string; rows: InstructorPayoutRow[] };
    };
    pagination: InstructorPayoutsRegisterResponse['pagination'];
    totals: InstructorPayoutsRegisterResponse['totals'];
    referenceData: InstructorPayoutsRegisterResponse['referenceData'];
  };

  const raw = await fetchAccountingAdmin<SectionResponse>(`/accounting/instructor-payouts?${params.toString()}`);

  return {
    rows: raw.section.table.rows,
    metrics: raw.section.metrics,
    filterOptions: raw.section.filters,
    meta: {
      searchPlaceholder: raw.section.searchPlaceholder,
      columns: raw.section.table.title ? ['Instructor', 'Course', 'Period', 'Calculated Amount', 'Approved Amount', 'Status'] : [],
      tableTitle: raw.section.table.title,
      tableDescription: raw.section.table.description,
    },
    pagination: raw.pagination,
    totals: raw.totals,
    referenceData: raw.referenceData,
  };
}

export async function getInstructorPayoutDetail(id: string | number): Promise<InstructorPayoutDetail> {
  return fetchAccountingAdmin<InstructorPayoutDetail>(`/accounting/instructor-payouts/${id}`);
}

export async function createInstructorPayout(input: InstructorPayoutMutationInput): Promise<InstructorPayoutDetail> {
  const created = await fetchAccountingAdmin<{ id: string | number }>(`/accounting/instructor-payouts`, {
    method: 'POST',
    body: JSON.stringify(input),
  });
  return getInstructorPayoutDetail(created.id);
}

export async function updateInstructorPayout(id: string | number, input: InstructorPayoutMutationInput): Promise<InstructorPayoutDetail> {
  return fetchAccountingAdmin<InstructorPayoutDetail>(`/accounting/instructor-payouts/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

export async function deleteInstructorPayout(id: string | number): Promise<{ success: boolean }> {
  return fetchAccountingAdmin<{ success: boolean }>(`/accounting/instructor-payouts/${id}`, {
    method: 'DELETE',
  });
}

export async function approveInstructorPayout(id: string | number): Promise<InstructorPayoutDetail> {
  return fetchAccountingAdmin<InstructorPayoutDetail>(`/accounting/instructor-payouts/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ status: 'approved' }),
  });
}
