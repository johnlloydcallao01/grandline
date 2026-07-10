import { NextRequest, NextResponse } from 'next/server'
import { ACCOUNTING_COLLECTION_SLUGS, ACCOUNTING_PAYROLL_RUN_STATUS_OPTIONS } from '@/accounting/constants/accounting'
import { AccountingApiError, handleAccountingApiError, requireAccountingAdmin } from '../../_utils/auth'

const parseListParam = (sp: URLSearchParams, key: string): string[] =>
  Array.from(new Set(sp.getAll(key).flatMap((v) => String(v || '').split(',')).map((v) => v.trim()).filter(Boolean)))

const normalizeText = (v?: string | null) => String(v || '').trim().toLowerCase()

const statusLabelMap = new Map<string, string>(ACCOUNTING_PAYROLL_RUN_STATUS_OPTIONS.map((o) => [o.value, o.label]))

function getStatusTone(status: string): string {
  if (status === 'posted') return 'green'
  if (status === 'approved') return 'blue'
  if (status === 'review') return 'amber'
  if (status === 'voided') return 'red'
  return 'gray'
}

export async function GET(request: NextRequest) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const sp = new URL(request.url).searchParams
    const search = normalizeText(sp.get('search'))
    const statuses = parseListParam(sp, 'status')
    const quickFilters = parseListParam(sp, 'quickFilter')
    const page = Math.max(1, Number(sp.get('page')) || 1)
    const limit = Math.min(100, Math.max(1, Number(sp.get('limit')) || 10))

    const where: Record<string, unknown> = {}
    const andClauses: Record<string, unknown>[] = []
    if (statuses.length) andClauses.push({ status: { in: statuses } })
    for (const qf of quickFilters) {
      const [k, v] = qf.split(':')
      if (k === 'status' && v) andClauses.push({ status: { equals: v } })
    }
    if (search) {
      andClauses.push({
        or: [
          { payrollCode: { like: search } },
          { 'branch.name': { like: search } },
          { 'department.name': { like: search } },
          { status: { like: search } },
        ],
      })
    }
    if (andClauses.length > 0) where.and = andClauses

    const result = await payload.find({
      collection: ACCOUNTING_COLLECTION_SLUGS.payrollRuns,
      depth: 1,
      sort: '-periodStart',
      page,
      limit,
      where: Object.keys(where).length ? where as never : undefined,
      overrideAccess: true,
    })

    const rows = result.docs.map((doc) => {
      const d = doc as unknown as Record<string, unknown>
      const je = d.postedJournalEntry as Record<string, unknown> | undefined
      const st = String(d.status || '')
      const jeRef = je?.entryNumber ? String(je.entryNumber) : je ? `JE#${je.id}` : null
      return {
        id: String(d.id),
        payrollCode: String(d.payrollCode || ''),
        periodStart: d.periodStart ? String(d.periodStart).slice(0, 10) : null,
        periodEnd: d.periodEnd ? String(d.periodEnd).slice(0, 10) : null,
        paymentDate: d.paymentDate ? String(d.paymentDate).slice(0, 10) : null,
        status: st,
        statusLabel: statusLabelMap.get(st) || st || '-',
        statusTone: getStatusTone(st),
        journalRef: jeRef,
        cells: [
          { text: String(d.payrollCode || ''), emphasis: true },
          (d.periodStart ? String(d.periodStart).slice(0, 10) : '-'),
          (d.periodEnd ? String(d.periodEnd).slice(0, 10) : '-'),
          (d.paymentDate ? String(d.paymentDate).slice(0, 10) : '-'),
          { text: statusLabelMap.get(st) || st || '-', tone: getStatusTone(st) },
          jeRef || '-',
        ],
      }
    })

    const allDocs = await payload.find({
      collection: ACCOUNTING_COLLECTION_SLUGS.payrollRuns,
      depth: 0,
      limit: 10000,
      sort: '-periodStart',
      overrideAccess: true,
    })
    const all = allDocs.docs.map((doc) => doc as unknown as Record<string, unknown>)
    const totalRuns = all.length
    const approvedCount = all.filter((d) => d.status === 'approved').length
    const postedCount = all.filter((d) => d.status === 'posted').length
    const pendingCount = all.filter((d) => d.status === 'draft' || d.status === 'review').length

    const [branches, departments] = await Promise.all([
      payload.find({ collection: ACCOUNTING_COLLECTION_SLUGS.branches, depth: 0, limit: 200, sort: 'name', overrideAccess: true }),
      payload.find({ collection: ACCOUNTING_COLLECTION_SLUGS.departments, depth: 0, limit: 200, sort: 'name', overrideAccess: true }),
    ])

    return NextResponse.json({
      rows,
      metrics: [
        { id: 'total-runs', label: 'Payroll Runs', value: totalRuns, change: 'Finance payroll batches tracked for posting', trend: 'up' as const },
        { id: 'approved-runs', label: 'Approved Runs', value: approvedCount, change: 'Runs already cleared for posting workflow', trend: approvedCount > 0 ? 'up' as const : 'neutral' as const },
        { id: 'posted-runs', label: 'Posted Runs', value: postedCount, change: 'Runs already posted to journal entries', trend: postedCount > 0 ? 'up' as const : 'neutral' as const },
        { id: 'pending-review', label: 'Pending Review', value: pendingCount, change: 'Runs still in draft or review status', trend: pendingCount > 0 ? 'neutral' as const : 'down' as const },
      ],
      filterOptions: {
        statuses: ACCOUNTING_PAYROLL_RUN_STATUS_OPTIONS.map((o) => ({ label: o.label, value: o.value })),
        quickFilters: [
          { label: 'Draft', value: 'status:draft' },
          { label: 'Review', value: 'status:review' },
          { label: 'Approved', value: 'status:approved' },
          { label: 'Posted', value: 'status:posted' },
        ],
      },
      meta: {
        searchPlaceholder: 'Search payroll code, branch, department, or status',
        columns: ['Payroll Code', 'Period Start', 'Period End', 'Payment Date', 'Status', 'Posted Journal'],
        tableTitle: 'Payroll Run Register',
        tableDescription: 'Run records aligned to the payroll-runs collection with period, payment date, status, and posted journal linkage.',
      },
      pagination: { page: result.page, limit: result.limit, totalDocs: result.totalDocs, totalPages: result.totalPages, hasPrevPage: result.hasPrevPage, hasNextPage: result.hasNextPage },
      totals: { totalRows: totalRuns, filteredRows: result.totalDocs },
      referenceData: {
        branches: branches.docs.map((d) => { const r = d as unknown as Record<string, unknown>; return { id: String(r.id), branchCode: String(r.branchCode ?? ''), name: String(r.name ?? '') }; }),
        departments: departments.docs.map((d) => { const r = d as unknown as Record<string, unknown>; return { id: String(r.id), code: String(r.code ?? ''), name: String(r.name ?? '') }; }),
      },
    })
  } catch (error) {
    return handleAccountingApiError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const { payload, user } = await requireAccountingAdmin(request)
    const body = await request.json()

    const toId = (v: unknown): number | null => {
      if (v === null || v === undefined) return null
      const n = Number(v)
      return Number.isFinite(n) && n > 0 ? n : null
    }

    if (!body.periodStart) throw new AccountingApiError('Period start date is required.', 400)
    if (!body.periodEnd) throw new AccountingApiError('Period end date is required.', 400)
    if (!body.paymentDate) throw new AccountingApiError('Payment date is required.', 400)

    const data: Record<string, unknown> = {
      payrollCode: String(body.payrollCode || `PAYRUN-${Date.now()}`).trim(),
      periodStart: body.periodStart,
      periodEnd: body.periodEnd,
      paymentDate: body.paymentDate,
      status: String(body.status || 'draft'),
      createdBy: user.id,
      updatedBy: user.id,
    }

    if (body.notes) data.notes = String(body.notes).trim()
    const branch = toId(body.branch)
    const department = toId(body.department)
    if (branch) data.branch = branch
    if (department) data.department = department

    const record = await payload.create({
      collection: ACCOUNTING_COLLECTION_SLUGS.payrollRuns,
      overrideAccess: true,
      data: data as never,
      depth: 1,
    })

    return NextResponse.json(record, { status: 201 })
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
