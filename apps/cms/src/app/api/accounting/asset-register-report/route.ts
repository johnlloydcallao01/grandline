import { NextRequest, NextResponse } from 'next/server'
import { AccountingAssetRegisterService } from '@/accounting/services/reports/AccountingAssetRegisterService'
import {
  ACCOUNTING_COLLECTION_SLUGS,
  ACCOUNTING_FIXED_ASSET_CATEGORY_OPTIONS,
  ACCOUNTING_FIXED_ASSET_STATUS_OPTIONS,
} from '@/accounting/constants/accounting'
import { AccountingApiError, handleAccountingApiError, requireAccountingAdmin } from '../_utils/auth'

const fmt = (n: number) => new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 2 }).format(n)

const parseListParam = (sp: URLSearchParams, key: string): string[] =>
  Array.from(new Set(sp.getAll(key).flatMap((v) => String(v || '').split(',')).map((v) => v.trim()).filter(Boolean)))

const normalizeText = (v?: string | null) => String(v || '').trim().toLowerCase()

const statusLabelMap = new Map(ACCOUNTING_FIXED_ASSET_STATUS_OPTIONS.map((o) => [o.value, o.label]))
const categoryLabelMap = new Map(ACCOUNTING_FIXED_ASSET_CATEGORY_OPTIONS.map((o) => [o.value, o.label]))
function getStatusTone(status: string): string {
  if (status === 'active') return 'green'
  if (status === 'fully_depreciated') return 'blue'
  if (status === 'disposed') return 'amber'
  if (status === 'written_off') return 'red'
  return 'gray'
}

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

    const rawAssets = await AccountingAssetRegisterService.getAssetRegister(payload)

    const rows = rawAssets.map((asset) => {
      const cost = asset.cost
      const accumDepn = asset.accumulatedDepreciation
      const nbv = asset.netBookValue
      const st = asset.status || ''
      return {
        id: asset.assetId,
        assetCode: asset.assetCode || '',
        name: asset.name || '',
        assetCategory: asset.assetCategory || '',
        categoryLabel: categoryLabelMap.get(asset.assetCategory) || asset.assetCategory || 'Other',
        branchName: asset.branch || null,
        departmentName: asset.department || null,
        locationName: asset.location || null,
        cost,
        costLabel: fmt(cost),
        accumulatedDepreciation: accumDepn,
        accumulatedDepreciationLabel: fmt(accumDepn),
        netBookValue: nbv,
        netBookValueLabel: fmt(nbv),
        status: st,
        statusLabel: statusLabelMap.get(st) || st || '-',
        statusTone: getStatusTone(st),
        cells: [
          { text: asset.assetCode || '-', emphasis: true },
          asset.name || '-',
          categoryLabelMap.get(asset.assetCategory) || asset.assetCategory || 'Other',
          { text: fmt(cost), align: 'right' },
          { text: fmt(accumDepn), align: 'right' },
          { text: fmt(nbv), align: 'right' },
          { text: statusLabelMap.get(st) || st || '-', tone: getStatusTone(st) },
        ],
      }
    })

    let filtered = rows
    if (search) {
      filtered = filtered.filter((r) =>
        [r.assetCode, r.name, r.categoryLabel, r.statusLabel, r.branchName, r.departmentName, r.locationName]
          .map((v) => normalizeText(v))
          .some((v) => v.includes(search)),
      )
    }
    if (statuses.length > 0) {
      filtered = filtered.filter((r) => Boolean(r.status && statuses.includes(r.status)))
    }
    if (categories.length > 0) {
      filtered = filtered.filter((r) => Boolean(r.assetCategory && categories.includes(r.assetCategory)))
    }
    if (quickFilters.length > 0) {
      const ALL_QF_VALUES = ['status:active', 'category:equipment', 'category:vehicle', 'status:fully_depreciated']
      const selectedSet = new Set(quickFilters)
      const allSelected = ALL_QF_VALUES.every((v) => selectedSet.has(v))
      if (!allSelected) {
        filtered = filtered.filter((r) =>
          quickFilters.some((qf) => {
            const [prefix, value] = qf.split(':')
            if (prefix === 'status') return r.status === value
            if (prefix === 'category') return r.assetCategory === value
            return false
          }),
        )
      }
    }

    const totalDocs = filtered.length
    const totalPages = Math.max(1, Math.ceil(totalDocs / limit))
    const currentPage = Math.min(page, totalPages)
    const paginatedRows = filtered.slice((currentPage - 1) * limit, currentPage * limit)

    const allCost = rawAssets.reduce((s, a) => s + a.cost, 0)
    const allAccumDepn = rawAssets.reduce((s, a) => s + a.accumulatedDepreciation, 0)
    const allNBV = rawAssets.reduce((s, a) => s + a.netBookValue, 0)

    const [chartAccounts, branches, departments, locations] = await Promise.all([
      payload.find({ collection: ACCOUNTING_COLLECTION_SLUGS.chartOfAccounts, depth: 0, limit: 500, sort: 'code', overrideAccess: true }),
      payload.find({ collection: ACCOUNTING_COLLECTION_SLUGS.branches, depth: 0, limit: 200, sort: 'name', overrideAccess: true }),
      payload.find({ collection: ACCOUNTING_COLLECTION_SLUGS.departments, depth: 0, limit: 200, sort: 'name', overrideAccess: true }),
      payload.find({ collection: ACCOUNTING_COLLECTION_SLUGS.locations, depth: 0, limit: 200, sort: 'name', overrideAccess: true }),
    ])

    return NextResponse.json({
      rows: paginatedRows,
      metrics: [
        { id: 'registered-assets', label: 'Registered Assets', value: rawAssets.length, change: 'Assets included in register output', trend: 'up' as const },
        { id: 'gross-cost', label: 'Gross Cost', value: fmt(allCost), change: 'Total acquisition cost in scope', trend: 'up' as const },
        { id: 'accumulated-depn', label: 'Accumulated Depn.', value: fmt(allAccumDepn), change: 'Depreciation captured in register', trend: 'up' as const },
        { id: 'net-book-value', label: 'Net Book Value', value: fmt(allNBV), change: 'Remaining carrying amount', trend: 'neutral' as const },
      ],
      filterOptions: {
        statuses: ACCOUNTING_FIXED_ASSET_STATUS_OPTIONS.map((o) => ({ label: o.label, value: o.value })),
        categories: ACCOUNTING_FIXED_ASSET_CATEGORY_OPTIONS.map((o) => ({ label: o.label, value: o.value })),
        quickFilters: [
          { label: 'Active', value: 'status:active' },
          { label: 'Equipment', value: 'category:equipment' },
          { label: 'Vehicles', value: 'category:vehicle' },
          { label: 'Fully Depreciated', value: 'status:fully_depreciated' },
        ],
      },
      meta: {
        searchPlaceholder: 'Search asset code, asset name, category, branch, department, location, or status',
        columns: ['Asset Code', 'Asset Name', 'Category', 'Acquisition Cost', 'Accumulated Depn.', 'Net Book Value', 'Status'],
        tableTitle: 'Asset Register Report',
        tableDescription: 'Fixed-asset register with acquisition cost, accumulated depreciation, and net book value computed from the depreciation-entry posting records.',
      },
      pagination: { page: currentPage, limit, totalDocs, totalPages, hasPrevPage: currentPage > 1, hasNextPage: currentPage < totalPages },
      totals: { totalRows: rawAssets.length, filteredRows: totalDocs },
      referenceData: {
        chartAccounts: chartAccounts.docs.map((d) => { const r = d as unknown as Record<string, unknown>; return { id: String(r.id), code: String(r.code ?? ''), name: String(r.name ?? '') }; }),
        branches: branches.docs.map((d) => { const r = d as unknown as Record<string, unknown>; return { id: String(r.id), branchCode: String(r.branchCode ?? ''), name: String(r.name ?? '') }; }),
        departments: departments.docs.map((d) => { const r = d as unknown as Record<string, unknown>; return { id: String(r.id), code: String(r.code ?? ''), name: String(r.name ?? '') }; }),
        locations: locations.docs.map((d) => { const r = d as unknown as Record<string, unknown>; return { id: String(r.id), code: String(r.code ?? ''), name: String(r.name ?? '') }; }),
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

    if (!body.name) throw new AccountingApiError('Asset name is required.', 400)
    if (Number(body.cost || 0) <= 0) throw new AccountingApiError('Cost must be greater than 0.', 400)
    if (Number(body.usefulLifeMonths || 0) < 1) throw new AccountingApiError('Useful life must be at least 1 month.', 400)
    if (!body.purchaseDate) throw new AccountingApiError('Purchase date is required.', 400)

    const data: Record<string, unknown> = {
      name: String(body.name).trim(),
      assetCategory: String(body.assetCategory || 'equipment'),
      purchaseDate: body.purchaseDate,
      inServiceDate: body.inServiceDate || null,
      cost: Number(body.cost || 0),
      salvageValue: Number(body.salvageValue || 0),
      usefulLifeMonths: Number(body.usefulLifeMonths || 60),
      depreciationMethod: String(body.depreciationMethod || 'straight_line'),
      status: String(body.status || 'draft'),
      createdBy: user.id,
      updatedBy: user.id,
    }

    if (body.assetCode) data.assetCode = String(body.assetCode).trim()
    if (body.inServiceDate) data.inServiceDate = body.inServiceDate

    const mapRel = (v: unknown) => { const n = toId(v); if (n) return n; return undefined }
    const expenseAccount = mapRel(body.expenseAccount)
    const assetAccount = mapRel(body.assetAccount)
    const accumDeprAccount = mapRel(body.accumulatedDepreciationAccount)

    if (expenseAccount) data.expenseAccount = expenseAccount
    if (assetAccount) data.assetAccount = assetAccount
    if (accumDeprAccount) data.accumulatedDepreciationAccount = accumDeprAccount

    const branch = mapRel(body.branch)
    const department = mapRel(body.department)
    const location = mapRel(body.location)
    if (branch) data.branch = branch
    if (department) data.department = department
    if (location) data.location = location

    if (body.notes) data.notes = String(body.notes).trim()

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
