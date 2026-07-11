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

export type InstructorPayoutRuleFilterOption = {
  label: string;
  value: string;
};

export type InstructorPayoutRuleMetric = {
  id: string;
  label: string;
  value: number | string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
};

export type InstructorPayoutRuleCell =
  | string
  | { text: string; tone?: 'amber' | 'blue' | 'gray' | 'green' | 'red'; emphasis?: boolean; align?: 'left' | 'right' | 'center' };

export type InstructorPayoutRuleRow = {
  id: string;
  instructorId: string;
  instructorLabel: string;
  courseId: string;
  courseLabel: string;
  payoutMethod: string;
  payoutMethodLabel: string;
  flatAmount: number;
  flatAmountLabel: string;
  percentOfRevenue: number;
  percentOfRevenueLabel: string;
  perEnrollmentAmount: number;
  completionBonusAmount: number;
  status: string;
  statusLabel: string;
  statusTone: 'amber' | 'blue' | 'gray' | 'green' | 'red';
  notes: string;
  cells: InstructorPayoutRuleCell[];
};

export type InstructorPayoutRulesResponse = {
  section: {
    id: string;
    label: string;
    description: string;
    searchPlaceholder: string;
    filters: {
      statuses: InstructorPayoutRuleFilterOption[];
      payoutMethods: InstructorPayoutRuleFilterOption[];
      quickFilters: InstructorPayoutRuleFilterOption[];
    };
    metrics: InstructorPayoutRuleMetric[];
    table: {
      title: string;
      description: string;
      columns: Array<string | { label: string; align: string }>;
      rows: InstructorPayoutRuleRow[];
    };
  };
  appliedFilters: {
    search: string;
    statuses: string[];
    payoutMethods: string[];
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

export type InstructorPayoutRuleDetail = {
  id: string;
  instructorId: string;
  instructorLabel: string;
  courseId: string;
  courseLabel: string;
  payoutMethod: string;
  payoutMethodLabel: string;
  flatAmount: number;
  flatAmountLabel: string;
  percentOfRevenue: number;
  percentOfRevenueLabel: string;
  perEnrollmentAmount: number;
  perEnrollmentAmountLabel: string;
  completionBonusAmount: number;
  completionBonusAmountLabel: string;
  status: string;
  statusLabel: string;
  notes: string;
  createdAt: string | null;
  updatedAt: string | null;
};

export type InstructorPayoutRuleMutationInput = {
  instructor: string;
  course: string;
  payoutMethod: string;
  flatAmount: number;
  percentOfRevenue: number;
  perEnrollmentAmount: number;
  completionBonusAmount: number;
  status: string;
  notes?: string | null;
};

export async function getPayoutRules(
  query: {
    search?: string;
    page?: number;
    statuses?: string[];
    payoutMethods?: string[];
    quickFilters?: string[];
  } = {},
): Promise<InstructorPayoutRulesResponse> {
  const params = new URLSearchParams();
  if (query.search?.trim()) params.set('search', query.search.trim());
  for (const value of query.statuses || []) params.append('status', value);
  for (const value of query.payoutMethods || []) params.append('payoutMethod', value);
  for (const value of query.quickFilters || []) params.append('quickFilter', value);
  params.set('page', String(query.page || 1));
  params.set('limit', '10');

  return fetchAccountingAdmin<InstructorPayoutRulesResponse>(`/accounting/instructor-payout-rules?${params.toString()}`);
}

export async function getPayoutRuleDetail(id: string | number): Promise<InstructorPayoutRuleDetail> {
  return fetchAccountingAdmin<InstructorPayoutRuleDetail>(`/accounting/instructor-payout-rules/${id}`);
}

export async function createPayoutRule(input: InstructorPayoutRuleMutationInput): Promise<InstructorPayoutRuleDetail> {
  const created = await fetchAccountingAdmin<{ id: string | number }>(`/accounting/instructor-payout-rules`, {
    method: 'POST',
    body: JSON.stringify(input),
  });

  return getPayoutRuleDetail(created.id);
}

export async function updatePayoutRule(id: string | number, input: Partial<InstructorPayoutRuleMutationInput>): Promise<InstructorPayoutRuleDetail> {
  return fetchAccountingAdmin<InstructorPayoutRuleDetail>(`/accounting/instructor-payout-rules/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

export async function deletePayoutRule(id: string | number): Promise<{ success: boolean }> {
  return fetchAccountingAdmin<{ success: boolean }>(`/accounting/instructor-payout-rules/${id}`, {
    method: 'DELETE',
  });
}
