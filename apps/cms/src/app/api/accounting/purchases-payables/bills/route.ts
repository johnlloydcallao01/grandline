import { NextRequest, NextResponse } from 'next/server'
import { ACCOUNTING_COLLECTION_SLUGS, ACCOUNTING_HOOK_CONTEXT, DOCUMENT_STATUS_OPTIONS } from '@/accounting/constants/accounting'
import { AccountingBillService } from '@/accounting/services/bills/AccountingBillService'
import { findAllDocs } from '@/accounting/utils/findAllDocs'
import { handleAccountingApiError, requireAccountingAdmin } from '../../_utils/auth'
import {
  assertBillMutationPayload,
  buildBillDetailResponse,
  buildBillRow,
  buildBillsMetrics,
  buildBillsReferenceData,
  matchesSelectedBillFilters,
  normalizeBillMutationBody,
  normalizeSearch,
  parseIntegerParam,
  parseListParam,
  type BillDoc,
  type BillLineDoc,
} from './_shared'

export async function GET(request: NextRequest) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const { searchParams } = new URL(request.url)

    const search = searchParams.get('search') || ''
    const statuses = parseListParam(searchParams, 'status')
    const vendorIds = parseListParam(searchParams, 'vendorId')
    const quickFilters = parseListParam(searchParams, 'quickFilter')
    const page = Math.max(1, parseIntegerParam(searchParams.get('page'), 1))
    const limit = Math.min(100, Math.max(1, parseIntegerParam(searchParams.get('limit'), 10)))

    const [billDocs, billLineDocs, referenceData] = await Promise.all([
      findAllDocs<BillDoc>({
        payload,
        collection: ACCOUNTING_COLLECTION_SLUGS.bills,
        depth: 1,
        sort: '-billDate',
      }),
      findAllDocs<BillLineDoc>({
        payload,
        collection: ACCOUNTING_COLLECTION_SLUGS.billLineItems,
        depth: 0,
        sort: 'lineNumber',
      }),
      buildBillsReferenceData(payload),
    ])

    const rows = billDocs.map(buildBillRow)
    const filteredRows = rows.filter((row) => {
      const normalizedQuery = normalizeSearch(search)
      if (normalizedQuery && !row.searchableText.includes(normalizedQuery)) return false
      return matchesSelectedBillFilters(row, {
        statuses,
        vendorIds,
        quickFilters,
      })
    })

    const totalDocs = filteredRows.length
    const totalPages = Math.max(1, Math.ceil(totalDocs / limit))
    const currentPage = Math.min(page, totalPages)
    const paginatedRows = filteredRows.slice((currentPage - 1) * limit, currentPage * limit)
    const mutableBillIds = new Set(
      billDocs
        .filter((bill) => ['draft', 'approved'].includes(String(bill.status || '')))
        .map((bill) => String(bill.id)),
    )
    const lineCoverage = new Set(
      billLineDocs
        .map((line) => String(line.bill || ''))
        .filter(Boolean),
    )

    return NextResponse.json({
      rows: paginatedRows,
      metrics: buildBillsMetrics(filteredRows),
      filterOptions: {
        statuses: DOCUMENT_STATUS_OPTIONS.map((option) => ({ label: option.label, value: option.value })),
        vendors: referenceData.vendors.map((vendor) => ({
          label: `${vendor.vendorCode ? `${vendor.vendorCode} - ` : ''}${vendor.displayName || `Vendor ${vendor.id}`}`,
          value: String(vendor.id),
        })),
        quickFilters: [
          { label: 'Draft', value: 'status:draft' },
          { label: 'Approved', value: 'status:approved' },
          { label: 'Posted', value: 'status:posted' },
          { label: 'Partially Paid', value: 'status:partially_paid' },
          { label: 'Open Balance', value: 'balance:open' },
          { label: 'Due This Week', value: 'due:this_week' },
        ],
      },
      appliedFilters: {
        search,
        statuses,
        vendorIds,
        quickFilters,
      },
      meta: {
        id: 'bills',
        label: 'Bills',
        description:
          'Create, review, and post vendor bills with due dates, totals, balances, and status tracking.',
        searchPlaceholder: 'Search bill no., vendor, reference no., memo, or due date',
        tableTitle: 'Vendor Bill Register',
        tableDescription:
          'Primary bill register based on the bill document collection and payable status fields.',
        columns: ['Bill No.', 'Bill Date', 'Vendor', 'Due Date', { label: 'Total', align: 'right' }, 'Status'],
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
      flags: {
        mutableBillIds: Array.from(mutableBillIds),
        billIdsWithLines: Array.from(lineCoverage),
      },
    })
  } catch (error) {
    return handleAccountingApiError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const { payload, user } = await requireAccountingAdmin(request)
    const body = normalizeBillMutationBody((await request.json()) as Record<string, unknown>)

    await assertBillMutationPayload(payload, body)

    const bill = await payload.create({
      collection: ACCOUNTING_COLLECTION_SLUGS.bills as any,
      overrideAccess: true,
      depth: 1,
      data: {
        billNumber: body.billNumber,
        vendor: body.vendor,
        billDate: body.billDate,
        postingDate: body.postingDate,
        dueDate: body.dueDate,
        status: body.status || 'draft',
        currency: body.currency || 'PHP',
        exchangeRate: body.exchangeRate ?? 1,
        referenceNumber: body.referenceNumber,
        memo: body.memo,
        payableAccountOverride: body.payableAccountOverride,
        notes: body.notes,
        createdBy: user.id,
        updatedBy: user.id,
      } as any,
    }) as any

    for (const line of body.lines || []) {
      await payload.create({
        collection: ACCOUNTING_COLLECTION_SLUGS.billLineItems as any,
        overrideAccess: true,
        depth: 0,
        context: {
          [ACCOUNTING_HOOK_CONTEXT.skipBillTotalsSync]: true,
        },
        data: {
          bill: bill.id,
          lineNumber: line.lineNumber,
          description: line.description,
          quantity: line.quantity,
          unitPrice: line.unitPrice,
          taxCode: line.taxCode,
          expenseAccount: line.expenseAccount,
          assetAccount: line.assetAccount,
          payableAccountOverride: line.payableAccountOverride,
          createdBy: user.id,
          updatedBy: user.id,
        } as any,
      })
    }

    await AccountingBillService.syncTotals(payload, bill.id)

    const createdBill = await payload.findByID({
      collection: ACCOUNTING_COLLECTION_SLUGS.bills as any,
      id: bill.id,
      depth: 1,
      overrideAccess: true,
    }) as any

    return NextResponse.json(await buildBillDetailResponse(payload, createdBill as BillDoc), { status: 201 })
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
