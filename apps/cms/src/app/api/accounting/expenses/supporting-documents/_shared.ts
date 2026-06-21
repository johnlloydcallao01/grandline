import type { Payload } from 'payload'
import {
  ACCOUNTING_COLLECTION_SLUGS,
  ACCOUNTING_DOCUMENT_CATEGORY_OPTIONS,
  SIMPLE_POSTING_STATUS_OPTIONS,
} from '@/accounting/constants/accounting'
import { getRelationshipId } from '@/accounting/utils/accounting-audit'
import { buildExpenseRow, type ExpenseDoc } from '../_shared'

type UserDoc = {
  id?: number | string | null
  firstName?: string | null
  lastName?: string | null
  username?: string | null
  email?: string | null
}

type MediaDoc = {
  id?: number | string | null
  filename?: string | null
  url?: string | null
  mimeType?: string | null
  alt?: string | null
  filesize?: number | null
}

export type DocumentLinkDoc = {
  id: number | string
  entityType?: string | null
  entityId?: string | null
  documentCategory?: string | null
  documentDate?: string | null
  uploadedBy?: UserDoc | number | string | null
  notes?: string | null
  isPrimary?: boolean | null
  media?: MediaDoc | number | string | null
  createdAt?: string | null
  updatedAt?: string | null
}

const categoryLabelMap = new Map<string, string>(
  ACCOUNTING_DOCUMENT_CATEGORY_OPTIONS.map((option) => [option.value, option.label]),
)
const expenseStatusLabelMap = new Map(
  SIMPLE_POSTING_STATUS_OPTIONS.map((option) => [option.value, option.label]),
)

const formatDate = (value: string | null | undefined) => {
  if (!value) return '-'
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return String(value)
  return new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(parsed)
}

const formatDateTime = (value: string | null | undefined) => {
  if (!value) return '-'
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return String(value)
  return new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(parsed)
}

const buildSearchableText = (parts: Array<string | number | null | undefined>) =>
  parts
    .flatMap((part) => (Array.isArray(part) ? part : [part]))
    .map((part) => String(part ?? '').toLowerCase().trim())
    .filter(Boolean)
    .join(' ')

const toTitleLabel = (value: string | null | undefined) =>
  String(value || '')
    .split('_')
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ') || '-'

const formatUserLabel = (user: DocumentLinkDoc['uploadedBy']) => {
  if (typeof user === 'object' && user) {
    const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ').trim()
    return fullName || user.username || user.email || `User ${String(user.id || '')}` || '-'
  }
  return user ? `User ${String(user)}` : '-'
}

const formatMediaLabel = (media: DocumentLinkDoc['media']) => {
  if (typeof media === 'object' && media) {
    return media.filename || media.alt || `Media ${String(media.id || '')}` || '-'
  }
  return media ? `Media ${String(media)}` : '-'
}

const resolveMediaUrl = (media: DocumentLinkDoc['media']) =>
  typeof media === 'object' && media ? media.url || null : null

const resolveMediaFileName = (media: DocumentLinkDoc['media']) =>
  typeof media === 'object' && media ? media.filename || null : null

const getStateTone = (documentLink: DocumentLinkDoc) => {
  if (documentLink.isPrimary) return 'green' as const
  if (!documentLink.documentDate) return 'amber' as const
  return 'blue' as const
}

const getStateLabel = (documentLink: DocumentLinkDoc) => {
  if (documentLink.isPrimary) return 'Primary'
  if (!documentLink.documentDate) return 'Missing Date'
  return 'Linked'
}

export type SupportingDocumentRow = {
  id: string
  linkReference: string
  expenseId: string
  expenseNumber: string
  expenseLabel: string
  expenseStatus: string
  expenseStatusLabel: string
  mediaId: string
  mediaLabel: string
  mediaUrl: string | null
  documentCategory: string
  documentCategoryLabel: string
  documentDate: string | null
  documentDateLabel: string
  uploadedByLabel: string
  isPrimary: boolean
  stateLabel: string
  stateTone: 'amber' | 'blue' | 'gray' | 'green' | 'red'
  notes: string
  createdAt: string | null
  createdAtLabel: string
  searchableText: string
  cells: Array<
    | string
    | {
        text: string
        tone?: 'amber' | 'blue' | 'gray' | 'green' | 'red'
        emphasis?: boolean
        align?: 'left' | 'right' | 'center'
      }
  >
}

export const buildSupportingDocumentRow = ({
  documentLink,
  expensesById,
}: {
  documentLink: DocumentLinkDoc
  expensesById: Map<string, ExpenseDoc>
}): SupportingDocumentRow => {
  const expenseId = String(documentLink.entityId || '')
  const expense = expensesById.get(expenseId)
  const expenseRow = expense ? buildExpenseRow(expense) : null
  const category = String(documentLink.documentCategory || '')
  const documentCategoryLabel = categoryLabelMap.get(category) || toTitleLabel(category)
  const uploadedByLabel = formatUserLabel(documentLink.uploadedBy)
  const mediaLabel = formatMediaLabel(documentLink.media)
  const stateTone = getStateTone(documentLink)
  const stateLabel = getStateLabel(documentLink)
  const notes = String(documentLink.notes || '')

  return {
    id: String(documentLink.id),
    linkReference: `DOC-LINK-${String(documentLink.id).padStart(4, '0')}`,
    expenseId,
    expenseNumber: expenseRow?.expenseNumber || `Expense ${expenseId || '-'}`,
    expenseLabel: expenseRow?.vendorLabel
      ? `${expenseRow.expenseNumber} - ${expenseRow.vendorLabel}`
      : expenseRow?.expenseNumber || `Expense ${expenseId || '-'}`,
    expenseStatus: expenseRow?.status || 'draft',
    expenseStatusLabel: expenseRow?.statusLabel || expenseStatusLabelMap.get('draft') || 'Draft',
    mediaId: String(getRelationshipId(documentLink.media) || ''),
    mediaLabel,
    mediaUrl: resolveMediaUrl(documentLink.media),
    documentCategory: category,
    documentCategoryLabel,
    documentDate: documentLink.documentDate || null,
    documentDateLabel: formatDate(documentLink.documentDate),
    uploadedByLabel,
    isPrimary: Boolean(documentLink.isPrimary),
    stateLabel,
    stateTone,
    notes,
    createdAt: documentLink.createdAt || null,
    createdAtLabel: formatDateTime(documentLink.createdAt),
    searchableText: buildSearchableText([
      expenseRow?.expenseNumber,
      expenseRow?.vendorLabel,
      expenseRow?.statusLabel,
      documentCategoryLabel,
      notes,
      uploadedByLabel,
      mediaLabel,
      stateLabel,
      resolveMediaFileName(documentLink.media),
      documentLink.documentDate,
    ]),
    cells: [
      { text: `DOC-LINK-${String(documentLink.id).padStart(4, '0')}`, emphasis: true },
      expenseRow?.expenseNumber || `Expense ${expenseId || '-'}`,
      mediaLabel,
      documentCategoryLabel,
      formatDate(documentLink.documentDate),
      uploadedByLabel,
      { text: stateLabel, tone: stateTone },
    ],
  }
}

const matchesQuickFilter = (row: SupportingDocumentRow, quickFilter: string) => {
  const [group, value] = quickFilter.split(':')
  if (group === 'state' && value === 'primary') return row.isPrimary
  if (group === 'state' && value === 'missing_date') return !row.documentDate
  if (group === 'state' && value === 'with_notes') return Boolean(row.notes)
  if (group === 'status') return row.expenseStatus === value
  return false
}

export const matchesSupportingDocumentFilters = (
  row: SupportingDocumentRow,
  filters: {
    categories: string[]
    states: string[]
    expenseStatuses: string[]
    quickFilters: string[]
  },
) => {
  const predicates = [
    ...filters.categories.map((category) => row.documentCategory === category),
    ...filters.states.map((state) =>
      state === 'primary'
        ? row.isPrimary
        : state === 'secondary'
          ? !row.isPrimary
          : state === 'with_notes'
            ? Boolean(row.notes)
            : state === 'missing_date'
              ? !row.documentDate
              : false,
    ),
    ...filters.expenseStatuses.map((status) => row.expenseStatus === status),
    ...filters.quickFilters.map((quickFilter) => matchesQuickFilter(row, quickFilter)),
  ]

  if (predicates.length === 0) return true
  return predicates.some(Boolean)
}

export const buildSupportingDocumentMetrics = (rows: SupportingDocumentRow[]) => [
  {
    id: 'supporting-documents-total',
    label: 'Linked Documents',
    value: rows.length,
    change: 'Expense-linked support records in view',
    trend: 'up' as const,
  },
  {
    id: 'supporting-documents-primary',
    label: 'Primary Files',
    value: rows.filter((row) => row.isPrimary).length,
    change: 'Marked as the main supporting file',
    trend: 'neutral' as const,
  },
  {
    id: 'supporting-documents-missing-date',
    label: 'Missing Dates',
    value: rows.filter((row) => !row.documentDate).length,
    change: 'Need document-date cleanup',
    trend: 'down' as const,
  },
  {
    id: 'supporting-documents-noted',
    label: 'With Notes',
    value: rows.filter((row) => Boolean(row.notes)).length,
    change: 'Document context captured in notes',
    trend: 'up' as const,
  },
]

export const buildSupportingDocumentReferenceData = (expenses: ExpenseDoc[]) => {
  const expenseRows = expenses.map((expense) => buildExpenseRow(expense))
  return {
    expenses: expenseRows.map((expenseRow) => ({
      id: expenseRow.id,
      label: expenseRow.vendorLabel
        ? `${expenseRow.expenseNumber} - ${expenseRow.vendorLabel}`
        : expenseRow.expenseNumber,
      expenseNumber: expenseRow.expenseNumber,
      status: expenseRow.status,
      statusLabel: expenseRow.statusLabel,
    })),
    categories: ACCOUNTING_DOCUMENT_CATEGORY_OPTIONS.map((option) => ({
      label: option.label,
      value: option.value,
    })),
  }
}

export const buildSupportingDocumentDetail = ({
  documentLink,
  expensesById,
}: {
  documentLink: DocumentLinkDoc
  expensesById: Map<string, ExpenseDoc>
}) => {
  const row = buildSupportingDocumentRow({ documentLink, expensesById })
  const expense = expensesById.get(row.expenseId)
  const expenseRow = expense ? buildExpenseRow(expense) : null
  const media =
    typeof documentLink.media === 'object' && documentLink.media
      ? documentLink.media
      : null

  return {
    id: row.id,
    linkReference: row.linkReference,
    expenseId: row.expenseId,
    expenseLabel: row.expenseLabel,
    expenseStatusLabel: row.expenseStatusLabel,
    media: media
      ? {
          id: String(media.id || ''),
          filename: String(media.filename || ''),
          url: media.url || null,
          mimeType: String(media.mimeType || ''),
          alt: String(media.alt || ''),
          filesize: typeof media.filesize === 'number' ? media.filesize : 0,
        }
      : null,
    documentCategory: row.documentCategory,
    documentCategoryLabel: row.documentCategoryLabel,
    documentDate: row.documentDate,
    documentDateLabel: row.documentDateLabel,
    uploadedByLabel: row.uploadedByLabel,
    isPrimary: row.isPrimary,
    stateLabel: row.stateLabel,
    stateTone: row.stateTone,
    notes: row.notes,
    createdAtLabel: row.createdAtLabel,
    updatedAtLabel: formatDateTime(documentLink.updatedAt),
    expenseSnapshot: expenseRow
      ? {
          id: expenseRow.id,
          expenseNumber: expenseRow.expenseNumber,
          vendorLabel: expenseRow.vendorLabel,
          statusLabel: expenseRow.statusLabel,
          totalLabel: expenseRow.totalLabel,
          taxCodeLabel: expenseRow.taxCodeLabel,
          paymentMethodLabel: expenseRow.paymentMethodLabel,
        }
      : null,
  }
}

export const buildExpenseMap = (expenses: ExpenseDoc[]) =>
  new Map(expenses.map((expense) => [String(expense.id), expense]))

export const findExpenseDocs = (payload: Payload) =>
  payload.find({
    collection: ACCOUNTING_COLLECTION_SLUGS.expenses,
    depth: 2,
    limit: 500,
    sort: '-updatedAt',
    overrideAccess: true,
  })

export const findExpenseDocumentLinks = (payload: Payload) =>
  payload.find({
    collection: ACCOUNTING_COLLECTION_SLUGS.documentLinks,
    depth: 2,
    limit: 500,
    sort: '-createdAt',
    overrideAccess: true,
    where: {
      entityType: {
        equals: 'expense',
      },
    } as never,
  })
