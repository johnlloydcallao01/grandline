import { NextRequest, NextResponse } from 'next/server'
import { ACCOUNTING_COLLECTION_SLUGS } from '@/accounting/constants/accounting'
import { findAllDocs } from '@/accounting/utils/findAllDocs'
import { handleAccountingApiError, requireAccountingAdmin } from '../_utils/auth'

const parseIntegerParam = (value: string | null, fallback: number) => { if (!value) return fallback; const p = Number(value); return Number.isFinite(p) ? p : fallback }
const parseListParam = (searchParams: URLSearchParams, key: string): string[] => Array.from(new Set(searchParams.getAll(key).flatMap((v) => String(v || '').split(',')).map((v) => v.trim()).filter(Boolean)))
const normalizeText = (value?: string | null) => String(value || '').trim().toLowerCase()
const formatDateTime = (v: string | null | undefined) => { if (!v) return '-'; const d = new Date(v); if (Number.isNaN(d.getTime())) return String(v); return d.toLocaleDateString('en-CA') + ' ' + d.toLocaleTimeString('en-CA', { hour: '2-digit', minute: '2-digit' }) }
const DECISION_TONE: Record<string, string> = { approved: 'green', rejected: 'red' }

export async function GET(request: NextRequest) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const { searchParams } = new URL(request.url)
    const search = normalizeText(searchParams.get('search'))
    const decisions = parseListParam(searchParams, 'decision')
    const quickFilters = parseListParam(searchParams, 'quickFilter')
    const page = Math.max(1, parseIntegerParam(searchParams.get('page'), 1))
    const limit = Math.min(100, Math.max(1, parseIntegerParam(searchParams.get('limit'), 10)))

    const docs = await findAllDocs<any>({ payload, collection: ACCOUNTING_COLLECTION_SLUGS.approvalRequests, depth: 2, sort: '-requestedAt' })

    const allTrails: any[] = []
    for (const doc of docs) {
      const trail = Array.isArray(doc.approvalTrail) ? doc.approvalTrail : []
      for (const entry of trail) {
        const approver = typeof entry.approver === 'object' ? entry.approver : null
        const approverName = approver ? [approver.firstName, approver.lastName].filter(Boolean).join(' ') || approver.email || approver.username || `User ${approver.id}` : '-'
        const decision = String(entry.decision || '')
        allTrails.push({
          id: `trail-${doc.id}-${entry.stepNumber || entry.id}`,
          requestId: String(doc.id),
          entityId: doc.entityId || '-',
          stepNumber: entry.stepNumber || null,
          approver: approverName,
          decision,
          decisionLabel: decision.charAt(0).toUpperCase() + decision.slice(1),
          decisionTone: DECISION_TONE[decision] || 'gray',
          notes: entry.notes || '',
          actedAt: entry.actedAt || null,
          actedAtLabel: formatDateTime(entry.actedAt),
          searchableText: normalizeText([String(doc.id), doc.entityId, approverName, decision, entry.notes].join(' ')),
          cells: [
            { text: `REQ-${String(doc.id).padStart(4, '0')}`, emphasis: true },
            String(entry.stepNumber ?? '-'),
            approverName,
            { text: decision.charAt(0).toUpperCase() + decision.slice(1), tone: DECISION_TONE[decision] || 'gray' },
            formatDateTime(entry.actedAt),
            entry.notes || '-',
          ],
        })
      }
    }

    let filtered = allTrails
    if (search) { filtered = filtered.filter((r) => r.searchableText.includes(search)) }
    if (decisions.length > 0) { filtered = filtered.filter((r) => decisions.includes(r.decision)) }
    if (quickFilters.length > 0) {
      filtered = filtered.filter((r) => quickFilters.some((qf) => {
        const [prefix, value] = qf.split(':')
        if (prefix === 'decision') return r.decision === value
        if (prefix === 'notes') return qf === 'notes:with' ? Boolean(r.notes) : false
        return false
      }))
    }

    const totalDocs = filtered.length
    const totalPages = Math.max(1, Math.ceil(totalDocs / limit))
    const currentPage = Math.min(page, totalPages)
    const paginatedRows = filtered.slice((currentPage - 1) * limit, currentPage * limit)

    const approvedSteps = allTrails.filter((r) => r.decision === 'approved').length
    const rejectedSteps = allTrails.filter((r) => r.decision === 'rejected').length
    const withNotes = allTrails.filter((r) => r.notes).length

    return NextResponse.json({
      section: { id: 'resolution-trail', label: 'Resolution Trail', description: 'Trace approval-trail decisions by step number, approver, decision, notes, and action timestamp.', searchPlaceholder: 'Search request id, step number, approver, decision, notes, or acted date', filters: { decisions: [{ label: 'Approved', value: 'approved' }, { label: 'Rejected', value: 'rejected' }], quickFilters: [{ label: 'Approved Steps', value: 'decision:approved' }, { label: 'Rejected Steps', value: 'decision:rejected' }, { label: 'With Notes', value: 'notes:with' }] }, metrics: [{ id: 'trail-entries', label: 'Trail Entries', value: allTrails.length, change: 'Recorded workflow decisions across requests', trend: 'up' as const }, { id: 'approved-steps', label: 'Approved Steps', value: approvedSteps, change: 'Trail rows with approved decisions', trend: approvedSteps > 0 ? 'up' as const : 'neutral' as const }, { id: 'rejected-steps', label: 'Rejected Steps', value: rejectedSteps, change: 'Trail rows with rejected decisions', trend: rejectedSteps > 0 ? 'down' as const : 'neutral' as const }, { id: 'notes-captured', label: 'Notes Captured', value: withNotes, change: 'Decision rows carrying written notes', trend: 'neutral' as const }], table: { title: 'Approval Resolution Trail', description: 'Decision-level history from the approvalTrail arrays stored on approval requests.', columns: ['Request ID', 'Step', 'Approver', 'Decision', 'Acted At', 'Notes'], rows: paginatedRows } },
      appliedFilters: { search, decisions, quickFilters },
      pagination: { page: currentPage, limit, totalDocs, totalPages, hasPrevPage: currentPage > 1, hasNextPage: currentPage < totalPages },
      totals: { totalRows: allTrails.length, filteredRows: totalDocs, approvedSteps, rejectedSteps, withNotes },
    })
  } catch (error) { return handleAccountingApiError(error) }
}
