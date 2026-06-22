import type { Payload } from 'payload'
import {
  ACCOUNTING_COLLECTION_SLUGS,
  ACCOUNTING_DOCUMENT_CATEGORY_OPTIONS,
  ACCOUNTING_ENTITY_TYPE_OPTIONS,
} from '@/accounting/constants/accounting'
import { getRelationshipId } from '@/accounting/utils/accounting-audit'
import { findAllDocs } from '@/accounting/utils/findAllDocs'
import { parseNumberParam } from '../../../_utils/auth'

type StatusTone = 'amber' | 'blue' | 'gray' | 'green' | 'red'

type UserDoc = {
  id?: number | string | null
  firstName?: string | null
  lastName?: string | null
  username?: string | null
  email?: string | null
}

export type MediaDoc = {
  id: number | string
  alt?: string | null
  cloudinaryPublicId?: string | null
  cloudinaryURL?: string | null
  url?: string | null
  filename?: string | null
  mimeType?: string | null
  filesize?: number | null
  createdAt?: string | null
  updatedAt?: string | null
}

export type AccountingInboxDocumentLinkDoc = {
  id: number | string
  media?: MediaDoc | number | string | null
  entityType?: string | null
  entityId?: string | null
  documentCategory?: string | null
  documentDate?: string | null
  uploadedBy?: UserDoc | number | string | null
  notes?: string | null
  isPrimary?: boolean | null
  createdAt?: string | null
  updatedAt?: string | null
}

export type AccountingInboxCell =
  | string
  | {
      text: string
      tone?: StatusTone
      emphasis?: boolean
      align?: 'left' | 'right' | 'center'
    }

export type AccountingInboxLinkedRecord = {
  id: string
  linkReference: string
  entityType: string
  entityTypeLabel: string
  entityId: string
  entityLabel: string
  documentCategory: string
  documentCategoryLabel: string
  documentDate: string | null
  documentDateLabel: string
  uploadedByLabel: string
  isPrimary: boolean
  notes: string
  createdAt: string | null
  createdAtLabel: string
  updatedAtLabel: string
  stateLabel: string
  stateTone: StatusTone
}

export type AccountingInboxRow = {
  id: string
  mediaId: string
  fileName: string
  fileUrl: string | null
  mimeType: string
  mimeTypeLabel: string
  mimeFamily: string
  mimeFamilyLabel: string
  fileSize: number
  fileSizeLabel: string
  uploadedAt: string | null
  uploadedAtLabel: string
  linkCount: number
  linkCountLabel: string
  latestLinkLabel: string
  latestLinkedAt: string | null
  latestLinkedAtLabel: string
  linkedCategories: string[]
  linkedCategoryLabels: string[]
  linkedEntityTypes: string[]
  linkedEntityTypeLabels: string[]
  status: string
  statusLabel: string
  statusTone: StatusTone
  hasPrimaryLink: boolean
  isUnlinked: boolean
  isMultiLinked: boolean
  searchableText: string
  cells: AccountingInboxCell[]
}

export type AccountingInboxDetail = AccountingInboxRow & {
  altText: string
  cloudinaryPublicId: string
  cloudinaryUrl: string | null
  linkedRecords: AccountingInboxLinkedRecord[]
  usageSummary: {
    linkCount: number
    primaryLinkCount: number
    latestLinkedAtLabel: string
    categorySummary: string
    entityTypeSummary: string
  }
}

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

const normalizeSearchPart = (value: string | number | null | undefined) =>
  String(value ?? '')
    .toLowerCase()
    .trim()

const buildSearchableText = (parts: Array<string | number | null | undefined>) =>
  parts.map((part) => normalizeSearchPart(part)).filter(Boolean).join(' ')

const formatFileSize = (bytes: number | null | undefined) => {
  const normalizedBytes = Number(bytes || 0)
  if (!normalizedBytes) return '0 Bytes'
  const units = ['Bytes', 'KB', 'MB', 'GB']
  const exponent = Math.min(Math.floor(Math.log(normalizedBytes) / Math.log(1024)), units.length - 1)
  const size = normalizedBytes / 1024 ** exponent
  return `${size.toFixed(exponent === 0 ? 0 : 2)} ${units[exponent]}`
}

const formatUserLabel = (value: UserDoc | number | string | null | undefined) => {
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

const normalizeLinkDate = (link: AccountingInboxDocumentLinkDoc | null | undefined) =>
  link?.updatedAt || link?.createdAt || link?.documentDate || null

const sortLinksDescending = (links: AccountingInboxDocumentLinkDoc[]) =>
  [...links]
    .filter((link): link is AccountingInboxDocumentLinkDoc => Boolean(link))
    .sort((left, right) => {
    const leftTime = new Date(normalizeLinkDate(left) || 0).getTime()
    const rightTime = new Date(normalizeLinkDate(right) || 0).getTime()
    return rightTime - leftTime
  })

const buildLinkLabel = (link: AccountingInboxDocumentLinkDoc) => {
  const entityType = String(link.entityType || '')
  const entityTypeLabel = entityTypeLabelMap.get(entityType) || toTitleLabel(entityType)
  const entityId = String(link.entityId || '').trim()
  const category = String(link.documentCategory || '')
  const categoryLabel = categoryLabelMap.get(category) || toTitleLabel(category)

  if (entityTypeLabel !== '-' && entityId) return `${entityTypeLabel} ${entityId}`
  if (categoryLabel !== '-') return categoryLabel
  return 'No linked record'
}

const getRowStatus = (links: AccountingInboxDocumentLinkDoc[]) => {
  const linkCount = links.length
  const primaryLinkCount = links.filter((link) => Boolean(link.isPrimary)).length

  if (primaryLinkCount > 0) {
    return {
      status: 'primary_linked',
      label: 'Primary Linked',
      tone: 'green' as const,
    }
  }

  if (linkCount > 1) {
    return {
      status: 'multi_linked',
      label: 'Multi-linked',
      tone: 'blue' as const,
    }
  }

  if (linkCount === 1) {
    return {
      status: 'linked',
      label: 'Linked',
      tone: 'blue' as const,
    }
  }

  return {
    status: 'ready_to_link',
    label: 'Ready To Link',
    tone: 'amber' as const,
  }
}

const buildLinkedRecord = (link: AccountingInboxDocumentLinkDoc): AccountingInboxLinkedRecord => {
  const entityType = String(link.entityType || '')
  const entityTypeLabel = entityTypeLabelMap.get(entityType) || toTitleLabel(entityType)
  const entityId = String(link.entityId || '').trim()
  const documentCategory = String(link.documentCategory || '')
  const documentCategoryLabel = categoryLabelMap.get(documentCategory) || toTitleLabel(documentCategory)
  const isPrimary = Boolean(link.isPrimary)
  const hasDocumentDate = Boolean(link.documentDate)

  return {
    id: String(link.id),
    linkReference: `DOC-LINK-${String(link.id).padStart(4, '0')}`,
    entityType,
    entityTypeLabel,
    entityId,
    entityLabel: entityId ? `${entityTypeLabel} ${entityId}` : entityTypeLabel,
    documentCategory,
    documentCategoryLabel,
    documentDate: link.documentDate || null,
    documentDateLabel: formatDate(link.documentDate),
    uploadedByLabel: formatUserLabel(link.uploadedBy),
    isPrimary,
    notes: String(link.notes || ''),
    createdAt: link.createdAt || null,
    createdAtLabel: formatDateTime(link.createdAt),
    updatedAtLabel: formatDateTime(link.updatedAt),
    stateLabel: isPrimary ? 'Primary' : hasDocumentDate ? 'Linked' : 'Missing Date',
    stateTone: isPrimary ? 'green' : hasDocumentDate ? 'blue' : 'amber',
  }
}

const buildLinksByMediaId = (documentLinks: AccountingInboxDocumentLinkDoc[]) => {
  const linksByMediaId = new Map<string, AccountingInboxDocumentLinkDoc[]>()

  for (const documentLink of documentLinks) {
    if (!documentLink) continue
    const mediaId = String(getRelationshipId(documentLink.media) || '').trim()
    if (!mediaId) continue

    const existing = linksByMediaId.get(mediaId) || []
    existing.push(documentLink)
    linksByMediaId.set(mediaId, existing)
  }

  linksByMediaId.forEach((links, mediaId) => {
    linksByMediaId.set(mediaId, sortLinksDescending(links))
  })

  return linksByMediaId
}

export const buildAccountingInboxRow = ({
  mediaDoc,
  documentLinks,
}: {
  mediaDoc: MediaDoc
  documentLinks: AccountingInboxDocumentLinkDoc[]
}): AccountingInboxRow => {
  const sortedLinks = sortLinksDescending(documentLinks)
  const latestLink = sortedLinks[0]
  const fileName =
    String(mediaDoc.filename || mediaDoc.alt || '').trim() || `Media ${String(mediaDoc.id)}`
  const mimeType = String(mediaDoc.mimeType || '').trim()
  const mimeFamily = getMimeFamily(mimeType, fileName)
  const mimeFamilyLabel = mimeFamilyLabelMap.get(mimeFamily) || 'Other'
  const fileUrl = mediaDoc.cloudinaryURL || mediaDoc.url || null
  const linkCount = sortedLinks.length
  const linkCountLabel = String(linkCount)
  const linkedCategories = Array.from(
    new Set(sortedLinks.map((link) => String(link.documentCategory || '').trim()).filter(Boolean)),
  )
  const linkedEntityTypes = Array.from(
    new Set(sortedLinks.map((link) => String(link.entityType || '').trim()).filter(Boolean)),
  )
  const linkedCategoryLabels = linkedCategories.map(
    (category) => categoryLabelMap.get(category) || toTitleLabel(category),
  )
  const linkedEntityTypeLabels = linkedEntityTypes.map(
    (entityType) => entityTypeLabelMap.get(entityType) || toTitleLabel(entityType),
  )
  const latestLinkedAt = normalizeLinkDate(latestLink)
  const latestLinkedAtLabel = formatDateTime(latestLinkedAt)
  const status = getRowStatus(sortedLinks)

  return {
    id: String(mediaDoc.id),
    mediaId: String(mediaDoc.id),
    fileName,
    fileUrl,
    mimeType,
    mimeTypeLabel: mimeType || '-',
    mimeFamily,
    mimeFamilyLabel,
    fileSize: Number(mediaDoc.filesize || 0),
    fileSizeLabel: formatFileSize(mediaDoc.filesize),
    uploadedAt: mediaDoc.createdAt || null,
    uploadedAtLabel: formatDateTime(mediaDoc.createdAt),
    linkCount,
    linkCountLabel,
    latestLinkLabel: latestLink ? buildLinkLabel(latestLink) : '-',
    latestLinkedAt,
    latestLinkedAtLabel,
    linkedCategories,
    linkedCategoryLabels,
    linkedEntityTypes,
    linkedEntityTypeLabels,
    status: status.status,
    statusLabel: status.label,
    statusTone: status.tone,
    hasPrimaryLink: sortedLinks.some((link) => Boolean(link.isPrimary)),
    isUnlinked: linkCount === 0,
    isMultiLinked: linkCount > 1,
    searchableText: buildSearchableText([
      fileName,
      mimeType,
      mimeFamilyLabel,
      status.label,
      mediaDoc.alt,
      linkedCategoryLabels.join(' '),
      linkedEntityTypeLabels.join(' '),
      sortedLinks.map((link) => buildLinkLabel(link)).join(' '),
      sortedLinks.map((link) => link.notes).join(' '),
      sortedLinks.map((link) => link.entityId).join(' '),
    ]),
    cells: [
      { text: fileName, emphasis: true },
      mimeFamilyLabel,
      formatDateTime(mediaDoc.createdAt),
      { text: linkCountLabel, align: 'right' },
      latestLink ? latestLinkLabelOrDash(latestLink) : '-',
      { text: status.label, tone: status.tone },
    ],
  }
}

const latestLinkLabelOrDash = (link: AccountingInboxDocumentLinkDoc) => buildLinkLabel(link) || '-'

const matchesQuickFilter = (row: AccountingInboxRow, quickFilter: string) => {
  const [group, value] = quickFilter.split(':')
  if (group === 'status' && value === 'ready_to_link') return row.isUnlinked
  if (group === 'status' && value === 'linked') return row.linkCount > 0
  if (group === 'status' && value === 'multi_linked') return row.isMultiLinked
  if (group === 'status' && value === 'primary') return row.hasPrimaryLink
  if (group === 'fileType') return row.mimeFamily === value
  if (group === 'recent' && value === '7d') {
    if (!row.uploadedAt) return false
    const uploadedAtTime = new Date(row.uploadedAt).getTime()
    const now = Date.now()
    return Number.isFinite(uploadedAtTime) && now - uploadedAtTime <= 7 * 24 * 60 * 60 * 1000
  }
  return false
}

export const matchesAccountingInboxFilters = (
  row: AccountingInboxRow,
  filters: {
    mimeFamilies: string[]
    statuses: string[]
    categories: string[]
    quickFilters: string[]
  },
) => {
  const predicates = [
    ...filters.mimeFamilies.map((mimeFamily) => row.mimeFamily === mimeFamily),
    ...filters.statuses.map((status) => row.status === status),
    ...filters.categories.map((category) => row.linkedCategories.includes(category)),
    ...filters.quickFilters.map((quickFilter) => matchesQuickFilter(row, quickFilter)),
  ]

  if (predicates.length === 0) return true
  return predicates.some(Boolean)
}

export const buildAccountingInboxMetrics = (rows: AccountingInboxRow[]) => [
  {
    id: 'accounting-inbox-total',
    label: 'Inbox Files',
    value: rows.length,
    change: 'Files currently visible in this intake view',
    trend: 'up' as const,
  },
  {
    id: 'accounting-inbox-linked',
    label: 'Linked Files',
    value: rows.filter((row) => row.linkCount > 0).length,
    change: 'Files already tied to accounting records',
    trend: 'up' as const,
  },
  {
    id: 'accounting-inbox-ready',
    label: 'Ready To Link',
    value: rows.filter((row) => row.isUnlinked).length,
    change: 'Uploads still waiting for document linkage',
    trend: 'neutral' as const,
  },
  {
    id: 'accounting-inbox-primary',
    label: 'Primary Linked',
    value: rows.filter((row) => row.hasPrimaryLink).length,
    change: 'Files marked as a primary support document',
    trend: 'up' as const,
  },
]

export const buildAccountingInboxReferenceData = (rows: AccountingInboxRow[]) => ({
  categories: ACCOUNTING_DOCUMENT_CATEGORY_OPTIONS.map((option) => ({
    label: option.label,
    value: option.value,
  })),
  entityTypes: ACCOUNTING_ENTITY_TYPE_OPTIONS.map((option) => ({
    label: option.label,
    value: option.value,
  })),
  mimeFamilies: Array.from(
    new Set(rows.map((row) => row.mimeFamily).filter(Boolean)),
  ).map((mimeFamily) => ({
    label: mimeFamilyLabelMap.get(mimeFamily) || 'Other',
    value: mimeFamily,
  })),
})

export const buildAccountingInboxDetail = ({
  mediaDoc,
  documentLinks,
}: {
  mediaDoc: MediaDoc
  documentLinks: AccountingInboxDocumentLinkDoc[]
}): AccountingInboxDetail => {
  const row = buildAccountingInboxRow({ mediaDoc, documentLinks })
  const linkedRecords = sortLinksDescending(documentLinks).map((link) => buildLinkedRecord(link))

  return {
    ...row,
    altText: String(mediaDoc.alt || ''),
    cloudinaryPublicId: String(mediaDoc.cloudinaryPublicId || ''),
    cloudinaryUrl: mediaDoc.cloudinaryURL || null,
    linkedRecords,
    usageSummary: {
      linkCount: linkedRecords.length,
      primaryLinkCount: linkedRecords.filter((linkedRecord) => linkedRecord.isPrimary).length,
      latestLinkedAtLabel: row.latestLinkedAtLabel,
      categorySummary: row.linkedCategoryLabels.join(', ') || '-',
      entityTypeSummary: row.linkedEntityTypeLabels.join(', ') || '-',
    },
  }
}

export const findAccountingInboxMedia = (payload: Payload) =>
  findAllDocs<MediaDoc>({
    payload,
    collection: 'media',
    depth: 0,
    sort: '-createdAt',
  })

export const findAccountingInboxDocumentLinks = (payload: Payload) =>
  findAllDocs<AccountingInboxDocumentLinkDoc>({
    payload,
    collection: ACCOUNTING_COLLECTION_SLUGS.documentLinks,
    depth: 1,
    sort: '-createdAt',
  })

export const buildAccountingInboxRegister = async (payload: Payload) => {
  const [mediaDocs, documentLinks] = await Promise.all([
    findAccountingInboxMedia(payload),
    findAccountingInboxDocumentLinks(payload),
  ])
  const linksByMediaId = buildLinksByMediaId(documentLinks)
  const rows = mediaDocs.map((mediaDoc) =>
    buildAccountingInboxRow({
      mediaDoc,
      documentLinks: linksByMediaId.get(String(mediaDoc.id)) || [],
    }),
  )

  return {
    rows,
    mediaDocs,
    linksByMediaId,
  }
}

export const normalizeSearch = (value: string | null | undefined) => normalizeSearchPart(value)

export const parseIntegerParam = (value: string | null, fallback: number) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

export const parseListParam = (searchParams: URLSearchParams, key: string) =>
  searchParams
    .getAll(key)
    .flatMap((entry) => entry.split(','))
    .map((entry) => entry.trim())
    .filter(Boolean)

export const findAccountingInboxMediaById = async ({
  payload,
  id,
}: {
  payload: Payload
  id: string
}) =>
  (await payload.findByID({
    collection: 'media',
    id: parseNumberParam(id) || id,
    depth: 0,
    overrideAccess: true,
  })) as MediaDoc

export const findAccountingInboxDetailById = async ({
  payload,
  id,
}: {
  payload: Payload
  id: string
}) => {
  const [mediaDoc, documentLinks] = await Promise.all([
    findAccountingInboxMediaById({ payload, id }),
    findAccountingInboxDocumentLinks(payload),
  ])
  const linksByMediaId = buildLinksByMediaId(documentLinks)
  return buildAccountingInboxDetail({
    mediaDoc,
    documentLinks: linksByMediaId.get(String(mediaDoc.id)) || [],
  })
}
