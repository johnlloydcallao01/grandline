import { NextRequest, NextResponse } from 'next/server'
import { AccountingAssetRegisterService } from '@/accounting/services/reports/AccountingAssetRegisterService'
import { ACCOUNTING_FIXED_ASSET_CATEGORY_OPTIONS, ACCOUNTING_FIXED_ASSET_STATUS_OPTIONS } from '@/accounting/constants/accounting'
import { handleAccountingApiError, requireAccountingAdmin } from '../_utils/auth'

const parseIntegerParam = (value: string | null, fallback: number) => {
  if (!value) return fallback; const p = Number(value); return Number.isFinite(p) ? p : fallback
}

const parseListParam = (searchParams: URLSearchParams, key: string): string[] =>
  Array.from(new Set(searchParams.getAll(key).flatMap((v) => String(v || '').split(',')).map((v) => v.trim()).filter(Boolean)))

const normalizeText = (value?: string | null) => String(value || '').trim().toLowerCase()
const formatCurrency = (value: number) => new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)

const categoryLabelMap = new Map(ACCOUNTING_FIXED_ASSET_CATEGORY_OPTIONS.map((o) => [o.value, o.label]))
const statusLabelMap = new Map(ACCOUNTING_FIXED_ASSET_STATUS_OPTIONS.map((o) => [o.value, o.label]))

export async function GET(request: NextRequest) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const { searchParams } = new URL(request.url)
    const search = normalizeText(searchParams.get('search'))
    const statuses = parseListParam(searchParams, 'status')
    const categories = parseListParam(searchParams, 'category')
    const quickFilters = parseListParam(searchParams, 'quickFilter')
    const page = Math.max(1, parseIntegerParam(searchParams.get('page'), 1))
    const limit = Math.min(100, Math.max(1, parseIntegerParam(searchParams.get('limit'), 10)))

    const rawAssets = await AccountingAssetRegisterService.getAssetRegister(payload)

    const mappedRows = rawAssets.map((asset) => ({
      id: asset.assetId,
      assetCode: asset.assetCode || null,
      name: asset.name || null,
      assetCategory: asset.assetCategory || null,
      categoryLabel: categoryLabelMap.get(asset.assetCategory) || asset.assetCategory || 'Other',
      branch: asset.branch || null,
      department: asset.department || null,
      location: asset.location || null,
      cost: asset.cost,
      accumulatedDepreciation: asset.accumulatedDepreciation,
      netBookValue: asset.netBookValue,
      status: asset.status || null,
      statusLabel: statusLabelMap.get(asset.status) || asset.status || '-',
      statusTone: asset.status === 'active' ? 'green' : asset.status === 'fully_depreciated' ? 'blue' : asset.status === 'disposed' ? 'amber' : asset.status === 'written_off' ? 'red' : 'gray',
      cells: [
        { text: asset.assetCode || '-', emphasis: true },
        asset.name || '-',
        categoryLabelMap.get(asset.assetCategory) || asset.assetCategory || 'Other',
        { text: formatCurrency(asset.cost), align: 'right' },
        { text: formatCurrency(asset.accumulatedDepreciation), align: 'right' },
        { text: statusLabelMap.get(asset.status) || asset.status || '-', tone: asset.status === 'active' ? 'green' : asset.status === 'fully_depreciated' ? 'blue' : asset.status === 'disposed' ? 'amber' : asset.status === 'written_off' ? 'red' : 'gray' },
      ],
    }))

    let filtered = mappedRows
    if (search) {
      filtered = filtered.filter((r) =>
        [r.assetCode, r.name, r.assetCategory, r.categoryLabel, r.statusLabel]
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
      filtered = filtered.filter((r) =>
        quickFilters.some((qf) => {
          const [prefix, value] = qf.split(':')
          if (prefix === 'status') return r.status === value
          if (prefix === 'category') return r.assetCategory === value
          return false
        }),
      )
    }

    const totalDocs = filtered.length
    const totalPages = Math.max(1, Math.ceil(totalDocs / limit))
    const currentPage = Math.min(page, totalPages)
    const paginatedRows = filtered.slice((currentPage - 1) * limit, currentPage * limit)

    const allCost = rawAssets.reduce((sum, a) => sum + a.cost, 0)
    const allAccumDepn = rawAssets.reduce((sum, a) => sum + a.accumulatedDepreciation, 0)
    const allNBV = rawAssets.reduce((sum, a) => sum + a.netBookValue, 0)

    return NextResponse.json({
      section: {
        id: 'asset-register',
        label: 'Asset Register',
        description: 'Review fixed-asset register rows using asset code, category, acquisition cost, accumulated depreciation, and carrying amount.',
        searchPlaceholder: 'Search asset code, asset name, category, branch, or status',
        filters: {
          statuses: ACCOUNTING_FIXED_ASSET_STATUS_OPTIONS.map((o) => ({ label: o.label, value: o.value })),
          categories: ACCOUNTING_FIXED_ASSET_CATEGORY_OPTIONS.map((o) => ({ label: o.label, value: o.value })),
          quickFilters: [
            { label: 'Active', value: 'status:active' },
            { label: 'Equipment', value: 'category:equipment' },
            { label: 'Vehicles', value: 'category:vehicle' },
            { label: 'Fully Depreciated', value: 'status:fully_depreciated' },
          ],
        },
        metrics: [
          { id: 'registered-assets', label: 'Registered Assets', value: rawAssets.length, change: 'Assets included in register output', trend: 'up' as const },
          { id: 'gross-cost', label: 'Gross Cost', value: formatCurrency(allCost), change: 'Total acquisition cost in scope', trend: 'up' as const },
          { id: 'accumulated-depn', label: 'Accumulated Depn.', value: formatCurrency(allAccumDepn), change: 'Depreciation captured in register', trend: 'up' as const },
          { id: 'net-book-value', label: 'Net Book Value', value: formatCurrency(allNBV), change: 'Remaining carrying amount', trend: 'neutral' as const },
        ],
        table: {
          title: 'Asset Register Report',
          description: 'Fixed-asset register aligned to the exposed asset-register report endpoint in apps/cms.',
          columns: ['Asset Code', 'Asset Name', 'Category', 'Acquisition Cost', 'Accumulated Depn.', 'Status'],
          rows: paginatedRows,
        },
      },
      appliedFilters: { search, statuses, categories, quickFilters },
      pagination: { page: currentPage, limit, totalDocs, totalPages, hasPrevPage: currentPage > 1, hasNextPage: currentPage < totalPages },
      totals: { totalRows: rawAssets.length, filteredRows: totalDocs, totalCost: allCost, totalAccumulatedDepreciation: allAccumDepn, totalNetBookValue: allNBV },
    })
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
