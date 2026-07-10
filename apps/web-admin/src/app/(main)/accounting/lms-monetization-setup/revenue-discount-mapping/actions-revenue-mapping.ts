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
        : 'Failed to load revenue mappings.';
    throw new Error(errorMessage);
  }

  return payload as T;
}

export type RevenueMappingFilterOption = {
  label: string;
  value: string;
};

export type RevenueMappingMetric = {
  id: string;
  label: string;
  value: number | string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
};

export type RevenueMappingCell =
  | string
  | { text: string; tone?: 'amber' | 'blue' | 'gray' | 'green' | 'red'; emphasis?: boolean; align?: 'left' | 'right' | 'center' };

export type RevenueMappingRow = {
  id: string;
  courseId: string;
  courseName: string;
  courseCode: string;
  courseRevenueAccountId: string;
  courseRevenueAccountLabel: string;
  deferredRevenueAccountId: string;
  deferredRevenueAccountLabel: string;
  certificateRevenueAccountId: string;
  certificateRevenueAccountLabel: string;
  discountContraRevenueAccountId: string;
  discountContraRevenueAccountLabel: string;
  instructorExpenseAccountId: string;
  instructorExpenseAccountLabel: string;
  notes: string;
};

export type RevenueMappingRegisterResponse = {
  rows: RevenueMappingRow[];
  metrics: RevenueMappingMetric[];
  filterOptions: {
    quickFilters: RevenueMappingFilterOption[];
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
    courses: Array<{ id: string; name: string; courseCode: string }>;
    chartAccounts: Array<{ id: string; code: string; name: string }>;
  };
};

export type RevenueMappingDetail = {
  id: string;
  course: string;
  courseName: string;
  courseRevenueAccount: string;
  courseRevenueAccountLabel: string;
  deferredRevenueAccount: string;
  deferredRevenueAccountLabel: string;
  certificateRevenueAccount: string;
  certificateRevenueAccountLabel: string;
  discountContraRevenueAccount: string;
  discountContraRevenueAccountLabel: string;
  instructorExpenseAccount: string;
  instructorExpenseAccountLabel: string;
  notes: string;
  createdAt: string | null;
  updatedAt: string | null;
};

export type RevenueMappingMutationInput = {
  course: string;
  courseRevenueAccount?: string;
  deferredRevenueAccount?: string;
  certificateRevenueAccount?: string;
  discountContraRevenueAccount?: string;
  instructorExpenseAccount?: string;
  notes?: string;
};

async function fetchCourseFeeProfilesRegister(
  query: {
    search?: string;
    page?: number;
    recognitionMethods?: string[];
    quickFilters?: string[];
  } = {},
): Promise<{
  rows: RevenueMappingRow[];
  metrics: RevenueMappingMetric[];
  filterOptions: { quickFilters: RevenueMappingFilterOption[] };
  meta: { searchPlaceholder: string; columns: string[]; tableTitle: string; tableDescription: string };
  pagination: { page: number; limit: number; totalDocs: number; totalPages: number; hasPrevPage: boolean; hasNextPage: boolean };
  totals: { totalRows: number; filteredRows: number };
  referenceData: { courses: Array<{ id: string; name: string; courseCode: string }>; chartAccounts: Array<{ id: string; code: string; name: string }> };
}> {
  const params = new URLSearchParams();
  if (query.search?.trim()) params.set('search', query.search.trim());
  for (const value of query.recognitionMethods || []) params.append('recognitionMethod', value);
  for (const value of query.quickFilters || []) params.append('quickFilter', value);
  params.set('page', String(query.page || 1));
  params.set('limit', '100');

  const raw = await fetchAccountingAdmin<{
    rows: Array<{
      id: string; courseId: string; courseName: string; courseCode: string;
      courseRevenueAccountId: string; courseRevenueAccountLabel: string;
      deferredRevenueAccountId: string; deferredRevenueAccountLabel: string;
      certificateRevenueAccountId: string; certificateRevenueAccountLabel: string;
      discountContraRevenueAccountId: string; discountContraRevenueAccountLabel: string;
      instructorExpenseAccountId: string; instructorExpenseAccountLabel: string;
      notes: string;
    }>;
    metrics: Array<{ id: string; label: string; value: number; change: string; trend: 'up' | 'down' | 'neutral' }>;
    filterOptions: { recognitionMethods: Array<{ label: string; value: string }>; quickFilters: Array<{ label: string; value: string }> };
    meta: { searchPlaceholder: string; columns: string[]; tableTitle: string; tableDescription: string };
    pagination: { page: number; limit: number; totalDocs: number; totalPages: number; hasPrevPage: boolean; hasNextPage: boolean };
    totals: { totalRows: number; filteredRows: number };
    referenceData: { courses: Array<{ id: string; name: string; courseCode: string }>; chartAccounts: Array<{ id: string; code: string; name: string }> };
  }>(`/accounting/course-fee-profiles?${params.toString()}`);

  const rows: RevenueMappingRow[] = raw.rows.map((r) => ({
    id: r.id,
    courseId: r.courseId,
    courseName: r.courseName,
    courseCode: r.courseCode,
    courseRevenueAccountId: r.courseRevenueAccountId,
    courseRevenueAccountLabel: r.courseRevenueAccountLabel,
    deferredRevenueAccountId: r.deferredRevenueAccountId,
    deferredRevenueAccountLabel: r.deferredRevenueAccountLabel,
    certificateRevenueAccountId: r.certificateRevenueAccountId,
    certificateRevenueAccountLabel: r.certificateRevenueAccountLabel,
    discountContraRevenueAccountId: r.discountContraRevenueAccountId,
    discountContraRevenueAccountLabel: r.discountContraRevenueAccountLabel,
    instructorExpenseAccountId: r.instructorExpenseAccountId,
    instructorExpenseAccountLabel: r.instructorExpenseAccountLabel,
    notes: r.notes,
  }));

  const profilesWithCourseRev = raw.rows.filter((r) => r.courseRevenueAccountId).length;
  const profilesWithDeferredRev = raw.rows.filter((r) => r.deferredRevenueAccountId).length;
  const profilesWithDiscountContra = raw.rows.filter((r) => r.discountContraRevenueAccountId).length;

  return {
    rows,
    metrics: [
      { id: 'mapped-courses', label: 'Mapped Courses', value: raw.rows.length, change: 'Course fee profiles with accounting mappings', trend: raw.rows.length > 0 ? 'up' as const : 'neutral' as const },
      { id: 'course-revenue-maps', label: 'Course Revenue Maps', value: profilesWithCourseRev, change: 'Profiles with course revenue account set', trend: profilesWithCourseRev > 0 ? 'up' as const : 'neutral' as const },
      { id: 'deferred-revenue-maps', label: 'Deferred Revenue Maps', value: profilesWithDeferredRev, change: 'Profiles using deferred revenue handling', trend: profilesWithDeferredRev > 0 ? 'up' as const : 'neutral' as const },
      { id: 'contra-revenue-maps', label: 'Contra Revenue Maps', value: profilesWithDiscountContra, change: 'Profiles with discount contra setup', trend: profilesWithDiscountContra > 0 ? 'neutral' as const : 'down' as const },
    ],
    filterOptions: {
      quickFilters: raw.filterOptions.quickFilters,
    },
    meta: {
      searchPlaceholder: 'Search course, revenue account, deferred account, certificate account, or instructor expense account',
      columns: ['Course', 'Course Revenue', 'Deferred Revenue', 'Certificate Revenue', 'Discount Contra', 'Instructor Expense'],
      tableTitle: 'LMS Revenue Mapping Register',
      tableDescription: 'Revenue mapping view aligned to account-relationship fields stored on accounting-course-fee-profiles.',
    },
    pagination: raw.pagination,
    totals: raw.totals,
    referenceData: raw.referenceData,
  };
}

export async function getRevenueMappings(
  query: {
    search?: string;
    page?: number;
    quickFilters?: string[];
  } = {},
): Promise<RevenueMappingRegisterResponse> {
  return fetchCourseFeeProfilesRegister(query);
}

export async function getRevenueMappingDetail(id: string | number): Promise<RevenueMappingDetail> {
  return fetchAccountingAdmin<RevenueMappingDetail>(`/accounting/course-fee-profiles/${id}`);
}

export async function createRevenueMapping(input: RevenueMappingMutationInput): Promise<RevenueMappingDetail> {
  const created = await fetchAccountingAdmin<{ id: string | number }>(`/accounting/course-fee-profiles`, {
    method: 'POST',
    body: JSON.stringify({
      ...input,
      certificateFee: 0,
      retakeFee: 0,
      reassessmentFee: 0,
      renewalFee: 0,
      latePaymentFee: 0,
      manualAdjustmentAllowed: true,
      defaultRecognitionMethod: 'on_activation',
    }),
  });
  return getRevenueMappingDetail(created.id);
}

export async function updateRevenueMapping(id: string | number, input: RevenueMappingMutationInput): Promise<RevenueMappingDetail> {
  return fetchAccountingAdmin<RevenueMappingDetail>(`/accounting/course-fee-profiles/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

export async function deleteRevenueMapping(id: string | number): Promise<{ success: boolean }> {
  return fetchAccountingAdmin<{ success: boolean }>(`/accounting/course-fee-profiles/${id}`, {
    method: 'DELETE',
  });
}
