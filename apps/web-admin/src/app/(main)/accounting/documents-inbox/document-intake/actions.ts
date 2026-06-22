'use server';

import { getServerToken } from '@/app/actions/auth';
import { env } from '@/lib/env';

async function fetchAccountingAdmin<T>(path: string, init?: RequestInit): Promise<T> {
  const token = await getServerToken();
  if (!token) {
    throw new Error('No admin session available.');
  }

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
        : 'Failed to load accounting inbox data.';
    throw new Error(errorMessage);
  }

  return payload as T;
}

export type AccountingInboxFilterOption = {
  label: string;
  value: string;
};

export type AccountingInboxMetric = {
  id: string;
  label: string;
  value: string | number;
  change: string;
  trend: 'up' | 'down' | 'neutral';
};

export type AccountingInboxCell =
  | string
  | {
      text: string;
      tone?: 'amber' | 'blue' | 'gray' | 'green' | 'red';
      emphasis?: boolean;
      align?: 'left' | 'right' | 'center';
    };

export type AccountingInboxLinkedRecord = {
  id: string;
  linkReference: string;
  entityType: string;
  entityTypeLabel: string;
  entityId: string;
  entityLabel: string;
  documentCategory: string;
  documentCategoryLabel: string;
  documentDate: string | null;
  documentDateLabel: string;
  uploadedByLabel: string;
  isPrimary: boolean;
  notes: string;
  createdAt: string | null;
  createdAtLabel: string;
  updatedAtLabel: string;
  stateLabel: string;
  stateTone: 'amber' | 'blue' | 'gray' | 'green' | 'red';
};

export type AccountingInboxRow = {
  id: string;
  mediaId: string;
  fileName: string;
  fileUrl: string | null;
  mimeType: string;
  mimeTypeLabel: string;
  mimeFamily: string;
  mimeFamilyLabel: string;
  fileSize: number;
  fileSizeLabel: string;
  uploadedAt: string | null;
  uploadedAtLabel: string;
  linkCount: number;
  linkCountLabel: string;
  latestLinkLabel: string;
  latestLinkedAt: string | null;
  latestLinkedAtLabel: string;
  linkedCategories: string[];
  linkedCategoryLabels: string[];
  linkedEntityTypes: string[];
  linkedEntityTypeLabels: string[];
  status: string;
  statusLabel: string;
  statusTone: 'amber' | 'blue' | 'gray' | 'green' | 'red';
  hasPrimaryLink: boolean;
  isUnlinked: boolean;
  isMultiLinked: boolean;
  searchableText: string;
  cells: AccountingInboxCell[];
};

export type AccountingInboxRegisterResponse = {
  rows: AccountingInboxRow[];
  metrics: AccountingInboxMetric[];
  filterOptions: {
    mimeFamilies: AccountingInboxFilterOption[];
    statuses: AccountingInboxFilterOption[];
    categories: AccountingInboxFilterOption[];
    quickFilters: AccountingInboxFilterOption[];
  };
  appliedFilters: {
    search: string;
    mimeFamilies: string[];
    statuses: string[];
    categories: string[];
    quickFilters: string[];
  };
  meta: {
    id: string;
    label: string;
    description: string;
    searchPlaceholder: string;
    tableTitle: string;
    tableDescription: string;
    columns: Array<string | { label: string; align: string }>;
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
  };
  referenceData: {
    categories: AccountingInboxFilterOption[];
    entityTypes: AccountingInboxFilterOption[];
    mimeFamilies: AccountingInboxFilterOption[];
  };
  flags: {
    detailEnabledIds: string[];
  };
};

export type AccountingInboxDetail = AccountingInboxRow & {
  altText: string;
  cloudinaryPublicId: string;
  cloudinaryUrl: string | null;
  linkedRecords: AccountingInboxLinkedRecord[];
  usageSummary: {
    linkCount: number;
    primaryLinkCount: number;
    latestLinkedAtLabel: string;
    categorySummary: string;
    entityTypeSummary: string;
  };
};

export async function getAccountingInbox(
  query: {
    search?: string;
    page?: number;
    mimeFamilies?: string[];
    statuses?: string[];
    categories?: string[];
    quickFilters?: string[];
  } = {},
): Promise<AccountingInboxRegisterResponse> {
  const params = new URLSearchParams();
  if (query.search?.trim()) params.set('search', query.search.trim());
  for (const value of query.mimeFamilies || []) params.append('mimeFamily', value);
  for (const value of query.statuses || []) params.append('status', value);
  for (const value of query.categories || []) params.append('category', value);
  for (const value of query.quickFilters || []) params.append('quickFilter', value);
  params.set('page', String(query.page || 1));
  params.set('limit', '10');

  return fetchAccountingAdmin<AccountingInboxRegisterResponse>(
    `/accounting/documents-inbox/document-intake/accounting-inbox?${params.toString()}`,
  );
}

export async function getAccountingInboxDetail(
  id: string | number,
): Promise<AccountingInboxDetail> {
  return fetchAccountingAdmin<AccountingInboxDetail>(
    `/accounting/documents-inbox/document-intake/accounting-inbox/${id}`,
  );
}
