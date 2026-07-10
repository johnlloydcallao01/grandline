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
        : 'Failed to load course fee profiles.';
    throw new Error(errorMessage);
  }

  return payload as T;
}

export type CoursePricingFilterOption = {
  label: string;
  value: string;
};

export type CoursePricingMetric = {
  id: string;
  label: string;
  value: number | string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
};

export type CoursePricingCell =
  | string
  | { text: string; tone?: 'amber' | 'blue' | 'gray' | 'green' | 'red'; emphasis?: boolean; align?: 'left' | 'right' | 'center' };

export type CoursePricingRow = {
  id: string;
  courseId: string;
  courseName: string;
  courseCode: string;
  certificateFee: number;
  retakeFee: number;
  reassessmentFee: number;
  renewalFee: number;
  latePaymentFee: number;
  manualAdjustmentAllowed: boolean;
  defaultRecognitionMethod: string;
  defaultRecognitionMethodLabel: string;
  defaultRecognitionMethodTone: string;
  courseRevenueAccountId: string;
  courseRevenueAccountLabel: string;
  deferredRevenueAccountId: string;
  deferredRevenueAccountLabel: string;
  discountContraRevenueAccountId: string;
  discountContraRevenueAccountLabel: string;
  certificateRevenueAccountId: string;
  certificateRevenueAccountLabel: string;
  instructorExpenseAccountId: string;
  instructorExpenseAccountLabel: string;
  notes: string;
};

export type CoursePricingRegisterResponse = {
  rows: CoursePricingRow[];
  metrics: CoursePricingMetric[];
  filterOptions: {
    recognitionMethods: CoursePricingFilterOption[];
    quickFilters: CoursePricingFilterOption[];
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

export type CoursePricingDetail = {
  id: string;
  course: string;
  courseName: string;
  certificateFee: number;
  retakeFee: number;
  reassessmentFee: number;
  renewalFee: number;
  latePaymentFee: number;
  manualAdjustmentAllowed: boolean;
  defaultRecognitionMethod: string;
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

export type CoursePricingMutationInput = {
  course: string;
  certificateFee?: number;
  retakeFee?: number;
  reassessmentFee?: number;
  renewalFee?: number;
  latePaymentFee?: number;
  manualAdjustmentAllowed?: boolean;
  defaultRecognitionMethod?: string;
  courseRevenueAccount?: string;
  deferredRevenueAccount?: string;
  certificateRevenueAccount?: string;
  discountContraRevenueAccount?: string;
  instructorExpenseAccount?: string;
  notes?: string;
};

export async function getCourseFeeProfiles(
  query: {
    search?: string;
    page?: number;
    recognitionMethods?: string[];
    quickFilters?: string[];
  } = {},
): Promise<CoursePricingRegisterResponse> {
  const params = new URLSearchParams();
  if (query.search?.trim()) params.set('search', query.search.trim());
  for (const value of query.recognitionMethods || []) params.append('recognitionMethod', value);
  for (const value of query.quickFilters || []) params.append('quickFilter', value);
  params.set('page', String(query.page || 1));
  params.set('limit', '100');

  return fetchAccountingAdmin<CoursePricingRegisterResponse>(`/accounting/course-fee-profiles?${params.toString()}`);
}

export async function getCourseFeeProfileDetail(id: string | number): Promise<CoursePricingDetail> {
  return fetchAccountingAdmin<CoursePricingDetail>(`/accounting/course-fee-profiles/${id}`);
}

export async function createCourseFeeProfile(input: CoursePricingMutationInput): Promise<CoursePricingDetail> {
  const created = await fetchAccountingAdmin<{ id: string | number }>(`/accounting/course-fee-profiles`, {
    method: 'POST',
    body: JSON.stringify(input),
  });
  return getCourseFeeProfileDetail(created.id);
}

export async function updateCourseFeeProfile(id: string | number, input: CoursePricingMutationInput): Promise<CoursePricingDetail> {
  return fetchAccountingAdmin<CoursePricingDetail>(`/accounting/course-fee-profiles/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

export async function deleteCourseFeeProfile(id: string | number): Promise<{ success: boolean }> {
  return fetchAccountingAdmin<{ success: boolean }>(`/accounting/course-fee-profiles/${id}`, {
    method: 'DELETE',
  });
}

export type FeeComponentRow = {
  id: string;
  courseName: string;
  courseCode: string;
  certificateFee: number;
  retakeFee: number;
  reassessmentFee: number;
  renewalFee: number;
  latePaymentFee: number;
  manualAdjustmentAllowed: boolean;
  manualAdjustmentLabel: string;
  manualAdjustmentTone: string;
  defaultRecognitionMethod: string;
  defaultRecognitionMethodLabel: string;
  defaultRecognitionMethodTone: string;
  instructorExpenseAccountLabel: string;
  notes: string;
};

export type FeeComponentsResponse = {
  section: {
    label: string;
    description: string;
    searchPlaceholder: string;
    columns: string[];
    table: {
      title: string;
      description: string;
      rows: FeeComponentRow[];
    };
    filters: {
      recognitionMethods: CoursePricingFilterOption[];
    };
    metrics: CoursePricingMetric[];
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

export async function getFeeComponents(
  query: {
    search?: string;
    page?: number;
    recognitionMethods?: string[];
  } = {},
): Promise<FeeComponentsResponse> {
  const params = new URLSearchParams();
  if (query.search?.trim()) params.set('search', query.search.trim());
  for (const value of query.recognitionMethods || []) params.append('recognitionMethod', value);
  params.set('page', String(query.page || 1));
  params.set('limit', '100');

  const data = await fetchAccountingAdmin<CoursePricingRegisterResponse>(`/accounting/course-fee-profiles?${params.toString()}`);

  const rows: FeeComponentRow[] = data.rows.map((r) => ({
    id: r.id,
    courseName: r.courseName,
    courseCode: r.courseCode,
    certificateFee: r.certificateFee,
    retakeFee: r.retakeFee,
    reassessmentFee: r.reassessmentFee,
    renewalFee: r.renewalFee,
    latePaymentFee: r.latePaymentFee,
    manualAdjustmentAllowed: r.manualAdjustmentAllowed,
    manualAdjustmentLabel: r.manualAdjustmentAllowed ? 'Allowed' : 'Blocked',
    manualAdjustmentTone: r.manualAdjustmentAllowed ? 'green' : 'amber',
    defaultRecognitionMethod: r.defaultRecognitionMethod,
    defaultRecognitionMethodLabel: r.defaultRecognitionMethodLabel,
    defaultRecognitionMethodTone: r.defaultRecognitionMethodTone,
    instructorExpenseAccountLabel: r.instructorExpenseAccountLabel,
    notes: r.notes,
  }));

  const profilesWithCertFee = data.rows.filter((r) => r.certificateFee > 0).length;
  const profilesWithRetakeFee = data.rows.filter((r) => r.retakeFee > 0).length;
  const profilesWithRenewalFee = data.rows.filter((r) => r.renewalFee > 0).length;

  return {
    section: {
      label: 'Fee Components & Recognition',
      description: 'Fee component values and recognition defaults for each course.',
      searchPlaceholder: 'Search course, fee amount, recognition method, or instructor expense account',
      columns: ['Course', 'Certificate Fee', 'Retake Fee', 'Reassessment Fee', 'Renewal Fee', 'Late Payment Fee', 'Instructor Expense', 'Recognition Method', 'Manual Adjustment'],
      table: {
        title: 'Fee Components Register',
        description: 'Fee component values and recognition defaults drawn from accounting-course-fee-profiles, including certificate, retake, renewal, late fees, and instructor expense mapping.',
        rows,
      },
      filters: {
        recognitionMethods: data.filterOptions.recognitionMethods,
      },
      metrics: [
        { id: 'total-profiles', label: 'Fee Profiles', value: data.rows.length, change: 'Courses with LMS monetization overlay records', trend: data.rows.length > 0 ? 'up' as const : 'neutral' as const },
        { id: 'cert-fee-profiles', label: 'With Certificate Fee', value: profilesWithCertFee, change: 'Profiles charging a certificate fee', trend: profilesWithCertFee > 0 ? 'up' as const : 'neutral' as const },
        { id: 'retake-fee-profiles', label: 'With Retake Fee', value: profilesWithRetakeFee, change: 'Profiles charging a retake fee', trend: profilesWithRetakeFee > 0 ? 'up' as const : 'neutral' as const },
        { id: 'renewal-fee-profiles', label: 'With Renewal Fee', value: profilesWithRenewalFee, change: 'Profiles charging a renewal fee', trend: profilesWithRenewalFee > 0 ? 'up' as const : 'neutral' as const },
      ],
    },
    pagination: data.pagination,
    totals: data.totals,
    referenceData: data.referenceData,
  };
}
