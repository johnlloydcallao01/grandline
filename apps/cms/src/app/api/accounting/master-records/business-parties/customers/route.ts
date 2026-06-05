import { NextRequest, NextResponse } from 'next/server'
import { AccountingCustomerRegisterService } from '@/accounting/services/customers/AccountingCustomerRegisterService'
import type { AccountingCustomerType, AccountingPartyStatus } from '@/accounting/types/accounting'
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

const parseBooleanParam = (value: string | null) => {
  if (!value) {
    return false
  }

  return ['1', 'true', 'yes'].includes(value.trim().toLowerCase())
}

export async function GET(request: NextRequest) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const { searchParams } = new URL(request.url)

    const result = await AccountingCustomerRegisterService.getCustomerMasterRegister(payload, {
      search: searchParams.get('search') || '',
      statuses: parseListParam<AccountingPartyStatus>(searchParams, 'status'),
      customerTypes: parseListParam<AccountingCustomerType>(searchParams, 'customerType'),
      hasCreditLimit: parseBooleanParam(searchParams.get('hasCreditLimit')),
      page: parseIntegerParam(searchParams.get('page'), 1),
      limit: parseIntegerParam(searchParams.get('limit'), 10),
    })

    return NextResponse.json({
      section: {
        id: 'customers',
        label: 'Customers',
        description:
          'Manage customer master records with codes, type, contacts, tax profile, currency, terms, and credit limit.',
        searchPlaceholder: 'Search customer code, display name, type, email, or status',
        filters: result.filterOptions,
        metrics: result.metrics,
        table: {
          title: 'Customer Master Register',
          description:
            'Customer records using customer code, type, currency, payment terms, and status.',
          columns: [
            'Customer Code',
            'Display Name',
            'Type',
            'Currency',
            'Payment Terms',
            'Status',
          ],
          rows: result.rows.map((row) => ({
            id: row.id,
            customerId: row.id,
            customerCode: row.customerCode,
            displayName: row.displayName,
            type: row.customerType,
            typeLabel: row.customerTypeLabel,
            currency: row.currency,
            currencyReferenceId: row.currencyReferenceId,
            paymentTerms: row.paymentTerms,
            paymentTermReferenceId: row.paymentTermReferenceId,
            status: row.status,
            statusLabel: row.statusLabel,
            creditLimit: row.creditLimit,
            hasCreditLimit: row.hasCreditLimit,
            email: row.email,
            legalName: row.legalName,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt,
            cells: [
              row.customerCode,
              row.displayName,
              row.customerTypeLabel,
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
