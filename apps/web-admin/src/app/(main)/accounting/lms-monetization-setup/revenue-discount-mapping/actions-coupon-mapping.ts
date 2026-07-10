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

export type CouponFilterOption = {
  label: string;
  value: string;
};

export type CouponMetric = {
  id: string;
  label: string;
  value: number | string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
};

export type CouponCell =
  | string
  | { text: string; tone?: 'amber' | 'blue' | 'gray' | 'green' | 'red'; emphasis?: boolean; align?: 'left' | 'right' | 'center' };

export type CouponRegisterRow = {
  id: string;
  code: string;
  name: string;
  status: string;
  statusLabel: string;
  discountType: string;
  discountTypeLabel: string;
  amount: number;
  scopeType: string;
  scopeTypeLabel: string;
  usageCount: number;
  startsAt: string | null;
  expiresAt: string | null;
  stackable: boolean;
};

export type CouponRegisterResponse = {
  rows: CouponRegisterRow[];
  metrics: CouponMetric[];
  filterOptions: {
    statuses: CouponFilterOption[];
    discountTypes: CouponFilterOption[];
    quickFilters: CouponFilterOption[];
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
    categories: Array<{ id: string; name: string }>;
    trainees: Array<{ id: string; label: string }>;
  };
};

export type CouponDetail = {
  id: string;
  code: string;
  name: string;
  description: string;
  status: string;
  statusLabel: string;
  discountType: string;
  discountTypeLabel: string;
  amount: number;
  maxDiscountAmount: number | null;
  scopeType: string;
  scopeTypeLabel: string;
  includedCourseIds: string[];
  includedCourseLabels: string[];
  excludedCourseIds: string[];
  excludedCourseLabels: string[];
  includedCategoryIds: string[];
  includedCategoryLabels: string[];
  excludedCategoryIds: string[];
  excludedCategoryLabels: string[];
  excludeSaleCourses: boolean;
  minimumAmount: number | null;
  maximumAmount: number | null;
  usageLimitTotal: number | null;
  usageLimitPerUser: number | null;
  maxItemsAffected: number | null;
  stackable: boolean;
  priority: number;
  usageCount: number;
  lastUsedAt: string | null;
  startsAt: string | null;
  expiresAt: string | null;
  allowedTraineeIds: string[];
  allowedTraineeLabels: string[];
  allowedEmails: string[];
  createdAt: string | null;
  updatedAt: string | null;
  usageSummary: {
    redemptionCount: number;
    hasBlockingDependents: boolean;
  };
};

export type CouponMutationInput = {
  code?: string;
  name?: string;
  description?: string;
  status?: string;
  discountType?: string;
  amount?: number;
  maxDiscountAmount?: number | null;
  scopeType?: string;
  includedCourses?: string[];
  excludedCourses?: string[];
  includedCategories?: string[];
  excludedCategories?: string[];
  excludeSaleCourses?: boolean;
  minimumAmount?: number | null;
  maximumAmount?: number | null;
  usageLimitTotal?: number | null;
  usageLimitPerUser?: number | null;
  maxItemsAffected?: number | null;
  stackable?: boolean;
  priority?: number;
  startsAt?: string | null;
  expiresAt?: string | null;
  allowedTrainees?: string[];
  allowedEmails?: string[];
};

export async function getCoupons(
  query: {
    search?: string;
    page?: number;
    statuses?: string[];
    discountTypes?: string[];
    quickFilters?: string[];
  } = {},
): Promise<CouponRegisterResponse> {
  const params = new URLSearchParams();
  if (query.search?.trim()) params.set('search', query.search.trim());
  for (const value of query.statuses || []) params.append('status', value);
  for (const value of query.discountTypes || []) params.append('discountType', value);
  for (const value of query.quickFilters || []) params.append('quickFilter', value);
  params.set('page', String(query.page || 1));
  params.set('limit', '100');

  const raw = await fetchAccountingAdmin<{
    rows: CouponRegisterRow[];
    metrics: CouponMetric[];
    filterOptions: {
      statuses: CouponFilterOption[];
      discountTypes: CouponFilterOption[];
      quickFilters: CouponFilterOption[];
    };
    meta: { searchPlaceholder: string; columns: string[]; tableTitle: string; tableDescription: string };
    pagination: { page: number; limit: number; totalDocs: number; totalPages: number; hasPrevPage: boolean; hasNextPage: boolean };
    totals: { totalRows: number; filteredRows: number };
    referenceData: {
      courses: Array<{ id: string; name: string; courseCode: string }>;
      categories: Array<{ id: string; name: string }>;
      trainees: Array<{ id: string; label: string }>;
    };
  }>(`/accounting/coupon-codes?${params.toString()}`);

  return raw;
}

export async function getCouponDetail(id: string | number): Promise<CouponDetail> {
  return fetchAccountingAdmin<CouponDetail>(`/accounting/coupon-codes/${id}`);
}

export async function createCoupon(input: CouponMutationInput): Promise<CouponDetail> {
  return fetchAccountingAdmin<CouponDetail>(`/accounting/coupon-codes`, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function updateCoupon(id: string | number, input: CouponMutationInput): Promise<CouponDetail> {
  return fetchAccountingAdmin<CouponDetail>(`/accounting/coupon-codes/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

export async function deleteCoupon(id: string | number): Promise<{ success: boolean }> {
  return fetchAccountingAdmin<{ success: boolean }>(`/accounting/coupon-codes/${id}`, {
    method: 'DELETE',
  });
}
