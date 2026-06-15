import { NextRequest, NextResponse } from 'next/server'
import { AccountingVendorRegisterService } from '@/accounting/services/vendors/AccountingVendorRegisterService'
import type { AccountingPartyStatus, AccountingVendorType } from '@/accounting/types/accounting'
import { handleAccountingApiError, requireAccountingAdmin } from '@/app/api/accounting/_utils/auth'

const parseIntegerParam = (value: string | null, fallback: number) => {
  if (!value) {
    return fallback
  }

  const parsedValue = Number(value)
  return Number.isFinite(parsedValue) ? parsedValue : fallback
}

const parseListParam = <T extends string>(searchParams: URLSearchParams, key: string): T[] => {
  const values = searchParams
    .getAll(key)
    .flatMap((value) => String(value || '').split(','))
    .map((value) => value.trim())
    .filter(Boolean)

  return Array.from(new Set(values)) as T[]
}

export async function GET(request: NextRequest) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const { searchParams } = new URL(request.url)

    const result = await AccountingVendorRegisterService.getVendorMasterRegister(payload, {
      search: searchParams.get('search') || '',
      statuses: parseListParam<AccountingPartyStatus>(searchParams, 'status'),
      vendorTypes: parseListParam<AccountingVendorType>(searchParams, 'vendorType'),
      quickFilters: parseListParam(searchParams, 'quickFilter'),
      page: parseIntegerParam(searchParams.get('page'), 1),
      limit: parseIntegerParam(searchParams.get('limit'), 10),
    })

    return NextResponse.json({
      section: {
        id: 'vendors',
        label: 'Vendors',
        description:
          'Manage vendor master records with codes, type, contacts, tax profile, currency, payment terms, and status.',
        searchPlaceholder: 'Search vendor code, display name, type, email, or status',
        filters: result.filterOptions,
        metrics: result.metrics,
        table: {
          title: 'Vendor Master Register',
          description:
            'Vendor records using vendor code, type, currency, payment terms, and status.',
          columns: [
            'Vendor Code',
            'Display Name',
            'Type',
            'Currency',
            'Payment Terms',
            'Status',
          ],
          rows: result.rows.map((row) => ({
            id: row.id,
            vendorId: row.id,
            vendorCode: row.vendorCode,
            displayName: row.displayName,
            type: row.vendorType,
            typeLabel: row.vendorTypeLabel,
            currency: row.currency,
            currencyReferenceId: row.currencyReferenceId,
            paymentTerms: row.paymentTerms,
            paymentTermReferenceId: row.paymentTermReferenceId,
            status: row.status,
            statusLabel: row.statusLabel,
            email: row.email,
            legalName: row.legalName,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt,
            cells: [
              row.vendorCode,
              row.displayName,
              row.vendorTypeLabel,
              row.currency,
              row.paymentTerms || '-',
              row.statusLabel,
            ],
          })),
        },
      },
      appliedFilters: result.appliedFilters,
      pagination: result.pagination,
      referenceData: result.referenceData,
      totals: result.totals,
    })
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
