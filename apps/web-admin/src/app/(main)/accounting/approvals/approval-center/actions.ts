'use server';

import { getServerToken } from '@/app/actions/auth';
import { env } from '@/lib/env';

async function fetchAccountingAdmin<T>(path: string, init?: RequestInit): Promise<T> {
  const token = await getServerToken();
  if (!token) throw new Error('No admin session available.');
  const response = await fetch(`${env.NEXT_PUBLIC_API_URL}${path}`, { ...init, headers: { Authorization: `JWT ${token}`, ...(init?.body ? { 'Content-Type': 'application/json' } : {}), ...(init?.headers || {}) }, cache: 'no-store' });
  const payload = (await response.json().catch(() => null)) as T | { error?: string } | null;
  if (!response.ok) { const m = payload && typeof payload === 'object' && 'error' in payload && typeof payload.error === 'string' ? payload.error : 'Failed to load approval data.'; throw new Error(m); }
  return payload as T;
}

async function postAccountingAdmin<T>(path: string, body: Record<string, unknown>): Promise<T> {
  const token = await getServerToken();
  if (!token) throw new Error('No admin session available.');
  const response = await fetch(`${env.NEXT_PUBLIC_API_URL}${path}`, { method: 'POST', body: JSON.stringify(body), headers: { Authorization: `JWT ${token}`, 'Content-Type': 'application/json' }, cache: 'no-store' });
  const payload = (await response.json().catch(() => null)) as T | { error?: string } | null;
  if (!response.ok) { const m = payload && typeof payload === 'object' && 'error' in payload && typeof payload.error === 'string' ? payload.error : 'Failed to process approval action.'; throw new Error(m); }
  return payload as T;
}

// Types
export type AqMetric = { id: string; label: string; value: number | string; change: string; trend: 'up' | 'down' | 'neutral'; };
export type AqFilterOption = { label: string; value: string };

export type ApprovalQueueRow = {
  id: string; approvalId: string; workflowName: string; entityType: string; entityTypeLabel: string;
  entityId: string; status: string; statusLabel: string; statusTone: string;
  requestedBy: string; currentApprover: string; requestedAt: string | null; requestedAtLabel: string; trailCount: number;
  cells: Array<string | { text: string; emphasis?: boolean; tone?: string; align?: string }>;
};

export type ApprovalQueueResponse = {
  section: { id: string; label: string; description: string; searchPlaceholder: string; filters: { statuses: AqFilterOption[]; quickFilters: AqFilterOption[] }; metrics: AqMetric[]; table: { title: string; description: string; columns: string[]; rows: ApprovalQueueRow[] }; };
  appliedFilters: { search: string; statuses: string[]; quickFilters: string[] };
  pagination: { page: number; limit: number; totalDocs: number; totalPages: number; hasPrevPage: boolean; hasNextPage: boolean };
  totals: { totalRows: number; filteredRows: number; pendingCount: number; approvedCount: number; rejectedCount: number };
  referenceData: { entityTypes: AqFilterOption[] };
};

export async function getApprovalQueue(query: { search?: string; page?: number; statuses?: string[]; quickFilters?: string[] } = {}): Promise<ApprovalQueueResponse> {
  const params = new URLSearchParams();
  if (query.search?.trim()) params.set('search', query.search.trim());
  for (const s of query.statuses || []) params.append('status', s);
  for (const q of query.quickFilters || []) params.append('quickFilter', q);
  params.set('page', String(query.page || 1)); params.set('limit', '10');
  return fetchAccountingAdmin<ApprovalQueueResponse>(`/accounting/approval-queue?${params.toString()}`);
}

export async function createApprovalRequest(data: { entityType: string; entityId: string; notes?: string }): Promise<{ id: string }> {
  return postAccountingAdmin<{ id: string }>('/accounting/approvals/requests', { entityType: data.entityType, entityId: data.entityId, notes: data.notes || null });
}

export async function approveRequest(approvalRequestId: string, notes?: string): Promise<void> {
  await postAccountingAdmin<void>(`/accounting/approvals/requests/${encodeURIComponent(approvalRequestId)}/approve`, { notes: notes || null });
}

export async function rejectRequest(approvalRequestId: string, notes?: string): Promise<void> {
  await postAccountingAdmin<void>(`/accounting/approvals/requests/${encodeURIComponent(approvalRequestId)}/reject`, { notes: notes || null });
}
