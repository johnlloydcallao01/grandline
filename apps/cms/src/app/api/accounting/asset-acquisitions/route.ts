import { NextRequest, NextResponse } from 'next/server'
import { ACCOUNTING_COLLECTION_SLUGS, ACCOUNTING_FIXED_ASSET_CATEGORY_OPTIONS, ACCOUNTING_FIXED_ASSET_STATUS_OPTIONS } from '@/accounting/constants/accounting'
import { AccountingApiError, handleAccountingApiError, requireAccountingAdmin } from '../_utils/auth'

const categoryMap = new Map(ACCOUNTING_FIXED_ASSET_CATEGORY_OPTIONS.map((o) => [o.value, o.label]))
const statusMap = new Map(ACCOUNTING_FIXED_ASSET_STATUS_OPTIONS.map((o) => [o.value, o.label]))

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
    const categories = parseListParam(sp, 'category')
    const quickFilters = parseListParam(sp, 'quickFilter')
    const page = Math.max(1, Number(sp.get('page')) || 1)
    const limit = Math.min(100, Math.max(1, Number(sp.get('limit')) || 10))

    const where: Record<string, unknown> = {}
    const andClauses: Record<string, unknown>[] = []

    if (statuses.length) {
      andClauses.push({ status: { in: statuses } })
    }
    if (categories.length) {
      andClauses.push({ assetCategory: { in: categories } })
    }
    for (const qf of quickFilters) {
      const [k, v] = qf.split(':')
      if (k === 'status' && v) andClauses.push({ status: { equals: v } })
      if (k === 'category' && v) andClauses.push({ assetCategory: { equals: v } })
    }
    if (search) {
      andClauses.push({
        or: [
          { assetCode: { like: search } },
          { name: { like: search } },
        ],
      })
    }
    if (andClauses.length > 0) {
      where.and = andClauses
    }

    const result = await payload.find({
      collection: ACCOUNTING_COLLECTION_SLUGS.fixedAssets,
      depth: 1,
      sort: '-createdAt',
      page,
      limit,
      where: Object.keys(where).length ? where as never : undefined,
      overrideAccess: true,
    })

    const rows = result.docs.map((doc) => {
      const d = doc as unknown as Record<string, unknown>
      const cat = String(d.assetCategory || '')
      const st = String(d.status || '')
      const cost = Number(d.cost || 0)
      const ulm = Number(d.usefulLifeMonths || 0)
      const catLbl = categoryMap.get(cat as typeof ACCOUNTING_FIXED_ASSET_CATEGORY_OPTIONS[number]['value']) || cat || 'Other'
      const stLbl = statusMap.get(st as typeof ACCOUNTING_FIXED_ASSET_STATUS_OPTIONS[number]['value']) || st || '-'
      const statusTone = st === 'active' ? 'green' : st === 'fully_depreciated' ? 'blue' : st === 'disposed' ? 'amber' : st === 'written_off' ? 'red' : 'gray'

      return {
        id: String(d.id),
        assetCode: String(d.assetCode || ''),
        name: String(d.name || ''),
        assetCategory: cat,
        categoryLabel: catLbl,
        purchaseDate: d.purchaseDate ? String(d.purchaseDate).slice(0, 10) : null,
        inServiceDate: d.inServiceDate ? String(d.inServiceDate).slice(0, 10) : null,
        cost,
        costLabel: fmt(cost),
        salvageValue: Number(d.salvageValue || 0),
        salvageValueLabel: fmt(Number(d.salvageValue || 0)),
        usefulLifeMonths: ulm,
        usefulLifeLabel: `${ulm} months`,
        status: st,
        statusLabel: stLbl,
        statusTone,
        documentRef: String(d.supportingDocument ? (d.supportingDocument as Record<string, unknown>).filename || String(d.supportingDocument) : d.notes || ''),
        cells: [
          { text: [String(d.assetCode || ''), String(d.name || '')].filter(Boolean).join(' - '), emphasis: true },
          (d.purchaseDate ? String(d.purchaseDate).slice(0, 10) : '-'),
          (d.inServiceDate ? String(d.inServiceDate).slice(0, 10) : '-'),
          { text: fmt(cost), align: 'right' },
          `${ulm} months`,
          { text: stLbl, tone: statusTone },
        ],
      }
    })

    const allDocs = await payload.find({
      collection: ACCOUNTING_COLLECTION_SLUGS.fixedAssets,
      depth: 0,
      limit: 10000,
      sort: '-createdAt',
      overrideAccess: true,
    })
    const all = allDocs.docs.map((doc) => doc as unknown as Record<string, unknown>)
    const allCost = all.reduce((s, d) => s + Number(d.cost || 0), 0)
    const inServiceCount = all.filter((d) => d.inServiceDate).length
    const recentCount = all.filter((d) => {
      if (!d.purchaseDate) return false
      const pd = new Date(String(d.purchaseDate))
      const cutoff = new Date()
      cutoff.setMonth(cutoff.getMonth() - 3)
      return pd >= cutoff
    }).length

    const [vendors, chartAccounts, branches, departments, locations] = await Promise.all([
      payload.find({ collection: ACCOUNTING_COLLECTION_SLUGS.vendors, depth: 0, limit: 500, sort: 'displayName', overrideAccess: true }),
      payload.find({ collection: ACCOUNTING_COLLECTION_SLUGS.chartOfAccounts, depth: 0, limit: 500, sort: 'code', overrideAccess: true }),
      payload.find({ collection: ACCOUNTING_COLLECTION_SLUGS.branches, depth: 0, limit: 200, sort: 'name', overrideAccess: true }),
      payload.find({ collection: ACCOUNTING_COLLECTION_SLUGS.departments, depth: 0, limit: 200, sort: 'name', overrideAccess: true }),
      payload.find({ collection: ACCOUNTING_COLLECTION_SLUGS.locations, depth: 0, limit: 200, sort: 'name', overrideAccess: true }),
    ])

    return NextResponse.json({
      rows,
      metrics: [
        { id: 'total-assets', label: 'Total Assets', value: all.length, change: 'Assets in acquisition register', trend: 'up' as const },
        { id: 'in-service', label: 'Assets In Service', value: inServiceCount, change: 'Assets with in-service date set', trend: inServiceCount > 0 ? 'up' as const : 'neutral' as const },
        { id: 'recent-acquisitions', label: 'Recent Acquisitions', value: recentCount, change: 'Purchased within last 3 months', trend: 'up' as const },
        { id: 'register-cost', label: 'Acquisition Cost', value: fmt(allCost), change: 'Total capitalized cost', trend: 'up' as const },
      ],
      filterOptions: {
        statuses: ACCOUNTING_FIXED_ASSET_STATUS_OPTIONS.map((o) => ({ label: o.label, value: o.value })),
        categories: ACCOUNTING_FIXED_ASSET_CATEGORY_OPTIONS.map((o) => ({ label: o.label, value: o.value })),
        quickFilters: [
          { label: 'Active', value: 'status:active' },
          { label: 'Draft', value: 'status:draft' },
          { label: 'In Service', value: 'category:equipment' },
        ],
      },
      meta: {
        searchPlaceholder: 'Search asset code, name, category, or status...',
        columns: ['Asset', 'Purchase Date', 'In Service', 'Cost', 'Useful Life', 'Status'],
        tableTitle: 'Asset Acquisition Register',
        tableDescription: 'Acquisition view of fixed-asset records — purchase, service, cost, useful-life, and status.',
      },
      pagination: { page: result.page, limit: result.limit, totalDocs: result.totalDocs, totalPages: result.totalPages, hasPrevPage: result.hasPrevPage, hasNextPage: result.hasNextPage },
      totals: { totalRows: all.length, filteredRows: result.totalDocs },
      referenceData: {
        vendors: vendors.docs.map((d) => { const r = d as unknown as Record<string, unknown>; return { id: String(r.id), vendorCode: String(r.vendorCode ?? ''), displayName: String(r.displayName ?? r.name ?? '') }; }),
        chartAccounts: chartAccounts.docs.map((d) => { const r = d as unknown as Record<string, unknown>; return { id: String(r.id), code: String(r.code ?? ''), name: String(r.name ?? ''), accountType: String(r.accountType ?? ''), accountSubType: String(r.accountSubType ?? '') }; }),
        branches: branches.docs.map((d) => { const r = d as unknown as Record<string, unknown>; return { id: String(r.id), branchCode: String(r.branchCode ?? ''), name: String(r.name ?? ''), status: String(r.status ?? '') }; }),
        departments: departments.docs.map((d) => { const r = d as unknown as Record<string, unknown>; return { id: String(r.id), code: String(r.code ?? ''), name: String(r.name ?? ''), status: String(r.status ?? '') }; }),
        locations: locations.docs.map((d) => { const r = d as unknown as Record<string, unknown>; return { id: String(r.id), code: String(r.code ?? ''), name: String(r.name ?? ''), status: String(r.status ?? '') }; }),
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

    const data: Record<string, unknown> = {
      name: String(body.name || '').trim(),
      assetCategory: String(body.assetCategory || 'equipment'),
      purchaseDate: body.purchaseDate || null,
      cost: Number(body.cost || 0),
      salvageValue: Number(body.salvageValue ?? 0),
      usefulLifeMonths: Number(body.usefulLifeMonths || 1),
      depreciationMethod: String(body.depreciationMethod || 'straight_line'),
      expenseAccount: toId(body.expenseAccount),
      assetAccount: toId(body.assetAccount),
      accumulatedDepreciationAccount: toId(body.accumulatedDepreciationAccount),
      status: String(body.status || 'draft'),
      createdBy: user.id,
      updatedBy: user.id,
    }

    if (body.inServiceDate) data.inServiceDate = body.inServiceDate
    if (body.branch) { const n = toId(body.branch); if (n) data.branch = n }
    if (body.department) { const n = toId(body.department); if (n) data.department = n }
    if (body.location) { const n = toId(body.location); if (n) data.location = n }
    if (body.notes) data.notes = String(body.notes).trim()
    if (body.assetCode) data.assetCode = String(body.assetCode).trim().toUpperCase()

    if (!data.name) throw new AccountingApiError('Asset name is required.', 400)
    if (Number(data.cost) <= 0) throw new AccountingApiError('Cost must be greater than 0.', 400)
    if (Number(data.usefulLifeMonths) < 1) throw new AccountingApiError('Useful life must be at least 1 month.', 400)
    if (!data.purchaseDate) throw new AccountingApiError('Purchase date is required.', 400)
    if (!data.expenseAccount) throw new AccountingApiError('Expense account is required.', 400)
    if (!data.assetAccount) throw new AccountingApiError('Asset account is required.', 400)
    if (!data.accumulatedDepreciationAccount) throw new AccountingApiError('Accumulated depreciation account is required.', 400)

    const record = await payload.create({
      collection: ACCOUNTING_COLLECTION_SLUGS.fixedAssets,
      overrideAccess: true,
      data: data as never,
      depth: 1,
    })

    return NextResponse.json(record, { status: 201 })
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
