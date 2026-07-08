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
      if (k === 'hasJournal' && v === 'true') andClauses.push({ postedJournalEntry: { exists: true } })
    }
    if (search) {
      andClauses.push({
        or: [
          { 'fixedAsset.assetCode': { like: search } },
          { 'fixedAsset.name': { like: search } },
          { 'period.label': { like: search } },
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
      const per = d.period as Record<string, unknown> | undefined
      const je = d.postedJournalEntry as Record<string, unknown> | undefined
      const faLabel = fa ? [fa.assetCode, fa.name].filter(Boolean).join(' - ') : ''
      const periodLabel = per?.label ? String(per.label) : per?.name ? String(per.name) : per ? String(per.id) : ''
      const st = String(d.status || '')
      const amount = Number(d.amount || 0)
      const stLbl = statusMap.get(st as typeof ACCOUNTING_DEPRECIATION_ENTRY_STATUS_OPTIONS[number]['value']) || st
      const statusTone = st === 'posted' ? 'green' : st === 'reversed' ? 'red' : 'amber'
      const journalRef = je?.entryNumber ? String(je.entryNumber) : je ? `JE#${je.id}` : null

      return {
        id: String(d.id),
        fixedAssetId: String(fa?.id ?? ''),
        assetLabel: faLabel,
        periodId: String(per?.id ?? ''),
        periodLabel,
        depreciationDate: d.depreciationDate ? String(d.depreciationDate).slice(0, 10) : null,
        amount,
        amountLabel: fmt(amount),
        status: st,
        statusLabel: stLbl,
        statusTone,
        postedJournalEntryId: je ? String(je.id ?? '') : '',
        journalRef,
        cells: [
          { text: faLabel || 'Unknown Asset', emphasis: true },
          periodLabel,
          (d.depreciationDate ? String(d.depreciationDate).slice(0, 10) : '-'),
          { text: fmt(amount), align: 'right' },
          journalRef || '-',
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
    const postedCount = all.filter((d) => d.status === 'posted').length
    const scheduledCount = all.filter((d) => d.status === 'scheduled').length
    const postedAmount = all.filter((d) => d.status === 'posted').reduce((s, d) => s + Number(d.amount || 0), 0)

    const [fixedAssets, periods, fiscalYears] = await Promise.all([
      payload.find({ collection: ACCOUNTING_COLLECTION_SLUGS.fixedAssets, depth: 0, limit: 500, sort: 'name', overrideAccess: true }),
      payload.find({ collection: ACCOUNTING_COLLECTION_SLUGS.periods, depth: 0, limit: 200, sort: 'label', overrideAccess: true }),
      payload.find({ collection: ACCOUNTING_COLLECTION_SLUGS.fiscalYears, depth: 0, limit: 100, sort: 'name', overrideAccess: true }),
    ])

    return NextResponse.json({
      rows,
      metrics: [
        { id: 'posted-entries', label: 'Posted Entries', value: postedCount, change: 'Depreciation rows already posted to journal entries', trend: 'up' as const },
        { id: 'scheduled-entries', label: 'Scheduled Entries', value: scheduledCount, change: 'Rows still pending posting', trend: scheduledCount > 0 ? 'up' as const : 'neutral' as const },
        { id: 'posted-amount', label: 'Posted Amount', value: fmt(postedAmount), change: 'Accumulated depreciation already posted through journal flow', trend: 'up' as const },
        { id: 'fully-depreciated', label: 'Fully Depreciated Assets', value: new Set(all.filter((d) => d.status === 'posted').map((d) => String(d.fixedAsset))).size, change: 'Assets automatically rolled to fully depreciated status', trend: 'up' as const },
      ],
      filterOptions: {
        statuses: ACCOUNTING_DEPRECIATION_ENTRY_STATUS_OPTIONS.map((o) => ({ label: o.label, value: o.value })),
        quickFilters: [
          { label: 'Posted', value: 'status:posted' },
          { label: 'Scheduled', value: 'status:scheduled' },
          { label: 'With Journal', value: 'hasJournal:true' },
        ],
      },
      meta: {
        searchPlaceholder: 'Search asset, period, depreciation date, amount, posted journal, or status',
        columns: ['Asset', 'Period', 'Depreciation Date', 'Amount', 'Posted Journal', 'Status'],
        tableTitle: 'Depreciation Entry Register',
        tableDescription: 'Entry rows aligned to `accounting-depreciation-entries` and the depreciation-post route that creates the supporting journal entry.',
      },
      pagination: { page: result.page, limit: result.limit, totalDocs: result.totalDocs, totalPages: result.totalPages, hasPrevPage: result.hasPrevPage, hasNextPage: result.hasNextPage },
      totals: { totalRows: all.length, filteredRows: result.totalDocs },
      referenceData: {
        fixedAssets: fixedAssets.docs.map((d) => { const r = d as unknown as Record<string, unknown>; return { id: String(r.id), assetCode: String(r.assetCode ?? ''), name: String(r.name ?? '') }; }),
        periods: periods.docs.map((d) => { const r = d as unknown as Record<string, unknown>; return { id: String(r.id), name: String(r.label ?? r.name ?? '') }; }),
        fiscalYears: fiscalYears.docs.map((d) => { const r = d as unknown as Record<string, unknown>; return { id: String(r.id), name: String(r.name ?? '') }; }),
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

    const data: Record<string, unknown> = {
      fixedAsset: fixedAssetId,
      depreciationDate: body.depreciationDate || null,
      amount: Number(body.amount || 0),
      status: String(body.status || 'scheduled'),
      createdBy: user.id,
      updatedBy: user.id,
    }

    if (body.fiscalYear) { const n = toId(body.fiscalYear); if (n) data.fiscalYear = n }
    if (body.period) { const n = toId(body.period); if (n) data.period = n }
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
