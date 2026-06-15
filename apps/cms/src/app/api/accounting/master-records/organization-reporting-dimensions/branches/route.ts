import { NextRequest, NextResponse } from 'next/server'
import { AccountingBranchesRegisterService } from '@/accounting/services/branches/AccountingBranchesRegisterService'
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

    const result = await AccountingBranchesRegisterService.getBranchesRegister(payload, {
      search: searchParams.get('search') || '',
      statuses: parseListParam(searchParams, 'status'),
      addressFilter: searchParams.get('addressFilter') || '',
      quickFilters: parseListParam(searchParams, 'quickFilter'),
      page: parseIntegerParam(searchParams.get('page'), 1),
      limit: parseIntegerParam(searchParams.get('limit'), 10),
    })

    return NextResponse.json({
      section: {
        id: 'branches',
        label: 'Branches',
        description: 'Maintain branch master records with branch code, name, status, address, and audit fields.',
        searchPlaceholder: 'Search branch code, branch name, status, or address',
        filters: result.filterOptions,
        metrics: result.metrics,
        table: {
          title: 'Branch Register',
          description: 'Branch master records using branch code, name, address, and status.',
          columns: ['Branch Code', 'Name', 'Address', 'Created By', 'Updated By', 'Status'],
          rows: result.rows.map((row) => ({
            id: row.id,
            branchCode: row.branchCode,
            name: row.name,
            status: row.status,
            statusLabel: row.statusLabel,
            address: row.address,
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
