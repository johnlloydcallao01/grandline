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
        : 'Failed to load recognition and certificate reporting data.';
    throw new Error(errorMessage);
  }

  return payload as T;
}

export type RecognitionCell =
  | string
  | { text: string; tone?: 'amber' | 'blue' | 'gray' | 'green' | 'red'; emphasis?: boolean; align?: 'left' | 'right' | 'center' };

export type RecognitionMetric = {
  id: string;
  label: string;
  value: number | string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
};

export type CompletionToRevenueRow = {
  id: string;
  enrollmentRef: string;
  courseTitle: string;
  completedAt: string | null;
  completedAtLabel: string;
  finalCharge: number;
  finalChargeLabel: string;
  recognizedRevenue: number;
  recognizedRevenueLabel: string;
  deferredRevenue: number;
  deferredRevenueLabel: string;
  billingStatus: string;
  billingStatusLabel: string;
  billingStatusTone: 'amber' | 'blue' | 'gray' | 'green' | 'red';
  cells: RecognitionCell[];
};

export type CertificateRevenueRow = {
  id: string;
  certificateCode: string;
  enrollmentRef: string;
  courseTitle: string;
  issueDate: string | null;
  issueDateLabel: string;
  billedAmount: number;
  billedAmountLabel: string;
  billingState: string;
  billingStateLabel: string;
  billingStateTone: 'amber' | 'blue' | 'gray' | 'green' | 'red';
  cells: RecognitionCell[];
};

export type RecognitionCertificateReportResponse = {
  section: {
    id: string;
    label: string;
    description: string;
    searchPlaceholder: string;
    filters: {
      statuses: Array<{ label: string; value: string }>;
      customers: Array<{ label: string; value: string }>;
      postingStatuses: Array<{ label: string; value: string }>;
      quickFilters: Array<{ label: string; value: string }>;
    };
    metrics: RecognitionMetric[];
    table: {
      title: string;
      description: string;
      columns: string[];
      rows: CompletionToRevenueRow[] | CertificateRevenueRow[];
    };
  };
  appliedFilters: {
    search: string;
    statuses: string[];
    customerIds: string[];
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
};

export async function getRecognitionCertificateReport(
  query: {
    tab?: string;
    search?: string;
    page?: number;
  } = {},
): Promise<RecognitionCertificateReportResponse> {
  const params = new URLSearchParams();
  params.set('tab', query.tab || 'completion-to-revenue');
  if (query.search?.trim()) params.set('search', query.search.trim());
  params.set('page', String(query.page || 1));
  params.set('limit', '10');

  return fetchAccountingAdmin<RecognitionCertificateReportResponse>(
    `/accounting/lms/reports/recognition-certificate-reporting?${params.toString()}`,
  );
}
