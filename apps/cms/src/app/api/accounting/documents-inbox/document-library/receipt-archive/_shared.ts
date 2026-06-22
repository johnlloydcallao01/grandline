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

const RECEIPT_ARCHIVE_CATEGORIES = new Set(['receipt', 'expense_receipt', 'proof_of_payment'])

const categoryLabelMap = new Map<string, string>(
  ACCOUNTING_DOCUMENT_CATEGORY_OPTIONS.map((option) => [option.value, option.label]),
)

const entityTypeLabelMap = new Map<string, string>(
  ACCOUNTING_ENTITY_TYPE_OPTIONS.map((option) => [option.value, option.label]),
)

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

const getMimeFamily = (mimeType: string | null | undefined, fileName: string | null | undefined) => {
  const normalizedMime = String(mimeType || '').toLowerCase()
  const normalizedFileName = String(fileName || '').toLowerCase()

  if (normalizedMime === 'application/pdf' || normalizedFileName.endsWith('.pdf')) return 'pdf'
  if (normalizedMime.startsWith('image/')) return 'image'
  if (
    normalizedMime.includes('spreadsheet') ||
    normalizedMime.includes('excel') ||
    normalizedFileName.endsWith('.csv') ||
    normalizedFileName.endsWith('.xls') ||
    normalizedFileName.endsWith('.xlsx')
  ) {
    return 'spreadsheet'
  }
  if (
    normalizedMime.includes('word') ||
    normalizedMime.includes('presentation') ||
    normalizedMime.includes('powerpoint') ||
    normalizedMime.includes('document') ||
    normalizedFileName.endsWith('.doc') ||
    normalizedFileName.endsWith('.docx') ||
    normalizedFileName.endsWith('.ppt') ||
    normalizedFileName.endsWith('.pptx')
  ) {
    return 'document'
  }
  if (
    normalizedMime.includes('zip') ||
    normalizedMime.includes('compressed') ||
    normalizedFileName.endsWith('.zip') ||
    normalizedFileName.endsWith('.rar')
  ) {
    return 'archive'
  }

  return 'other'
}

const mimeFamilyLabelMap = new Map<string, string>([
  ['pdf', 'PDF'],
  ['image', 'Image'],
  ['spreadsheet', 'Spreadsheet'],
  ['document', 'Document'],
  ['archive', 'Archive'],
  ['other', 'Other'],
])

const buildSearchableText = (parts: Array<string | number | null | undefined>) =>
  parts
    .map((part) =>
      String(part ?? '')
        .toLowerCase()
        .trim(),
    )
    .filter(Boolean)
    .join(' ')

const getArchiveStatus = (link: AccountingInboxDocumentLinkDoc) => {
  if (link.isPrimary) {
    return {
      status: 'primary',
      label: 'Primary',
      tone: 'green' as const,
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
    tone: 'blue' as const,
  }
}

export type ReceiptArchiveCell =
  | string
  | {
      text: string
      tone?: StatusTone
      emphasis?: boolean
      align?: 'left' | 'right' | 'center'
    }

export type ReceiptArchiveRow = {
  id: string
  documentLinkId: string
  mediaId: string
  fileName: string
  fileUrl: string | null
  fileSizeLabel: string
  mimeTypeLabel: string
  mimeFamily: string
  mimeFamilyLabel: string
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
  cells: ReceiptArchiveCell[]
}

export type ReceiptArchiveDetail = ReceiptArchiveRow & {
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

export const buildReceiptArchiveRow = ({
  link,
  mediaDoc,
}: {
  link: AccountingInboxDocumentLinkDoc
  mediaDoc: MediaDoc | null
}): ReceiptArchiveRow => {
  const fileName =
    String(mediaDoc?.filename || mediaDoc?.alt || '').trim() || `Media ${String(getRelationshipId(link.media) || '')}`
  const documentCategory = String(link.documentCategory || '').trim()
  const entityType = String(link.entityType || '').trim()
  const entityId = String(link.entityId || '').trim()
  const status = getArchiveStatus(link)
  const mimeType = String(mediaDoc?.mimeType || '').trim()
  const mimeFamily = getMimeFamily(mimeType, fileName)
  const fileUrl = mediaDoc?.cloudinaryURL || mediaDoc?.url || null

  return {
    id: String(link.id),
    documentLinkId: String(link.id),
    mediaId: String(getRelationshipId(link.media) || mediaDoc?.id || ''),
    fileName,
    fileUrl,
    fileSizeLabel: formatFileSize(mediaDoc?.filesize),
    mimeTypeLabel: mimeType || '-',
    mimeFamily,
    mimeFamilyLabel: mimeFamilyLabelMap.get(mimeFamily) || 'Other',
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
      categoryLabelMap.get(documentCategory) || toTitleLabel(documentCategory),
      entityTypeLabelMap.get(entityType) || toTitleLabel(entityType),
      entityId || '-',
      formatDate(link.documentDate),
      { text: status.label, tone: status.tone },
    ],
  }
}

export const buildReceiptArchiveDetail = ({
  link,
  mediaDoc,
}: {
  link: AccountingInboxDocumentLinkDoc
  mediaDoc: MediaDoc | null
}): ReceiptArchiveDetail => ({
  ...buildReceiptArchiveRow({ link, mediaDoc }),
  altText: String(mediaDoc?.alt || ''),
  cloudinaryPublicId: String(mediaDoc?.cloudinaryPublicId || ''),
  fileTypeLabel: String(mediaDoc?.mimeType || '') || mimeFamilyLabelMap.get(getMimeFamily(mediaDoc?.mimeType, mediaDoc?.filename)) || 'Other',
  fileSize: Number(mediaDoc?.filesize || 0),
  notesLabel: String(link.notes || '').trim() || '-',
})

export const findReceiptArchiveRegister = async (payload: Payload) => {
  const links = (await findAccountingInboxDocumentLinks(payload)).filter((link) =>
    RECEIPT_ARCHIVE_CATEGORIES.has(String(link.documentCategory || '').trim()),
  )

  const rows = await Promise.all(
    links.map(async (link) =>
      buildReceiptArchiveRow({
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

export const findReceiptArchiveDetailById = async ({
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

  return buildReceiptArchiveDetail({
    link,
    mediaDoc: await resolveMediaDoc(payload, link),
  })
}

const matchesReceiptArchiveQuickFilter = (row: ReceiptArchiveRow, quickFilter: string) => {
  const [group, value] = quickFilter.split(':')
  if (group === 'category') return row.documentCategory === value
  if (group === 'status' && value === 'primary') return row.isPrimary
  return false
}

export const matchesReceiptArchiveFilters = (
  row: ReceiptArchiveRow,
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
    ...filters.quickFilters.map((quickFilter) => matchesReceiptArchiveQuickFilter(row, quickFilter)),
  ]

  if (predicates.length === 0) return true
  return predicates.some(Boolean)
}

export const buildReceiptArchiveMetrics = (rows: ReceiptArchiveRow[]) => [
  {
    id: 'receipt-archive-total',
    label: 'Receipt Records',
    value: rows.length,
    change: 'Receipt-oriented linked document records in view',
    trend: 'up' as const,
  },
  {
    id: 'receipt-archive-expense-receipts',
    label: 'Expense Receipts',
    value: rows.filter((row) => row.documentCategory === 'expense_receipt').length,
    change: 'Expense-specific receipt attachments',
    trend: 'neutral' as const,
  },
  {
    id: 'receipt-archive-proof-of-payment',
    label: 'Proof Of Payment',
    value: rows.filter((row) => row.documentCategory === 'proof_of_payment').length,
    change: 'Payment-supporting document links',
    trend: 'neutral' as const,
  },
  {
    id: 'receipt-archive-primary',
    label: 'Primary Receipts',
    value: rows.filter((row) => row.isPrimary).length,
    change: 'Receipt links marked as primary support files',
    trend: 'up' as const,
  },
]

export const buildReceiptArchiveReferenceData = (rows: ReceiptArchiveRow[]) => ({
  categories: ACCOUNTING_DOCUMENT_CATEGORY_OPTIONS.filter((option) =>
    RECEIPT_ARCHIVE_CATEGORIES.has(option.value),
  ).map((option) => ({
    label: option.label,
    value: option.value,
  })),
  entityTypes: Array.from(new Set(rows.map((row) => row.entityType).filter(Boolean))).map((entityType) => ({
    label: entityTypeLabelMap.get(entityType) || toTitleLabel(entityType),
    value: entityType,
  })),
  statuses: [
    { label: 'Linked', value: 'linked' },
    { label: 'Primary', value: 'primary' },
    { label: 'Missing Date', value: 'missing_date' },
  ],
})

export { normalizeSearch, parseIntegerParam, parseListParam }
