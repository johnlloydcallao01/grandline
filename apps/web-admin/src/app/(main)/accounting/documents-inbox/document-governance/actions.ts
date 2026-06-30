'use server';

import { getServerToken } from '@/app/actions/auth';
import { env } from '@/lib/env';
import type { AccountingInboxCell, AccountingInboxFilterOption, AccountingInboxMetric } from '../document-intake/actions';

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
        : 'Failed to load document governance data.';
    throw new Error(errorMessage);
  }

  return payload as T;
}

export type DocumentCategoryFilterOption = AccountingInboxFilterOption;
export type DocumentCategoryMetric = AccountingInboxMetric;
export type DocumentCategoryCell = AccountingInboxCell;

export type DocumentCategoryRow = {
  id: string;
  category: string;
  categoryLabel: string;
  group: string;
  groupLabel: string;
  typicalUse: string;
  linkedRecordCount: number;
  linkedRecordCountLabel: string;
  primaryLinkCount: number;
  primaryUsageLabel: string;
  notes: string;
  status: string;
  statusLabel: string;
  statusTone: 'amber' | 'blue' | 'gray' | 'green' | 'red';
  latestLinkedAt: string | null;
  latestLinkedAtLabel: string;
  searchableText: string;
  cells: DocumentCategoryCell[];
};

export type DocumentCategoryRecentLink = {
  id: string;
  entityType: string;
  entityTypeLabel: string;
  entityId: string;
  documentDateLabel: string;
  linkedAtLabel: string;
  isPrimary: boolean;
};

export type DocumentCategoryDetail = DocumentCategoryRow & {
  receiptOriented: boolean;
  canBePrimary: boolean;
  entityCoverageSummary: string;
  recentLinks: DocumentCategoryRecentLink[];
};

export type DocumentCategoriesRegisterResponse = {
  rows: DocumentCategoryRow[];
  metrics: DocumentCategoryMetric[];
  filterOptions: {
    groups: DocumentCategoryFilterOption[];
    statuses: DocumentCategoryFilterOption[];
    quickFilters: DocumentCategoryFilterOption[];
  };
  appliedFilters: {
    search: string;
    groups: string[];
    statuses: string[];
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
    groups: DocumentCategoryFilterOption[];
    statuses: DocumentCategoryFilterOption[];
  };
  flags: {
    detailEnabledIds: string[];
  };
};

export async function getDocumentCategories(
  query: {
    search?: string;
    page?: number;
    groups?: string[];
    statuses?: string[];
    quickFilters?: string[];
  } = {},
): Promise<DocumentCategoriesRegisterResponse> {
  const params = new URLSearchParams();
  if (query.search?.trim()) params.set('search', query.search.trim());
  for (const value of query.groups || []) params.append('group', value);
  for (const value of query.statuses || []) params.append('status', value);
  for (const value of query.quickFilters || []) params.append('quickFilter', value);
  params.set('page', String(query.page || 1));
  params.set('limit', '10');

  return fetchAccountingAdmin<DocumentCategoriesRegisterResponse>(
    `/accounting/documents-inbox/document-governance/document-categories?${params.toString()}`,
  );
}

export async function getDocumentCategoryDetail(id: string): Promise<DocumentCategoryDetail> {
  return fetchAccountingAdmin<DocumentCategoryDetail>(
    `/accounting/documents-inbox/document-governance/document-categories/${encodeURIComponent(id)}`,
  );
}

export type EntityLinkFilterOption = AccountingInboxFilterOption;
export type EntityLinkMetric = AccountingInboxMetric;
export type EntityLinksCell = AccountingInboxCell;

export type EntityLinksRow = {
  id: string;
  entityType: string;
  entityTypeLabel: string;
  group: string;
  groupLabel: string;
  typicalUse: string;
  linkedRecordCount: number;
  linkedRecordCountLabel: string;
  uniqueEntityIdCount: number;
  uniqueEntityIdCountLabel: string;
  latestEntityId: string;
  latestLinkedAt: string | null;
  latestLinkedAtLabel: string;
  commonCategory: string;
  commonCategoryLabel: string;
  primaryLinkCount: number;
  primaryLinkCountLabel: string;
  notes: string;
  status: string;
  statusLabel: string;
  statusTone: 'amber' | 'blue' | 'gray' | 'green' | 'red';
  searchableText: string;
  cells: EntityLinksCell[];
};

export type EntityLinkRecentRecord = {
  id: string;
  entityId: string;
  documentCategory: string;
  documentCategoryLabel: string;
  documentDateLabel: string;
  linkedAtLabel: string;
  isPrimary: boolean;
};

export type EntityLinksDetail = EntityLinksRow & {
  categoryCoverageSummary: string;
  activeEntityIdSummary: string;
  recentLinks: EntityLinkRecentRecord[];
};

export type EntityLinksRegisterResponse = {
  rows: EntityLinksRow[];
  metrics: EntityLinkMetric[];
  filterOptions: {
    groups: EntityLinkFilterOption[];
    statuses: EntityLinkFilterOption[];
    quickFilters: EntityLinkFilterOption[];
  };
  appliedFilters: {
    search: string;
    groups: string[];
    statuses: string[];
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
    groups: EntityLinkFilterOption[];
    statuses: EntityLinkFilterOption[];
  };
  flags: {
    detailEnabledIds: string[];
  };
};

export async function getEntityLinks(
  query: {
    search?: string;
    page?: number;
    groups?: string[];
    statuses?: string[];
    quickFilters?: string[];
  } = {},
): Promise<EntityLinksRegisterResponse> {
  const params = new URLSearchParams();
  if (query.search?.trim()) params.set('search', query.search.trim());
  for (const value of query.groups || []) params.append('group', value);
  for (const value of query.statuses || []) params.append('status', value);
  for (const value of query.quickFilters || []) params.append('quickFilter', value);
  params.set('page', String(query.page || 1));
  params.set('limit', '10');

  return fetchAccountingAdmin<EntityLinksRegisterResponse>(
    `/accounting/documents-inbox/document-governance/entity-links?${params.toString()}`,
  );
}

export async function getEntityLinkDetail(id: string): Promise<EntityLinksDetail> {
  return fetchAccountingAdmin<EntityLinksDetail>(
    `/accounting/documents-inbox/document-governance/entity-links/${encodeURIComponent(id)}`,
  );
}

export type PrimaryDocumentFilterOption = AccountingInboxFilterOption;
export type PrimaryDocumentMetric = AccountingInboxMetric;
export type PrimaryDocumentCell = AccountingInboxCell;

export type PrimaryDocumentRow = {
  id: string;
  linkId: string;
  fileName: string;
  entityType: string;
  entityTypeLabel: string;
  entityId: string;
  category: string;
  categoryLabel: string;
  group: string;
  groupLabel: string;
  uploadedBy: string;
  uploadedByLabel: string;
  documentDate: string | null;
  documentDateLabel: string;
  status: string;
  statusLabel: string;
  statusTone: 'amber' | 'blue' | 'gray' | 'green' | 'red';
  notes: string;
  createdAt: string | null;
  createdAtLabel: string;
  updatedAtLabel: string;
  searchableText: string;
  cells: PrimaryDocumentCell[];
};

export type PrimaryDocumentRecentLink = {
  id: string;
  entityType: string;
  entityTypeLabel: string;
  entityId: string;
  documentCategory: string;
  documentCategoryLabel: string;
  documentDateLabel: string;
  linkedAtLabel: string;
  isPrimary: boolean;
};

export type PrimaryDocumentDetail = PrimaryDocumentRow & {
  fileMimeType: string;
  fileSizeLabel: string;
  categoryCoverageSummary: string;
  recentLinks: PrimaryDocumentRecentLink[];
};

export type PrimaryDocumentsRegisterResponse = {
  rows: PrimaryDocumentRow[];
  metrics: PrimaryDocumentMetric[];
  filterOptions: {
    groups: PrimaryDocumentFilterOption[];
    categories: PrimaryDocumentFilterOption[];
    quickFilters: PrimaryDocumentFilterOption[];
  };
  appliedFilters: {
    search: string;
    groups: string[];
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
    groups: PrimaryDocumentFilterOption[];
    categories: PrimaryDocumentFilterOption[];
  };
  flags: {
    detailEnabledIds: string[];
  };
};

export async function getPrimaryDocuments(
  query: {
    search?: string;
    page?: number;
    groups?: string[];
    categories?: string[];
    quickFilters?: string[];
  } = {},
): Promise<PrimaryDocumentsRegisterResponse> {
  const params = new URLSearchParams();
  if (query.search?.trim()) params.set('search', query.search.trim());
  for (const value of query.groups || []) params.append('group', value);
  for (const value of query.categories || []) params.append('category', value);
  for (const value of query.quickFilters || []) params.append('quickFilter', value);
  params.set('page', String(query.page || 1));
  params.set('limit', '10');

  return fetchAccountingAdmin<PrimaryDocumentsRegisterResponse>(
    `/accounting/documents-inbox/document-governance/primary-documents?${params.toString()}`,
  );
}

export async function getPrimaryDocumentDetail(id: string): Promise<PrimaryDocumentDetail> {
  return fetchAccountingAdmin<PrimaryDocumentDetail>(
    `/accounting/documents-inbox/document-governance/primary-documents/${encodeURIComponent(id)}`,
  );
}
