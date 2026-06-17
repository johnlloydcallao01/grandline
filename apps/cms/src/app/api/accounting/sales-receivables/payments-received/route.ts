import { NextRequest, NextResponse } from 'next/server'
import { ACCOUNTING_COLLECTION_SLUGS, PAYMENT_METHOD_OPTIONS, SIMPLE_POSTING_STATUS_OPTIONS } from '@/accounting/constants/accounting'
import { findAllDocs } from '@/accounting/utils/findAllDocs'
import { normalizeAmount } from '@/accounting/utils/amounts'
import { handleAccountingApiError, requireAccountingAdmin } from '../../_utils/auth'
import {
  assertPaymentMutationPayload,
  buildCustomerLabel,
  formatCurrency,
  mapPaymentRow,
  matchesSelectedPaymentFilters,
  normalizePaymentMutationBody,
  normalizeSearch,
  parseIntegerParam,
  parseListParam,
  type PaymentDoc,
} from './_shared'

type CustomerDoc = {
  id: number | string
  customerCode?: string | null
  displayName?: string | null
  status?: string | null
}

type InvoiceDoc = {
  id: number | string
  invoiceNumber?: string | null
  status?: string | null
  balanceDue?: number | null
  customer?:
    | {
        id?: number | string
        customerCode?: string | null
        displayName?: string | null
      }
    | number
    | string
    | null
}

type BankAccountDoc = {
  id: number | string
  accountName?: string | null
  bankName?: string | null
  accountNumberMasked?: string | null
  accountType?: string | null
  isActive?: boolean | null
}

type ChartAccountDoc = {
  id: number | string
  code?: string | null
  name?: string | null
  isActive?: boolean | null
}

export async function POST(request: NextRequest) {
  try {
    const { payload, user } = await requireAccountingAdmin(request)
    const body = normalizePaymentMutationBody(await request.json())
    await assertPaymentMutationPayload(payload, body)

    const record = await payload.create({
      collection: ACCOUNTING_COLLECTION_SLUGS.paymentsReceived,
      overrideAccess: true,
      data: {
        ...body,
        status: 'draft',
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
    const paymentMethods = parseListParam(searchParams, 'paymentMethod')
    const customerIds = parseListParam(searchParams, 'customerId')
    const quickFilters = parseListParam(searchParams, 'quickFilter')
    const page = Math.max(1, parseIntegerParam(searchParams.get('page'), 1))
    const limit = Math.min(100, Math.max(1, parseIntegerParam(searchParams.get('limit'), 10)))

    const [paymentDocs, customerDocs, invoiceDocs, bankAccountDocs, chartAccountDocs] = await Promise.all([
      findAllDocs<PaymentDoc>({
        payload,
        collection: ACCOUNTING_COLLECTION_SLUGS.paymentsReceived,
        depth: 2,
        sort: '-paymentDate',
      }),
      findAllDocs<CustomerDoc>({
        payload,
        collection: ACCOUNTING_COLLECTION_SLUGS.customers,
        depth: 0,
        sort: 'displayName',
      }),
      findAllDocs<InvoiceDoc>({
        payload,
        collection: ACCOUNTING_COLLECTION_SLUGS.invoices,
        depth: 1,
        sort: '-invoiceDate',
      }),
      findAllDocs<BankAccountDoc>({
        payload,
        collection: ACCOUNTING_COLLECTION_SLUGS.bankAccounts,
        depth: 0,
        sort: 'accountName',
      }),
      findAllDocs<ChartAccountDoc>({
        payload,
        collection: ACCOUNTING_COLLECTION_SLUGS.chartOfAccounts,
        depth: 0,
        sort: 'code',
      }),
    ])

    const allRows = paymentDocs.map(mapPaymentRow)
    const normalizedSearch = normalizeSearch(search)
    const filteredRows = allRows.filter((row) => {
      if (normalizedSearch && !row.searchableText.includes(normalizedSearch)) return false
      return matchesSelectedPaymentFilters(row, {
        statuses,
        paymentMethods,
        customerIds,
        quickFilters,
      })
    })

    const totalDocs = filteredRows.length
    const totalPages = Math.max(1, Math.ceil(totalDocs / limit))
    const paginatedRows = filteredRows.slice((page - 1) * limit, page * limit)

    const draftReceipts = filteredRows.filter((row) => row.status === 'draft').length
    const postedReceipts = filteredRows.filter((row) => row.status === 'posted').length
    const unappliedValue = filteredRows.reduce((sum, row) => sum + row.unappliedAmount, 0)
    const bankTransferVolume = filteredRows
      .filter((row) => row.paymentMethod === 'bank_transfer')
      .reduce((sum, row) => sum + row.amountReceived, 0)

    return NextResponse.json({
      rows: paginatedRows,
      metrics: [
        {
          id: 'draft-receipts',
          label: 'Draft Receipts',
          value: draftReceipts,
          change: 'Prepared before posting',
          trend: 'neutral',
        },
        {
          id: 'posted-receipts',
          label: 'Posted Receipts',
          value: postedReceipts,
          change: 'Registered customer collections',
          trend: 'up',
        },
        {
          id: 'unapplied-value',
          label: 'Unapplied Value',
          value: formatCurrency(unappliedValue),
          change: 'Receipts not yet fully allocated',
          trend: 'down',
        },
        {
          id: 'bank-transfer-volume',
          label: 'Bank Transfer Volume',
          value: formatCurrency(bankTransferVolume),
          change: 'Primary receipt method in the current view',
          trend: 'up',
        },
      ],
      filterOptions: {
        statuses: SIMPLE_POSTING_STATUS_OPTIONS.map((option) => ({ label: option.label, value: option.value })),
        paymentMethods: PAYMENT_METHOD_OPTIONS.map((option) => ({ label: option.label, value: option.value })),
        customers: customerDocs
          .filter((customer) => customer.status !== 'inactive' && customer.status !== 'archived')
          .map((customer) => ({
            label: `${customer.customerCode ? `${customer.customerCode} - ` : ''}${customer.displayName || `Customer ${customer.id}`}`,
            value: String(customer.id),
          })),
        quickFilters: [
          { label: 'Draft', value: 'status:draft' },
          { label: 'Posted', value: 'status:posted' },
          { label: 'Voided', value: 'status:voided' },
          { label: 'With Applications', value: 'application:with_applications' },
          { label: 'Unapplied', value: 'application:unapplied' },
          { label: 'Bank Transfer', value: 'method:bank_transfer' },
        ],
      },
      appliedFilters: {
        search,
        statuses,
        paymentMethods,
        customerIds,
        quickFilters,
      },
      meta: {
        id: 'payments-received',
        label: 'Payments Received',
        description:
          'Manage incoming customer payments with payment method, deposit routing, applications, and posting status.',
        searchPlaceholder: 'Search receipt no., customer, method, reference no., or deposit account',
        tableTitle: 'Payments Received Register',
        tableDescription: 'Customer payment records with application coverage, deposit routing, and posting status.',
        columns: ['Receipt No.', 'Payment Date', 'Customer', 'Method', { label: 'Amount', align: 'right' }, 'Status'],
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
        customers: customerDocs
          .filter((customer) => customer.status !== 'inactive' && customer.status !== 'archived')
          .map((customer) => ({
            id: customer.id,
            customerCode: customer.customerCode || null,
            displayName: customer.displayName || null,
          })),
        invoices: invoiceDocs
          .filter((invoice) => ['posted', 'partially_paid'].includes(String(invoice.status || '')))
          .map((invoice) => ({
            id: invoice.id,
            invoiceNumber: invoice.invoiceNumber || null,
            status: String(invoice.status || ''),
            balanceDue: normalizeAmount(invoice.balanceDue),
            customerId:
              typeof invoice.customer === 'object' && invoice.customer
                ? String(invoice.customer.id || '')
                : String(invoice.customer || ''),
            customerLabel: buildCustomerLabel(invoice.customer),
          })),
        bankAccounts: bankAccountDocs
          .filter((account) => account.isActive !== false)
          .map((account) => ({
            id: account.id,
            accountName: account.accountName || null,
            bankName: account.bankName || null,
            accountNumberMasked: account.accountNumberMasked || null,
            accountType: account.accountType || null,
          })),
        chartAccounts: chartAccountDocs
          .filter((account) => account.isActive !== false)
          .map((account) => ({
            id: account.id,
            code: account.code || null,
            name: account.name || null,
          })),
      },
    })
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
