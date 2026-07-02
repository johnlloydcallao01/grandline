import { NextRequest, NextResponse } from 'next/server'
import { AccountingApprovalService } from '@/accounting/services/approvals/AccountingApprovalService'
import { ACCOUNTING_APPROVAL_ENTITY_TYPE_OPTIONS, ACCOUNTING_APPROVAL_REQUEST_STATUS_OPTIONS } from '@/accounting/constants/accounting'
import { handleAccountingApiError, requireAccountingAdmin } from '../_utils/auth'

const parseIntegerParam = (value: string | null, fallback: number) => {
  if (!value) return fallback; const p = Number(value); return Number.isFinite(p) ? p : fallback
}

const parseListParam = (searchParams: URLSearchParams, key: string): string[] =>
  Array.from(new Set(searchParams.getAll(key).flatMap((v) => String(v || '').split(',')).map((v) => v.trim()).filter(Boolean)))

const normalizeText = (value?: string | null) => String(value || '').trim().toLowerCase()
const formatDateTime = (v: string | null | undefined) => {
  if (!v) return '-'
  const d = new Date(v)
  if (Number.isNaN(d.getTime())) return String(v)
  return d.toLocaleDateString('en-CA') + ' ' + d.toLocaleTimeString('en-CA', { hour: '2-digit', minute: '2-digit' })
}

const STATUS_TONE: Record<string, string> = { pending: 'amber', approved: 'green', rejected: 'red' }

export async function GET(request: NextRequest) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const { searchParams } = new URL(request.url)
    const search = normalizeText(searchParams.get('search'))
    const statuses = parseListParam(searchParams, 'status')
    const quickFilters = parseListParam(searchParams, 'quickFilter')
    const page = Math.max(1, parseIntegerParam(searchParams.get('page'), 1))
    const limit = Math.min(100, Math.max(1, parseIntegerParam(searchParams.get('limit'), 10)))

    const queueResult = await AccountingApprovalService.getApprovalQueue(payload)
    const docs = queueResult.docs

    const mappedRows = docs.map((doc: any) => {
      const wf = typeof doc.workflow === 'object' ? doc.workflow : null
      const reqBy = typeof doc.requestedBy === 'object' ? doc.requestedBy : null
      const approver = typeof doc.currentApprover === 'object' ? doc.currentApprover : null
      const status = doc.status || 'pending'
      const statusLabel = ACCOUNTING_APPROVAL_REQUEST_STATUS_OPTIONS.find((o) => o.value === status)?.label || status

      const reqByName = reqBy ? [reqBy.firstName, reqBy.lastName].filter(Boolean).join(' ') || reqBy.email || reqBy.username || `User ${reqBy.id}` : '-'
      const approverName = approver ? [approver.firstName, approver.lastName].filter(Boolean).join(' ') || approver.email || approver.username || `User ${approver.id}` : 'Unassigned'

      return {
        id: `queue-${doc.id}`,
        approvalId: doc.id,
        workflowName: wf?.name || wf?.workflowCode || 'Unknown Workflow',
        entityType: doc.entityType || '-',
        entityTypeLabel: String(doc.entityType || '-').charAt(0).toUpperCase() + String(doc.entityType || '').slice(1).replace('_', ' '),
        entityId: doc.entityId || '-',
        status,
        statusLabel,
        statusTone: STATUS_TONE[status] || 'gray',
        requestedBy: reqByName,
        currentApprover: approverName,
        requestedAt: doc.requestedAt || null,
        requestedAtLabel: formatDateTime(doc.requestedAt),
        trailCount: Array.isArray(doc.approvalTrail) ? doc.approvalTrail.length : 0,
        searchableText: normalizeText([wf?.name, wf?.workflowCode, doc.entityType, doc.entityId, reqByName, approverName, statusLabel].join(' ')),
        cells: [
          formatDateTime(doc.requestedAt),
          { text: wf?.name || wf?.workflowCode || 'Unknown', emphasis: true },
          String(doc.entityType || '-').charAt(0).toUpperCase() + String(doc.entityType || '').slice(1).replace('_', ' '),
          { text: doc.entityId || '-', emphasis: true },
          approverName,
          { text: statusLabel, tone: STATUS_TONE[status] || 'gray' },
        ],
      }
    })

    let filtered = mappedRows
    if (search) { filtered = filtered.filter((r) => r.searchableText.includes(search)) }
    if (statuses.length > 0) { filtered = filtered.filter((r) => statuses.includes(r.status)) }
    if (quickFilters.length > 0) {
      filtered = filtered.filter((r) => quickFilters.some((qf) => {
        const [prefix, value] = qf.split(':')
        if (prefix === 'status') return r.status === value
        return false
      }))
    }

    const totalDocs = filtered.length
    const totalPages = Math.max(1, Math.ceil(totalDocs / limit))
    const currentPage = Math.min(page, totalPages)
    const paginatedRows = filtered.slice((currentPage - 1) * limit, currentPage * limit)

    const pendingCount = mappedRows.filter((r) => r.status === 'pending').length
    const approvedCount = mappedRows.filter((r) => r.status === 'approved').length
    const rejectedCount = mappedRows.filter((r) => r.status === 'rejected').length

    return NextResponse.json({
      section: {
        id: 'approval-queue',
        label: 'Approval Queue',
        description: 'Review pending approval items returned by the approval queue flow, including workflow, entity type, requester, current approver, and requested timestamp.',
        searchPlaceholder: 'Search workflow, entity type, entity id, requester, approver, or status',
        filters: {
          statuses: ACCOUNTING_APPROVAL_REQUEST_STATUS_OPTIONS.map((o) => ({ label: o.label, value: o.value })),
          quickFilters: [
            { label: 'Pending', value: 'status:pending' },
            { label: 'Approved', value: 'status:approved' },
            { label: 'Rejected', value: 'status:rejected' },
          ],
        },
        metrics: [
          { id: 'pending-queue', label: 'Pending Queue', value: pendingCount, change: 'Requests currently pending approval', trend: pendingCount > 0 ? 'up' as const : 'neutral' as const },
          { id: 'approved', label: 'Approved', value: approvedCount, change: 'Resolved with approval', trend: approvedCount > 0 ? 'up' as const : 'neutral' as const },
          { id: 'rejected', label: 'Rejected', value: rejectedCount, change: 'Declined or returned', trend: rejectedCount > 0 ? 'down' as const : 'neutral' as const },
          { id: 'total-queue', label: 'Total Items', value: mappedRows.length, change: 'All items in current view', trend: 'neutral' as const },
        ],
        table: {
          title: 'Approval Queue',
          description: 'Queue view aligned to the approval-request collection and the approval queue endpoint.',
          columns: ['Requested At', 'Workflow', 'Entity Type', 'Entity ID', 'Current Approver', 'Status'],
          rows: paginatedRows,
        },
      },
      appliedFilters: { search, statuses, quickFilters },
      pagination: { page: currentPage, limit, totalDocs, totalPages, hasPrevPage: currentPage > 1, hasNextPage: currentPage < totalPages },
      totals: { totalRows: mappedRows.length, filteredRows: totalDocs, pendingCount, approvedCount, rejectedCount },
      referenceData: {
        entityTypes: ACCOUNTING_APPROVAL_ENTITY_TYPE_OPTIONS.map((o) => ({ label: o.label, value: o.value })),
      },
    })
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
