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
  if (!response.ok) { const m = payload && typeof payload === 'object' && 'error' in payload && typeof payload.error === 'string' ? payload.error : 'Failed to load budget data.'; throw new Error(m); }
  return payload as T;
}

export type BvaMetric = { id: string; label: string; value: number | string; change: string; trend: 'up' | 'down' | 'neutral'; };
export type BvaFilterOption = { label: string; value: string };

export type BudgetVsActualRow = {
  id: string; budgetId: string; budgetCode: string; budgetName: string; scope: string;
  budgetAmount: number; actualAmount: number; varianceAmount: number;
  status: string; statusLabel: string; statusTone: string;
  varianceStatus: string; varianceTone: string;
  cells: Array<string | { text: string; emphasis?: boolean; tone?: string; align?: string }>;
};

export type BudgetVsActualResponse = {
  section: { id: string; label: string; description: string; searchPlaceholder: string; filters: { statuses: BvaFilterOption[]; quickFilters: BvaFilterOption[] }; metrics: BvaMetric[]; table: { title: string; description: string; columns: string[]; rows: BudgetVsActualRow[] }; };
  appliedFilters: { search: string; statuses: string[]; quickFilters: string[] };
  pagination: { page: number; limit: number; totalDocs: number; totalPages: number; hasPrevPage: boolean; hasNextPage: boolean };
  totals: { totalRows: number; filteredRows: number; totalPlanned: number; totalActual: number; totalVariance: number };
};

export async function getBudgetVsActual(query: { search?: string; page?: number; statuses?: string[]; quickFilters?: string[] } = {}): Promise<BudgetVsActualResponse> {
  const params = new URLSearchParams();
  if (query.search?.trim()) params.set('search', query.search.trim());
  for (const s of query.statuses || []) params.append('status', s);
  for (const q of query.quickFilters || []) params.append('quickFilter', q);
  params.set('page', String(query.page || 1)); params.set('limit', '10');
  return fetchAccountingAdmin<BudgetVsActualResponse>(`/accounting/budget-vs-actual?${params.toString()}`);
}
