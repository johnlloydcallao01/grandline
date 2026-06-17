import { ACCOUNTING_COLLECTION_SLUGS, PAYMENT_METHOD_OPTIONS, SIMPLE_POSTING_STATUS_OPTIONS } from '@/accounting/constants/accounting'
import { AccountingCommercialService } from '@/accounting/services/AccountingCommercialService'
import { getRelationshipId } from '@/accounting/utils/accounting-audit'
import { normalizeAmount } from '@/accounting/utils/amounts'
import { parseNumberParam, requireAccountingAdmin } from '../../_utils/auth'

export type HistoryCell =
  | string
  | {
      text: string
      tone?: 'amber' | 'blue' | 'gray' | 'green' | 'red'
      emphasis?: boolean
      align?: 'left' | 'right' | 'center'
    }

type CustomerRelation =
  | {
      id?: number | string
      customerCode?: string | null
      displayName?: string | null
    }
  | number
  | string
  | null

type InvoiceRelation =
  | {
      id?: number | string
      invoiceNumber?: string | null
      balanceDue?: number | null
      status?: string | null
      customer?: CustomerRelation
    }
  | number
  | string
  | null

type BankAccountRelation =
  | {
      id?: number | string
      accountName?: string | null
      bankName?: string | null
      accountType?: string | null
      accountNumberMasked?: string | null
    }
  | number
  | string
  | null

type ChartAccountRelation =
  | {
      id?: number | string
      code?: string | null
      name?: string | null
    }
  | number
  | string
  | null

type FiscalYearRelation =
  | {
      id?: number | string
      code?: string | null
      name?: string | null
    }
  | number
  | string
  | null

type PeriodRelation =
  | {
      id?: number | string
      label?: string | null
      periodNumber?: number | null
    }
  | number
  | string
  | null

export type PaymentDoc = {
  id: number | string
  receiptNumber?: string | null
  customer?: CustomerRelation
  paymentDate?: string | null
  postingDate?: string | null
  paymentMethod?: string | null
  depositAccount?: BankAccountRelation
  undepositedFundsAccount?: ChartAccountRelation
  amountReceived?: number | null
  currency?: string | null
  exchangeRate?: number | null
  status?: string | null
  applications?:
    | Array<{
        invoice?: InvoiceRelation
        amountApplied?: number | null
      } | null>
    | null
  postedJournalEntry?:
    | {
        id?: number | string
      }
    | number
    | string
    | null
  referenceNumber?: string | null
  notes?: string | null
  fiscalYear?: FiscalYearRelation
  period?: PeriodRelation
  createdAt?: string | null
  updatedAt?: string | null
}

export type PaymentRegisterRow = {
  id: string
  receiptNumber: string
  paymentDate: string | null
  paymentDateLabel: string
  customerId: string
  customerLabel: string
  paymentMethod: string
  paymentMethodLabel: string
  depositAccountLabel: string
  undepositedFundsAccountLabel: string
  amountReceived: number
  amountReceivedLabel: string
  appliedAmount: number
  appliedAmountLabel: string
  unappliedAmount: number
  unappliedAmountLabel: string
  status: string
  statusLabel: string
  statusTone: 'amber' | 'blue' | 'gray' | 'green' | 'red'
  referenceNumber: string
  postedJournalEntryId: string
  searchableText: string
  cells: HistoryCell[]
}

type PaymentMutationApplication = {
  invoice?: unknown
  amountApplied?: unknown
}

const statusLabels = new Map<string, string>(SIMPLE_POSTING_STATUS_OPTIONS.map((option) => [option.value, option.label]))
const paymentMethodLabels = new Map<string, string>(PAYMENT_METHOD_OPTIONS.map((option) => [option.value, option.label]))

export const parseIntegerParam = (value: string | null, fallback: number) => {
  if (!value) return fallback
  const parsedValue = Number(value)
  return Number.isFinite(parsedValue) ? parsedValue : fallback
}

export const parseListParam = (searchParams: URLSearchParams, key: string): string[] =>
  Array.from(
    new Set(
      searchParams
        .getAll(key)
        .flatMap((value) => String(value || '').split(','))
        .map((value) => value.trim())
        .filter(Boolean),
    ),
  )

export const normalizeSearch = (value: unknown) => String(value ?? '').toLowerCase().trim()

export const buildSearchableText = (parts: Array<unknown>) =>
  parts
    .map((part) => normalizeSearch(part))
    .filter(Boolean)
    .join(' ')

export const formatDate = (value: string | null | undefined) => {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'

  return new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
}

export const formatCurrency = (value: number | null | undefined) =>
  new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value || 0))

export const getStatusTone = (status: string | null | undefined): 'amber' | 'blue' | 'gray' | 'green' | 'red' => {
  switch (String(status || '')) {
    case 'draft':
      return 'blue'
    case 'posted':
      return 'green'
    case 'voided':
      return 'red'
    default:
      return 'gray'
  }
}

export const buildCustomerLabel = (customer: CustomerRelation | undefined) => {
  if (!customer) return 'Unassigned Customer'
  if (typeof customer === 'number' || typeof customer === 'string') return String(customer)
  return `${customer.customerCode ? `${customer.customerCode} - ` : ''}${customer.displayName || `Customer ${customer.id || ''}`}`.trim()
}

export const buildCustomerId = (customer: CustomerRelation | undefined) => {
  if (!customer) return 'unassigned'
  if (typeof customer === 'number' || typeof customer === 'string') return String(customer)
  return String(customer.id || 'unassigned')
}

export const buildBankAccountLabel = (account: BankAccountRelation | undefined) => {
  if (!account) return '-'
  if (typeof account === 'number' || typeof account === 'string') return String(account)
  const parts = [
    account.accountName || 'Unnamed bank account',
    account.bankName || null,
    account.accountNumberMasked || null,
  ].filter(Boolean)
  return parts.join(' • ')
}

export const buildChartAccountLabel = (account: ChartAccountRelation | undefined) => {
  if (!account) return '-'
  if (typeof account === 'number' || typeof account === 'string') return String(account)
  return `${account.code ? `${account.code} - ` : ''}${account.name || 'Unnamed account'}`.trim()
}

export const buildFiscalYearLabel = (fiscalYear: FiscalYearRelation | undefined) => {
  if (!fiscalYear) return '-'
  if (typeof fiscalYear === 'number' || typeof fiscalYear === 'string') return String(fiscalYear)
  return `${fiscalYear.code ? `${fiscalYear.code} - ` : ''}${fiscalYear.name || 'Fiscal Year'}`
}

export const buildPeriodLabel = (period: PeriodRelation | undefined) => {
  if (!period) return '-'
  if (typeof period === 'number' || typeof period === 'string') return String(period)
  return String(period.label || (period.periodNumber ? `Period ${period.periodNumber}` : 'Period'))
}

export const getAppliedAmount = (applications: PaymentDoc['applications']) =>
  normalizeAmount((applications || []).reduce((total, application) => total + normalizeAmount(application?.amountApplied), 0))

export const mapPaymentRow = (payment: PaymentDoc): PaymentRegisterRow => {
  const amountReceived = normalizeAmount(payment.amountReceived)
  const appliedAmount = getAppliedAmount(payment.applications)
  const unappliedAmount = Math.max(0, normalizeAmount(amountReceived - appliedAmount))
  const customerLabel = buildCustomerLabel(payment.customer)
  const status = String(payment.status || '')
  const paymentMethod = String(payment.paymentMethod || '')
  const depositAccountLabel = buildBankAccountLabel(payment.depositAccount)
  const undepositedFundsAccountLabel = buildChartAccountLabel(payment.undepositedFundsAccount)

  return {
    id: String(payment.id),
    receiptNumber: String(payment.receiptNumber || `Receipt ${payment.id}`),
    paymentDate: payment.paymentDate || null,
    paymentDateLabel: formatDate(payment.paymentDate),
    customerId: buildCustomerId(payment.customer),
    customerLabel,
    paymentMethod,
    paymentMethodLabel: paymentMethodLabels.get(paymentMethod) || 'Unknown',
    depositAccountLabel,
    undepositedFundsAccountLabel,
    amountReceived,
    amountReceivedLabel: formatCurrency(amountReceived),
    appliedAmount,
    appliedAmountLabel: formatCurrency(appliedAmount),
    unappliedAmount,
    unappliedAmountLabel: formatCurrency(unappliedAmount),
    status,
    statusLabel: statusLabels.get(status) || 'Unknown',
    statusTone: getStatusTone(status),
    referenceNumber: String(payment.referenceNumber || ''),
    postedJournalEntryId: String(getRelationshipId(payment.postedJournalEntry) || ''),
    searchableText: buildSearchableText([
      payment.receiptNumber,
      customerLabel,
      paymentMethodLabels.get(paymentMethod) || paymentMethod,
      payment.referenceNumber,
      depositAccountLabel,
      undepositedFundsAccountLabel,
      formatCurrency(amountReceived),
      statusLabels.get(status),
    ]),
    cells: [
      { text: String(payment.receiptNumber || `Receipt ${payment.id}`), emphasis: true },
      formatDate(payment.paymentDate),
      customerLabel,
      paymentMethodLabels.get(paymentMethod) || 'Unknown',
      { text: formatCurrency(amountReceived), emphasis: true, align: 'right' },
      { text: statusLabels.get(status) || 'Unknown', tone: getStatusTone(status) },
    ],
  }
}

export const matchesPaymentQuickFilter = (row: PaymentRegisterRow, quickFilter: string) => {
  const [group, value] = quickFilter.split(':')

  if (group === 'status') {
    return row.status === value
  }

  if (group === 'application') {
    if (value === 'with_applications') return row.appliedAmount > 0
    if (value === 'unapplied') return row.unappliedAmount > 0
  }

  if (group === 'method') {
    return row.paymentMethod === value
  }

  return false
}

export const matchesSelectedPaymentFilters = (
  row: PaymentRegisterRow,
  filters: {
    statuses: string[]
    paymentMethods: string[]
    customerIds: string[]
    quickFilters: string[]
  },
) => {
  const predicates = [
    ...filters.statuses.map((status) => row.status === status),
    ...filters.paymentMethods.map((paymentMethod) => row.paymentMethod === paymentMethod),
    ...filters.customerIds.map((customerId) => row.customerId === customerId),
    ...filters.quickFilters.map((quickFilter) => matchesPaymentQuickFilter(row, quickFilter)),
  ]

  if (predicates.length === 0) {
    return true
  }

  return predicates.some(Boolean)
}

export const normalizeRelationshipId = (value: unknown) => {
  if (value === undefined || value === null || value === '') return null
  const stringValue = String(value).trim()
  if (!stringValue || stringValue === 'null' || stringValue === 'undefined') return null
  return parseNumberParam(stringValue)
}

export const normalizeOptionalString = (value: unknown) => {
  if (value === undefined) return undefined
  if (value === null) return null
  const normalized = String(value).trim()
  return normalized || null
}

export const normalizePaymentMutationBody = (body: Record<string, unknown>) => {
  const applications = Array.isArray(body.applications) ? (body.applications as PaymentMutationApplication[]) : undefined

  return {
    ...(body.receiptNumber !== undefined ? { receiptNumber: normalizeOptionalString(body.receiptNumber) } : {}),
    ...(body.customer !== undefined ? { customer: normalizeRelationshipId(body.customer) } : {}),
    ...(body.paymentDate !== undefined ? { paymentDate: normalizeOptionalString(body.paymentDate) } : {}),
    ...(body.postingDate !== undefined ? { postingDate: normalizeOptionalString(body.postingDate) } : {}),
    ...(body.paymentMethod !== undefined ? { paymentMethod: String(body.paymentMethod || '') } : {}),
    ...(body.depositAccount !== undefined ? { depositAccount: normalizeRelationshipId(body.depositAccount) } : {}),
    ...(body.undepositedFundsAccount !== undefined
      ? { undepositedFundsAccount: normalizeRelationshipId(body.undepositedFundsAccount) }
      : {}),
    ...(body.amountReceived !== undefined ? { amountReceived: normalizeAmount(body.amountReceived) } : {}),
    ...(body.currency !== undefined ? { currency: normalizeOptionalString(body.currency) } : {}),
    ...(body.exchangeRate !== undefined ? { exchangeRate: Number(body.exchangeRate || 0) } : {}),
    ...(body.referenceNumber !== undefined ? { referenceNumber: normalizeOptionalString(body.referenceNumber) } : {}),
    ...(body.notes !== undefined ? { notes: normalizeOptionalString(body.notes) } : {}),
    ...(body.status !== undefined ? { status: String(body.status || 'draft') } : {}),
    ...(applications !== undefined
      ? {
          applications: applications.map((application) => ({
            invoice: normalizeRelationshipId(application.invoice),
            amountApplied: normalizeAmount(application.amountApplied),
          })),
        }
      : {}),
  }
}

const assertRelationshipExists = async (
  payload: Awaited<ReturnType<typeof requireAccountingAdmin>>['payload'],
  collection: string,
  relationshipId: string | number | null,
  label: string,
) => {
  if (relationshipId === null) return

  await payload
    .findByID({
      collection: collection as never,
      id: relationshipId,
      depth: 0,
      overrideAccess: true,
    })
    .catch(() => {
      throw new Error(`${label} with ID "${String(relationshipId)}" was not found.`)
    })
}

export const assertPaymentMutationPayload = async (
  payload: Awaited<ReturnType<typeof requireAccountingAdmin>>['payload'],
  body: ReturnType<typeof normalizePaymentMutationBody>,
) => {
  if ('customer' in body) {
    if (!body.customer) throw new Error('Customer is required.')
    await assertRelationshipExists(payload, ACCOUNTING_COLLECTION_SLUGS.customers, body.customer, 'Customer')
  }

  if ('paymentDate' in body && !body.paymentDate) throw new Error('Payment date is required.')
  if ('postingDate' in body && !body.postingDate) throw new Error('Posting date is required.')

  if ('paymentMethod' in body) {
    if (!body.paymentMethod) throw new Error('Payment method is required.')
    if (!PAYMENT_METHOD_OPTIONS.some((option) => option.value === body.paymentMethod)) {
      throw new Error('Payment method is invalid.')
    }
  }

  if ('depositAccount' in body) {
    await assertRelationshipExists(payload, ACCOUNTING_COLLECTION_SLUGS.bankAccounts, body.depositAccount || null, 'Deposit account')
  }

  if ('undepositedFundsAccount' in body) {
    await assertRelationshipExists(
      payload,
      ACCOUNTING_COLLECTION_SLUGS.chartOfAccounts,
      body.undepositedFundsAccount || null,
      'Undeposited funds account',
    )
  }

  if (body.amountReceived !== undefined && body.amountReceived <= 0) {
    throw new Error('Amount received must be greater than zero.')
  }

  if (body.exchangeRate !== undefined && (!Number.isFinite(body.exchangeRate) || body.exchangeRate <= 0)) {
    throw new Error('Exchange rate must be greater than zero.')
  }

  if ('status' in body && body.status && body.status !== 'draft') {
    throw new Error('Payments received may only be saved in Draft status. Use Post to finalize the document.')
  }

  if (body.applications) {
    await AccountingCommercialService.validateInvoiceApplications(payload, body.applications, body.customer)
    const appliedAmount = AccountingCommercialService.getAppliedAmountFromArray(body.applications)
    if (body.amountReceived !== undefined && appliedAmount > body.amountReceived) {
      throw new Error('Applied invoice allocations cannot exceed the received amount.')
    }
  }
}

export const buildPaymentDetailResponse = (payment: PaymentDoc) => {
  const amountReceived = normalizeAmount(payment.amountReceived)
  const appliedAmount = getAppliedAmount(payment.applications)
  const unappliedAmount = Math.max(0, normalizeAmount(amountReceived - appliedAmount))
  const status = String(payment.status || '')
  const paymentMethod = String(payment.paymentMethod || '')

  return {
    id: String(payment.id),
    receiptNumber: String(payment.receiptNumber || `Receipt ${payment.id}`),
    customerId: String(getRelationshipId(payment.customer) || ''),
    customerLabel: buildCustomerLabel(payment.customer),
    paymentDate: payment.paymentDate || null,
    paymentDateLabel: formatDate(payment.paymentDate),
    postingDate: payment.postingDate || null,
    postingDateLabel: formatDate(payment.postingDate),
    paymentMethod,
    paymentMethodLabel: paymentMethodLabels.get(paymentMethod) || 'Unknown',
    depositAccountId: String(getRelationshipId(payment.depositAccount) || ''),
    depositAccountLabel: buildBankAccountLabel(payment.depositAccount),
    undepositedFundsAccountId: String(getRelationshipId(payment.undepositedFundsAccount) || ''),
    undepositedFundsAccountLabel: buildChartAccountLabel(payment.undepositedFundsAccount),
    amountReceived,
    amountReceivedLabel: formatCurrency(amountReceived),
    appliedAmount,
    appliedAmountLabel: formatCurrency(appliedAmount),
    unappliedAmount,
    unappliedAmountLabel: formatCurrency(unappliedAmount),
    currency: String(payment.currency || 'PHP'),
    exchangeRate: Number(payment.exchangeRate || 1),
    status,
    statusLabel: statusLabels.get(status) || 'Unknown',
    statusTone: getStatusTone(status),
    referenceNumber: String(payment.referenceNumber || ''),
    notes: String(payment.notes || ''),
    postedJournalEntryId: String(getRelationshipId(payment.postedJournalEntry) || ''),
    fiscalYearId: String(getRelationshipId(payment.fiscalYear) || ''),
    fiscalYearLabel: buildFiscalYearLabel(payment.fiscalYear),
    periodId: String(getRelationshipId(payment.period) || ''),
    periodLabel: buildPeriodLabel(payment.period),
    createdAt: payment.createdAt || null,
    updatedAt: payment.updatedAt || null,
    applications: (payment.applications || []).map((application, index) => {
      const invoice = application?.invoice
      const invoiceStatus = typeof invoice === 'object' && invoice ? String(invoice.status || '') : ''
      return {
        id: `${payment.id}-application-${index + 1}`,
        invoiceId: String(getRelationshipId(invoice) || ''),
        invoiceLabel:
          typeof invoice === 'object' && invoice
            ? String(invoice.invoiceNumber || `Invoice ${invoice.id || ''}`)
            : String(invoice || ''),
        invoiceBalanceDue:
          typeof invoice === 'object' && invoice ? normalizeAmount(invoice.balanceDue) : 0,
        invoiceBalanceDueLabel:
          typeof invoice === 'object' && invoice ? formatCurrency(invoice.balanceDue) : formatCurrency(0),
        invoiceStatus,
        invoiceStatusLabel: invoiceStatus ? invoiceStatus.split('_').join(' ').replace(/\b\w/g, (char) => char.toUpperCase()) : '-',
        amountApplied: normalizeAmount(application?.amountApplied),
        amountAppliedLabel: formatCurrency(application?.amountApplied),
      }
    }),
    usageSummary: {
      applicationCount: Array.isArray(payment.applications) ? payment.applications.length : 0,
      hasPostedJournalEntry: Boolean(getRelationshipId(payment.postedJournalEntry)),
      canEdit: !['posted', 'voided'].includes(status),
      canDelete: !['posted', 'voided'].includes(status),
    },
  }
}
