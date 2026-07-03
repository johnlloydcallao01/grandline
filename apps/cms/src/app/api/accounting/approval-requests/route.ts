import { NextRequest, NextResponse } from 'next/server'
import { ACCOUNTING_COLLECTION_SLUGS, ACCOUNTING_APPROVAL_REQUEST_STATUS_OPTIONS } from '@/accounting/constants/accounting'
import { findAllDocs } from '@/accounting/utils/findAllDocs'
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

    const docs = await findAllDocs<any>({ payload, collection: ACCOUNTING_COLLECTION_SLUGS.approvalRequests, depth: 1, sort: '-requestedAt' })

    const mappedRows = docs.map((doc: any) => {
      const wf = typeof doc.workflow === 'object' ? doc.workflow : null
      const reqBy = typeof doc.requestedBy === 'object' ? doc.requestedBy : null
      const approver = typeof doc.currentApprover === 'object' ? doc.currentApprover : null
      const status = doc.status || 'pending'
      const statusLabel = ACCOUNTING_APPROVAL_REQUEST_STATUS_OPTIONS.find((o) => o.value === status)?.label || status
      const reqByName = reqBy ? [reqBy.firstName, reqBy.lastName].filter(Boolean).join(' ') || reqBy.email || reqBy.username || `User ${reqBy.id}` : '-'
      const approverName = approver ? [approver.firstName, approver.lastName].filter(Boolean).join(' ') || approver.email || approver.username || `User ${approver.id}` : 'Unassigned'
      const trailCount = Array.isArray(doc.approvalTrail) ? doc.approvalTrail.length : 0

      return {
        id: `req-${doc.id}`,
        approvalId: doc.id,
        workflowName: wf?.name || wf?.workflowCode || 'Unknown',
        entityType: doc.entityType || '-',
        entityTypeLabel: String(doc.entityType || '-').charAt(0).toUpperCase() + String(doc.entityType || '').slice(1).replace('_', ' '),
        entityId: doc.entityId || '-',
        status, statusLabel, statusTone: STATUS_TONE[status] || 'gray',
        requestedBy: reqByName,
        currentApprover: approverName,
        requestedAt: doc.requestedAt || null,
        requestedAtLabel: formatDateTime(doc.requestedAt),
        resolvedAt: doc.resolvedAt || null,
        resolvedAtLabel: formatDateTime(doc.resolvedAt),
        trailCount,
        searchableText: normalizeText([wf?.name, doc.entityType, doc.entityId, reqByName, approverName, statusLabel].join(' ')),
        cells: [
          { text: wf?.name || wf?.workflowCode || 'Unknown', emphasis: true },
          String(doc.entityType || '-').charAt(0).toUpperCase() + String(doc.entityType || '').slice(1).replace('_', ' '),
          { text: doc.entityId || '-', emphasis: true },
          reqByName,
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
        id: 'approval-requests',
        label: 'Approval Requests',
        description: 'Review approval-request records across pending, approved, and rejected states.',
        searchPlaceholder: 'Search entity type, entity id, workflow, requested by, current approver, or status',
        filters: {
          statuses: ACCOUNTING_APPROVAL_REQUEST_STATUS_OPTIONS.map((o) => ({ label: o.label, value: o.value })),
          quickFilters: [
            { label: 'Pending', value: 'status:pending' },
            { label: 'Approved', value: 'status:approved' },
            { label: 'Rejected', value: 'status:rejected' },
          ],
        },
        metrics: [
          { id: 'open-requests', label: 'Open Requests', value: pendingCount, change: 'Requests still awaiting resolution', trend: pendingCount > 0 ? 'up' as const : 'neutral' as const },
          { id: 'approved', label: 'Approved', value: approvedCount, change: 'Resolved with approval', trend: approvedCount > 0 ? 'up' as const : 'neutral' as const },
          { id: 'rejected', label: 'Rejected', value: rejectedCount, change: 'Declined or returned', trend: rejectedCount > 0 ? 'down' as const : 'neutral' as const },
          { id: 'total', label: 'Total Requests', value: mappedRows.length, change: 'All approval request records', trend: 'neutral' as const },
        ],
        table: {
          title: 'Approval Request Register',
          description: 'Approval-request register from the approvalRequests collection.',
          columns: ['Workflow', 'Entity Type', 'Entity ID', 'Requested By', 'Current Approver', 'Status'],
          rows: paginatedRows,
        },
      },
      appliedFilters: { search, statuses, quickFilters },
      pagination: { page: currentPage, limit, totalDocs, totalPages, hasPrevPage: currentPage > 1, hasNextPage: currentPage < totalPages },
      totals: { totalRows: mappedRows.length, filteredRows: totalDocs, pendingCount, approvedCount, rejectedCount },
    })
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
