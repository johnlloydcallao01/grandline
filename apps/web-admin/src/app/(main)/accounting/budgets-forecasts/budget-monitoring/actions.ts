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

export type BvaMetric = { id: string; label: string; value: number | string; change: string; trend: 'up' | 'down' | 'neutral' };
export type BvaOption = { label: string; value: string };

export type BvaRow = {
  id: string; budgetId: string; budgetCode: string; budgetName: string; scope: string;
  budgetAmount: number; actualAmount: number; varianceAmount: number;
  status: string; statusLabel: string; statusTone: string; varianceStatus: string; varianceTone: string;
  cells: Array<string | { text: string; emphasis?: boolean; tone?: string; align?: string }>;
};

export type BvaResponse = {
  section: { id: string; label: string; description: string; searchPlaceholder: string; filters: { statuses: BvaOption[]; quickFilters: BvaOption[] }; metrics: BvaMetric[]; table: { title: string; description: string; columns: string[]; rows: BvaRow[] } };
  appliedFilters: { search: string; statuses: string[]; quickFilters: string[] };
  pagination: { page: number; limit: number; totalDocs: number; totalPages: number; hasPrevPage: boolean; hasNextPage: boolean };
  totals: { totalRows: number; filteredRows: number; totalPlanned: number; totalActual: number; totalVariance: number };
};

export type VarianceDetail = {
  budgetId: string; budgetCode: string; name: string; status: string;
  rows: Array<{ budgetLineId: string; accountId: string; accountCode: string; accountName: string; periodId: string; plannedAmount: number; actualAmount: number; varianceAmount: number }>;
  totals: { plannedAmount: number; actualAmount: number; varianceAmount: number };
};

export async function getBudgetVsActual(q: { search?: string; page?: number; statuses?: string[]; quickFilters?: string[] } = {}): Promise<BvaResponse> {
  const p = new URLSearchParams(); if (q.search?.trim()) p.set('search', q.search.trim());
  for (const v of q.statuses || []) p.append('status', v); for (const v of q.quickFilters || []) p.append('quickFilter', v);
  p.set('page', String(q.page || 1)); p.set('limit', '10');
  return fetchAdmin<BvaResponse>(`/accounting/budget-vs-actual?${p.toString()}`);
}

export async function getVarianceDetail(id: string | number): Promise<VarianceDetail> {
  return fetchAdmin<VarianceDetail>(`/accounting/budgets/${encodeURIComponent(String(id))}/variance`);
}
