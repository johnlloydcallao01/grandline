'use server';

import { getServerToken } from '@/app/actions/auth';
import { env } from '@/lib/env';

async function fetchAccountingAdmin<T>(path: string, init?: RequestInit): Promise<T> {
  const token = await getServerToken();
  if (!token) throw new Error('No admin session available.');

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
        : 'Failed to load revenue analysis data.';
    throw new Error(errorMessage);
  }

  return payload as T;
}

export type RevenueAnalysisMetric = {
  id: string;
  label: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
};

export type RevenueAnalysisCell =
  | string
  | { text: string; tone?: 'amber' | 'blue' | 'gray' | 'green' | 'red'; emphasis?: boolean; align?: 'left' | 'right' | 'center' };

export type RevenueByCourseRow = {
  id: string;
  courseTitle: string;
  linkedEnrollments: number;
  averageCharge: number;
  averageChargeLabel: string;
  billedRevenue: number;
  billedRevenueLabel: string;
  rank: number;
  billingLinkCount: number;
  cells: RevenueAnalysisCell[];
};

export type RevenueByInstructorRow = {
  id: string;
  instructorName: string;
  linkedCourses: number;
  linkedEnrollments: number;
  billedRevenue: number;
  billedRevenueLabel: string;
  revenueShare: number;
  revenueShareLabel: string;
  cells: RevenueAnalysisCell[];
};

export type RevenueByEnrollmentTypeRow = {
  id: string;
  enrollmentType: string;
  linkedEnrollments: number;
  averageCharge: number;
  averageChargeLabel: string;
  billedRevenue: number;
  billedRevenueLabel: string;
  share: number;
  shareLabel: string;
  cells: RevenueAnalysisCell[];
};

export type RevenueAnalysisResponse = {
  tab: string;
  metrics: RevenueAnalysisMetric[];
  rows: RevenueByCourseRow[] | RevenueByInstructorRow[] | RevenueByEnrollmentTypeRow[];
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

function toCell(text: string, options?: { emphasis?: boolean; align?: 'left' | 'right' | 'center' }): RevenueAnalysisCell {
  return { text, ...(options || {}) };
}

function toBadgeCell(text: string, tone: 'amber' | 'blue' | 'gray' | 'green' | 'red'): RevenueAnalysisCell {
  return { text, tone } as RevenueAnalysisCell;
}

export async function getRevenueAnalysis(
  query: {
    tab?: string;
    search?: string;
    page?: number;
  } = {},
): Promise<RevenueAnalysisResponse> {
  const params = new URLSearchParams();
  params.set('tab', query.tab || 'revenue-by-course');
  if (query.search?.trim()) params.set('search', query.search.trim());
  params.set('page', String(query.page || 1));
  params.set('limit', '10');

  const raw = await fetchAccountingAdmin<RevenueAnalysisResponse>(
    `/accounting/lms/reports/revenue-analysis?${params.toString()}`,
  );

  const rows = raw.rows;
  const tab = raw.tab;

  if (tab === 'revenue-by-course') {
    const courseRows = rows as RevenueByCourseRow[];
    const enriched = courseRows.map((row) => ({
      ...row,
      cells: [
        toCell(row.courseTitle, { emphasis: true }),
        toCell(String(row.linkedEnrollments), { align: 'right' }),
        toCell(row.averageChargeLabel, { align: 'right' }),
        toCell(row.billedRevenueLabel, { align: 'right' }),
        row.rank === 1 ? toBadgeCell(String(row.rank), 'green') : row.rank <= 3 ? toBadgeCell(String(row.rank), 'blue') : toBadgeCell(String(row.rank), 'gray'),
      ] as RevenueAnalysisCell[],
    }));
    return { ...raw, rows: enriched };
  }

  if (tab === 'revenue-by-instructor') {
    const instructorRows = rows as RevenueByInstructorRow[];
    const enriched = instructorRows.map((row) => ({
      ...row,
      cells: [
        toCell(row.instructorName, { emphasis: true }),
        toCell(String(row.linkedCourses), { align: 'right' }),
        toCell(String(row.linkedEnrollments), { align: 'right' }),
        toCell(row.billedRevenueLabel, { align: 'right' }),
        toCell(row.revenueShareLabel, { align: 'right' }),
      ] as RevenueAnalysisCell[],
    }));
    return { ...raw, rows: enriched };
  }

  const typeRows = rows as RevenueByEnrollmentTypeRow[];
  const enriched = typeRows.map((row) => ({
    ...row,
    cells: [
      toCell(row.enrollmentType, { emphasis: true }),
      toCell(String(row.linkedEnrollments), { align: 'right' }),
      toCell(row.averageChargeLabel, { align: 'right' }),
      toCell(row.billedRevenueLabel, { align: 'right' }),
      toCell(row.shareLabel, { align: 'right' }),
    ] as RevenueAnalysisCell[],
  }));

  return { ...raw, rows: enriched };
}
