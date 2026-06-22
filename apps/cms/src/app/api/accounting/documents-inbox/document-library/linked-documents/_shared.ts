import type { Payload } from 'payload'
import {
  ACCOUNTING_DOCUMENT_CATEGORY_OPTIONS,
  ACCOUNTING_ENTITY_TYPE_OPTIONS,
} from '@/accounting/constants/accounting'
import { getRelationshipId } from '@/accounting/utils/accounting-audit'
import type {
  AccountingInboxDocumentLinkDoc,
  MediaDoc,
} from '../../document-intake/accounting-inbox/_shared'
import {
  findAccountingInboxDocumentLinks,
  findAccountingInboxMediaById,
  normalizeSearch,
  parseIntegerParam,
  parseListParam,
} from '../../document-intake/accounting-inbox/_shared'

type StatusTone = 'amber' | 'blue' | 'gray' | 'green' | 'red'

const categoryLabelMap = new Map<string, string>(
  ACCOUNTING_DOCUMENT_CATEGORY_OPTIONS.map((option) => [option.value, option.label]),
)

const entityTypeLabelMap = new Map<string, string>(
  ACCOUNTING_ENTITY_TYPE_OPTIONS.map((option) => [option.value, option.label]),
)

const INVOICE_BILL_ENTITY_TYPES = new Set(['invoice', 'bill'])
const EXPENSE_BANKING_ENTITY_TYPES = new Set([
  'expense',
  'bank_transaction',
  'bank_reconciliation',
  'deposit',
  'transfer',
])

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

const formatFileSize = (bytes: number | null | undefined) => {
  const normalizedBytes = Number(bytes || 0)
  if (!normalizedBytes) return '0 Bytes'
  const units = ['Bytes', 'KB', 'MB', 'GB']
  const exponent = Math.min(Math.floor(Math.log(normalizedBytes) / Math.log(1024)), units.length - 1)
  const size = normalizedBytes / 1024 ** exponent
  return `${size.toFixed(exponent === 0 ? 0 : 2)} ${units[exponent]}`
}

const formatUserLabel = (value: AccountingInboxDocumentLinkDoc['uploadedBy']) => {
  if (typeof value === 'object' && value) {
    const fullName = [value.firstName, value.lastName].filter(Boolean).join(' ').trim()
    return fullName || value.username || value.email || `User ${String(value.id || '')}` || '-'
  }
  return value ? `User ${String(value)}` : '-'
}

const toTitleLabel = (value: string | null | undefined) =>
  String(value || '')
    .split('_')
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ') || '-'

const buildSearchableText = (parts: Array<string | number | null | undefined>) =>
  parts
    .map((part) =>
      String(part ?? '')
        .toLowerCase()
        .trim(),
    )
    .filter(Boolean)
    .join(' ')

const getLinkedDocumentStatus = (link: AccountingInboxDocumentLinkDoc) => {
  if (link.isPrimary) {
    return {
      status: 'primary',
      label: 'Primary',
      tone: 'green' as const,
    }
  }

  if (String(link.notes || '').trim()) {
    return {
      status: 'with_notes',
      label: 'With Notes',
      tone: 'blue' as const,
    }
  }

  if (!link.documentDate) {
    return {
      status: 'missing_date',
      label: 'Missing Date',
      tone: 'amber' as const,
    }
  }

  return {
    status: 'linked',
    label: 'Linked',
    tone: 'gray' as const,
  }
}

export type LinkedDocumentsCell =
  | string
  | {
      text: string
      tone?: StatusTone
      emphasis?: boolean
      align?: 'left' | 'right' | 'center'
    }

export type LinkedDocumentsRow = {
  id: string
  documentLinkId: string
  mediaId: string
  fileName: string
  fileUrl: string | null
  fileSizeLabel: string
  mimeTypeLabel: string
  documentCategory: string
  documentCategoryLabel: string
  entityType: string
  entityTypeLabel: string
  entityId: string
  entityLabel: string
  documentDate: string | null
  documentDateLabel: string
  linkedAt: string | null
  linkedAtLabel: string
  uploadedByLabel: string
  notes: string
  status: string
  statusLabel: string
  statusTone: StatusTone
  isPrimary: boolean
  searchableText: string
  cells: LinkedDocumentsCell[]
}

export type LinkedDocumentsDetail = LinkedDocumentsRow & {
  altText: string
  cloudinaryPublicId: string
  fileTypeLabel: string
  fileSize: number
  notesLabel: string
}

const isMediaDoc = (value: AccountingInboxDocumentLinkDoc['media']): value is MediaDoc =>
  value !== null && value !== undefined && typeof value === 'object' && 'id' in value

const resolveMediaDoc = async (
  payload: Payload,
  link: AccountingInboxDocumentLinkDoc,
): Promise<MediaDoc | null> => {
  if (isMediaDoc(link.media)) return link.media
  const mediaId = String(getRelationshipId(link.media) || '').trim()
  if (!mediaId) return null

  try {
    return await findAccountingInboxMediaById({ payload, id: mediaId })
  } catch {
    return null
  }
}

export const buildLinkedDocumentsRow = ({
  link,
  mediaDoc,
}: {
  link: AccountingInboxDocumentLinkDoc
  mediaDoc: MediaDoc | null
}): LinkedDocumentsRow => {
  const fileName =
    String(mediaDoc?.filename || mediaDoc?.alt || '').trim() || `Media ${String(getRelationshipId(link.media) || '')}`
  const documentCategory = String(link.documentCategory || '').trim()
  const entityType = String(link.entityType || '').trim()
  const entityId = String(link.entityId || '').trim()
  const status = getLinkedDocumentStatus(link)

  return {
    id: String(link.id),
    documentLinkId: String(link.id),
    mediaId: String(getRelationshipId(link.media) || mediaDoc?.id || ''),
    fileName,
    fileUrl: mediaDoc?.cloudinaryURL || mediaDoc?.url || null,
    fileSizeLabel: formatFileSize(mediaDoc?.filesize),
    mimeTypeLabel: String(mediaDoc?.mimeType || '').trim() || '-',
    documentCategory,
    documentCategoryLabel: categoryLabelMap.get(documentCategory) || toTitleLabel(documentCategory),
    entityType,
    entityTypeLabel: entityTypeLabelMap.get(entityType) || toTitleLabel(entityType),
    entityId,
    entityLabel: entityId
      ? `${entityTypeLabelMap.get(entityType) || toTitleLabel(entityType)} ${entityId}`
      : entityTypeLabelMap.get(entityType) || toTitleLabel(entityType),
    documentDate: link.documentDate || null,
    documentDateLabel: formatDate(link.documentDate),
    linkedAt: link.updatedAt || link.createdAt || null,
    linkedAtLabel: formatDateTime(link.updatedAt || link.createdAt),
    uploadedByLabel: formatUserLabel(link.uploadedBy),
    notes: String(link.notes || ''),
    status: status.status,
    statusLabel: status.label,
    statusTone: status.tone,
    isPrimary: Boolean(link.isPrimary),
    searchableText: buildSearchableText([
      fileName,
      documentCategory,
      categoryLabelMap.get(documentCategory),
      entityType,
      entityTypeLabelMap.get(entityType),
      entityId,
      link.documentDate,
      link.notes,
      formatUserLabel(link.uploadedBy),
      status.label,
    ]),
    cells: [
      { text: fileName, emphasis: true },
      entityTypeLabelMap.get(entityType) || toTitleLabel(entityType),
      entityId || '-',
      categoryLabelMap.get(documentCategory) || toTitleLabel(documentCategory),
      { text: link.isPrimary ? 'Yes' : 'No', tone: link.isPrimary ? 'green' : 'gray' },
      { text: status.label, tone: status.tone },
    ],
  }
}

export const buildLinkedDocumentsDetail = ({
  link,
  mediaDoc,
}: {
  link: AccountingInboxDocumentLinkDoc
  mediaDoc: MediaDoc | null
}): LinkedDocumentsDetail => ({
  ...buildLinkedDocumentsRow({ link, mediaDoc }),
  altText: String(mediaDoc?.alt || ''),
  cloudinaryPublicId: String(mediaDoc?.cloudinaryPublicId || ''),
  fileTypeLabel: String(mediaDoc?.mimeType || '').trim() || '-',
  fileSize: Number(mediaDoc?.filesize || 0),
  notesLabel: String(link.notes || '').trim() || '-',
})

export const findLinkedDocumentsRegister = async (payload: Payload) => {
  const links = await findAccountingInboxDocumentLinks(payload)

  const rows = await Promise.all(
    links.map(async (link) =>
      buildLinkedDocumentsRow({
        link,
        mediaDoc: await resolveMediaDoc(payload, link),
      }),
    ),
  )

  return rows.sort((left, right) => {
    const leftTime = new Date(left.linkedAt || left.documentDate || 0).getTime()
    const rightTime = new Date(right.linkedAt || right.documentDate || 0).getTime()
    return rightTime - leftTime
  })
}

export const findLinkedDocumentsDetailById = async ({
  payload,
  id,
}: {
  payload: Payload
  id: string
}) => {
  const link = (await payload.findByID({
    collection: 'accounting-document-links',
    id: parseIntegerParam(id, 0) || id,
    depth: 1,
    overrideAccess: true,
  })) as AccountingInboxDocumentLinkDoc

  return buildLinkedDocumentsDetail({
    link,
    mediaDoc: await resolveMediaDoc(payload, link),
  })
}

const matchesLinkedDocumentsQuickFilter = (row: LinkedDocumentsRow, quickFilter: string) => {
  const [group, value] = quickFilter.split(':')
  if (group !== 'group') return false
  if (value === 'invoices') return INVOICE_BILL_ENTITY_TYPES.has(row.entityType) && row.entityType === 'invoice'
  if (value === 'bills') return INVOICE_BILL_ENTITY_TYPES.has(row.entityType) && row.entityType === 'bill'
  if (value === 'expenses') return row.entityType === 'expense'
  if (value === 'banking') return EXPENSE_BANKING_ENTITY_TYPES.has(row.entityType) && row.entityType !== 'expense'
  return false
}

export const matchesLinkedDocumentsFilters = (
  row: LinkedDocumentsRow,
  filters: {
    categories: string[]
    entityTypes: string[]
    statuses: string[]
    quickFilters: string[]
  },
) => {
  const predicates = [
    ...filters.categories.map((category) => row.documentCategory === category),
    ...filters.entityTypes.map((entityType) => row.entityType === entityType),
    ...filters.statuses.map((status) => row.status === status),
    ...filters.quickFilters.map((quickFilter) => matchesLinkedDocumentsQuickFilter(row, quickFilter)),
  ]

  if (predicates.length === 0) return true
  return predicates.some(Boolean)
}

export const buildLinkedDocumentsMetrics = (rows: LinkedDocumentsRow[]) => [
  {
    id: 'linked-documents-total',
    label: 'Linked Documents',
    value: rows.length,
    change: 'Accounting document-link records currently visible',
    trend: 'up' as const,
  },
  {
    id: 'linked-documents-invoice-bill',
    label: 'Invoice / Bill Links',
    value: rows.filter((row) => INVOICE_BILL_ENTITY_TYPES.has(row.entityType)).length,
    change: 'Commercial transaction attachments',
    trend: 'up' as const,
  },
  {
    id: 'linked-documents-expense-banking',
    label: 'Expense / Banking Links',
    value: rows.filter((row) => EXPENSE_BANKING_ENTITY_TYPES.has(row.entityType)).length,
    change: 'Expense and banking support files',
    trend: 'neutral' as const,
  },
  {
    id: 'linked-documents-with-notes',
    label: 'With Notes',
    value: rows.filter((row) => row.notes.trim().length > 0).length,
    change: 'Linked records carrying document notes',
    trend: 'neutral' as const,
  },
]

export const buildLinkedDocumentsReferenceData = (rows: LinkedDocumentsRow[]) => ({
  categories: Array.from(new Set(rows.map((row) => row.documentCategory).filter(Boolean))).map((documentCategory) => ({
    label: categoryLabelMap.get(documentCategory) || toTitleLabel(documentCategory),
    value: documentCategory,
  })),
  entityTypes: Array.from(new Set(rows.map((row) => row.entityType).filter(Boolean))).map((entityType) => ({
    label: entityTypeLabelMap.get(entityType) || toTitleLabel(entityType),
    value: entityType,
  })),
  statuses: [
    { label: 'Linked', value: 'linked' },
    { label: 'Primary', value: 'primary' },
    { label: 'With Notes', value: 'with_notes' },
    { label: 'Missing Date', value: 'missing_date' },
  ],
})

export { normalizeSearch, parseIntegerParam, parseListParam }
