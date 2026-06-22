'use server';

import { getServerToken } from '@/app/actions/auth';
import { env } from '@/lib/env';
import type {
  AccountingInboxCell,
  AccountingInboxDetail,
  AccountingInboxFilterOption,
  AccountingInboxMetric,
  AccountingInboxRow,
} from '../document-intake/actions';

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
        : 'Failed to load document library data.';
    throw new Error(errorMessage);
  }

  return payload as T;
}

export type AllFilesFilterOption = AccountingInboxFilterOption;
export type AllFilesMetric = AccountingInboxMetric;
export type AllFilesCell = AccountingInboxCell;
export type AllFilesRow = AccountingInboxRow;
export type AllFilesDetail = AccountingInboxDetail;
export type ReceiptArchiveFilterOption = AccountingInboxFilterOption;
export type ReceiptArchiveMetric = AccountingInboxMetric;
export type ReceiptArchiveCell = AccountingInboxCell;
export type LinkedDocumentsFilterOption = AccountingInboxFilterOption;
export type LinkedDocumentsMetric = AccountingInboxMetric;
export type LinkedDocumentsCell = AccountingInboxCell;

export type ReceiptArchiveRow = {
  id: string;
  documentLinkId: string;
  mediaId: string;
  fileName: string;
  fileUrl: string | null;
  fileSizeLabel: string;
  mimeTypeLabel: string;
  mimeFamily: string;
  mimeFamilyLabel: string;
  documentCategory: string;
  documentCategoryLabel: string;
  entityType: string;
  entityTypeLabel: string;
  entityId: string;
  entityLabel: string;
  documentDate: string | null;
  documentDateLabel: string;
  linkedAt: string | null;
  linkedAtLabel: string;
  uploadedByLabel: string;
  notes: string;
  status: string;
  statusLabel: string;
  statusTone: 'amber' | 'blue' | 'gray' | 'green' | 'red';
  isPrimary: boolean;
  searchableText: string;
  cells: ReceiptArchiveCell[];
};

export type ReceiptArchiveDetail = ReceiptArchiveRow & {
  altText: string;
  cloudinaryPublicId: string;
  fileTypeLabel: string;
  fileSize: number;
  notesLabel: string;
};

export type LinkedDocumentsRow = {
  id: string;
  documentLinkId: string;
  mediaId: string;
  fileName: string;
  fileUrl: string | null;
  fileSizeLabel: string;
  mimeTypeLabel: string;
  documentCategory: string;
  documentCategoryLabel: string;
  entityType: string;
  entityTypeLabel: string;
  entityId: string;
  entityLabel: string;
  documentDate: string | null;
  documentDateLabel: string;
  linkedAt: string | null;
  linkedAtLabel: string;
  uploadedByLabel: string;
  notes: string;
  status: string;
  statusLabel: string;
  statusTone: 'amber' | 'blue' | 'gray' | 'green' | 'red';
  isPrimary: boolean;
  searchableText: string;
  cells: LinkedDocumentsCell[];
};

export type LinkedDocumentsDetail = LinkedDocumentsRow & {
  altText: string;
  cloudinaryPublicId: string;
  fileTypeLabel: string;
  fileSize: number;
  notesLabel: string;
};

export type AllFilesRegisterResponse = {
  rows: AllFilesRow[];
  metrics: AllFilesMetric[];
  filterOptions: {
    mimeFamilies: AllFilesFilterOption[];
    statuses: AllFilesFilterOption[];
    categories: AllFilesFilterOption[];
    quickFilters: AllFilesFilterOption[];
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
    categories: AllFilesFilterOption[];
    entityTypes: AllFilesFilterOption[];
    mimeFamilies: AllFilesFilterOption[];
  };
  flags: {
    detailEnabledIds: string[];
  };
};

export type ReceiptArchiveRegisterResponse = {
  rows: ReceiptArchiveRow[];
  metrics: ReceiptArchiveMetric[];
  filterOptions: {
    categories: ReceiptArchiveFilterOption[];
    entityTypes: ReceiptArchiveFilterOption[];
    statuses: ReceiptArchiveFilterOption[];
    quickFilters: ReceiptArchiveFilterOption[];
  };
  appliedFilters: {
    search: string;
    categories: string[];
    entityTypes: string[];
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
    categories: ReceiptArchiveFilterOption[];
    entityTypes: ReceiptArchiveFilterOption[];
    statuses: ReceiptArchiveFilterOption[];
  };
  flags: {
    detailEnabledIds: string[];
  };
};

export type LinkedDocumentsRegisterResponse = {
  rows: LinkedDocumentsRow[];
  metrics: LinkedDocumentsMetric[];
  filterOptions: {
    categories: LinkedDocumentsFilterOption[];
    entityTypes: LinkedDocumentsFilterOption[];
    statuses: LinkedDocumentsFilterOption[];
    quickFilters: LinkedDocumentsFilterOption[];
  };
  appliedFilters: {
    search: string;
    categories: string[];
    entityTypes: string[];
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
    categories: LinkedDocumentsFilterOption[];
    entityTypes: LinkedDocumentsFilterOption[];
    statuses: LinkedDocumentsFilterOption[];
  };
  flags: {
    detailEnabledIds: string[];
  };
};

export async function getDocumentLibraryAllFiles(
  query: {
    search?: string;
    page?: number;
    mimeFamilies?: string[];
    statuses?: string[];
    categories?: string[];
    quickFilters?: string[];
  } = {},
): Promise<AllFilesRegisterResponse> {
  const params = new URLSearchParams();
  if (query.search?.trim()) params.set('search', query.search.trim());
  for (const value of query.mimeFamilies || []) params.append('mimeFamily', value);
  for (const value of query.statuses || []) params.append('status', value);
  for (const value of query.categories || []) params.append('category', value);
  for (const value of query.quickFilters || []) {
    if (value !== 'scope:all') params.append('quickFilter', value);
  }
  params.set('page', String(query.page || 1));
  params.set('limit', '10');

  return fetchAccountingAdmin<AllFilesRegisterResponse>(
    `/accounting/documents-inbox/document-library/all-files?${params.toString()}`,
  );
}

export async function getDocumentLibraryAllFileDetail(
  id: string | number,
): Promise<AllFilesDetail> {
  return fetchAccountingAdmin<AllFilesDetail>(
    `/accounting/documents-inbox/document-library/all-files/${id}`,
  );
}

export async function getDocumentLibraryReceiptArchive(
  query: {
    search?: string;
    page?: number;
    categories?: string[];
    entityTypes?: string[];
    statuses?: string[];
    quickFilters?: string[];
  } = {},
): Promise<ReceiptArchiveRegisterResponse> {
  const params = new URLSearchParams();
  if (query.search?.trim()) params.set('search', query.search.trim());
  for (const value of query.categories || []) params.append('category', value);
  for (const value of query.entityTypes || []) params.append('entityType', value);
  for (const value of query.statuses || []) params.append('status', value);
  for (const value of query.quickFilters || []) params.append('quickFilter', value);
  params.set('page', String(query.page || 1));
  params.set('limit', '10');

  return fetchAccountingAdmin<ReceiptArchiveRegisterResponse>(
    `/accounting/documents-inbox/document-library/receipt-archive?${params.toString()}`,
  );
}

export async function getDocumentLibraryReceiptArchiveDetail(
  id: string | number,
): Promise<ReceiptArchiveDetail> {
  return fetchAccountingAdmin<ReceiptArchiveDetail>(
    `/accounting/documents-inbox/document-library/receipt-archive/${id}`,
  );
}

export async function getDocumentLibraryLinkedDocuments(
  query: {
    search?: string;
    page?: number;
    categories?: string[];
    entityTypes?: string[];
    statuses?: string[];
    quickFilters?: string[];
  } = {},
): Promise<LinkedDocumentsRegisterResponse> {
  const params = new URLSearchParams();
  if (query.search?.trim()) params.set('search', query.search.trim());
  for (const value of query.categories || []) params.append('category', value);
  for (const value of query.entityTypes || []) params.append('entityType', value);
  for (const value of query.statuses || []) params.append('status', value);
  for (const value of query.quickFilters || []) params.append('quickFilter', value);
  params.set('page', String(query.page || 1));
  params.set('limit', '10');

  return fetchAccountingAdmin<LinkedDocumentsRegisterResponse>(
    `/accounting/documents-inbox/document-library/linked-documents?${params.toString()}`,
  );
}

export async function getDocumentLibraryLinkedDocumentDetail(
  id: string | number,
): Promise<LinkedDocumentsDetail> {
  return fetchAccountingAdmin<LinkedDocumentsDetail>(
    `/accounting/documents-inbox/document-library/linked-documents/${id}`,
  );
}
