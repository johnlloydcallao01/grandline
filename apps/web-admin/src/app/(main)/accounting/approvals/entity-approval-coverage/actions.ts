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
    const errorMessage = payload && typeof payload === 'object' && 'error' in payload && typeof payload.error === 'string'
      ? payload.error : 'Failed to load coverage data.';
    throw new Error(errorMessage);
  }
  return payload as T;
}

async function postAccountingAdmin<T>(path: string, body: Record<string, unknown>): Promise<T> {
  const token = await getServerToken();
  if (!token) throw new Error('No admin session available.');
  const response = await fetch(`${env.NEXT_PUBLIC_API_URL}${path}`, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { Authorization: `JWT ${token}`, 'Content-Type': 'application/json' },
    cache: 'no-store',
  });
  const payload = (await response.json().catch(() => null)) as T | { error?: string } | null;
  if (!response.ok) {
    const errorMessage = payload && typeof payload === 'object' && 'error' in payload && typeof payload.error === 'string'
      ? payload.error : 'Failed to process coverage action.';
    throw new Error(errorMessage);
  }
  return payload as T;
}

export type EcMetric = { id: string; label: string; value: number | string; change: string; trend: 'up' | 'down' | 'neutral' };
export type EcFilterOption = { label: string; value: string };

export type TransactionCoverageRow = {
  id: string;
  entityType: string;
  entityTypeLabel: string;
  mappedCollection: string;
  requestSupport: boolean;
  requestSupportLabel: string;
  approveOutcome: string;
  rejectOutcome: string;
  hasWorkflow: boolean;
  workflowStatus: string;
  workflowStatusTone: string;
  workflowId: string;
  workflowCode: string;
  workflowName: string;
  requestCount: number;
  pendingCount: number;
  lastRequestLabel: string;
  cells: Array<string | { text: string; emphasis?: boolean; tone?: string; align?: string }>;
};

export type TransactionCoverageResponse = {
  section: {
    id: string;
    label: string;
    description: string;
    searchPlaceholder: string;
    filters: {
      entityTypes: EcFilterOption[];
      quickFilters: EcFilterOption[];
    };
    metrics: EcMetric[];
    table: {
      title: string;
      description: string;
      columns: string[];
      rows: TransactionCoverageRow[];
    };
  };
  appliedFilters: { search: string; entityTypes: string[]; quickFilters: string[] };
  pagination: { page: number; limit: number; totalDocs: number; totalPages: number; hasPrevPage: boolean; hasNextPage: boolean };
  totals: { totalRows: number; filteredRows: number; withWorkflowCount: number; totalRequests: number; totalPending: number };
  referenceData: {
    entityTypes: EcFilterOption[];
    users: Array<{ id: string; label: string; email: string; username: string }>;
  };
};

export async function getTransactionCoverage(
  query: { search?: string; page?: number; entityTypes?: string[]; quickFilters?: string[] } = {}
): Promise<TransactionCoverageResponse> {
  const params = new URLSearchParams();
  if (query.search?.trim()) params.set('search', query.search.trim());
  for (const t of query.entityTypes || []) params.append('entityType', t);
  for (const q of query.quickFilters || []) params.append('quickFilter', q);
  params.set('page', String(query.page || 1));
  params.set('limit', '10');
  return fetchAccountingAdmin<TransactionCoverageResponse>(`/accounting/entity-coverage/transactions?${params.toString()}`);
}

export type WorkflowDetail = {
  id: string;
  workflowCode: string;
  name: string;
  entityType: string;
  isActive: boolean;
  notes: string;
  steps: Array<{
    stepNumber: number;
    label: string;
    approverUser: { id: string; label: string } | null;
    approverRole: string;
  }>;
  createdAt: string | null;
  updatedAt: string | null;
};

export async function getWorkflowDetail(id: string | number): Promise<WorkflowDetail> {
  return fetchAccountingAdmin<WorkflowDetail>(`/accounting/workflow-directory/${encodeURIComponent(String(id))}`);
}

export async function createApprovalRequest(data: {
  entityType: string;
  entityId: string;
  notes?: string;
}): Promise<{ id: string }> {
  return postAccountingAdmin<{ id: string }>('/accounting/approvals/requests', {
    entityType: data.entityType,
    entityId: data.entityId,
    notes: data.notes || null,
  });
}

async function patchAccountingAdmin<T>(path: string, body: Record<string, unknown>): Promise<T> {
  const token = await getServerToken();
  if (!token) throw new Error('No admin session available.');
  const response = await fetch(`${env.NEXT_PUBLIC_API_URL}${path}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
    headers: { Authorization: `JWT ${token}`, 'Content-Type': 'application/json' },
    cache: 'no-store',
  });
  const payload = (await response.json().catch(() => null)) as T | { error?: string } | null;
  if (!response.ok) {
    const errorMessage = payload && typeof payload === 'object' && 'error' in payload && typeof payload.error === 'string'
      ? payload.error : 'Failed to process workflow action.';
    throw new Error(errorMessage);
  }
  return payload as T;
}

async function deleteAccountingAdmin(path: string): Promise<void> {
  const token = await getServerToken();
  if (!token) throw new Error('No admin session available.');
  const response = await fetch(`${env.NEXT_PUBLIC_API_URL}${path}`, {
    method: 'DELETE',
    headers: { Authorization: `JWT ${token}` },
    cache: 'no-store',
  });
  const payload = (await response.json().catch(() => null)) as { error?: string } | null;
  if (!response.ok) {
    const errorMessage = payload && typeof payload === 'object' && 'error' in payload && typeof payload.error === 'string'
      ? payload.error : 'Failed to delete workflow.';
    throw new Error(errorMessage);
  }
}

export async function createWorkflow(data: {
  workflowCode: string;
  name: string;
  entityType: string;
  isActive: boolean;
  steps: Array<{ label: string; approverUserId: string; approverRole: string }>;
  notes: string;
}): Promise<{ id: string }> {
  return postAccountingAdmin<{ id: string }>('/accounting/workflow-directory', {
    workflowCode: data.workflowCode,
    name: data.name,
    entityType: data.entityType,
    isActive: data.isActive,
    steps: data.steps,
    notes: data.notes,
  });
}

export async function updateWorkflow(id: string | number, data: {
  workflowCode?: string;
  name?: string;
  entityType?: string;
  isActive?: boolean;
  steps?: Array<{ label: string; approverUserId: string; approverRole: string }>;
  notes?: string;
}): Promise<{ id: string }> {
  return patchAccountingAdmin<{ id: string }>(`/accounting/workflow-directory/${encodeURIComponent(String(id))}`, {
    workflowCode: data.workflowCode,
    name: data.name,
    entityType: data.entityType,
    isActive: data.isActive,
    steps: data.steps,
    notes: data.notes,
  });
}

export async function deleteWorkflow(id: string | number): Promise<void> {
  await deleteAccountingAdmin(`/accounting/workflow-directory/${encodeURIComponent(String(id))}`);
}

export type OperationalCoverageRow = {
  id: string;
  entityType: string;
  entityTypeLabel: string;
  mappedCollection: string;
  requestBehavior: string;
  requestSupport: boolean;
  requestSupportLabel: string;
  approveOutcome: string;
  rejectOutcome: string;
  hasWorkflow: boolean;
  workflowStatus: string;
  workflowStatusTone: string;
  workflowId: string;
  workflowCode: string;
  workflowName: string;
  requestCount: number;
  pendingCount: number;
  lastRequestLabel: string;
  cells: Array<string | { text: string; emphasis?: boolean; tone?: string; align?: string }>;
};

export type OperationalCoverageResponse = {
  section: {
    id: string;
    label: string;
    description: string;
    searchPlaceholder: string;
    filters: {
      entityTypes: EcFilterOption[];
      quickFilters: EcFilterOption[];
    };
    metrics: EcMetric[];
    table: {
      title: string;
      description: string;
      columns: string[];
      rows: OperationalCoverageRow[];
    };
  };
  appliedFilters: { search: string; entityTypes: string[]; quickFilters: string[] };
  pagination: { page: number; limit: number; totalDocs: number; totalPages: number; hasPrevPage: boolean; hasNextPage: boolean };
  totals: { totalRows: number; filteredRows: number; withWorkflowCount: number; totalRequests: number; totalPending: number };
  referenceData: {
    entityTypes: EcFilterOption[];
    users: Array<{ id: string; label: string; email: string; username: string }>;
  };
};

export async function getOperationalCoverage(
  query: { search?: string; page?: number; entityTypes?: string[]; quickFilters?: string[] } = {}
): Promise<OperationalCoverageResponse> {
  const params = new URLSearchParams();
  if (query.search?.trim()) params.set('search', query.search.trim());
  for (const t of query.entityTypes || []) params.append('entityType', t);
  for (const q of query.quickFilters || []) params.append('quickFilter', q);
  params.set('page', String(query.page || 1));
  params.set('limit', '10');
  return fetchAccountingAdmin<OperationalCoverageResponse>(`/accounting/entity-coverage/operations?${params.toString()}`);
}
