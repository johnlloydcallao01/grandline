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
        : 'Failed to load billing pipeline data.';
    throw new Error(errorMessage);
  }

  return payload as T;
}

export type PipelineCell =
  | string
  | { text: string; tone?: 'amber' | 'blue' | 'gray' | 'green' | 'red'; emphasis?: boolean; align?: 'left' | 'right' | 'center' };

export type PipelineMetric = {
  id: string;
  label: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
};

export type PendingEnrollmentRow = {
  id: string;
  sourceReference: string;
  courseTitle: string;
  traineeName: string;
  billingStatus: string;
  billingStatusLabel: string;
  billingStatusTone: 'amber' | 'blue' | 'gray' | 'green' | 'red';
  finalCharge: number;
  finalChargeLabel: string;
  customerLabel: string;
  customerId: string | null;
  actionStage: string;
  invoiceId: string | null;
  enrollmentId: string | null;
  cells: PipelineCell[];
};

export type CorporateReceivableRow = {
  id: string;
  accountCode: string;
  accountName: string;
  invoiceNumber: string;
  coveredAmount: number;
  coveredAmountLabel: string;
  balanceDue: number;
  balanceDueLabel: string;
  status: string;
  statusLabel: string;
  statusTone: string;
  coverageType: string;
  cells: PipelineCell[];
};

export type TraineeCollectionRow = {
  id: string;
  sourceReference: string;
  traineeId: string;
  customerIdRef: string;
  amountDue: number;
  amountDueLabel: string;
  priority: string;
  priorityTone: 'amber' | 'blue' | 'gray' | 'green' | 'red';
  collectionState: string;
  billingStatus: string;
  customerLabel: string;
  traineeName: string;
  cells: PipelineCell[];
};

export type PipelineResponse = {
  tab: string;
  metrics: PipelineMetric[];
  rows: PendingEnrollmentRow[] | CorporateReceivableRow[] | TraineeCollectionRow[];
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

function toCell(text: string, options?: { emphasis?: boolean; align?: 'left' | 'right' | 'center' }): PipelineCell {
  return { text, ...(options || {}) };
}

function toBadgeCell(text: string, tone: 'amber' | 'blue' | 'gray' | 'green' | 'red'): PipelineCell {
  return { text, tone } as PipelineCell;
}

export async function getBillingPipeline(
  query: {
    tab?: string;
    search?: string;
    page?: number;
  } = {},
): Promise<PipelineResponse> {
  const params = new URLSearchParams();
  params.set('tab', query.tab || 'pending-enrollment-billing');
  if (query.search?.trim()) params.set('search', query.search.trim());
  params.set('page', String(query.page || 1));
  params.set('limit', '10');

  const raw = await fetchAccountingAdmin<PipelineResponse>(
    `/accounting/lms/reports/billing-pipeline-monitoring?${params.toString()}`,
  );

  const rows = raw.rows;
  const tab = raw.tab;

  if (tab === 'pending-enrollment-billing') {
    const enriched = (rows as PendingEnrollmentRow[]).map((row) => ({
      ...row,
      cells: [
        toCell(row.sourceReference, { emphasis: true }),
        toCell(row.courseTitle),
        toCell(row.traineeName),
        toBadgeCell(row.billingStatusLabel, row.billingStatusTone),
        toCell(row.finalChargeLabel, { align: 'right' }),
        toCell(row.actionStage),
      ] as PipelineCell[],
    }));
    return { ...raw, rows: enriched };
  }

  if (tab === 'corporate-receivables') {
    const enriched = (rows as CorporateReceivableRow[]).map((row) => ({
      ...row,
      cells: [
        toCell(row.accountCode, { emphasis: true }),
        toCell(row.accountName),
        toCell(row.invoiceNumber || '-'),
        toCell(row.coveredAmountLabel, { align: 'right' }),
        toCell(row.balanceDueLabel, { align: 'right' }),
        toBadgeCell(row.statusLabel, row.statusTone as 'amber' | 'blue' | 'gray' | 'green' | 'red'),
      ] as PipelineCell[],
    }));
    return { ...raw, rows: enriched };
  }

  const enriched = (rows as TraineeCollectionRow[]).map((row) => ({
    ...row,
    cells: [
      toCell(row.sourceReference, { emphasis: true }),
      toCell(row.traineeId),
      toCell(row.customerIdRef),
      toCell(row.amountDueLabel, { align: 'right' }),
      toBadgeCell(row.priority, row.priorityTone),
      toCell(row.collectionState),
    ] as PipelineCell[],
  }));

  return { ...raw, rows: enriched };
}
