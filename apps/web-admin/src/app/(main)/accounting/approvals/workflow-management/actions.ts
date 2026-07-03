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
      ? payload.error : 'Failed to load workflow data.';
    throw new Error(errorMessage);
  }
  return payload as T;
}

async function postAccountingAdmin<T>(path: string, body: Record<string, unknown>, method: string = 'POST'): Promise<T> {
  const token = await getServerToken();
  if (!token) throw new Error('No admin session available.');
  const response = await fetch(`${env.NEXT_PUBLIC_API_URL}${path}`, {
    method,
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

export type WdMetric = { id: string; label: string; value: number | string; change: string; trend: 'up' | 'down' | 'neutral' };
export type WdFilterOption = { label: string; value: string };

export type WorkflowStep = {
  stepNumber: number;
  label: string;
  approverUserName: string;
  approverUserId: string;
  approverRole: string;
};

export type WorkflowDirectoryRow = {
  id: string;
  workflowId: string;
  workflowCode: string;
  name: string;
  entityType: string;
  entityTypeLabel: string;
  isActive: boolean;
  activeLabel: string;
  stepCount: number;
  notes: string;
  firstApproverName: string;
  createdAtLabel: string;
  updatedAtLabel: string;
  steps: WorkflowStep[];
  cells: Array<string | { text: string; emphasis?: boolean; tone?: string; align?: string }>;
};

export type WorkflowDirectoryResponse = {
  section: {
    id: string;
    label: string;
    description: string;
    searchPlaceholder: string;
    filters: {
      entityTypes: WdFilterOption[];
      activeStates: WdFilterOption[];
      quickFilters: WdFilterOption[];
    };
    metrics: WdMetric[];
    table: {
      title: string;
      description: string;
      columns: string[];
      rows: WorkflowDirectoryRow[];
    };
  };
  appliedFilters: { search: string; entityTypes: string[]; activeStates: string[]; quickFilters: string[] };
  pagination: { page: number; limit: number; totalDocs: number; totalPages: number; hasPrevPage: boolean; hasNextPage: boolean };
  totals: { totalRows: number; filteredRows: number; activeCount: number; multiStepCount: number; entityTypeCoverage: number; totalSteps: number };
  referenceData: {
    entityTypes: WdFilterOption[];
    users: Array<{ id: string; label: string; email: string; username: string }>;
  };
};

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

export async function getWorkflowDirectory(
  query: { search?: string; page?: number; entityTypes?: string[]; activeStates?: string[]; quickFilters?: string[] } = {}
): Promise<WorkflowDirectoryResponse> {
  const params = new URLSearchParams();
  if (query.search?.trim()) params.set('search', query.search.trim());
  for (const t of query.entityTypes || []) params.append('entityType', t);
  for (const t of query.activeStates || []) params.append('activeState', t);
  for (const q of query.quickFilters || []) params.append('quickFilter', q);
  params.set('page', String(query.page || 1));
  params.set('limit', '10');
  return fetchAccountingAdmin<WorkflowDirectoryResponse>(`/accounting/workflow-directory?${params.toString()}`);
}

export async function getWorkflowDetail(id: string | number): Promise<WorkflowDetail> {
  return fetchAccountingAdmin<WorkflowDetail>(`/accounting/workflow-directory/${encodeURIComponent(String(id))}`);
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
  return postAccountingAdmin<{ id: string }>(`/accounting/workflow-directory/${encodeURIComponent(String(id))}`, {
    workflowCode: data.workflowCode,
    name: data.name,
    entityType: data.entityType,
    isActive: data.isActive,
    steps: data.steps,
    notes: data.notes,
  }, 'PATCH');
}

export type WorkflowStepRow = {
  id: string;
  workflowId: string;
  workflowCode: string;
  workflowName: string;
  entityType: string;
  entityTypeLabel: string;
  stepNumber: number;
  label: string;
  approverUserName: string;
  approverUserId: string;
  approverRole: string;
  workflowIsActive: boolean;
  isFinalStep: boolean;
  cells: Array<string | { text: string; emphasis?: boolean; tone?: string; align?: string }>;
};

export type WorkflowStepsResponse = {
  section: {
    id: string;
    label: string;
    description: string;
    searchPlaceholder: string;
    filters: {
      entityTypes: WdFilterOption[];
      quickFilters: WdFilterOption[];
    };
    metrics: WdMetric[];
    table: {
      title: string;
      description: string;
      columns: string[];
      rows: WorkflowStepRow[];
    };
  };
  appliedFilters: { search: string; entityTypes: string[]; quickFilters: string[] };
  pagination: { page: number; limit: number; totalDocs: number; totalPages: number; hasPrevPage: boolean; hasNextPage: boolean };
  totals: { totalRows: number; filteredRows: number; withUserCount: number; withRoleCount: number; workflowCount: number; multiStepWorkflowCount: number };
  referenceData: {
    entityTypes: WdFilterOption[];
    users: Array<{ id: string; label: string; email: string; username: string }>;
    workflows: Array<{ id: string; workflowCode: string; name: string; entityType: string; entityTypeLabel: string }>;
  };
};

export async function getWorkflowSteps(
  query: { search?: string; page?: number; entityTypes?: string[]; quickFilters?: string[] } = {}
): Promise<WorkflowStepsResponse> {
  const params = new URLSearchParams();
  if (query.search?.trim()) params.set('search', query.search.trim());
  for (const t of query.entityTypes || []) params.append('entityType', t);
  for (const q of query.quickFilters || []) params.append('quickFilter', q);
  params.set('page', String(query.page || 1));
  params.set('limit', '10');
  return fetchAccountingAdmin<WorkflowStepsResponse>(`/accounting/workflow-steps?${params.toString()}`);
}

export async function deleteWorkflow(id: string | number): Promise<void> {
  const token = await getServerToken();
  if (!token) throw new Error('No admin session available.');
  const response = await fetch(`${env.NEXT_PUBLIC_API_URL}/accounting/workflow-directory/${encodeURIComponent(String(id))}`, {
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

export async function createWorkflowStep(workflowId: string, data: {
  label: string;
  approverUserId: string;
  approverRole: string;
}): Promise<void> {
  const detail = await getWorkflowDetail(workflowId);
  const currentSteps = detail.steps.map((s) => ({ label: s.label, approverUserId: s.approverUser?.id || '', approverRole: s.approverRole }));
  const newSteps = [...currentSteps, { label: data.label, approverUserId: data.approverUserId, approverRole: data.approverRole }];
  await updateWorkflow(workflowId, { steps: newSteps });
}

export async function updateWorkflowStep(workflowId: string, stepNumber: number, data: {
  label: string;
  approverUserId: string;
  approverRole: string;
}): Promise<void> {
  const detail = await getWorkflowDetail(workflowId);
  const newSteps = detail.steps.map((s) =>
    s.stepNumber === stepNumber
      ? { label: data.label, approverUserId: data.approverUserId, approverRole: data.approverRole }
      : { label: s.label, approverUserId: s.approverUser?.id || '', approverRole: s.approverRole }
  );
  await updateWorkflow(workflowId, { steps: newSteps });
}

export async function deleteWorkflowStep(workflowId: string, stepNumber: number): Promise<void> {
  const detail = await getWorkflowDetail(workflowId);
  const newSteps = detail.steps
    .filter((s) => s.stepNumber !== stepNumber)
    .map((s) => ({ label: s.label, approverUserId: s.approverUser?.id || '', approverRole: s.approverRole }));
  await updateWorkflow(workflowId, { steps: newSteps });
}
