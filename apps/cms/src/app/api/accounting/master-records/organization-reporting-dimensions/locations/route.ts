import { NextRequest, NextResponse } from 'next/server'
import { AccountingLocationsRegisterService } from '@/accounting/services/locations/AccountingLocationsRegisterService'
import { handleAccountingApiError, requireAccountingAdmin } from '@/app/api/accounting/_utils/auth'

const parseIntegerParam = (value: string | null, fallback: number) => {
  if (!value) return fallback
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

const parseListParam = (searchParams: URLSearchParams, key: string): string[] => {
  return Array.from(new Set(
    searchParams.getAll(key).flatMap((v) => String(v || '').split(',')).map((v) => v.trim()).filter(Boolean),
  ))
}

export async function GET(request: NextRequest) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const { searchParams } = new URL(request.url)

    const branchIds = parseListParam(searchParams, 'branchId').map((v) => {
      const n = Number(v)
      return Number.isFinite(n) ? n : v
    })

    const result = await AccountingLocationsRegisterService.getLocationsRegister(payload, {
      search: searchParams.get('search') || '',
      statuses: parseListParam(searchParams, 'status'),
      branchIds,
      branchFilters: parseListParam(searchParams, 'branchFilter'),
      quickFilters: parseListParam(searchParams, 'quickFilter'),
      page: parseIntegerParam(searchParams.get('page'), 1),
      limit: parseIntegerParam(searchParams.get('limit'), 10),
    })

    return NextResponse.json({
      section: {
        id: 'locations',
        label: 'Locations',
        description: 'Maintain location records with location code, name, optional branch link, status, and notes.',
        searchPlaceholder: 'Search location code, name, branch, status, or notes',
        filters: result.filterOptions,
        metrics: result.metrics,
        table: {
          title: 'Location Register',
          description: 'Location master records using code, name, branch relationship, and status.',
          columns: ['Location Code', 'Name', 'Branch', 'Created By', 'Updated By', 'Status'],
          rows: result.rows.map((row) => ({
            id: row.id,
            locationCode: row.locationCode,
            name: row.name,
            status: row.status,
            statusLabel: row.statusLabel,
            branchId: row.branchId,
            branchCode: row.branchCode,
            branchName: row.branchName,
            createdBy: row.createdBy,
            updatedBy: row.updatedBy,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt,
            cells: row.cells,
          })),
        },
      },
      appliedFilters: result.appliedFilters,
      pagination: result.pagination,
      totals: result.totals,
    })
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
