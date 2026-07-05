import { NextRequest, NextResponse } from 'next/server'
import { ACCOUNTING_COLLECTION_SLUGS } from '@/accounting/constants/accounting'
import { findAllDocs } from '@/accounting/utils/findAllDocs'
import { handleAccountingApiError, requireAccountingAdmin } from '../../_utils/auth'

const parseIntegerParam = (value: string | null, fallback: number) => { if (!value) return fallback; const p = Number(value); return Number.isFinite(p) ? p : fallback }
const parseListParam = (searchParams: URLSearchParams, key: string): string[] => Array.from(new Set(searchParams.getAll(key).flatMap((v) => String(v || '').split(',')).map((v) => v.trim()).filter(Boolean)))
const normalizeText = (value?: string | null) => String(value || '').trim().toLowerCase()
const formatDateTime = (v: string | null | undefined) => { if (!v) return '-'; const d = new Date(v); if (Number.isNaN(d.getTime())) return String(v); return d.toLocaleDateString('en-CA') + ' ' + d.toLocaleTimeString('en-CA', { hour: '2-digit', minute: '2-digit' }) }

const TRANSACTION_ENTITY_TYPES = ['invoice', 'bill', 'expense', 'journal']

function getCollectionName(et: string): string {
  switch (et) {
    case 'invoice': return ACCOUNTING_COLLECTION_SLUGS.invoices
    case 'bill': return ACCOUNTING_COLLECTION_SLUGS.bills
    case 'expense': return ACCOUNTING_COLLECTION_SLUGS.expenses
    case 'journal': return ACCOUNTING_COLLECTION_SLUGS.journalEntries
    case 'budget': return ACCOUNTING_COLLECTION_SLUGS.budgets
    case 'asset_disposal': return ACCOUNTING_COLLECTION_SLUGS.assetDisposals
    case 'timesheet': return ACCOUNTING_COLLECTION_SLUGS.timesheets
    case 'payroll_run': return ACCOUNTING_COLLECTION_SLUGS.payrollRuns
    default: return 'journal-entries'
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

    const users = userDocs
      .filter((u) => u.role !== 'service' && u.isActive !== false)
      .map((u) => ({ id: String(u.id), label: [u.firstName, u.lastName].filter(Boolean).join(' ') || u.email || u.username || `User ${u.id}`, email: u.email || '', username: u.username || '' }))

    const requestsByType: Record<string, any[]> = {}
    for (const req of requestDocs) {
      const et = req.entityType || ''
      if (!requestsByType[et]) requestsByType[et] = []
      requestsByType[et].push(req)
    }

    const entityTypeLabels: Record<string, string> = {
      invoice: 'Invoice', bill: 'Bill', expense: 'Expense', journal: 'Journal',
      budget: 'Budget', asset_disposal: 'Asset Disposal', timesheet: 'Timesheet', payroll_run: 'Payroll Run',
    }

    type CoverageRow = {
      id: string
      entityType: string
      entityTypeLabel: string
      mappedCollection: string
      requestSupport: boolean
      requestSupportLabel: string
      approveOutcome: string
      rejectOutcome: string
      hasWorkflow: boolean
      workflowStatus: string
      workflowStatusTone: string
      workflowId: string
      workflowCode: string
      workflowName: string
      requestCount: number
      pendingCount: number
      lastRequestAt: string | null
      lastRequestLabel: string
      cells: Array<string | { text: string; emphasis?: boolean; tone?: string; align?: string }>
    }

    const rows: CoverageRow[] = []

    for (const doc of workflowDocs) {
      const et = doc.entityType || ''
      if (!TRANSACTION_ENTITY_TYPES.includes(et)) continue
      const etLabel = entityTypeLabels[et] || et
      const mappedCollection = getCollectionName(et)
      const outcome = getOutcomeInfo(et)
      const isActive = doc.isActive !== false
      const rqs = requestsByType[et] || []
      const pendingCount = rqs.filter((r) => r.status === 'pending').length
      const lastReq = rqs[0] || null

      rows.push({
        id: `coverage-${doc.id}`, entityType: et, entityTypeLabel: etLabel, mappedCollection, requestSupport: true, requestSupportLabel: 'Yes', approveOutcome: outcome.approve, rejectOutcome: outcome.reject, hasWorkflow: true, workflowStatus: isActive ? 'Active' : 'Inactive', workflowStatusTone: isActive ? 'green' : 'gray', workflowId: String(doc.id), workflowCode: doc.workflowCode || '', workflowName: doc.name || '', requestCount: rqs.length, pendingCount, lastRequestAt: lastReq?.requestedAt || null, lastRequestLabel: lastReq ? formatDateTime(lastReq.requestedAt) : '-',
        cells: [
          { text: etLabel, emphasis: true }, mappedCollection, { text: 'Yes', tone: 'green' }, outcome.approve, outcome.reject,
          { text: isActive ? 'Active' : 'Inactive', tone: isActive ? 'green' : 'gray' },
        ],
      })
    }

    const coveredTypes = new Set(workflowDocs.map((d) => d.entityType || ''))
    for (const et of TRANSACTION_ENTITY_TYPES) {
      if (coveredTypes.has(et)) continue
      const etLabel = entityTypeLabels[et] || et
      const mappedCollection = getCollectionName(et)
      const outcome = getOutcomeInfo(et)
      const rqs = requestsByType[et] || []
      const pendingCount = rqs.filter((r) => r.status === 'pending').length

      rows.push({
        id: `coverage-gap-${et}`, entityType: et, entityTypeLabel: etLabel, mappedCollection, requestSupport: true, requestSupportLabel: 'Yes', approveOutcome: outcome.approve, rejectOutcome: outcome.reject, hasWorkflow: false, workflowStatus: 'No Workflow', workflowStatusTone: 'red', workflowId: '', workflowCode: '', workflowName: '', requestCount: rqs.length, pendingCount, lastRequestAt: null, lastRequestLabel: rqs[0] ? formatDateTime(rqs[0].requestedAt) : '-',
        cells: [
          { text: etLabel, emphasis: true }, mappedCollection, { text: 'Yes', tone: 'green' }, outcome.approve, outcome.reject,
          { text: 'No Workflow', tone: 'red' },
        ],
      })
    }

    let filtered = rows
    if (search) { filtered = filtered.filter((r) => normalizeText([r.entityTypeLabel, r.mappedCollection, r.approveOutcome, r.rejectOutcome, r.workflowStatus, r.workflowCode, r.workflowName].join(' ')).includes(search)) }
    if (entityTypes.length > 0) { filtered = filtered.filter((r) => entityTypes.includes(r.entityType)) }
    if (quickFilters.length > 0) {
      filtered = filtered.filter((r) => quickFilters.some((qf) => {
        if (qf === 'workflow:active') return r.hasWorkflow
        if (qf === 'workflow:missing') return !r.hasWorkflow
        if (qf === 'requests:has') return r.requestCount > 0
        if (qf === 'requests:pending') return r.pendingCount > 0
        return false
      }))
    }

    const totalDocs = filtered.length
    const totalPages = Math.max(1, Math.ceil(totalDocs / limit))
    const currentPage = Math.min(page, totalPages)
    const paginatedRows = filtered.slice((currentPage - 1) * limit, currentPage * limit)

    const activeRows = rows.filter((r) => r.hasWorkflow)
    const withWorkflowCount = new Set(activeRows.map((r) => r.entityType)).size
    const totalRequests = rows.reduce((sum, r) => sum + r.requestCount, 0)
    const totalPending = rows.reduce((sum, r) => sum + r.pendingCount, 0)

    return NextResponse.json({
      section: {
        id: 'transactions',
        label: 'Transaction Coverage',
        description: 'Review approval workflow mappings for transaction entity types such as invoices, bills, expenses, and journal entries.',
        searchPlaceholder: 'Search entity type, collection, outcome, or mapping status',
        filters: {
          entityTypes: rows.map((r) => ({ label: r.entityTypeLabel, value: r.entityType })),
          quickFilters: [
            { label: 'Has Workflow', value: 'workflow:active' },
            { label: 'Missing Workflow', value: 'workflow:missing' },
            { label: 'Has Requests', value: 'requests:has' },
            { label: 'Pending Requests', value: 'requests:pending' },
          ],
        },
        metrics: [
          { id: 'types', label: 'Transaction Types', value: rows.length, change: 'Entity types supported by approval service', trend: 'neutral' as const },
          { id: 'with-workflow', label: 'With Active Workflow', value: withWorkflowCount, change: 'Transaction types with an active workflow configured', trend: withWorkflowCount > 0 ? 'up' as const : 'neutral' as const },
          { id: 'total-requests', label: 'Total Requests', value: totalRequests, change: 'Approval requests created across transaction types', trend: totalRequests > 0 ? 'up' as const : 'neutral' as const },
          { id: 'pending', label: 'Pending Requests', value: totalPending, change: 'Transaction requests still awaiting resolution', trend: totalPending > 0 ? 'up' as const : 'neutral' as const },
        ],
        table: {
          title: 'Transaction Approval Coverage',
          description: 'Workflow-to-entity-type mappings for transaction documents. Shows which entity types have an active workflow and what outcome behavior applies on approval or rejection.',
          columns: ['Entity Type', 'Mapped Collection', 'Request Support', 'Approve Outcome', 'Reject Outcome', 'Workflow Status'],
          rows: paginatedRows,
        },
      },
      appliedFilters: { search, entityTypes, quickFilters },
      pagination: { page: currentPage, limit, totalDocs, totalPages, hasPrevPage: currentPage > 1, hasNextPage: currentPage < totalPages },
      totals: { totalRows: rows.length, filteredRows: totalDocs, withWorkflowCount, totalRequests, totalPending },
      referenceData: {
        entityTypes: rows.map((r) => ({ label: r.entityTypeLabel, value: r.entityType })),
        users,
      },
    })
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
