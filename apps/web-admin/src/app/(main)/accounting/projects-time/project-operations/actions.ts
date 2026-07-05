'use server';

import { getServerToken } from '@/app/actions/auth';
import { env } from '@/lib/env';

async function fetchAccountingAdmin<T>(path: string, init?: RequestInit): Promise<T> {
  const token = await getServerToken();
  if (!token) throw new Error('No admin session available.');
  const response = await fetch(`${env.NEXT_PUBLIC_API_URL}${path}`, {
    ...init,
    headers: { Authorization: `JWT ${token}`, ...(init?.body ? { 'Content-Type': 'application/json' } : {}), ...(init?.headers || {}) },
    cache: 'no-store',
  });
  const payload = (await response.json().catch(() => null)) as T | { error?: string } | null;
  if (!response.ok) { const m = payload && typeof payload === 'object' && 'error' in payload && typeof payload.error === 'string' ? payload.error : 'Failed to load project data.'; throw new Error(m); }
  return payload as T;
}

export type PmFilterOption = { label: string; value: string };
export type PmMetric = { id: string; label: string; value: number | string; change: string; trend: 'up' | 'down' | 'neutral' };

export type ProjectRow = {
  id: string; projectCode: string; name: string; status: string; statusLabel: string; statusTone: string;
  customerId: string; customerLabel: string; customerCode: string;
  managerUserId: string; managerLabel: string;
  projectType: string; projectTypeLabel: string;
  courseId: string; courseLabel: string;
  startDate: string | null; startDateLabel: string;
  endDate: string | null; endDateLabel: string;
  branchId: string; branchLabel: string;
  departmentId: string; departmentLabel: string;
  locationId: string; locationLabel: string;
  budgetAmount: number; budgetAmountLabel: string;
  notes: string;
  cells: Array<string | { text: string; emphasis?: boolean; tone?: string; align?: string }>;
};

export type ProjectDetail = {
  id: string; projectCode: string; name: string; status: string; projectType: string;
  customerId: string; customerLabel: string;
  managerUserId: string; managerLabel: string;
  courseId: string; courseLabel: string;
  startDate: string | null; startDateLabel: string;
  endDate: string | null; endDateLabel: string;
  branchId: string; branchLabel: string;
  departmentId: string; departmentLabel: string;
  locationId: string; locationLabel: string;
  budgetAmount: number; notes: string;
  createdAt: string | null; updatedAt: string | null;
};

export type ProjectMutationInput = {
  projectCode?: string; name: string; status?: string; projectType?: string;
  customerId?: string; managerUserId?: string; courseId?: string;
  startDate?: string; endDate?: string;
  branchId?: string; departmentId?: string; locationId?: string;
  budgetAmount?: number; notes?: string;
};

export type ProjectsResponse = {
  section: {
    id: string; label: string; description: string; searchPlaceholder: string;
    filters: { statuses: PmFilterOption[]; projectTypes: PmFilterOption[]; quickFilters: PmFilterOption[] };
    metrics: PmMetric[];
    table: { title: string; description: string; columns: string[]; rows: ProjectRow[] };
  };
  appliedFilters: { search: string; statuses: string[]; projectTypes: string[]; quickFilters: string[] };
  pagination: { page: number; limit: number; totalDocs: number; totalPages: number; hasPrevPage: boolean; hasNextPage: boolean };
  totals: { totalRows: number; filteredRows: number; activeCount: number; customerCount: number; totalBudget: number; withBudgetCount: number };
  referenceData: {
    customers: Array<{ id: string; label: string; code: string }>;
    users: Array<{ id: string; label: string }>;
    courses: Array<{ id: string; label: string }>;
    branches: Array<{ id: string; label: string }>;
    departments: Array<{ id: string; label: string }>;
    locations: Array<{ id: string; label: string }>;
    statusOptions: PmFilterOption[];
    typeOptions: PmFilterOption[];
  };
};

export async function getProjects(query: { search?: string; page?: number; statuses?: string[]; projectTypes?: string[]; quickFilters?: string[] } = {}): Promise<ProjectsResponse> {
  const params = new URLSearchParams();
  if (query.search?.trim()) params.set('search', query.search.trim());
  for (const v of query.statuses || []) params.append('status', v);
  for (const v of query.projectTypes || []) params.append('projectType', v);
  for (const v of query.quickFilters || []) params.append('quickFilter', v);
  params.set('page', String(query.page || 1)); params.set('limit', '10');
  return fetchAccountingAdmin<ProjectsResponse>(`/accounting/projects?${params.toString()}`);
}

export async function getProjectDetail(id: string | number): Promise<ProjectDetail> {
  return fetchAccountingAdmin<ProjectDetail>(`/accounting/projects/${encodeURIComponent(String(id))}`);
}

export async function createProject(input: ProjectMutationInput): Promise<{ id: string }> {
  return fetchAccountingAdmin<{ id: string }>('/accounting/projects', { method: 'POST', body: JSON.stringify(input) });
}

export async function updateProject(id: string | number, input: ProjectMutationInput): Promise<{ id: string }> {
  return fetchAccountingAdmin<{ id: string }>(`/accounting/projects/${encodeURIComponent(String(id))}`, { method: 'PATCH', body: JSON.stringify(input) });
}

export async function deleteProject(id: string | number): Promise<{ success: boolean }> {
  return fetchAccountingAdmin<{ success: boolean }>(`/accounting/projects/${encodeURIComponent(String(id))}`, { method: 'DELETE' });
}

export type ProjectTaskRow = {
  id: string; taskCode: string; name: string; status: string; statusLabel: string; statusTone: string;
  projectId: string; projectLabel: string; projectCode: string;
  assignedToId: string; assigneeLabel: string; isAssigned: boolean; isBillable: boolean; billableLabel: string;
  startDate: string | null; startDateLabel: string;
  dueDate: string | null; dueDateLabel: string;
  notes: string;
  cells: Array<string | { text: string; emphasis?: boolean; tone?: string; align?: string }>;
};

export type ProjectTaskDetail = {
  id: string; taskCode: string; name: string; status: string; billable: boolean;
  projectId: string; projectLabel: string;
  assignedToId: string; assigneeLabel: string;
  startDate: string | null; startDateLabel: string;
  dueDate: string | null; dueDateLabel: string;
  notes: string; createdAt: string | null; updatedAt: string | null;
};

export type ProjectTasksResponse = {
  section: {
    id: string; label: string; description: string; searchPlaceholder: string;
    filters: { statuses: PmFilterOption[]; billableOptions: PmFilterOption[]; quickFilters: PmFilterOption[] };
    metrics: PmMetric[];
    table: { title: string; description: string; columns: string[]; rows: ProjectTaskRow[] };
  };
  appliedFilters: { search: string; statuses: string[]; billableFilter: string[]; projectIds: string[]; quickFilters: string[] };
  pagination: { page: number; limit: number; totalDocs: number; totalPages: number; hasPrevPage: boolean; hasNextPage: boolean };
  totals: { totalRows: number; filteredRows: number; billableCount: number; assignedCount: number; openCount: number };
  referenceData: { projects: Array<{ id: string; label: string; code: string; name: string }>; users: Array<{ id: string; label: string }>; statusOptions: PmFilterOption[] };
};

export async function getProjectTasks(query: { search?: string; page?: number; statuses?: string[]; billable?: string[]; projectIds?: string[]; quickFilters?: string[] } = {}): Promise<ProjectTasksResponse> {
  const params = new URLSearchParams();
  if (query.search?.trim()) params.set('search', query.search.trim());
  for (const v of query.statuses || []) params.append('status', v);
  for (const v of query.billable || []) params.append('billable', v);
  for (const v of query.projectIds || []) params.append('projectId', v);
  for (const v of query.quickFilters || []) params.append('quickFilter', v);
  params.set('page', String(query.page || 1)); params.set('limit', '10');
  return fetchAccountingAdmin<ProjectTasksResponse>(`/accounting/project-tasks?${params.toString()}`);
}

export async function getProjectTaskDetail(id: string | number): Promise<ProjectTaskDetail> {
  return fetchAccountingAdmin<ProjectTaskDetail>(`/accounting/project-tasks/${encodeURIComponent(String(id))}`);
}

export async function createProjectTask(input: { taskCode?: string; name: string; projectId: string; status?: string; assignedToId?: string; billable?: boolean; startDate?: string; dueDate?: string; notes?: string }): Promise<{ id: string }> {
  return fetchAccountingAdmin<{ id: string }>('/accounting/project-tasks', { method: 'POST', body: JSON.stringify(input) });
}

export async function updateProjectTask(id: string | number, input: { taskCode?: string; name?: string; projectId?: string; status?: string; assignedToId?: string; billable?: boolean; startDate?: string; dueDate?: string; notes?: string }): Promise<{ id: string }> {
  return fetchAccountingAdmin<{ id: string }>(`/accounting/project-tasks/${encodeURIComponent(String(id))}`, { method: 'PATCH', body: JSON.stringify(input) });
}

export async function deleteProjectTask(id: string | number): Promise<{ success: boolean }> {
  return fetchAccountingAdmin<{ success: boolean }>(`/accounting/project-tasks/${encodeURIComponent(String(id))}`, { method: 'DELETE' });
}
