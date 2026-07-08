'use server';

import { getServerToken } from '@/app/actions/auth';
import { env } from '@/lib/env';

async function fetchAdmin<T>(path: string, init?: RequestInit): Promise<T> {
  const token = await getServerToken(); if (!token) throw new Error('No admin session.');
  const res = await fetch(`${env.NEXT_PUBLIC_API_URL}${path}`, { ...init, headers: { Authorization: `JWT ${token}`, ...(init?.body ? { 'Content-Type': 'application/json' } : {}), ...(init?.headers || {}) }, cache: 'no-store' });
  const p = (await res.json().catch(() => null)) as T | { error?: string } | null;
  if (!res.ok) { const m = p && typeof p === 'object' && 'error' in p && typeof p.error === 'string' ? p.error : 'Failed to load forecast data.'; throw new Error(m); }
  return p as T;
}

export type FmMetric = { id: string; label: string; value: number | string; change: string; trend: 'up' | 'down' | 'neutral' };
export type FmOption = { label: string; value: string };

export type ScenarioRow = {
  id: string; name: string; status: string; statusLabel: string; statusTone: string; scenarioType: string; scenarioTypeLabel: string; hasAssumptions: boolean; assumptionsLabel: string;
  fiscalYearId: string; fiscalYearLabel: string; notes: string;
  cells: Array<string | { text: string; emphasis?: boolean; tone?: string; align?: string }>;
};

export type ScenarioDetail = {
  id: string; name: string; status: string; scenarioType: string; fiscalYearId: string; fiscalYearLabel: string;
  assumptions: unknown; notes: string; createdAt: string | null; updatedAt: string | null;
};

export type ScenariosResponse = {
  section: { id: string; label: string; description: string; searchPlaceholder: string; filters: { statuses: FmOption[]; scenarioTypes: FmOption[]; quickFilters: FmOption[] }; metrics: FmMetric[]; table: { title: string; description: string; columns: string[]; rows: ScenarioRow[] } };
  appliedFilters: { search: string; statuses: string[]; scenarioTypes: string[]; quickFilters: string[] };
  pagination: { page: number; limit: number; totalDocs: number; totalPages: number; hasPrevPage: boolean; hasNextPage: boolean };
  totals: { totalRows: number; filteredRows: number; approvedCount: number };
  referenceData: { fiscalYears: Array<{ id: string; label: string }>; statusOptions: FmOption[]; typeOptions: FmOption[] };
};

export async function getScenarios(q: { search?: string; page?: number; statuses?: string[]; scenarioTypes?: string[]; quickFilters?: string[] } = {}): Promise<ScenariosResponse> {
  const p = new URLSearchParams(); if (q.search?.trim()) p.set('search', q.search.trim());
  for (const v of q.statuses || []) p.append('status', v); for (const v of q.scenarioTypes || []) p.append('scenarioType', v); for (const v of q.quickFilters || []) p.append('quickFilter', v);
  p.set('page', String(q.page || 1)); p.set('limit', '10');
  return fetchAdmin<ScenariosResponse>(`/accounting/forecast-scenarios?${p.toString()}`);
}
export async function getScenarioDetail(id: string | number): Promise<ScenarioDetail> { return fetchAdmin<ScenarioDetail>(`/accounting/forecast-scenarios/${encodeURIComponent(String(id))}`); }
export async function createScenario(i: Record<string, unknown>): Promise<{ id: string }> { return fetchAdmin<{ id: string }>('/accounting/forecast-scenarios', { method: 'POST', body: JSON.stringify(i) }); }
export async function updateScenario(id: string | number, i: Record<string, unknown>): Promise<{ id: string }> { return fetchAdmin<{ id: string }>(`/accounting/forecast-scenarios/${encodeURIComponent(String(id))}`, { method: 'PATCH', body: JSON.stringify(i) }); }
export async function deleteScenario(id: string | number): Promise<{ success: boolean }> { return fetchAdmin<{ success: boolean }>(`/accounting/forecast-scenarios/${encodeURIComponent(String(id))}`, { method: 'DELETE' }); }

export type AssumptionRow = {
  id: string; scenarioId: string; scenarioName: string; scenarioStatus: string; scenarioStatusLabel: string; scenarioStatusTone: string;
  fiscalYearLabel: string; key: string; rawKey: string; category: string; value: number; valueLabel: string;
  cells: Array<string | { text: string; emphasis?: boolean; tone?: string; align?: string }>;
};

export type AssumptionsResponse = {
  section: { id: string; label: string; description: string; searchPlaceholder: string; filters: { categories: FmOption[]; quickFilters: FmOption[] }; metrics: FmMetric[]; table: { title: string; description: string; columns: string[]; rows: AssumptionRow[] } };
  appliedFilters: { search: string; scenarioIds: string[]; categories: string[]; quickFilters: string[] };
  pagination: { page: number; limit: number; totalDocs: number; totalPages: number; hasPrevPage: boolean; hasNextPage: boolean };
  totals: { totalRows: number; filteredRows: number; growthCount: number };
  referenceData: { scenarios: Array<{ id: string; label: string; status: string }>; categories: FmOption[] };
};

export async function getAssumptions(q: { search?: string; page?: number; scenarioIds?: string[]; categories?: string[]; quickFilters?: string[] } = {}): Promise<AssumptionsResponse> {
  const p = new URLSearchParams(); if (q.search?.trim()) p.set('search', q.search.trim());
  for (const v of q.scenarioIds || []) p.append('scenarioId', v); for (const v of q.categories || []) p.append('category', v); for (const v of q.quickFilters || []) p.append('quickFilter', v);
  p.set('page', String(q.page || 1)); p.set('limit', '10');
  return fetchAdmin<AssumptionsResponse>(`/accounting/scenario-assumptions?${p.toString()}`);
}
export async function createAssumption(i: Record<string, unknown>): Promise<{ success: boolean }> { return fetchAdmin<{ success: boolean }>('/accounting/scenario-assumptions', { method: 'POST', body: JSON.stringify(i) }); }
export async function updateAssumption(id: string, i: Record<string, unknown>): Promise<{ success: boolean }> { return fetchAdmin<{ success: boolean }>(`/accounting/scenario-assumptions/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify(i) }); }
export async function deleteAssumption(id: string): Promise<{ success: boolean }> { return fetchAdmin<{ success: boolean }>(`/accounting/scenario-assumptions/${encodeURIComponent(id)}`, { method: 'DELETE' }); }
