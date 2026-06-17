import { NextRequest, NextResponse } from 'next/server'
import { ACCOUNTING_COLLECTION_SLUGS } from '@/accounting/constants/accounting'
import { findAllDocs } from '@/accounting/utils/findAllDocs'
import { handleAccountingApiError, requireAccountingAdmin } from '../../_utils/auth'
import {
  assertVendorCreditMutationPayload,
  buildVendorCreditMetrics,
  buildVendorCreditRow,
  buildVendorCreditsReferenceData,
  matchesSelectedVendorCreditFilters,
  normalizeSearch,
  normalizeVendorCreditMutationBody,
  parseIntegerParam,
  parseListParam,
  type VendorCreditDoc,
} from './_shared'

export async function GET(request: NextRequest) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const { searchParams } = new URL(request.url)

    const search = searchParams.get('search') || ''
    const statuses = parseListParam(searchParams, 'status')
    const vendorIds = parseListParam(searchParams, 'vendorId')
    const balanceStates = parseListParam(searchParams, 'balance')
    const quickFilters = parseListParam(searchParams, 'quickFilter')
    const page = Math.max(1, parseIntegerParam(searchParams.get('page'), 1))
    const limit = Math.min(100, Math.max(1, parseIntegerParam(searchParams.get('limit'), 10)))

    const [vendorCredits, referenceData] = await Promise.all([
      findAllDocs<VendorCreditDoc>({
        payload,
        collection: ACCOUNTING_COLLECTION_SLUGS.vendorCredits,
        depth: 2,
        sort: '-creditDate',
      }),
      buildVendorCreditsReferenceData(payload),
    ])

    const rows = vendorCredits.map(buildVendorCreditRow)
    const normalizedQuery = normalizeSearch(search)
    const filteredRows = rows.filter((row) => {
      if (normalizedQuery && !row.searchableText.includes(normalizedQuery)) {
        return false
      }

      return matchesSelectedVendorCreditFilters(row, {
        statuses,
        vendorIds,
        balanceStates,
        quickFilters,
      })
    })

    const totalDocs = filteredRows.length
    const totalPages = Math.max(1, Math.ceil(totalDocs / limit))
    const currentPage = Math.min(page, totalPages)
    const paginatedRows = filteredRows.slice((currentPage - 1) * limit, currentPage * limit)

    return NextResponse.json({
      rows: paginatedRows,
      metrics: buildVendorCreditMetrics(filteredRows),
      filterOptions: {
        statuses: [
          { label: 'Draft', value: 'draft' },
          { label: 'Approved', value: 'approved' },
          { label: 'Posted', value: 'posted' },
          { label: 'Partially Paid', value: 'partially_paid' },
          { label: 'Paid', value: 'paid' },
          { label: 'Voided', value: 'voided' },
        ],
        vendors: referenceData.vendors.map((vendor) => ({
          label: `${vendor.vendorCode ? `${vendor.vendorCode} - ` : ''}${vendor.displayName || `Vendor ${vendor.id}`}`,
          value: String(vendor.id),
        })),
        balanceStates: [
          { label: 'With Remaining', value: 'remaining' },
          { label: 'Fully Applied', value: 'fully_applied' },
        ],
        quickFilters: [
          { label: 'Draft', value: 'status:draft' },
          { label: 'Posted', value: 'status:posted' },
          { label: 'Partially Applied', value: 'status:partially_paid' },
          { label: 'With Remaining', value: 'balance:remaining' },
          { label: 'With Source Bill', value: 'coverage:with_source_bill' },
          { label: 'With Applications', value: 'coverage:with_applications' },
        ],
      },
      appliedFilters: {
        search,
        statuses,
        vendorIds,
        balanceStates,
        quickFilters,
      },
      meta: {
        id: 'vendor-credits',
        label: 'Vendor Credits',
        description:
          'Manage vendor credits that reduce payables through source bills, applications, and remaining balances.',
        searchPlaceholder: 'Search credit no., vendor, source bill, reason, or posting date',
        tableTitle: 'Vendor Credit Register',
        tableDescription:
          'Vendor credit records with source-bill references, totals, application progress, and remaining amounts.',
        columns: ['Credit No.', 'Credit Date', 'Vendor', 'Source Bill', { label: 'Remaining', align: 'right' }, 'Status'],
      },
      pagination: {
        page: currentPage,
        limit,
        totalDocs,
        totalPages,
        hasPrevPage: currentPage > 1,
        hasNextPage: currentPage < totalPages,
      },
      totals: {
        totalRows: rows.length,
        filteredRows: totalDocs,
      },
      referenceData,
    })
  } catch (error) {
    return handleAccountingApiError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const { payload, user } = await requireAccountingAdmin(request)
    const body = normalizeVendorCreditMutationBody(await request.json())
    await assertVendorCreditMutationPayload(payload, body)

    const record = await payload.create({
      collection: ACCOUNTING_COLLECTION_SLUGS.vendorCredits,
      overrideAccess: true,
      data: {
        ...body,
        createdBy: user.id,
        updatedBy: user.id,
      } as never,
      depth: 2,
    })

    return NextResponse.json(record, { status: 201 })
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
