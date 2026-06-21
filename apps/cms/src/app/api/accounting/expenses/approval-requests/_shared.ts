import type { Payload } from 'payload'
import {
  ACCOUNTING_APPROVAL_REQUEST_STATUS_OPTIONS,
  ACCOUNTING_COLLECTION_SLUGS,
} from '@/accounting/constants/accounting'
import { findAllDocs } from '@/accounting/utils/findAllDocs'
import { getRelationshipId } from '@/accounting/utils/accounting-audit'
import {
  buildExpenseDetailResponse,
  normalizeSearch,
  parseIntegerParam,
  parseListParam,
  type ExpenseDetail,
  type ExpenseDoc,
} from '../_shared'

export type { ExpenseDoc }

type StatusTone = 'amber' | 'blue' | 'gray' | 'green' | 'red'

type UserDoc =
  | {
      id?: number | string
      firstName?: string | null
      lastName?: string | null
      username?: string | null
    }
  | number
  | string
  | null

type WorkflowDoc =
  | {
      id?: number | string
      workflowCode?: string | null
      name?: string | null
      entityType?: string | null
      isActive?: boolean | null
      steps?:
        | Array<{
            stepNumber?: number | null
            label?: string | null
            approverUser?: UserDoc
            approverRole?: string | null
          }>
        | null
    }
  | number
  | string
  | null

export type ApprovalTrailStepDoc = {
  id?: string | null
  stepNumber?: number | null
  approver?: UserDoc
  decision?: string | null
  notes?: string | null
  actedAt?: string | null
}

export type ExpenseApprovalRequestDoc = {
  id: number | string
  workflow?: WorkflowDoc
  entityType?: string | null
  entityId?: string | null
  status?: string | null
  requestedBy?: UserDoc
  currentApprover?: UserDoc
  requestedAt?: string | null
  resolvedAt?: string | null
  resolutionNotes?: string | null
  approvalTrail?: ApprovalTrailStepDoc[] | null
  createdAt?: string | null
  updatedAt?: string | null
}

export type ExpenseApprovalCell =
  | string
  | {
      text: string
      tone?: StatusTone
      emphasis?: boolean
      align?: 'left' | 'right' | 'center'
    }

export type ExpenseApprovalMetric = {
  id: string
  label: string
  value: number | string
  change: string
  trend: 'up' | 'down' | 'neutral'
}

export type ExpenseApprovalRow = {
  id: string
  requestCode: string
  expenseId: string
  expenseNumber: string
  expenseLabel: string
  workflowId: string
  workflowLabel: string
  requestedByLabel: string
  currentApproverLabel: string
  requestedAt: string | null
  requestedAtLabel: string
  resolvedAt: string | null
  resolvedAtLabel: string
  status: string
  statusLabel: string
  statusTone: StatusTone
  resolutionNotes: string
  trailCount: number
  trailCountLabel: string
  hasCurrentApprover: boolean
  searchableText: string
  cells: ExpenseApprovalCell[]
}

export type ExpenseApprovalDetail = {
  id: string
  requestCode: string
  entityType: string
  expenseId: string
  expenseLabel: string
  status: string
  statusLabel: string
  statusTone: StatusTone
  workflow: {
    id: string
    label: string
    code: string
    isActive: boolean
    steps: Array<{
      stepNumber: number
      label: string
      approverLabel: string
      approverRole: string
    }>
  }
  requestedByLabel: string
  currentApproverLabel: string
  requestedAt: string | null
  requestedAtLabel: string
  resolvedAt: string | null
  resolvedAtLabel: string
  resolutionNotes: string
  approvalTrail: Array<{
    id: string
    stepNumber: number
    approverLabel: string
    decision: string
    decisionLabel: string
    notes: string
    actedAt: string | null
    actedAtLabel: string
  }>
  expenseSnapshot: ExpenseDetail | null
  usageSummary: {
    trailCount: number
    hasCurrentApprover: boolean
    isPending: boolean
  }
}

export type ExpenseApprovalReferenceData = {
  expenses: Array<{
    id: string
    expenseNumber: string
    label: string
    status: string
  }>
  workflows: Array<{
    id: string
    label: string
    workflowCode: string
    isActive: boolean
  }>
}

const statusLabelMap = new Map<string, string>(
  ACCOUNTING_APPROVAL_REQUEST_STATUS_OPTIONS.map((option) => [option.value, option.label]),
)

const formatDateTime = (value?: string | null) => {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return new Intl.DateTimeFormat('en-PH', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

const formatUserLabel = (user?: UserDoc) => {
  if (typeof user === 'object' && user) {
    const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ').trim()
    return fullName || user.username || `User ${String(user.id || '')}`.trim()
  }
  if (user === null || user === undefined || user === '') return '-'
  return `User ${String(user)}`
}

const formatWorkflowLabel = (workflow?: WorkflowDoc) => {
  if (typeof workflow === 'object' && workflow) {
    return `${workflow.workflowCode ? `${workflow.workflowCode} - ` : ''}${workflow.name || 'Unnamed workflow'}`
  }
  return '-'
}

const formatExpenseLabel = (expense: ExpenseDoc | undefined) => {
  if (!expense) return 'Unknown Expense'
  const expenseNumber = String(expense.expenseNumber || `Expense ${String(expense.id)}`)
  const vendor =
    typeof expense.vendor === 'object' && expense.vendor
      ? `${expense.vendor.vendorCode ? `${expense.vendor.vendorCode} - ` : ''}${expense.vendor.displayName || 'Unnamed vendor'}`
      : ''
  return vendor ? `${expenseNumber} - ${vendor}` : expenseNumber
}

const buildSearchableText = (values: unknown[]) =>
  values
    .flat()
    .filter((value) => value !== null && value !== undefined && value !== '')
    .map((value) => String(value).toLowerCase())
    .join(' ')

const getStatusTone = (status: string): StatusTone => {
  if (status === 'approved') return 'green'
  if (status === 'rejected') return 'red'
  if (status === 'pending') return 'amber'
  if (status === 'cancelled') return 'gray'
  return 'blue'
}

const toDecisionLabel = (decision: string) =>
  decision
    .split('_')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ') || 'Pending'

const buildRequestCode = (requestId: string) => `APR-${requestId.padStart(4, '0')}`

const matchesQuickFilter = (row: ExpenseApprovalRow, quickFilter: string) => {
  const [group, value] = quickFilter.split(':')
  if (group === 'status') return row.status === value
  if (group === 'coverage' && value === 'assigned') return row.hasCurrentApprover
  if (group === 'coverage' && value === 'with_notes') return Boolean(row.resolutionNotes)
  if (group === 'coverage' && value === 'with_trail') return row.trailCount > 0
  return false
}

export const getExpenseIdsFromApprovalRequests = (requests: ExpenseApprovalRequestDoc[]) =>
  Array.from(
    new Set(
      requests
        .map((request) => String(request.entityId || ''))
        .filter((entityId) => entityId.length > 0),
    ),
  )

export const buildExpenseLookup = (expenses: ExpenseDoc[]) =>
  new Map(expenses.map((expense) => [String(expense.id), expense]))

export const buildExpenseApprovalRow = ({
  request,
  expense,
}: {
  request: ExpenseApprovalRequestDoc
  expense?: ExpenseDoc
}): ExpenseApprovalRow => {
  const requestId = String(request.id)
  const status = String(request.status || 'pending')
  const requestCode = buildRequestCode(requestId)
  const workflowLabel = formatWorkflowLabel(request.workflow)
  const expenseNumber = String(expense?.expenseNumber || request.entityId || `Expense ${requestId}`)
  const expenseLabel = formatExpenseLabel(expense)
  const requestedByLabel = formatUserLabel(request.requestedBy)
  const currentApproverLabel = formatUserLabel(request.currentApprover)
  const trailCount = Array.isArray(request.approvalTrail) ? request.approvalTrail.length : 0

  return {
    id: requestId,
    requestCode,
    expenseId: String(request.entityId || ''),
    expenseNumber,
    expenseLabel,
    workflowId: String(getRelationshipId(request.workflow) || ''),
    workflowLabel,
    requestedByLabel,
    currentApproverLabel,
    requestedAt: request.requestedAt || null,
    requestedAtLabel: formatDateTime(request.requestedAt),
    resolvedAt: request.resolvedAt || null,
    resolvedAtLabel: formatDateTime(request.resolvedAt),
    status,
    statusLabel: statusLabelMap.get(status) || toDecisionLabel(status),
    statusTone: getStatusTone(status),
    resolutionNotes: String(request.resolutionNotes || ''),
    trailCount,
    trailCountLabel: `${trailCount} step${trailCount === 1 ? '' : 's'}`,
    hasCurrentApprover: Boolean(getRelationshipId(request.currentApprover)),
    searchableText: buildSearchableText([
      requestCode,
      expenseNumber,
      expenseLabel,
      workflowLabel,
      requestedByLabel,
      currentApproverLabel,
      status,
      request.resolutionNotes,
      Array.isArray(request.approvalTrail)
        ? request.approvalTrail.map((trailStep) => [trailStep.decision, trailStep.notes, formatUserLabel(trailStep.approver)])
        : [],
    ]),
    cells: [
      { text: requestCode, emphasis: true },
      expenseLabel,
      workflowLabel,
      currentApproverLabel,
      formatDateTime(request.requestedAt),
      { text: statusLabelMap.get(status) || toDecisionLabel(status), tone: getStatusTone(status) },
    ],
  }
}

export const matchesSelectedExpenseApprovalFilters = (
  row: ExpenseApprovalRow,
  filters: {
    statuses: string[]
    workflowIds: string[]
    coverageStates: string[]
    quickFilters: string[]
  },
) => {
  const predicates = [
    ...filters.statuses.map((status) => row.status === status),
    ...filters.workflowIds.map((workflowId) => row.workflowId === workflowId),
    ...filters.coverageStates.map((coverageState) =>
      coverageState === 'assigned'
        ? row.hasCurrentApprover
        : coverageState === 'with_notes'
          ? Boolean(row.resolutionNotes)
          : coverageState === 'with_trail'
            ? row.trailCount > 0
            : false,
    ),
    ...filters.quickFilters.map((quickFilter) => matchesQuickFilter(row, quickFilter)),
  ]

  if (predicates.length === 0) return true
  return predicates.some(Boolean)
}

export const buildExpenseApprovalMetrics = (rows: ExpenseApprovalRow[]): ExpenseApprovalMetric[] => [
  {
    id: 'expense-approval-pending',
    label: 'Pending Requests',
    value: rows.filter((row) => row.status === 'pending').length,
    change: 'Requests still awaiting action',
    trend: 'neutral',
  },
  {
    id: 'expense-approval-approved',
    label: 'Approved',
    value: rows.filter((row) => row.status === 'approved').length,
    change: 'Resolved with approval outcome',
    trend: 'up',
  },
  {
    id: 'expense-approval-rejected',
    label: 'Rejected',
    value: rows.filter((row) => row.status === 'rejected').length,
    change: 'Requests declined or returned',
    trend: 'down',
  },
  {
    id: 'expense-approval-with-trail',
    label: 'With Trail',
    value: rows.filter((row) => row.trailCount > 0).length,
    change: 'Requests carrying decision steps',
    trend: 'up',
  },
]

export const buildExpenseApprovalReferenceData = async (
  payload: Payload,
): Promise<ExpenseApprovalReferenceData> => {
  const [expenseRecords, workflows] = await Promise.all([
    payload.find({
      collection: ACCOUNTING_COLLECTION_SLUGS.expenses,
      depth: 2,
      sort: '-updatedAt',
      limit: 200,
      overrideAccess: true,
    }),
    findAllDocs<WorkflowDoc>({
      payload,
      collection: ACCOUNTING_COLLECTION_SLUGS.approvalWorkflows,
      depth: 1,
      where: {
        and: [
          { entityType: { equals: 'expense' } },
          { isActive: { equals: true } },
        ],
      },
      sort: 'name',
    }),
  ])

  return {
    expenses: expenseRecords.docs.map((expense) => {
      const expenseDoc = expense as unknown as ExpenseDoc
      return {
        id: String(expenseDoc.id),
        expenseNumber: String(expenseDoc.expenseNumber || `Expense ${String(expenseDoc.id)}`),
        label: formatExpenseLabel(expenseDoc),
        status: String(expenseDoc.status || 'draft'),
      }
    }),
    workflows: workflows.map((workflow) => ({
      id: String(getRelationshipId(workflow) || ''),
      label: formatWorkflowLabel(workflow),
      workflowCode:
        typeof workflow === 'object' && workflow ? String(workflow.workflowCode || '') : '',
      isActive: typeof workflow === 'object' && workflow ? Boolean(workflow.isActive) : false,
    })),
  }
}

export const buildExpenseApprovalDetailResponse = async ({
  payload,
  request,
}: {
  payload: Payload
  request: ExpenseApprovalRequestDoc
}): Promise<ExpenseApprovalDetail> => {
  const requestId = String(request.id)
  const status = String(request.status || 'pending')
  const expenseId = String(request.entityId || '')
  const expenseRecord = expenseId
    ? await payload
        .findByID({
          collection: ACCOUNTING_COLLECTION_SLUGS.expenses,
          id: parseIntegerParam(expenseId, 0) || expenseId,
          depth: 2,
          overrideAccess: true,
        })
        .catch(() => null)
    : null

  const workflow =
    typeof request.workflow === 'object' && request.workflow
      ? request.workflow
      : null

  return {
    id: requestId,
    requestCode: buildRequestCode(requestId),
    entityType: String(request.entityType || 'expense'),
    expenseId,
    expenseLabel: formatExpenseLabel((expenseRecord as ExpenseDoc | null) || undefined),
    status,
    statusLabel: statusLabelMap.get(status) || toDecisionLabel(status),
    statusTone: getStatusTone(status),
    workflow: {
      id: String(getRelationshipId(request.workflow) || ''),
      label: formatWorkflowLabel(request.workflow),
      code: String(workflow?.workflowCode || ''),
      isActive: Boolean(workflow?.isActive),
      steps: Array.isArray(workflow?.steps)
        ? workflow.steps.map((step, index) => ({
            stepNumber: Number(step.stepNumber || index + 1),
            label: String(step.label || `Step ${index + 1}`),
            approverLabel: formatUserLabel(step.approverUser),
            approverRole: String(step.approverRole || ''),
          }))
        : [],
    },
    requestedByLabel: formatUserLabel(request.requestedBy),
    currentApproverLabel: formatUserLabel(request.currentApprover),
    requestedAt: request.requestedAt || null,
    requestedAtLabel: formatDateTime(request.requestedAt),
    resolvedAt: request.resolvedAt || null,
    resolvedAtLabel: formatDateTime(request.resolvedAt),
    resolutionNotes: String(request.resolutionNotes || ''),
    approvalTrail: Array.isArray(request.approvalTrail)
      ? request.approvalTrail.map((trailStep, index) => {
          const decision = String(trailStep.decision || 'pending')
          return {
            id: String(trailStep.id || `${requestId}-${index + 1}`),
            stepNumber: Number(trailStep.stepNumber || index + 1),
            approverLabel: formatUserLabel(trailStep.approver),
            decision,
            decisionLabel: toDecisionLabel(decision),
            notes: String(trailStep.notes || ''),
            actedAt: trailStep.actedAt || null,
            actedAtLabel: formatDateTime(trailStep.actedAt),
          }
        })
      : [],
    expenseSnapshot:
      expenseRecord && typeof expenseRecord === 'object'
        ? await buildExpenseDetailResponse(payload, expenseRecord as unknown as ExpenseDoc)
        : null,
    usageSummary: {
      trailCount: Array.isArray(request.approvalTrail) ? request.approvalTrail.length : 0,
      hasCurrentApprover: Boolean(getRelationshipId(request.currentApprover)),
      isPending: status === 'pending',
    },
  }
}

export { normalizeSearch, parseIntegerParam, parseListParam }
