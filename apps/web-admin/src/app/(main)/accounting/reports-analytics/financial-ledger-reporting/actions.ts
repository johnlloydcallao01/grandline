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
        : 'Failed to load trial balance data.';
    throw new Error(errorMessage);
  }
  return payload as T;
}

export type TbMetric = {
  id: string;
  label: string;
  value: number | string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
};

export type TbFilterOption = {
  label: string;
  value: string;
};

export type TrialBalanceRegisterRow = {
  id: number | string;
  accountCode: string | null;
  accountName: string | null;
  accountType: string | null;
  totalDebit: number | null;
  totalCredit: number | null;
  closingBalance: number | null;
  cells: Array<string | { text: string; emphasis?: boolean; tone?: string; align?: string }>;
};

export type TrialBalanceRegisterResponse = {
  section: {
    id: string;
    label: string;
    description: string;
    searchPlaceholder: string;
    filters: {
      statuses: TbFilterOption[];
      quickFilters: TbFilterOption[];
    };
    metrics: TbMetric[];
    table: {
      title: string;
      description: string;
      columns: string[];
      rows: TrialBalanceRegisterRow[];
    };
  };
  appliedFilters: {
    search: string;
    statuses: string[];
    quickFilters: string[];
  };
  pagination: {
    page: number;
    limit: number;
    totalDocs: number;
    totalPages: number;
    hasPrevPage: boolean;
    hasNextPage: boolean;
  };
  totals: {
    totalEntries: number;
    filteredEntries: number;
    totalDebit: number;
    totalCredit: number;
    balanceDifference: number;
  };
};

export async function getTrialBalanceRegister(
  query: {
    search?: string;
    page?: number;
    statuses?: string[];
    quickFilters?: string[];
  } = {},
): Promise<TrialBalanceRegisterResponse> {
  const params = new URLSearchParams();
  if (query.search?.trim()) params.set('search', query.search.trim());
  for (const s of query.statuses || []) params.append('status', s);
  for (const q of query.quickFilters || []) params.append('quickFilter', q);
  params.set('page', String(query.page || 1));
  params.set('limit', '10');

  return fetchAccountingAdmin<TrialBalanceRegisterResponse>(
    `/accounting/trial-balance?${params.toString()}`,
  );
}

export type GlMetric = {
  id: string;
  label: string;
  value: number | string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
};

export type GlFilterOption = {
  label: string;
  value: string;
};

export type GeneralLedgerRegisterRow = {
  id: number | string;
  postingDate: string | null | undefined;
  entryNumber: string | null | undefined;
  account: string | null;
  debit: number | null;
  credit: number | null;
  runningBalance: number | null | undefined;
  status: string | null | undefined;
  cells: Array<string | { text: string; emphasis?: boolean; tone?: string; align?: string }>;
};

export type GeneralLedgerRegisterResponse = {
  section: {
    id: string;
    label: string;
    description: string;
    searchPlaceholder: string;
    filters: {
      statuses: GlFilterOption[];
      quickFilters: GlFilterOption[];
    };
    metrics: GlMetric[];
    table: {
      title: string;
      description: string;
      columns: string[];
      rows: GeneralLedgerRegisterRow[];
    };
  };
  appliedFilters: {
    search: string;
    statuses: string[];
    quickFilters: string[];
  };
  pagination: {
    page: number;
    limit: number;
    totalDocs: number;
    totalPages: number;
    hasPrevPage: boolean;
    hasNextPage: boolean;
  };
  totals: {
    totalEntries: number;
    filteredEntries: number;
    postedJournals: number;
    reversedJournals: number;
    accountsHit: number;
  };
};

export async function getGeneralLedgerRegister(
  query: {
    search?: string;
    page?: number;
    statuses?: string[];
    quickFilters?: string[];
  } = {},
): Promise<GeneralLedgerRegisterResponse> {
  const params = new URLSearchParams();
  if (query.search?.trim()) params.set('search', query.search.trim());
  for (const s of query.statuses || []) params.append('status', s);
  for (const q of query.quickFilters || []) params.append('quickFilter', q);
  params.set('page', String(query.page || 1));
  params.set('limit', '10');

  return fetchAccountingAdmin<GeneralLedgerRegisterResponse>(
    `/accounting/general-ledger?${params.toString()}`,
  );
}

export type ArMetric = {
  id: string;
  label: string;
  value: number | string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
};

export type ArFilterOption = {
  label: string;
  value: string;
};

export type AssetRegisterRow = {
  id: number | string;
  assetCode: string | null;
  name: string | null;
  assetCategory: string | null;
  categoryLabel: string | null;
  branch: string | null;
  department: string | null;
  location: string | null;
  cost: number;
  accumulatedDepreciation: number;
  netBookValue: number;
  status: string | null;
  statusLabel: string | null;
  statusTone: string;
  cells: Array<string | { text: string; emphasis?: boolean; tone?: string; align?: string }>;
};

export type AssetRegisterResponse = {
  section: {
    id: string;
    label: string;
    description: string;
    searchPlaceholder: string;
    filters: {
      statuses: ArFilterOption[];
      categories: ArFilterOption[];
      quickFilters: ArFilterOption[];
    };
    metrics: ArMetric[];
    table: {
      title: string;
      description: string;
      columns: string[];
      rows: AssetRegisterRow[];
    };
  };
  appliedFilters: {
    search: string;
    statuses: string[];
    categories: string[];
    quickFilters: string[];
  };
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
    totalCost: number;
    totalAccumulatedDepreciation: number;
    totalNetBookValue: number;
  };
};

export async function getAssetRegister(
  query: {
    search?: string;
    page?: number;
    statuses?: string[];
    categories?: string[];
    quickFilters?: string[];
  } = {},
): Promise<AssetRegisterResponse> {
  const params = new URLSearchParams();
  if (query.search?.trim()) params.set('search', query.search.trim());
  for (const s of query.statuses || []) params.append('status', s);
  for (const c of query.categories || []) params.append('category', c);
  for (const q of query.quickFilters || []) params.append('quickFilter', q);
  params.set('page', String(query.page || 1));
  params.set('limit', '10');

  return fetchAccountingAdmin<AssetRegisterResponse>(
    `/accounting/asset-register?${params.toString()}`,
  );
}
