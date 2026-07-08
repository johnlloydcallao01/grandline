import { NextRequest, NextResponse } from 'next/server'
import { ACCOUNTING_COLLECTION_SLUGS, ACCOUNTING_DEPRECIATION_ENTRY_STATUS_OPTIONS } from '@/accounting/constants/accounting'
import { AccountingApiError, handleAccountingApiError, requireAccountingAdmin } from '../_utils/auth'

const statusMap = new Map(ACCOUNTING_DEPRECIATION_ENTRY_STATUS_OPTIONS.map((o) => [o.value, o.label]))

const fmt = (n: number) => new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 2 }).format(n)

const parseListParam = (sp: URLSearchParams, key: string): string[] =>
  Array.from(new Set(sp.getAll(key).flatMap((v) => String(v || '').split(',')).map((v) => v.trim()).filter(Boolean)))

const normalizeText = (v?: string | null) => String(v || '').trim().toLowerCase()

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

    if (statuses.length) {
      andClauses.push({ status: { in: statuses } })
    }
    for (const qf of quickFilters) {
      const [k, v] = qf.split(':')
      if (k === 'status' && v) andClauses.push({ status: { equals: v } })
    }
    if (search) {
      andClauses.push({
        or: [
          { 'fixedAsset.assetCode': { like: search } },
          { 'fixedAsset.name': { like: search } },
          { 'fiscalYear.name': { like: search } },
          { 'period.name': { like: search } },
          { status: { like: search } },
        ],
      })
    }
    if (andClauses.length > 0) {
      where.and = andClauses
    }

    const result = await payload.find({
      collection: ACCOUNTING_COLLECTION_SLUGS.depreciationEntries,
      depth: 1,
      sort: '-depreciationDate',
      page,
      limit,
      where: Object.keys(where).length ? where as never : undefined,
      overrideAccess: true,
    })

    const rows = result.docs.map((doc) => {
      const d = doc as unknown as Record<string, unknown>
      const fa = d.fixedAsset as Record<string, unknown> | undefined
      const fy = d.fiscalYear as Record<string, unknown> | undefined
      const per = d.period as Record<string, unknown> | undefined
      const faLabel = fa ? [fa.assetCode, fa.name].filter(Boolean).join(' - ') : ''
      const fyLabel = fy?.name ? String(fy.name) : fy ? String(fy.id) : ''
      const periodLabel = per?.label ? String(per.label) : per?.name ? String(per.name) : per ? String(per.id) : ''
      const st = String(d.status || '')
      const amount = Number(d.amount || 0)
      const stLbl = statusMap.get(st as typeof ACCOUNTING_DEPRECIATION_ENTRY_STATUS_OPTIONS[number]['value']) || st
      const statusTone = st === 'posted' ? 'green' : st === 'reversed' ? 'red' : 'amber'

      return {
        id: String(d.id),
        fixedAssetId: String(fa?.id ?? ''),
        assetLabel: faLabel,
        fiscalYearId: String(fy?.id ?? ''),
        fiscalYearLabel: fyLabel,
        periodId: String(per?.id ?? ''),
        periodLabel,
        depreciationDate: d.depreciationDate ? String(d.depreciationDate).slice(0, 10) : null,
        amount,
        amountLabel: fmt(amount),
        status: st,
        statusLabel: stLbl,
        statusTone,
        postedJournalEntryId: d.postedJournalEntry ? String(typeof d.postedJournalEntry === 'object' ? (d.postedJournalEntry as Record<string, unknown>).id ?? '' : d.postedJournalEntry) : '',
        cells: [
          { text: faLabel || 'Unknown Asset', emphasis: true },
          fyLabel,
          periodLabel,
          (d.depreciationDate ? String(d.depreciationDate).slice(0, 10) : '-'),
          { text: fmt(amount), align: 'right' },
          { text: stLbl, tone: statusTone },
        ],
      }
    })

    const allDocs = await payload.find({
      collection: ACCOUNTING_COLLECTION_SLUGS.depreciationEntries,
      depth: 0,
      limit: 10000,
      sort: '-depreciationDate',
      overrideAccess: true,
    })
    const all = allDocs.docs.map((doc) => doc as unknown as Record<string, unknown>)
    const totalScheduledAmount = all.reduce((s, d) => s + Number(d.amount || 0), 0)
    const scheduledCount = all.filter((d) => d.status === 'scheduled').length

    const [fixedAssets, fiscalYears, periods] = await Promise.all([
      payload.find({ collection: ACCOUNTING_COLLECTION_SLUGS.fixedAssets, depth: 0, limit: 500, sort: 'name', overrideAccess: true }),
      payload.find({ collection: ACCOUNTING_COLLECTION_SLUGS.fiscalYears, depth: 0, limit: 50, sort: 'name', overrideAccess: true }),
      payload.find({ collection: ACCOUNTING_COLLECTION_SLUGS.periods, depth: 0, limit: 200, sort: 'name', overrideAccess: true }),
    ])

    return NextResponse.json({
      rows,
      metrics: [
        { id: 'scheduled-entries', label: 'Scheduled Entries', value: all.length, change: 'Rows generated through asset schedule creation', trend: 'up' as const },
        { id: 'assets-with-schedule', label: 'Assets With Schedule', value: new Set(all.map((d) => String(d.fixedAsset))).size, change: 'Assets already carrying generated depreciation entries', trend: 'up' as const },
        { id: 'current-period-amount', label: 'Current Period Amount', value: fmt(scheduledCount > 0 ? totalScheduledAmount / Math.max(1, all.length) * 1 : 0), change: 'Scheduled depreciation for the current active period', trend: 'up' as const },
        { id: 'ready-to-post', label: 'Ready To Post', value: scheduledCount, change: 'Scheduled rows awaiting posting action', trend: scheduledCount > 0 ? 'up' as const : 'neutral' as const },
      ],
      filterOptions: {
        statuses: ACCOUNTING_DEPRECIATION_ENTRY_STATUS_OPTIONS.map((o) => ({ label: o.label, value: o.value })),
        quickFilters: [
          { label: 'Scheduled', value: 'status:scheduled' },
          { label: 'Posted', value: 'status:posted' },
        ],
      },
      meta: {
        searchPlaceholder: 'Search asset, fiscal year, period, depreciation date, scheduled amount, or status',
        columns: ['Asset', 'Fiscal Year', 'Period', 'Depreciation Date', 'Amount', 'Status'],
        tableTitle: 'Depreciation Schedule Register',
        tableDescription: 'Schedule rows aligned to the depreciation-entry collection and the schedule-generation route for fixed assets.',
      },
      pagination: { page: result.page, limit: result.limit, totalDocs: result.totalDocs, totalPages: result.totalPages, hasPrevPage: result.hasPrevPage, hasNextPage: result.hasNextPage },
      totals: { totalRows: all.length, filteredRows: result.totalDocs },
      referenceData: {
        fixedAssets: fixedAssets.docs.map((d) => { const r = d as unknown as Record<string, unknown>; return { id: String(r.id), assetCode: String(r.assetCode ?? ''), name: String(r.name ?? '') }; }),
        fiscalYears: fiscalYears.docs.map((d) => { const r = d as unknown as Record<string, unknown>; return { id: String(r.id), name: String(r.name ?? '') }; }),
        periods: periods.docs.map((d) => { const r = d as unknown as Record<string, unknown>; return { id: String(r.id), name: String(r.label ?? r.name ?? '') }; }),
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

    const fixedAssetId = toId(body.fixedAsset)
    if (!fixedAssetId) throw new AccountingApiError('Fixed asset is required.', 400)

    const fiscalYearId = toId(body.fiscalYear)
    if (!fiscalYearId) throw new AccountingApiError('Fiscal year is required.', 400)

    const periodId = toId(body.period)
    if (!periodId) throw new AccountingApiError('Period is required.', 400)

    const data: Record<string, unknown> = {
      fixedAsset: fixedAssetId,
      fiscalYear: fiscalYearId,
      period: periodId,
      depreciationDate: body.depreciationDate || null,
      amount: Number(body.amount || 0),
      status: String(body.status || 'scheduled'),
      createdBy: user.id,
      updatedBy: user.id,
    }

    if (body.notes) data.notes = String(body.notes).trim()

    if (!data.depreciationDate) throw new AccountingApiError('Depreciation date is required.', 400)
    if (Number(data.amount) <= 0) throw new AccountingApiError('Amount must be greater than 0.', 400)

    const record = await payload.create({
      collection: ACCOUNTING_COLLECTION_SLUGS.depreciationEntries,
      overrideAccess: true,
      data: data as never,
      depth: 1,
    })

    return NextResponse.json(record, { status: 201 })
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
