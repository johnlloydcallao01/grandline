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

export type PayoutRegisterFilterOption = {
  label: string;
  value: string;
};

export type PayoutRegisterMetric = {
  id: string;
  label: string;
  value: number | string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
};

export type PayoutRegisterCell =
  | string
  | { text: string; tone?: 'amber' | 'blue' | 'gray' | 'green' | 'red'; emphasis?: boolean; align?: 'left' | 'right' | 'center' };

export type PayoutRegisterRow = {
  id: string;
  instructorId: string;
  instructorLabel: string;
  courseId: string;
  courseLabel: string;
  periodStart: string | null;
  periodEnd: string | null;
  periodLabel: string;
  sourceReference: string;
  calculatedAmount: number;
  calculatedAmountLabel: string;
  approvedAmount: number;
  approvedAmountLabel: string;
  status: string;
  statusLabel: string;
  statusTone: 'amber' | 'blue' | 'gray' | 'green' | 'red';
  notes: string;
  cells: PayoutRegisterCell[];
};

export type PayoutRegisterResponse = {
  section: {
    id: string;
    label: string;
    description: string;
    searchPlaceholder: string;
    filters: {
      statuses: PayoutRegisterFilterOption[];
      quickFilters: PayoutRegisterFilterOption[];
    };
    metrics: PayoutRegisterMetric[];
    table: {
      title: string;
      description: string;
      columns: Array<string | { label: string; align: string }>;
      rows: PayoutRegisterRow[];
    };
  };
  appliedFilters: {
    search: string;
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
    totalRows: number;
    filteredRows: number;
  };
  referenceData: {
    instructors: Array<{ id: number | string; label: string }>;
    courses: Array<{ id: number | string; title: string | null; courseCode: string | null }>;
  };
};

export type PayoutRegisterDetail = {
  id: string;
  instructorId: string;
  instructorLabel: string;
  courseId: string;
  courseLabel: string;
  periodStart: string | null;
  periodEnd: string | null;
  periodLabel: string;
  sourceType: string;
  sourceReference: string;
  calculatedAmount: number;
  calculatedAmountLabel: string;
  approvedAmount: number;
  approvedAmountLabel: string;
  status: string;
  statusLabel: string;
  notes: string;
  createdAt: string | null;
  updatedAt: string | null;
};

export type PayoutRegisterMutationInput = {
  instructor: string;
  course: string;
  periodStart: string;
  periodEnd: string;
  sourceType?: string;
  sourceReference?: string;
  calculatedAmount: number;
  approvedAmount?: number;
  status: string;
  notes?: string | null;
};

export async function getPayouts(
  query: {
    search?: string;
    page?: number;
    statuses?: string[];
    quickFilters?: string[];
  } = {},
): Promise<PayoutRegisterResponse> {
  const params = new URLSearchParams();
  if (query.search?.trim()) params.set('search', query.search.trim());
  for (const value of query.statuses || []) params.append('status', value);
  for (const value of query.quickFilters || []) params.append('quickFilter', value);
  params.set('page', String(query.page || 1));
  params.set('limit', '10');

  return fetchAccountingAdmin<PayoutRegisterResponse>(`/accounting/instructor-payouts?${params.toString()}`);
}

export async function getPayoutDetail(id: string | number): Promise<PayoutRegisterDetail> {
  return fetchAccountingAdmin<PayoutRegisterDetail>(`/accounting/instructor-payouts/${id}`);
}

export async function createPayout(input: PayoutRegisterMutationInput): Promise<PayoutRegisterDetail> {
  const created = await fetchAccountingAdmin<{ id: string | number }>(`/accounting/instructor-payouts`, {
    method: 'POST',
    body: JSON.stringify(input),
  });

  return getPayoutDetail(created.id);
}

export async function updatePayout(id: string | number, input: Partial<PayoutRegisterMutationInput>): Promise<PayoutRegisterDetail> {
  return fetchAccountingAdmin<PayoutRegisterDetail>(`/accounting/instructor-payouts/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

export async function deletePayout(id: string | number): Promise<{ success: boolean }> {
  return fetchAccountingAdmin<{ success: boolean }>(`/accounting/instructor-payouts/${id}`, {
    method: 'DELETE',
  });
}

export async function postPayoutAction(id: string | number, action: 'calculate' | 'approve' | 'pay' | 'void'): Promise<{ id: string | number; status: string }> {
  return fetchAccountingAdmin<{ id: string | number; status: string }>(`/accounting/instructor-payouts/${id}/post`, {
    method: 'POST',
    body: JSON.stringify({ action }),
  });
}
