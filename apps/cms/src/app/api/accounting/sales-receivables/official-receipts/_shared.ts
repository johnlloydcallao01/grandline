import { ACCOUNTING_COLLECTION_SLUGS, LMS_RECEIPT_STATUS_OPTIONS, SIMPLE_POSTING_STATUS_OPTIONS } from '@/accounting/constants/accounting'
import { getRelationshipId } from '@/accounting/utils/accounting-audit'
import { normalizeAmount } from '@/accounting/utils/amounts'

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

type PaymentRelation =
  | {
      id?: number | string
      receiptNumber?: string | null
      paymentDate?: string | null
      postingDate?: string | null
      amountReceived?: number | null
      currency?: string | null
      referenceNumber?: string | null
      status?: string | null
      customer?: CustomerRelation
    }
  | number
  | string
  | null

type UserRelation =
  | {
      id?: number | string
      email?: string | null
      firstName?: string | null
      lastName?: string | null
      name?: string | null
    }
  | number
  | string
  | null

type MediaRelation =
  | {
      id?: number | string
      filename?: string | null
      alt?: string | null
      url?: string | null
    }
  | number
  | string
  | null

export type PaymentDoc = {
  id: number | string
  receiptNumber?: string | null
  paymentDate?: string | null
  postingDate?: string | null
  amountReceived?: number | null
  currency?: string | null
  referenceNumber?: string | null
  status?: string | null
  customer?: CustomerRelation
}

export type ReceiptDoc = {
  id: number | string
  receiptNumber?: string | null
  paymentReceived?: PaymentRelation
  customer?: CustomerRelation
  receiptDate?: string | null
  amount?: number | null
  currency?: string | null
  status?: string | null
  proofDocument?: MediaRelation
  issuedBy?: UserRelation
  voidedAt?: string | null
  voidedBy?: UserRelation
  notes?: string | null
  createdAt?: string | null
  updatedAt?: string | null
}

export type ReceiptRegisterRow = {
  id: string
  receiptNumber: string
  paymentReceivedId: string
  paymentLabel: string
  paymentReferenceNumber: string
  customerId: string
  customerLabel: string
  receiptDate: string | null
  receiptDateLabel: string
  amount: number
  amountLabel: string
  currency: string
  status: string
  statusLabel: string
  statusTone: 'amber' | 'blue' | 'gray' | 'green' | 'red'
  proofDocumentId: string
  proofDocumentLabel: string
  issuedByLabel: string
  searchableText: string
  cells: HistoryCell[]
}

export type ReceiptMutationBody = {
  receiptNumber?: string | null
  paymentReceived: string
  proofDocument?: string | null
  notes?: string | null
}

const receiptStatusLabels = new Map<string, string>(LMS_RECEIPT_STATUS_OPTIONS.map((option) => [option.value, option.label]))
const paymentStatusLabels = new Map<string, string>(SIMPLE_POSTING_STATUS_OPTIONS.map((option) => [option.value, option.label]))

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

export const formatCurrency = (value: number | null | undefined, currency = 'PHP') =>
  new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: currency || 'PHP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value || 0))

export const getReceiptStatusTone = (status: string | null | undefined): 'amber' | 'blue' | 'gray' | 'green' | 'red' => {
  switch (String(status || '')) {
    case 'draft':
      return 'blue'
    case 'issued':
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

export const buildPaymentLabel = (payment: PaymentRelation | undefined) => {
  if (!payment) return 'Unlinked Payment'
  if (typeof payment === 'number' || typeof payment === 'string') return String(payment)
  return String(payment.receiptNumber || `Receipt ${payment.id || ''}`)
}

export const buildPaymentId = (payment: PaymentRelation | undefined) => {
  if (!payment) return ''
  if (typeof payment === 'number' || typeof payment === 'string') return String(payment)
  return String(payment.id || '')
}

export const buildMediaLabel = (media: MediaRelation | undefined) => {
  if (!media) return '-'
  if (typeof media === 'number' || typeof media === 'string') return String(media)
  return String(media.filename || media.alt || `Media ${media.id || ''}`)
}

export const buildMediaId = (media: MediaRelation | undefined) => {
  if (!media) return ''
  if (typeof media === 'number' || typeof media === 'string') return String(media)
  return String(media.id || '')
}

export const buildMediaUrl = (media: MediaRelation | undefined) => {
  if (!media || typeof media === 'number' || typeof media === 'string') return ''
  return String(media.url || '')
}

export const buildUserLabel = (user: UserRelation | undefined) => {
  if (!user) return '-'
  if (typeof user === 'number' || typeof user === 'string') return String(user)
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ').trim()
  return fullName || user.name || user.email || `User ${user.id || ''}`
}

export const mapReceiptRow = (receipt: ReceiptDoc): ReceiptRegisterRow => {
  const amount = normalizeAmount(receipt.amount)
  const currency = String(receipt.currency || 'PHP')
  const status = String(receipt.status || '')
  const payment = receipt.paymentReceived
  const customer = receipt.customer || (typeof payment === 'object' && payment ? payment.customer : null)
  const proofDocument = receipt.proofDocument
  const paymentReferenceNumber =
    typeof payment === 'object' && payment ? String(payment.referenceNumber || '') : ''

  return {
    id: String(receipt.id),
    receiptNumber: String(receipt.receiptNumber || `Receipt ${receipt.id}`),
    paymentReceivedId: buildPaymentId(payment),
    paymentLabel: buildPaymentLabel(payment),
    paymentReferenceNumber,
    customerId: buildCustomerId(customer),
    customerLabel: buildCustomerLabel(customer),
    receiptDate: receipt.receiptDate || (typeof payment === 'object' && payment ? payment.paymentDate || payment.postingDate || null : null),
    receiptDateLabel: formatDate(receipt.receiptDate || (typeof payment === 'object' && payment ? payment.paymentDate || payment.postingDate : null)),
    amount,
    amountLabel: formatCurrency(amount, currency),
    currency,
    status,
    statusLabel: receiptStatusLabels.get(status) || 'Unknown',
    statusTone: getReceiptStatusTone(status),
    proofDocumentId: buildMediaId(proofDocument),
    proofDocumentLabel: buildMediaLabel(proofDocument),
    issuedByLabel: buildUserLabel(receipt.issuedBy),
    searchableText: buildSearchableText([
      receipt.receiptNumber,
      buildPaymentLabel(payment),
      paymentReferenceNumber,
      buildCustomerLabel(customer),
      buildMediaLabel(proofDocument),
      buildUserLabel(receipt.issuedBy),
      receipt.notes,
      formatCurrency(amount, currency),
      receiptStatusLabels.get(status),
      formatDate(receipt.receiptDate),
    ]),
    cells: [
      { text: String(receipt.receiptNumber || `Receipt ${receipt.id}`), emphasis: true },
      formatDate(receipt.receiptDate || (typeof payment === 'object' && payment ? payment.paymentDate || payment.postingDate : null)),
      buildCustomerLabel(customer),
      buildPaymentLabel(payment),
      { text: formatCurrency(amount, currency), emphasis: true, align: 'right' },
      { text: receiptStatusLabels.get(status) || 'Unknown', tone: getReceiptStatusTone(status) },
    ],
  }
}

export const matchesReceiptQuickFilter = (row: ReceiptRegisterRow, quickFilter: string) => {
  const [group, value] = quickFilter.split(':')

  if (group === 'status') {
    return row.status === value
  }

  if (group === 'proof') {
    if (value === 'with_proof') return Boolean(row.proofDocumentId)
    if (value === 'missing_proof') return !row.proofDocumentId
  }

  return false
}

export const matchesSelectedReceiptFilters = (
  row: ReceiptRegisterRow,
  filters: {
    statuses: string[]
    customerIds: string[]
    proofStates: string[]
    quickFilters: string[]
  },
) => {
  const predicates = [
    ...filters.statuses.map((status) => row.status === status),
    ...filters.customerIds.map((customerId) => row.customerId === customerId),
    ...filters.proofStates.map((proofState) => {
      if (proofState === 'with_proof') return Boolean(row.proofDocumentId)
      if (proofState === 'missing_proof') return !row.proofDocumentId
      return false
    }),
    ...filters.quickFilters.map((quickFilter) => matchesReceiptQuickFilter(row, quickFilter)),
  ]

  if (predicates.length === 0) {
    return true
  }

  return predicates.some(Boolean)
}

export const normalizeReceiptMutationBody = (body: unknown): ReceiptMutationBody => {
  const payload = typeof body === 'object' && body !== null ? (body as Record<string, unknown>) : {}
  return {
    receiptNumber: payload.receiptNumber ? String(payload.receiptNumber).trim() : null,
    paymentReceived: String(payload.paymentReceived || '').trim(),
    proofDocument: payload.proofDocument ? String(payload.proofDocument).trim() : null,
    notes: payload.notes ? String(payload.notes).trim() : null,
  }
}

const resolvePaymentMutationData = async (payload: any, body: ReceiptMutationBody, currentReceiptId?: string) => {
  if (!body.paymentReceived) {
    throw new Error('Payment received is required.')
  }

  const payment = (await payload.findByID({
    collection: ACCOUNTING_COLLECTION_SLUGS.paymentsReceived,
    id: body.paymentReceived,
    depth: 1,
    overrideAccess: true,
  })) as PaymentDoc

  const customerId = getRelationshipId(payment.customer)
  if (!customerId) {
    throw new Error('Selected payment must have a linked customer.')
  }

  const existingReceipts = await payload.find({
    collection: ACCOUNTING_COLLECTION_SLUGS.receipts,
    where: {
      paymentReceived: {
        equals: payment.id,
      },
    },
    limit: 10,
    depth: 0,
    overrideAccess: true,
  })

  const conflictingReceipt = existingReceipts.docs.find(
    (receipt: { id: number | string }) => String(receipt.id) !== String(currentReceiptId || ''),
  )
  if (conflictingReceipt) {
    throw new Error('An official receipt is already linked to the selected payment.')
  }

  let proofDocumentId: number | undefined
  if (body.proofDocument) {
    const numericProofDocumentId = Number(body.proofDocument)
    if (!Number.isFinite(numericProofDocumentId)) {
      throw new Error('Proof document must resolve to a valid media record.')
    }

    await payload.findByID({
      collection: 'media',
      id: numericProofDocumentId,
      depth: 0,
      overrideAccess: true,
    })

    proofDocumentId = numericProofDocumentId
  }

  return {
    payment,
    data: {
      receiptNumber: body.receiptNumber || undefined,
      paymentReceived: payment.id,
      customer: customerId,
      receiptDate: payment.paymentDate || payment.postingDate || new Date().toISOString(),
      amount: normalizeAmount(payment.amountReceived),
      currency: String(payment.currency || 'PHP'),
      proofDocument: proofDocumentId,
      notes: body.notes || undefined,
      status: 'draft' as const,
    },
  }
}

export const buildReceiptMutationData = async (
  payload: any,
  body: ReceiptMutationBody,
  currentReceiptId?: string,
) => resolvePaymentMutationData(payload, body, currentReceiptId)

export const assertMutableReceipt = (status: unknown) => {
  if (['issued', 'voided'].includes(String(status || ''))) {
    throw new Error('Issued or voided official receipts cannot be edited directly.')
  }
}

export const buildReceiptDetailResponse = (receipt: ReceiptDoc) => {
  const payment = receipt.paymentReceived
  const customer = receipt.customer || (typeof payment === 'object' && payment ? payment.customer : null)
  const amount = normalizeAmount(receipt.amount)
  const currency = String(receipt.currency || 'PHP')
  const status = String(receipt.status || '')
  const paymentStatus =
    typeof payment === 'object' && payment ? String(payment.status || '') : ''

  return {
    id: String(receipt.id),
    receiptNumber: String(receipt.receiptNumber || `Receipt ${receipt.id}`),
    paymentReceivedId: buildPaymentId(payment),
    paymentReceivedLabel: buildPaymentLabel(payment),
    paymentReferenceNumber:
      typeof payment === 'object' && payment ? String(payment.referenceNumber || '') : '',
    paymentStatus,
    paymentStatusLabel: paymentStatusLabels.get(paymentStatus) || (paymentStatus ? paymentStatus : '-'),
    customerId: buildCustomerId(customer),
    customerLabel: buildCustomerLabel(customer),
    receiptDate: receipt.receiptDate || null,
    receiptDateLabel: formatDate(receipt.receiptDate),
    amount,
    amountLabel: formatCurrency(amount, currency),
    currency,
    status,
    statusLabel: receiptStatusLabels.get(status) || 'Unknown',
    statusTone: getReceiptStatusTone(status),
    proofDocumentId: buildMediaId(receipt.proofDocument),
    proofDocumentLabel: buildMediaLabel(receipt.proofDocument),
    proofDocumentUrl: buildMediaUrl(receipt.proofDocument),
    issuedByLabel: buildUserLabel(receipt.issuedBy),
    voidedAt: receipt.voidedAt || null,
    voidedAtLabel: formatDate(receipt.voidedAt),
    voidedByLabel: buildUserLabel(receipt.voidedBy),
    notes: String(receipt.notes || ''),
    createdAt: receipt.createdAt || null,
    updatedAt: receipt.updatedAt || null,
    usageSummary: {
      canEdit: status === 'draft',
      canDelete: status === 'draft',
      canIssue: status === 'draft',
      canVoid: status === 'issued',
      hasProofDocument: Boolean(buildMediaId(receipt.proofDocument)),
    },
  }
}
