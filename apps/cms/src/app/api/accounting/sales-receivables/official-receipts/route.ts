import { NextRequest, NextResponse } from 'next/server'
import { ACCOUNTING_COLLECTION_SLUGS, LMS_RECEIPT_STATUS_OPTIONS } from '@/accounting/constants/accounting'
import { findAllDocs } from '@/accounting/utils/findAllDocs'
import { handleAccountingApiError, requireAccountingAdmin } from '../../_utils/auth'
import {
  buildCustomerLabel,
  buildPaymentLabel,
  buildReceiptMutationData,
  formatCurrency,
  mapReceiptRow,
  matchesSelectedReceiptFilters,
  normalizeReceiptMutationBody,
  normalizeSearch,
  parseIntegerParam,
  parseListParam,
  type PaymentDoc,
  type ReceiptDoc,
} from './_shared'

type CustomerDoc = {
  id: number | string
  customerCode?: string | null
  displayName?: string | null
  status?: string | null
}

type MediaDoc = {
  id: number | string
  filename?: string | null
  alt?: string | null
  url?: string | null
}

export async function POST(request: NextRequest) {
  try {
    const { payload, user } = await requireAccountingAdmin(request)
    const body = normalizeReceiptMutationBody(await request.json())
    const { data } = await buildReceiptMutationData(payload, body)

    const record = await payload.create({
      collection: ACCOUNTING_COLLECTION_SLUGS.receipts,
      overrideAccess: true,
      data: {
        ...data,
        createdBy: user.id,
        updatedBy: user.id,
      } as never,
      depth: 0,
    })

    return NextResponse.json({ id: record.id }, { status: 201 })
  } catch (error) {
    return handleAccountingApiError(error)
  }
}

export async function GET(request: NextRequest) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const { searchParams } = new URL(request.url)

    const search = searchParams.get('search') || ''
    const statuses = parseListParam(searchParams, 'status')
    const customerIds = parseListParam(searchParams, 'customerId')
    const proofStates = parseListParam(searchParams, 'proofState')
    const quickFilters = parseListParam(searchParams, 'quickFilter')
    const page = Math.max(1, parseIntegerParam(searchParams.get('page'), 1))
    const limit = Math.min(100, Math.max(1, parseIntegerParam(searchParams.get('limit'), 10)))

    const [receiptDocs, paymentDocs, customerDocs, mediaDocs] = await Promise.all([
      findAllDocs<ReceiptDoc>({
        payload,
        collection: ACCOUNTING_COLLECTION_SLUGS.receipts,
        depth: 2,
        sort: '-receiptDate',
      }),
      findAllDocs<PaymentDoc>({
        payload,
        collection: ACCOUNTING_COLLECTION_SLUGS.paymentsReceived,
        depth: 1,
        sort: '-paymentDate',
      }),
      findAllDocs<CustomerDoc>({
        payload,
        collection: ACCOUNTING_COLLECTION_SLUGS.customers,
        depth: 0,
        sort: 'displayName',
      }),
      findAllDocs<MediaDoc>({
        payload,
        collection: 'media',
        depth: 0,
        sort: '-updatedAt',
      }),
    ])

    const allRows = receiptDocs.map(mapReceiptRow)
    const normalizedSearch = normalizeSearch(search)
    const filteredRows = allRows.filter((row) => {
      if (normalizedSearch && !row.searchableText.includes(normalizedSearch)) return false
      return matchesSelectedReceiptFilters(row, {
        statuses,
        customerIds,
        proofStates,
        quickFilters,
      })
    })

    const linkedReceiptIdByPaymentId = new Map(
      receiptDocs
        .map((receipt) => [receipt.paymentReceived, receipt.id] as const)
        .map(([paymentReceived, receiptId]) => {
          const paymentId =
            typeof paymentReceived === 'object' && paymentReceived
              ? String(paymentReceived.id || '')
              : String(paymentReceived || '')
          return [paymentId, String(receiptId)] as const
        })
        .filter(([paymentId]) => Boolean(paymentId)),
    )

    const totalDocs = filteredRows.length
    const totalPages = Math.max(1, Math.ceil(totalDocs / limit))
    const paginatedRows = filteredRows.slice((page - 1) * limit, page * limit)

    const draftReceipts = filteredRows.filter((row) => row.status === 'draft').length
    const issuedReceipts = filteredRows.filter((row) => row.status === 'issued').length
    const voidedReceipts = filteredRows.filter((row) => row.status === 'voided').length
    const proofCount = filteredRows.filter((row) => Boolean(row.proofDocumentId)).length

    return NextResponse.json({
      rows: paginatedRows,
      metrics: [
        {
          id: 'official-receipt-draft',
          label: 'Draft ORs',
          value: draftReceipts,
          change: 'Prepared before final issuance',
          trend: 'neutral',
        },
        {
          id: 'official-receipt-issued',
          label: 'Issued ORs',
          value: issuedReceipts,
          change: 'Linked to payments received',
          trend: 'up',
        },
        {
          id: 'official-receipt-voided',
          label: 'Voided ORs',
          value: voidedReceipts,
          change: 'Retained for audit visibility',
          trend: 'down',
        },
        {
          id: 'official-receipt-proof',
          label: 'With Proof Documents',
          value: proofCount,
          change: 'Issued receipts with proof attached',
          trend: 'up',
        },
      ],
      filterOptions: {
        statuses: LMS_RECEIPT_STATUS_OPTIONS.map((option) => ({ label: option.label, value: option.value })),
        customers: customerDocs
          .filter((customer) => customer.status !== 'inactive' && customer.status !== 'archived')
          .map((customer) => ({
            label: `${customer.customerCode ? `${customer.customerCode} - ` : ''}${customer.displayName || `Customer ${customer.id}`}`,
            value: String(customer.id),
          })),
        proofStates: [
          { label: 'With Proof', value: 'with_proof' },
          { label: 'Missing Proof', value: 'missing_proof' },
        ],
        quickFilters: [
          { label: 'Draft', value: 'status:draft' },
          { label: 'Issued', value: 'status:issued' },
          { label: 'Voided', value: 'status:voided' },
          { label: 'With Proof', value: 'proof:with_proof' },
          { label: 'Missing Proof', value: 'proof:missing_proof' },
        ],
      },
      appliedFilters: {
        search,
        statuses,
        customerIds,
        proofStates,
        quickFilters,
      },
      meta: {
        id: 'official-receipts',
        label: 'Official Receipts',
        description: 'Manage official receipt issuance tied to payments received, customers, receipt dates, and proof documents.',
        searchPlaceholder: 'Search OR no., customer, payment ref, issued by, or receipt date',
        tableTitle: 'Official Receipt Register',
        tableDescription: 'Receipt register linked to payments received, customers, issue dates, and proof documents.',
        columns: ['OR No.', 'Receipt Date', 'Customer', 'Payment Ref', { label: 'Amount', align: 'right' }, 'Status'],
      },
      pagination: {
        page,
        limit,
        totalDocs,
        totalPages,
        hasPrevPage: page > 1,
        hasNextPage: page < totalPages,
      },
      totals: {
        totalRows: allRows.length,
        filteredRows: totalDocs,
      },
      referenceData: {
        payments: paymentDocs.map((payment) => ({
          id: payment.id,
          receiptNumber: String(payment.receiptNumber || `Receipt ${payment.id}`),
          paymentDate: payment.paymentDate || payment.postingDate || null,
          paymentDateLabel:
            payment.paymentDate || payment.postingDate
              ? new Intl.DateTimeFormat('en-CA', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                }).format(new Date(payment.paymentDate || payment.postingDate || ''))
              : '-',
          amountReceived: Number(payment.amountReceived || 0),
          amountReceivedLabel: formatCurrency(Number(payment.amountReceived || 0), String(payment.currency || 'PHP')),
          currency: String(payment.currency || 'PHP'),
          customerId:
            typeof payment.customer === 'object' && payment.customer ? String(payment.customer.id || '') : String(payment.customer || ''),
          customerLabel: buildCustomerLabel(payment.customer),
          referenceNumber: String(payment.referenceNumber || ''),
          status: String(payment.status || ''),
          statusLabel:
            String(payment.status || '') === 'posted'
              ? 'Posted'
              : String(payment.status || '') === 'draft'
                ? 'Draft'
                : String(payment.status || '') === 'voided'
                  ? 'Voided'
                  : String(payment.status || '-'),
          linkedOfficialReceiptId: linkedReceiptIdByPaymentId.get(String(payment.id)) || '',
          label: `${buildPaymentLabel(payment)} • ${buildCustomerLabel(payment.customer)} • ${formatCurrency(Number(payment.amountReceived || 0), String(payment.currency || 'PHP'))}`,
        })),
        mediaDocuments: mediaDocs.map((media) => ({
          id: media.id,
          filename: String(media.filename || media.alt || `Media ${media.id}`),
          url: String(media.url || ''),
        })),
      },
    })
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
