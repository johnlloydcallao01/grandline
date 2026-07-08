'use server';

import { getServerToken } from '@/app/actions/auth';
import { env } from '@/lib/env';

async function fetchAdmin<T>(path: string, init?: RequestInit): Promise<T> {
  const token = await getServerToken(); if (!token) throw new Error('No admin session.');
  const res = await fetch(`${env.NEXT_PUBLIC_API_URL}${path}`, { ...init, headers: { Authorization: `JWT ${token}`, ...(init?.body ? { 'Content-Type': 'application/json' } : {}), ...(init?.headers || {}) }, cache: 'no-store' });
  const p = (await res.json().catch(() => null)) as T | { error?: string } | null;
  if (!res.ok) { const m = p && typeof p === 'object' && 'error' in p && typeof p.error === 'string' ? p.error : 'Failed to load budget data.'; throw new Error(m); }
  return p as T;
}

export type BfMetric = { id: string; label: string; value: number | string; change: string; trend: 'up' | 'down' | 'neutral' };
export type BfOption = { label: string; value: string };

export type BudgetRow = {
  id: string; budgetCode: string; name: string; status: string; statusLabel: string; statusTone: string; budgetType: string; budgetTypeLabel: string;
  fiscalYearId: string; fiscalYearLabel: string; scenarioId: string; scenarioLabel: string; projectId: string; projectLabel: string;
  courseCategoryId: string; courseCategoryLabel: string; branchId: string; branchLabel: string; departmentId: string; departmentLabel: string; locationId: string; locationLabel: string;
  notes: string;
  cells: Array<string | { text: string; emphasis?: boolean; tone?: string; align?: string }>;
};

export type BudgetDetail = {
  id: string; budgetCode: string; name: string; status: string; budgetType: string;
  fiscalYearId: string; fiscalYearLabel: string; scenarioId: string; scenarioLabel: string;
  projectId: string; projectLabel: string; courseCategoryId: string; courseCategoryLabel: string;
  branchId: string; branchLabel: string; departmentId: string; departmentLabel: string; locationId: string; locationLabel: string;
  notes: string; createdAt: string | null; updatedAt: string | null;
};

export type BudgetsResponse = {
  section: { id: string; label: string; description: string; searchPlaceholder: string; filters: { statuses: BfOption[]; budgetTypes: BfOption[]; quickFilters: BfOption[] }; metrics: BfMetric[]; table: { title: string; description: string; columns: string[]; rows: BudgetRow[] } };
  appliedFilters: { search: string; statuses: string[]; budgetTypes: string[]; quickFilters: string[] };
  pagination: { page: number; limit: number; totalDocs: number; totalPages: number; hasPrevPage: boolean; hasNextPage: boolean };
  totals: { totalRows: number; filteredRows: number; approvedCount: number; annualCount: number };
  referenceData: { fiscalYears: Array<{ id: string; label: string }>; branches: Array<{ id: string; label: string }>; departments: Array<{ id: string; label: string }>; locations: Array<{ id: string; label: string }>; projects: Array<{ id: string; label: string }>; courseCategories: Array<{ id: string; label: string }>; scenarios: Array<{ id: string; label: string }>; statusOptions: BfOption[]; typeOptions: BfOption[] };
};

export async function getBudgets(q: { search?: string; page?: number; statuses?: string[]; budgetTypes?: string[]; quickFilters?: string[] } = {}): Promise<BudgetsResponse> {
  const p = new URLSearchParams(); if (q.search?.trim()) p.set('search', q.search.trim());
  for (const v of q.statuses || []) p.append('status', v); for (const v of q.budgetTypes || []) p.append('budgetType', v); for (const v of q.quickFilters || []) p.append('quickFilter', v);
  p.set('page', String(q.page || 1)); p.set('limit', '10');
  return fetchAdmin<BudgetsResponse>(`/accounting/budgets?${p.toString()}`);
}
export async function getBudgetDetail(id: string | number): Promise<BudgetDetail> { return fetchAdmin<BudgetDetail>(`/accounting/budgets/${encodeURIComponent(String(id))}`); }
export async function createBudget(i: Record<string, unknown>): Promise<{ id: string }> { return fetchAdmin<{ id: string }>('/accounting/budgets', { method: 'POST', body: JSON.stringify(i) }); }
export async function updateBudget(id: string | number, i: Record<string, unknown>): Promise<{ id: string }> { return fetchAdmin<{ id: string }>(`/accounting/budgets/${encodeURIComponent(String(id))}`, { method: 'PATCH', body: JSON.stringify(i) }); }
export async function deleteBudget(id: string | number): Promise<{ success: boolean }> { return fetchAdmin<{ success: boolean }>(`/accounting/budgets/${encodeURIComponent(String(id))}`, { method: 'DELETE' }); }

export type BudgetLineRow = {
  id: string; budgetId: string; budgetLabel: string; accountId: string; accountLabel: string; accountCode: string; accountName: string; lineType: string; normalBalance: string;
  periodId: string; periodLabel: string; plannedAmount: number; plannedAmountLabel: string; notes: string;
  cells: Array<string | { text: string; emphasis?: boolean; tone?: string; align?: string }>;
};

export type BudgetLineDetail = {
  id: string; budgetId: string; budgetLabel: string; accountId: string; accountLabel: string; accountCode: string;
  periodId: string; periodLabel: string; plannedAmount: number; notes: string;
  createdAt: string | null; updatedAt: string | null;
};

export type BudgetLinesResponse = {
  section: { id: string; label: string; description: string; searchPlaceholder: string; filters: { quickFilters: BfOption[] }; metrics: BfMetric[]; table: { title: string; description: string; columns: string[]; rows: BudgetLineRow[] } };
  appliedFilters: { search: string; budgetIds: string[]; quickFilters: string[] };
  pagination: { page: number; limit: number; totalDocs: number; totalPages: number; hasPrevPage: boolean; hasNextPage: boolean };
  totals: { totalRows: number; filteredRows: number; totalPlanned: number; revenueCount: number };
  referenceData: { budgets: Array<{ id: string; label: string }>; accounts: Array<{ id: string; label: string; code: string; name: string; normalBalance: string }>; periods: Array<{ id: string; label: string; periodNumber: number }> };
};

export async function getBudgetLines(q: { search?: string; page?: number; budgetIds?: string[]; quickFilters?: string[] } = {}): Promise<BudgetLinesResponse> {
  const p = new URLSearchParams(); if (q.search?.trim()) p.set('search', q.search.trim());
  for (const v of q.budgetIds || []) p.append('budgetId', v); for (const v of q.quickFilters || []) p.append('quickFilter', v);
  p.set('page', String(q.page || 1)); p.set('limit', '10');
  return fetchAdmin<BudgetLinesResponse>(`/accounting/budget-lines?${p.toString()}`);
}
export async function getBudgetLineDetail(id: string | number): Promise<BudgetLineDetail> { return fetchAdmin<BudgetLineDetail>(`/accounting/budget-lines/${encodeURIComponent(String(id))}`); }
export async function createBudgetLine(i: Record<string, unknown>): Promise<{ id: string }> { return fetchAdmin<{ id: string }>('/accounting/budget-lines', { method: 'POST', body: JSON.stringify(i) }); }
export async function updateBudgetLine(id: string | number, i: Record<string, unknown>): Promise<{ id: string }> { return fetchAdmin<{ id: string }>(`/accounting/budget-lines/${encodeURIComponent(String(id))}`, { method: 'PATCH', body: JSON.stringify(i) }); }
export async function deleteBudgetLine(id: string | number): Promise<{ success: boolean }> { return fetchAdmin<{ success: boolean }>(`/accounting/budget-lines/${encodeURIComponent(String(id))}`, { method: 'DELETE' }); }
