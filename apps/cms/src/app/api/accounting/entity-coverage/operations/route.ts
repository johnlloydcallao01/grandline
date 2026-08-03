import { NextRequest, NextResponse } from 'next/server'
import { ACCOUNTING_COLLECTION_SLUGS } from '@/accounting/constants/accounting'
import { findAllDocs } from '@/accounting/utils/findAllDocs'
import { handleAccountingApiError, requireAccountingAdmin } from '../../_utils/auth'

const parseIntegerParam = (value: string | null, fallback: number) => { if (!value) return fallback; const p = Number(value); return Number.isFinite(p) ? p : fallback }
const parseListParam = (searchParams: URLSearchParams, key: string): string[] => Array.from(new Set(searchParams.getAll(key).flatMap((v) => String(v || '').split(',')).map((v) => v.trim()).filter(Boolean)))
const normalizeText = (value?: string | null) => String(value || '').trim().toLowerCase()
const formatDateTime = (v: string | null | undefined) => { if (!v) return '-'; const d = new Date(v); if (Number.isNaN(d.getTime())) return String(v); return d.toLocaleDateString('en-CA') + ' ' + d.toLocaleTimeString('en-CA', { hour: '2-digit', minute: '2-digit' }) }

const OPERATIONAL_ENTITY_TYPES = ['budget', 'asset_disposal', 'timesheet', 'payroll_run']

function getCollectionName(et: string): string {
  switch (et) {
    case 'budget': return ACCOUNTING_COLLECTION_SLUGS.budgets
    case 'asset_disposal': return ACCOUNTING_COLLECTION_SLUGS.assetDisposals
    case 'timesheet': return ACCOUNTING_COLLECTION_SLUGS.timesheets
    case 'payroll_run': return ACCOUNTING_COLLECTION_SLUGS.payrollRuns
    default: return 'unknown'
  }
}

function getOutcomeInfo(et: string): { approve: string; reject: string } {
  switch (et) {
    case 'budget': return { approve: 'Sets status to approved', reject: 'Returns status to draft' }
    case 'asset_disposal': return { approve: 'Sets status to approved', reject: 'Returns status to draft' }
    case 'timesheet': return { approve: 'Calls timesheet approve service', reject: 'Calls timesheet reject service' }
    case 'payroll_run': return { approve: 'Sets status to approved', reject: 'Keeps status at review' }
    default: return { approve: 'No direct entity mutation', reject: 'No direct entity mutation' }
  }
}

function getRequestBehavior(et: string): string {
  switch (et) {
    case 'timesheet': return 'Submitting request also submits timesheet'
    case 'payroll_run': return 'Request sets payroll run to review'
    default: return 'Creates approval request'
  }
}

export async function GET(request: NextRequest) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const { searchParams } = new URL(request.url)
    const search = normalizeText(searchParams.get('search'))
    const entityTypes = parseListParam(searchParams, 'entityType')
    const quickFilters = parseListParam(searchParams, 'quickFilter')
    const page = Math.max(1, parseIntegerParam(searchParams.get('page'), 1))
    const limit = Math.min(100, Math.max(1, parseIntegerParam(searchParams.get('limit'), 10)))

    const [workflowDocs, requestDocs, userDocs] = await Promise.all([
      findAllDocs<any>({ payload, collection: ACCOUNTING_COLLECTION_SLUGS.approvalWorkflows, depth: 2, sort: '-createdAt' }),
      findAllDocs<any>({ payload, collection: ACCOUNTING_COLLECTION_SLUGS.approvalRequests, depth: 0, sort: '-requestedAt' }),
      findAllDocs<any>({ payload, collection: 'users', depth: 0 }),
    ])

    const users = userDocs.filter((u) => u.role !== 'service' && u.isActive !== false).map((u) => ({ id: String(u.id), label: [u.firstName, u.lastName].filter(Boolean).join(' ') || u.email || u.username || `User ${u.id}`, email: u.email || '', username: u.username || '' }))

    const requestsByType: Record<string, any[]> = {}
    for (const req of requestDocs) {
      const et = req.entityType || ''
      if (!requestsByType[et]) requestsByType[et] = []
      requestsByType[et].push(req)
    }

    const entityTypeLabels: Record<string, string> = { budget: 'Budget', asset_disposal: 'Asset Disposal', timesheet: 'Timesheet', payroll_run: 'Payroll Run' }

    type CoverageRow = {
      id: string; entityType: string; entityTypeLabel: string; mappedCollection: string; requestBehavior: string; requestSupport: boolean; requestSupportLabel: string; approveOutcome: string; rejectOutcome: string; hasWorkflow: boolean; workflowStatus: string; workflowStatusTone: string; workflowId: string; workflowCode: string; workflowName: string; requestCount: number; pendingCount: number; lastRequestLabel: string; cells: Array<string | { text: string; emphasis?: boolean; tone?: string; align?: string }>
    }

    const rows: CoverageRow[] = []

    for (const doc of workflowDocs) {
      const et = doc.entityType || ''
      if (!OPERATIONAL_ENTITY_TYPES.includes(et)) continue
      const etLabel = entityTypeLabels[et] || et
      const mappedCollection = getCollectionName(et)
      const outcome = getOutcomeInfo(et)
      const reqBehavior = getRequestBehavior(et)
      const isActive = doc.isActive !== false
      const rqs = requestsByType[et] || []
      const pendingCount = rqs.filter((r) => r.status === 'pending').length
      const lastReq = rqs[0] || null

      rows.push({
        id: `coverage-op-${doc.id}`, entityType: et, entityTypeLabel: etLabel, mappedCollection, requestBehavior: reqBehavior, requestSupport: true, requestSupportLabel: 'Yes', approveOutcome: outcome.approve, rejectOutcome: outcome.reject, hasWorkflow: true, workflowStatus: isActive ? 'Active' : 'Inactive', workflowStatusTone: isActive ? 'green' : 'gray', workflowId: String(doc.id), workflowCode: doc.workflowCode || '', workflowName: doc.name || '', requestCount: rqs.length, pendingCount, lastRequestLabel: lastReq ? formatDateTime(lastReq.requestedAt) : '-',
        cells: [
          { text: etLabel, emphasis: true },
          mappedCollection,
          reqBehavior,
          outcome.approve,
          outcome.reject,
          { text: isActive ? 'Active' : 'Inactive', tone: isActive ? 'green' : 'gray' },
        ],
      })
    }

    const coveredTypes = new Set(workflowDocs.map((d) => d.entityType || ''))
    for (const et of OPERATIONAL_ENTITY_TYPES) {
      if (coveredTypes.has(et)) continue
      const etLabel = entityTypeLabels[et] || et
      const mappedCollection = getCollectionName(et)
      const outcome = getOutcomeInfo(et)
      const reqBehavior = getRequestBehavior(et)
      const rqs = requestsByType[et] || []
      const pendingCount = rqs.filter((r) => r.status === 'pending').length

      rows.push({
        id: `coverage-op-gap-${et}`, entityType: et, entityTypeLabel: etLabel, mappedCollection, requestBehavior: reqBehavior, requestSupport: true, requestSupportLabel: 'Yes', approveOutcome: outcome.approve, rejectOutcome: outcome.reject, hasWorkflow: false, workflowStatus: 'No Workflow', workflowStatusTone: 'red', workflowId: '', workflowCode: '', workflowName: '', requestCount: rqs.length, pendingCount, lastRequestLabel: rqs[0] ? formatDateTime(rqs[0].requestedAt) : '-',
        cells: [
          { text: etLabel, emphasis: true },
          mappedCollection,
          reqBehavior,
          outcome.approve,
          outcome.reject,
          { text: 'No Workflow', tone: 'red' },
        ],
      })
    }

    let filtered = rows
    if (search) { filtered = filtered.filter((r) => normalizeText([r.entityTypeLabel, r.mappedCollection, r.requestBehavior, r.approveOutcome, r.rejectOutcome, r.workflowStatus, r.workflowCode, r.workflowName].join(' ')).includes(search)) }
    if (entityTypes.length > 0) { filtered = filtered.filter((r) => entityTypes.includes(r.entityType)) }
    if (quickFilters.length > 0) {
      filtered = filtered.filter((r) => quickFilters.some((qf) => {
        if (qf === 'mapping:active') return r.hasWorkflow
        if (qf === 'mapping:missing') return !r.hasWorkflow
        if (qf === 'requests:has') return r.requestCount > 0
        if (qf === 'requests:pending') return r.pendingCount > 0
        if (qf === 'outcome:status') return r.approveOutcome.includes('status')
        if (qf === 'outcome:service') return r.approveOutcome.includes('service')
        return false
      }))
    }

    const totalDocs = filtered.length
    const totalPages = Math.max(1, Math.ceil(totalDocs / limit))
    const currentPage = Math.min(page, totalPages)
    const paginatedRows = filtered.slice((currentPage - 1) * limit, currentPage * limit)

    const activeRows = rows.filter((r) => r.hasWorkflow)
    const withWorkflowCount = new Set(activeRows.map((r) => r.entityType)).size
    const statusMutationCount = new Set(activeRows.filter((r) => r.approveOutcome.includes('status') || r.rejectOutcome.includes('status')).map((r) => r.entityType)).size
    const serviceHookCount = new Set(activeRows.filter((r) => r.approveOutcome.includes('service') || r.requestBehavior.includes('submits')).map((r) => r.entityType)).size
    const totalRequests = rows.reduce((sum, r) => sum + r.requestCount, 0)

    return NextResponse.json({
      section: {
        id: 'operations', label: 'Operational Coverage',
        description: 'Review approval workflow mappings for operational entity types such as budgets, asset disposals, timesheets, and payroll runs.',
        searchPlaceholder: 'Search entity type, collection, behavior, outcome, or mapping status',
        filters: {
          entityTypes: Array.from(new Map(rows.map((r) => [r.entityType, { label: r.entityTypeLabel, value: r.entityType }])).values()),
          quickFilters: [
            { label: 'Has Mapping', value: 'mapping:active' },
            { label: 'Missing Mapping', value: 'mapping:missing' },
            { label: 'Has Requests', value: 'requests:has' },
            { label: 'Pending Requests', value: 'requests:pending' },
            { label: 'Status Mutation', value: 'outcome:status' },
            { label: 'Service Hook', value: 'outcome:service' },
          ],
        },
        metrics: [
          { id: 'types', label: 'Operational Types', value: rows.length, change: 'Entity types supported by operational approval flows', trend: 'neutral' as const },
          { id: 'with-mapping', label: 'With Active Mapping', value: withWorkflowCount, change: 'Operational types with an active workflow mapped', trend: withWorkflowCount > 0 ? 'up' as const : 'neutral' as const },
          { id: 'status-updates', label: 'Status Mutations', value: statusMutationCount, change: 'Entity types with direct status update on outcome', trend: statusMutationCount > 0 ? 'up' as const : 'neutral' as const },
          { id: 'service-hooks', label: 'Service Hooks', value: serviceHookCount, change: 'Entity types triggering service calls on request or outcome', trend: serviceHookCount > 0 ? 'up' as const : 'neutral' as const },
        ],
        table: {
          title: 'Operational Approval Coverage', description: 'Workflow-to-entity-type mappings for operational records. Shows which entity types have an active workflow, what request-side behavior is triggered, and what outcome mutations apply.',
          columns: ['Entity Type', 'Mapped Collection', 'Request Behavior', 'Approve Outcome', 'Reject Outcome', 'Workflow Status'],
          rows: paginatedRows,
        },
      },
      appliedFilters: { search, entityTypes, quickFilters },
      pagination: { page: currentPage, limit, totalDocs, totalPages, hasPrevPage: currentPage > 1, hasNextPage: currentPage < totalPages },
      totals: { totalRows: rows.length, filteredRows: totalDocs, withWorkflowCount, totalRequests, totalPending: rows.reduce((sum, r) => sum + r.pendingCount, 0) },
      referenceData: { entityTypes: Array.from(new Map(rows.map((r) => [r.entityType, { label: r.entityTypeLabel, value: r.entityType }])).values()), users },
    })
  } catch (error) { return handleAccountingApiError(error) }
}
