'use server';

import { getServerToken } from '@/app/actions/auth';
import { env } from '@/lib/env';

async function fetchAccountingAdmin<T>(path: string, init?: RequestInit): Promise<T> {
  const token = await getServerToken();
  if (!token) {
    throw new Error('No admin session available.');
  }

  const traceId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const url = `${env.NEXT_PUBLIC_API_URL}${path}`;

  // #region debug-point A:web-admin-fetch-start
  fetch('http://127.0.0.1:7777/event', {
    method: 'POST',
    body: JSON.stringify({
      sessionId: 'supporting-docs-upload',
      runId: 'pre-fix',
      hypothesisId: 'A',
      location: 'claims-reimbursements/actions.ts:fetchAccountingAdmin:start',
      msg: '[DEBUG] fetchAccountingAdmin request starting',
      data: {
        traceId,
        path,
        url,
        method: init?.method || 'GET',
        hasBody: Boolean(init?.body),
      },
      ts: Date.now(),
    }),
  }).catch(() => {});
  // #endregion

  const response = await fetch(url, {
    ...init,
    headers: {
      Authorization: `JWT ${token}`,
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
      ...(init?.headers || {}),
    },
    cache: 'no-store',
  });

  // #region debug-point B:web-admin-fetch-response
  fetch('http://127.0.0.1:7777/event', {
    method: 'POST',
    body: JSON.stringify({
      sessionId: 'supporting-docs-upload',
      runId: 'pre-fix',
      hypothesisId: 'B',
      location: 'claims-reimbursements/actions.ts:fetchAccountingAdmin:response',
      msg: '[DEBUG] fetchAccountingAdmin response received',
      data: {
        traceId,
        path,
        url,
        status: response.status,
        ok: response.ok,
        statusText: response.statusText,
      },
      ts: Date.now(),
    }),
  }).catch(() => {});
  // #endregion

  const payload = (await response.json().catch(() => null)) as T | { error?: string } | null;
  if (!response.ok) {
    const errorMessage =
      payload && typeof payload === 'object' && 'error' in payload && typeof payload.error === 'string'
        ? payload.error
        : 'Failed to load accounting data.';

    // #region debug-point C:web-admin-fetch-error
    fetch('http://127.0.0.1:7777/event', {
      method: 'POST',
      body: JSON.stringify({
        sessionId: 'supporting-docs-upload',
        runId: 'pre-fix',
        hypothesisId: 'C',
        location: 'claims-reimbursements/actions.ts:fetchAccountingAdmin:error',
        msg: '[DEBUG] fetchAccountingAdmin response failed',
        data: {
          traceId,
          path,
          url,
          status: response.status,
          errorMessage,
          payload,
        },
        ts: Date.now(),
      }),
    }).catch(() => {});
    // #endregion
    throw new Error(errorMessage);
  }

  return payload as T;
}

export type ApprovalFilterOption = {
  label: string;
  value: string;
};

export type ApprovalMetric = {
  id: string;
  label: string;
  value: number | string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
};

export type ApprovalCell =
  | string
  | {
      text: string;
      tone?: 'amber' | 'blue' | 'gray' | 'green' | 'red';
      emphasis?: boolean;
      align?: 'left' | 'right' | 'center';
    };

export type ExpenseApprovalRequestRow = {
  id: string;
  requestCode: string;
  expenseId: string;
  expenseNumber: string;
  expenseLabel: string;
  workflowId: string;
  workflowLabel: string;
  requestedByLabel: string;
  currentApproverLabel: string;
  requestedAt: string | null;
  requestedAtLabel: string;
  resolvedAt: string | null;
  resolvedAtLabel: string;
  status: string;
  statusLabel: string;
  statusTone: 'amber' | 'blue' | 'gray' | 'green' | 'red';
  resolutionNotes: string;
  trailCount: number;
  trailCountLabel: string;
  hasCurrentApprover: boolean;
  searchableText: string;
  cells: ApprovalCell[];
};

export type ExpenseApprovalRequestDetail = {
  id: string;
  requestCode: string;
  entityType: string;
  expenseId: string;
  expenseLabel: string;
  status: string;
  statusLabel: string;
  statusTone: 'amber' | 'blue' | 'gray' | 'green' | 'red';
  workflow: {
    id: string;
    label: string;
    code: string;
    isActive: boolean;
    steps: Array<{
      stepNumber: number;
      label: string;
      approverLabel: string;
      approverRole: string;
    }>;
  };
  requestedByLabel: string;
  currentApproverLabel: string;
  requestedAt: string | null;
  requestedAtLabel: string;
  resolvedAt: string | null;
  resolvedAtLabel: string;
  resolutionNotes: string;
  approvalTrail: Array<{
    id: string;
    stepNumber: number;
    approverLabel: string;
    decision: string;
    decisionLabel: string;
    notes: string;
    actedAt: string | null;
    actedAtLabel: string;
  }>;
  expenseSnapshot: {
    id: string;
    expenseNumber: string;
    expenseDateLabel: string;
    postingDateLabel: string;
    vendorLabel: string;
    expenseCategory: string;
    paymentMethodLabel: string;
    statusLabel: string;
    statusTone: 'amber' | 'blue' | 'gray' | 'green' | 'red';
    subtotalLabel: string;
    taxTotalLabel: string;
    totalLabel: string;
    projectLabel: string;
    expenseAccountLabel: string;
    taxCodeLabel: string;
    paymentAccountLabel: string;
    bankAccountLabel: string;
    postedJournalEntryId: string;
    notes: string;
    usageSummary: {
      documentCount: number;
      hasJournalLink: boolean;
      hasDependents: boolean;
    };
  } | null;
  usageSummary: {
    trailCount: number;
    hasCurrentApprover: boolean;
    isPending: boolean;
  };
};

export type ExpenseApprovalRequestsResponse = {
  rows: ExpenseApprovalRequestRow[];
  metrics: ApprovalMetric[];
  filterOptions: {
    statuses: ApprovalFilterOption[];
    workflows: ApprovalFilterOption[];
    coverageStates: ApprovalFilterOption[];
    quickFilters: ApprovalFilterOption[];
  };
  appliedFilters: {
    search: string;
    statuses: string[];
    workflowIds: string[];
    coverageStates: string[];
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
    expenses: Array<{
      id: string;
      expenseNumber: string;
      label: string;
      status: string;
    }>;
    workflows: Array<{
      id: string;
      label: string;
      workflowCode: string;
      isActive: boolean;
    }>;
  };
  flags: {
    pendingRequestIds: string[];
  };
};

export type ExpenseSupportingDocumentRow = {
  id: string;
  linkReference: string;
  expenseId: string;
  expenseNumber: string;
  expenseLabel: string;
  expenseStatus: string;
  expenseStatusLabel: string;
  mediaId: string;
  mediaLabel: string;
  mediaUrl: string | null;
  documentCategory: string;
  documentCategoryLabel: string;
  documentDate: string | null;
  documentDateLabel: string;
  uploadedByLabel: string;
  isPrimary: boolean;
  stateLabel: string;
  stateTone: 'amber' | 'blue' | 'gray' | 'green' | 'red';
  notes: string;
  createdAt: string | null;
  createdAtLabel: string;
  searchableText: string;
  cells: ApprovalCell[];
};

export type ExpenseSupportingDocumentDetail = {
  id: string;
  linkReference: string;
  expenseId: string;
  expenseLabel: string;
  expenseStatusLabel: string;
  media: {
    id: string;
    filename: string;
    url: string | null;
    mimeType: string;
    alt: string;
    filesize: number;
  } | null;
  documentCategory: string;
  documentCategoryLabel: string;
  documentDate: string | null;
  documentDateLabel: string;
  uploadedByLabel: string;
  isPrimary: boolean;
  stateLabel: string;
  stateTone: 'amber' | 'blue' | 'gray' | 'green' | 'red';
  notes: string;
  createdAtLabel: string;
  updatedAtLabel: string;
  expenseSnapshot: {
    id: string;
    expenseNumber: string;
    vendorLabel: string;
    statusLabel: string;
    totalLabel: string;
    taxCodeLabel: string;
    paymentMethodLabel: string;
  } | null;
};

export type ExpenseSupportingDocumentsResponse = {
  rows: ExpenseSupportingDocumentRow[];
  metrics: ApprovalMetric[];
  filterOptions: {
    categories: ApprovalFilterOption[];
    states: ApprovalFilterOption[];
    expenseStatuses: ApprovalFilterOption[];
    quickFilters: ApprovalFilterOption[];
  };
  appliedFilters: {
    search: string;
    categories: string[];
    states: string[];
    expenseStatuses: string[];
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
    expenses: Array<{
      id: string;
      label: string;
      expenseNumber: string;
      status: string;
      statusLabel: string;
    }>;
    categories: ApprovalFilterOption[];
  };
  flags: {
    editableDocumentIds: string[];
  };
};

export async function getExpenseApprovalRequests(
  query: {
    search?: string;
    page?: number;
    statuses?: string[];
    workflowIds?: string[];
    coverageStates?: string[];
    quickFilters?: string[];
  } = {},
): Promise<ExpenseApprovalRequestsResponse> {
  const params = new URLSearchParams();
  if (query.search?.trim()) params.set('search', query.search.trim());
  for (const value of query.statuses || []) params.append('status', value);
  for (const value of query.workflowIds || []) params.append('workflowId', value);
  for (const value of query.coverageStates || []) params.append('coverage', value);
  for (const value of query.quickFilters || []) params.append('quickFilter', value);
  params.set('page', String(query.page || 1));
  params.set('limit', '10');

  return fetchAccountingAdmin<ExpenseApprovalRequestsResponse>(
    `/accounting/expenses/approval-requests?${params.toString()}`,
  );
}

export async function getExpenseApprovalRequestDetail(
  id: string | number,
): Promise<ExpenseApprovalRequestDetail> {
  return fetchAccountingAdmin<ExpenseApprovalRequestDetail>(
    `/accounting/expenses/approval-requests/${id}`,
  );
}

export async function createExpenseApprovalRequest(input: {
  entityId: string;
  workflowId?: string | null;
  notes?: string | null;
}): Promise<ExpenseApprovalRequestDetail> {
  const created = await fetchAccountingAdmin<{ id: string | number }>(`/accounting/approvals/requests`, {
    method: 'POST',
    body: JSON.stringify({
      entityType: 'expense',
      entityId: input.entityId,
      workflowId: input.workflowId || undefined,
      notes: input.notes || undefined,
    }),
  });

  return getExpenseApprovalRequestDetail(created.id);
}

export async function approveExpenseApprovalRequest(
  id: string | number,
  notes?: string,
): Promise<ExpenseApprovalRequestDetail> {
  await fetchAccountingAdmin(`/accounting/approvals/requests/${id}/approve`, {
    method: 'POST',
    body: JSON.stringify({ notes: notes || undefined }),
  });
  return getExpenseApprovalRequestDetail(id);
}

export async function rejectExpenseApprovalRequest(
  id: string | number,
  notes?: string,
): Promise<ExpenseApprovalRequestDetail> {
  await fetchAccountingAdmin(`/accounting/approvals/requests/${id}/reject`, {
    method: 'POST',
    body: JSON.stringify({ notes: notes || undefined }),
  });
  return getExpenseApprovalRequestDetail(id);
}

export type SupportingDocumentMutationInput = {
  entityId: string;
  media: string | number;
  documentCategory: string;
  documentDate?: string | null;
  isPrimary: boolean;
  notes?: string | null;
};

export async function getExpenseSupportingDocuments(
  query: {
    search?: string;
    page?: number;
    categories?: string[];
    states?: string[];
    expenseStatuses?: string[];
    quickFilters?: string[];
  } = {},
): Promise<ExpenseSupportingDocumentsResponse> {
  const params = new URLSearchParams();
  if (query.search?.trim()) params.set('search', query.search.trim());
  for (const value of query.categories || []) params.append('category', value);
  for (const value of query.states || []) params.append('state', value);
  for (const value of query.expenseStatuses || []) params.append('expenseStatus', value);
  for (const value of query.quickFilters || []) params.append('quickFilter', value);
  params.set('page', String(query.page || 1));
  params.set('limit', '10');

  return fetchAccountingAdmin<ExpenseSupportingDocumentsResponse>(
    `/accounting/expenses/supporting-documents?${params.toString()}`,
  );
}

export async function getExpenseSupportingDocumentDetail(
  id: string | number,
): Promise<ExpenseSupportingDocumentDetail> {
  return fetchAccountingAdmin<ExpenseSupportingDocumentDetail>(
    `/accounting/expenses/supporting-documents/${id}`,
  );
}

export async function createExpenseSupportingDocument(
  input: SupportingDocumentMutationInput,
): Promise<ExpenseSupportingDocumentDetail> {
  return fetchAccountingAdmin<ExpenseSupportingDocumentDetail>(
    `/accounting/expenses/supporting-documents`,
    {
      method: 'POST',
      body: JSON.stringify({
        entityId: input.entityId,
        media: input.media,
        documentCategory: input.documentCategory,
        documentDate: input.documentDate || undefined,
        isPrimary: input.isPrimary,
        notes: input.notes || undefined,
      }),
    },
  );
}

export async function updateExpenseSupportingDocument(
  id: string | number,
  input: SupportingDocumentMutationInput,
): Promise<ExpenseSupportingDocumentDetail> {
  return fetchAccountingAdmin<ExpenseSupportingDocumentDetail>(
    `/accounting/expenses/supporting-documents/${id}`,
    {
      method: 'PATCH',
      body: JSON.stringify({
        entityId: input.entityId,
        media: input.media,
        documentCategory: input.documentCategory,
        documentDate: input.documentDate || undefined,
        isPrimary: input.isPrimary,
        notes: input.notes || undefined,
      }),
    },
  );
}

export async function deleteExpenseSupportingDocument(
  id: string | number,
): Promise<{ success: boolean }> {
  return fetchAccountingAdmin<{ success: boolean }>(
    `/accounting/expenses/supporting-documents/${id}`,
    {
      method: 'DELETE',
    },
  );
}
