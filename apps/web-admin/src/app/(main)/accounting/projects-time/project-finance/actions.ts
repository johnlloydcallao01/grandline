'use server';

import { getServerToken } from '@/app/actions/auth';
import { env } from '@/lib/env';

async function fetchAccountingAdmin<T>(path: string, init?: RequestInit): Promise<T> {
  const token = await getServerToken(); if (!token) throw new Error('No admin session available.');
  const response = await fetch(`${env.NEXT_PUBLIC_API_URL}${path}`, { ...init, headers: { Authorization: `JWT ${token}`, ...(init?.body ? { 'Content-Type': 'application/json' } : {}), ...(init?.headers || {}) }, cache: 'no-store' });
  const payload = (await response.json().catch(() => null)) as T | { error?: string } | null;
  if (!response.ok) { const m = payload && typeof payload === 'object' && 'error' in payload && typeof payload.error === 'string' ? payload.error : 'Failed to load project finance data.'; throw new Error(m); }
  return payload as T;
}

export type PfMetric = { id: string; label: string; value: number | string; change: string; trend: 'up' | 'down' | 'neutral' };
export type PfFilterOption = { label: string; value: string };

export type ProjectExpenseRow = {
  id: string; expenseNumber: string; expenseDate: string | null; expenseDateLabel: string; status: string; statusLabel: string; statusTone: string;
  projectId: string; projectLabel: string; vendorId: string; vendorLabel: string; vendorCode: string;
  postingDate: string | null; postingDateLabel: string; total: number; totalLabel: string; currency: string; expenseCategory: string; notes: string;
  cells: Array<string | { text: string; emphasis?: boolean; tone?: string; align?: string }>;
};

export type ProjectExpensesResponse = {
  section: { id: string; label: string; description: string; searchPlaceholder: string; filters: { statuses: PfFilterOption[]; quickFilters: PfFilterOption[] }; metrics: PfMetric[]; table: { title: string; description: string; columns: string[]; rows: ProjectExpenseRow[] } };
  appliedFilters: { search: string; statuses: string[]; projectIds: string[]; quickFilters: string[] };
  pagination: { page: number; limit: number; totalDocs: number; totalPages: number; hasPrevPage: boolean; hasNextPage: boolean };
  totals: { totalRows: number; filteredRows: number; postedCount: number; totalCost: number; projectCount: number };
  referenceData: { projects: Array<{ id: string; label: string }>; vendors: Array<{ id: string; label: string; code: string }>; chartAccounts: Array<{ id: string; label: string; code: string }>; statusOptions: PfFilterOption[] };
};

export async function getProjectExpenses(query: { search?: string; page?: number; statuses?: string[]; projectIds?: string[]; quickFilters?: string[] } = {}): Promise<ProjectExpensesResponse> {
  const p = new URLSearchParams(); if (query.search?.trim()) p.set('search', query.search.trim());
  for (const v of query.statuses || []) p.append('status', v); for (const v of query.projectIds || []) p.append('projectId', v); for (const v of query.quickFilters || []) p.append('quickFilter', v);
  p.set('page', String(query.page || 1)); p.set('limit', '10');
  return fetchAccountingAdmin<ProjectExpensesResponse>(`/accounting/project-expenses?${p.toString()}`);
}
