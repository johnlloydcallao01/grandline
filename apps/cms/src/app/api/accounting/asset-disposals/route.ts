import { NextRequest, NextResponse } from 'next/server'
import { ACCOUNTING_ASSET_DISPOSAL_STATUS_OPTIONS, ACCOUNTING_ASSET_DISPOSAL_TYPE_OPTIONS, ACCOUNTING_COLLECTION_SLUGS } from '@/accounting/constants/accounting'
import { AccountingApiError, handleAccountingApiError, requireAccountingAdmin } from '../_utils/auth'

const disposalTypeMap = new Map(ACCOUNTING_ASSET_DISPOSAL_TYPE_OPTIONS.map((o) => [o.value, o.label]))
const statusMap = new Map(ACCOUNTING_ASSET_DISPOSAL_STATUS_OPTIONS.map((o) => [o.value, o.label]))

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
    const types = parseListParam(sp, 'disposalType')
    const quickFilters = parseListParam(sp, 'quickFilter')
    const page = Math.max(1, Number(sp.get('page')) || 1)
    const limit = Math.min(100, Math.max(1, Number(sp.get('limit')) || 10))

    const where: Record<string, unknown> = {}
    const andClauses: Record<string, unknown>[] = []

    if (statuses.length) {
      andClauses.push({ status: { in: statuses } })
    }
    if (types.length) {
      andClauses.push({ disposalType: { in: types } })
    }
    for (const qf of quickFilters) {
      const [k, v] = qf.split(':')
      if (k === 'status' && v) andClauses.push({ status: { equals: v } })
      if (k === 'disposalType' && v) andClauses.push({ disposalType: { equals: v } })
    }
    if (search) {
      andClauses.push({
        or: [
          { 'fixedAsset.assetCode': { like: search } },
          { 'fixedAsset.name': { like: search } },
          { disposalType: { like: search } },
          { status: { like: search } },
          { notes: { like: search } },
        ],
      })
    }
    if (andClauses.length > 0) {
      where.and = andClauses
    }

    const result = await payload.find({
      collection: ACCOUNTING_COLLECTION_SLUGS.assetDisposals,
      depth: 1,
      sort: '-createdAt',
      page,
      limit,
      where: Object.keys(where).length ? where as never : undefined,
      overrideAccess: true,
    })

    const rows = result.docs.map((doc) => {
      const d = doc as unknown as Record<string, unknown>
      const fa = d.fixedAsset as Record<string, unknown> | undefined
      const faLabel = fa ? [fa.assetCode, fa.name].filter(Boolean).join(' - ') : ''
      const dt = String(d.disposalType || '')
      const st = String(d.status || '')
      const proceeds = Number(d.proceedsAmount || 0)
      const gainLoss = Number(d.gainOrLossAmount || 0)
      const dtLbl = disposalTypeMap.get(dt as typeof ACCOUNTING_ASSET_DISPOSAL_TYPE_OPTIONS[number]['value']) || dt
      const stLbl = statusMap.get(st as typeof ACCOUNTING_ASSET_DISPOSAL_STATUS_OPTIONS[number]['value']) || st
      const statusTone = st === 'posted' ? 'green' : st === 'approved' ? 'blue' : st === 'voided' ? 'red' : 'amber'

      return {
        id: String(d.id),
        fixedAssetId: String(fa?.id ?? ''),
        assetLabel: faLabel,
        disposalDate: d.disposalDate ? String(d.disposalDate).slice(0, 10) : null,
        disposalType: dt,
        disposalTypeLabel: dtLbl,
        proceedsAmount: proceeds,
        proceedsLabel: fmt(proceeds),
        bookValueAtDisposal: Number(d.bookValueAtDisposal || 0),
        bookValueLabel: fmt(Number(d.bookValueAtDisposal || 0)),
        gainOrLossAmount: gainLoss,
        gainOrLossLabel: fmt(gainLoss),
        gainLossSign: gainLoss >= 0 ? 'gain' : 'loss' as 'gain' | 'loss',
        status: st,
        statusLabel: stLbl,
        statusTone,
        cells: [
          { text: faLabel || 'Unknown Asset', emphasis: true },
          (d.disposalDate ? String(d.disposalDate).slice(0, 10) : '-'),
          { text: dtLbl },
          { text: fmt(proceeds), align: 'right' },
          { text: fmt(gainLoss), align: 'right', tone: gainLoss < 0 ? 'red' : gainLoss > 0 ? 'green' : undefined },
          { text: stLbl, tone: statusTone },
        ],
      }
    })

    const allDocs = await payload.find({
      collection: ACCOUNTING_COLLECTION_SLUGS.assetDisposals,
      depth: 0,
      limit: 10000,
      sort: '-createdAt',
      overrideAccess: true,
    })
    const all = allDocs.docs.map((doc) => doc as unknown as Record<string, unknown>)
    const totalGainLoss = all.reduce((s, d) => s + Number(d.gainOrLossAmount || 0), 0)
    const postedCount = all.filter((d) => d.status === 'posted').length
    const writeOffCount = all.filter((d) => d.disposalType === 'write_off').length

    const [fixedAssets, chartAccounts] = await Promise.all([
      payload.find({ collection: ACCOUNTING_COLLECTION_SLUGS.fixedAssets, depth: 0, limit: 500, sort: 'name', overrideAccess: true }),
      payload.find({ collection: ACCOUNTING_COLLECTION_SLUGS.chartOfAccounts, depth: 0, limit: 500, sort: 'code', overrideAccess: true }),
    ])

    return NextResponse.json({
      rows,
      metrics: [
        { id: 'total-disposals', label: 'Disposal Records', value: all.length, change: 'Lifecycle exits tracked in the disposal register', trend: 'up' as const },
        { id: 'posted-disposals', label: 'Posted Disposals', value: postedCount, change: 'Disposals already journal-posted', trend: 'up' as const },
        { id: 'write-offs', label: 'Write-Offs', value: writeOffCount, change: 'Disposal records tagged as write-off type', trend: writeOffCount > 0 ? 'up' as const : 'neutral' as const },
        { id: 'net-gain-loss', label: 'Net Gain / Loss', value: fmt(totalGainLoss), change: `Combined gain or loss across ${all.length} disposal(s)`, trend: totalGainLoss >= 0 ? 'up' as const : 'down' as const },
      ],
      filterOptions: {
        statuses: ACCOUNTING_ASSET_DISPOSAL_STATUS_OPTIONS.map((o) => ({ label: o.label, value: o.value })),
        disposalTypes: ACCOUNTING_ASSET_DISPOSAL_TYPE_OPTIONS.map((o) => ({ label: o.label, value: o.value })),
        quickFilters: [
          { label: 'Draft', value: 'status:draft' },
          { label: 'Posted', value: 'status:posted' },
          { label: 'Sale', value: 'disposalType:sale' },
          { label: 'Write-Off', value: 'disposalType:write_off' },
        ],
      },
      meta: {
        searchPlaceholder: 'Search asset, date, type, proceeds, book value, gain/loss, or status...',
        columns: ['Asset', 'Disposal Date', 'Type', 'Proceeds', 'Gain / Loss', 'Status'],
        tableTitle: 'Asset Disposal Register',
        tableDescription: 'Disposal rows aligned to asset disposals, including type, proceeds, book value, gain or loss, status, and posted journal entry.',
      },
      pagination: { page: result.page, limit: result.limit, totalDocs: result.totalDocs, totalPages: result.totalPages, hasPrevPage: result.hasPrevPage, hasNextPage: result.hasNextPage },
      totals: { totalRows: all.length, filteredRows: result.totalDocs },
      referenceData: {
        fixedAssets: fixedAssets.docs.map((d) => { const r = d as unknown as Record<string, unknown>; return { id: String(r.id), assetCode: String(r.assetCode ?? ''), name: String(r.name ?? '') }; }),
        chartAccounts: chartAccounts.docs.map((d) => { const r = d as unknown as Record<string, unknown>; return { id: String(r.id), code: String(r.code ?? ''), name: String(r.name ?? ''), accountType: String(r.accountType ?? ''), accountSubType: String(r.accountSubType ?? '') }; }),
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
      disposalDate: body.disposalDate || null,
      disposalType: String(body.disposalType || 'sale'),
      proceedsAmount: Number(body.proceedsAmount ?? 0),
      bookValueAtDisposal: Number(body.bookValueAtDisposal ?? 0),
      gainOrLossAmount: Number(body.gainOrLossAmount ?? 0),
      status: String(body.status || 'draft'),
      createdBy: user.id,
      updatedBy: user.id,
    }

    if (body.notes) data.notes = String(body.notes).trim()
    if (body.proceedsAccount) { const n = toId(body.proceedsAccount); if (n) data.proceedsAccount = n }
    if (body.gainAccount) { const n = toId(body.gainAccount); if (n) data.gainAccount = n }
    if (body.lossAccount) { const n = toId(body.lossAccount); if (n) data.lossAccount = n }

    if (!data.disposalDate) throw new AccountingApiError('Disposal date is required.', 400)

    const record = await payload.create({
      collection: ACCOUNTING_COLLECTION_SLUGS.assetDisposals,
      overrideAccess: true,
      data: data as never,
      depth: 1,
    })

    return NextResponse.json(record, { status: 201 })
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
