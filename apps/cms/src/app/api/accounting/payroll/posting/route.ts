import { NextRequest, NextResponse } from 'next/server'
import {
  ACCOUNTING_COLLECTION_SLUGS,
  ACCOUNTING_PAYROLL_RUN_STATUS_OPTIONS,
} from '@/accounting/constants/accounting'
import { findAllDocs } from '@/accounting/utils/findAllDocs'
import { handleAccountingApiError, requireAccountingAdmin } from '../../_utils/auth'

const fmt = (n: number) => new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 2 }).format(n)

const statusLabelMap = new Map<string, string>(ACCOUNTING_PAYROLL_RUN_STATUS_OPTIONS.map((o) => [o.value, o.label]))

const POSTING_STATE_OPTIONS = [
  { label: 'Ready to Post', value: 'ready_to_post' },
  { label: 'Posted', value: 'posted' },
  { label: 'Pending Review', value: 'pending_review' },
  { label: 'Draft', value: 'draft' },
  { label: 'Voided', value: 'voided' },
]

const postingStateLabelMap = new Map<string, string>(POSTING_STATE_OPTIONS.map((o) => [o.value, o.label]))

function getPostingTone(state: string): string {
  if (state === 'posted') return 'green'
  if (state === 'ready_to_post') return 'green'
  if (state === 'pending_review') return 'amber'
  if (state === 'voided') return 'red'
  return 'gray'
}

function getStatusTone(status: string): string {
  if (status === 'posted') return 'green'
  if (status === 'approved') return 'blue'
  if (status === 'review') return 'amber'
  if (status === 'voided') return 'red'
  return 'gray'
}

function derivePostingState(run: Record<string, unknown>, entryCount: number, hasJournal: boolean): string {
  const status = String(run.status || '')
  if (status === 'voided') return 'voided'
  if (status === 'posted' && hasJournal) return 'posted'
  if (status === 'approved' && entryCount > 0) return 'ready_to_post'
  if (status === 'review') return 'pending_review'
  if (status === 'approved' && entryCount === 0) return 'pending_review'
  return 'draft'
}

const normalizeText = (v?: string | null) => String(v || '').trim().toLowerCase()

export async function GET(request: NextRequest) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const sp = new URL(request.url).searchParams
    const search = normalizeText(sp.get('search'))
    const postingStates = Array.from(new Set(
      sp.getAll('postingState').flatMap((v) => v.split(',')).map((v) => v.trim()).filter(Boolean),
    ))
    const statuses = Array.from(new Set(
      sp.getAll('status').flatMap((v) => v.split(',')).map((v) => v.trim()).filter(Boolean),
    ))
    const quickFilters = Array.from(new Set(
      sp.getAll('quickFilter').flatMap((v) => v.split(',')).map((v) => v.trim()).filter(Boolean),
    ))
    const page = Math.max(1, Number(sp.get('page')) || 1)
    const limit = Math.min(100, Math.max(1, Number(sp.get('limit')) || 10))

    const runs = await findAllDocs<Record<string, unknown>>({
      payload,
      collection: ACCOUNTING_COLLECTION_SLUGS.payrollRuns,
      depth: 1,
      sort: '-periodStart',
    })

    const runIds = runs.map((r) => r.id)
    const entryCountsByRun = new Map<string | number, number>()
    const entryGrossByRun = new Map<string | number, number>()
    const entryNetByRun = new Map<string | number, number>()

    if (runIds.length > 0) {
      const entries = await findAllDocs<Record<string, unknown>>({
        payload,
        collection: ACCOUNTING_COLLECTION_SLUGS.payrollEntries,
        depth: 0,
        where: { payrollRun: { in: runIds } } as never,
      })
      for (const e of entries) {
        const runRel = e.payrollRun
        const runId = typeof runRel === 'object' && runRel !== null ? (runRel as Record<string, unknown>).id : runRel
        const rid = String(runId)
        entryCountsByRun.set(rid, (entryCountsByRun.get(rid) || 0) + 1)
        entryGrossByRun.set(rid, (entryGrossByRun.get(rid) || 0) + (Number(e.grossAmount) || 0))
        entryNetByRun.set(rid, (entryNetByRun.get(rid) || 0) + (Number(e.netAmount) || Number(e.grossAmount || 0) - Number(e.deductionAmount || 0)))
      }
    }

    const rows = runs.map((run) => {
      const runId = String(run.id)
      const entryCount = entryCountsByRun.get(runId) || 0
      const grossTotal = entryGrossByRun.get(runId) || 0
      const netTotal = entryNetByRun.get(runId) || 0
      const journalEntry = run.postedJournalEntry as Record<string, unknown> | undefined
      const hasJournal = Boolean(journalEntry?.id || journalEntry)
      const jeRef = journalEntry?.entryNumber ? String(journalEntry.entryNumber) : journalEntry?.id ? `JE#${journalEntry.id}` : null
      const st = String(run.status || '')
      const postingState = derivePostingState(run, entryCount, hasJournal)

      return {
        id: runId,
        payrollCode: String(run.payrollCode || ''),
        periodStart: run.periodStart ? String(run.periodStart).slice(0, 10) : null,
        periodEnd: run.periodEnd ? String(run.periodEnd).slice(0, 10) : null,
        paymentDate: run.paymentDate ? String(run.paymentDate).slice(0, 10) : null,
        status: st,
        statusLabel: statusLabelMap.get(st) || st || '-',
        statusTone: getStatusTone(st),
        entryCount,
        grossTotal,
        grossTotalLabel: fmt(grossTotal),
        netTotal,
        netTotalLabel: fmt(netTotal),
        journalRef: jeRef,
        journalEntryId: journalEntry?.id ? String(journalEntry.id) : null,
        postingState,
        postingStateLabel: postingStateLabelMap.get(postingState) || postingState || '-',
        postingStateTone: getPostingTone(postingState),
        cells: [
          { text: String(run.payrollCode || ''), emphasis: true },
          run.paymentDate ? String(run.paymentDate).slice(0, 10) : '-',
          { text: String(entryCount), align: 'right' },
          { text: fmt(grossTotal), align: 'right' },
          { text: statusLabelMap.get(st) || st || '-', tone: getStatusTone(st) },
          jeRef || '-',
          { text: postingStateLabelMap.get(postingState) || postingState || '-', tone: getPostingTone(postingState) },
        ],
      }
    })

    let filtered = rows
    if (search) {
      filtered = filtered.filter((r) =>
        [r.payrollCode, r.paymentDate, r.status, r.postingStateLabel, String(r.entryCount)]
          .map((v) => normalizeText(v))
          .some((v) => v.includes(search)),
      )
    }
    if (postingStates.length > 0) {
      filtered = filtered.filter((r) => postingStates.includes(r.postingState))
    }
    if (statuses.length > 0) {
      filtered = filtered.filter((r) => statuses.includes(r.status))
    }
    if (quickFilters.length > 0) {
      const allQf = ['postingState:ready_to_post', 'postingState:posted', 'postingState:pending_review', 'postingState:draft']
      const selectedSet = new Set(quickFilters)
      const allSelected = allQf.every((v) => selectedSet.has(v))
      if (!allSelected) {
        filtered = filtered.filter((r) =>
          quickFilters.some((qf) => {
            const [prefix, value] = qf.split(':')
            if (prefix === 'postingState') return r.postingState === value
            return false
          }),
        )
      }
    }

    const totalDocs = filtered.length
    const totalPages = Math.max(1, Math.ceil(totalDocs / limit))
    const currentPage = Math.min(page, totalPages)
    const paginatedRows = filtered.slice((currentPage - 1) * limit, currentPage * limit)

    const totalRuns = rows.length
    const readyCount = rows.filter((r) => r.postingState === 'ready_to_post').length
    const postedCount = rows.filter((r) => r.postingState === 'posted').length
    const pendingCount = rows.filter((r) => r.postingState === 'pending_review').length
    const postingValue = rows.reduce((s, r) => s + r.grossTotal, 0)

    return NextResponse.json({
      rows: paginatedRows,
      metrics: [
        { id: 'ready-to-post', label: 'Ready to Post', value: readyCount, change: 'Approved runs with entries ready for GL posting', trend: readyCount > 0 ? 'up' as const : 'neutral' as const },
        { id: 'posted-journals', label: 'Posted Journals', value: postedCount, change: 'Runs already linked to posted journal entries', trend: postedCount > 0 ? 'up' as const : 'neutral' as const },
        { id: 'pending-review', label: 'Pending Review', value: pendingCount, change: 'Runs blocked before approval can proceed', trend: pendingCount > 0 ? 'neutral' as const : 'down' as const },
        { id: 'posting-value', label: 'Posting Value', value: fmt(postingValue), change: 'Gross payroll expense value across all posting states', trend: 'up' as const },
      ],
      filterOptions: {
        statuses: ACCOUNTING_PAYROLL_RUN_STATUS_OPTIONS.map((o) => ({ label: o.label, value: o.value })),
        postingStates: POSTING_STATE_OPTIONS,
        quickFilters: [
          { label: 'Ready to Post', value: 'postingState:ready_to_post' },
          { label: 'Posted', value: 'postingState:posted' },
          { label: 'Pending Review', value: 'postingState:pending_review' },
          { label: 'Draft', value: 'postingState:draft' },
        ],
      },
      meta: {
        searchPlaceholder: 'Search payroll code, payment date, posting state, or entry count',
        columns: ['Payroll Code', 'Payment Date', 'Entry Count', 'Gross Total', 'Approval State', 'Posted Journal', 'Posting State'],
        tableTitle: 'Payroll Posting Register',
        tableDescription: 'Posting readiness view grounded in payroll run status, entry counts, and journal linkage. Posting state is derived from run approval flow and journal status.',
      },
      pagination: { page: currentPage, limit, totalDocs, totalPages, hasPrevPage: currentPage > 1, hasNextPage: currentPage < totalPages },
      totals: { totalRows: totalRuns, filteredRows: totalDocs },
    })
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
