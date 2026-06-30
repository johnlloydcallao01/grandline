import type { Payload } from 'payload'
import {
  ACCOUNTING_DOCUMENT_CATEGORY_OPTIONS,
  ACCOUNTING_ENTITY_TYPE_OPTIONS,
} from '@/accounting/constants/accounting'
import type { AccountingInboxDocumentLinkDoc } from '../../document-intake/accounting-inbox/_shared'
import {
  findAccountingInboxDocumentLinks,
  normalizeSearch,
  parseIntegerParam,
  parseListParam,
} from '../../document-intake/accounting-inbox/_shared'
import { AccountingApiError } from '../../../_utils/auth'

type StatusTone = 'amber' | 'blue' | 'gray' | 'green' | 'red'

type CategoryDefinition = {
  typicalUse: string
  group: 'commercial' | 'receipts' | 'banking' | 'tax' | 'reference' | 'other'
  defaultNotes: string
}

const CATEGORY_DEFINITIONS: Record<string, CategoryDefinition> = {
  invoice: {
    typicalUse: 'Invoice support documents',
    group: 'commercial',
    defaultNotes: 'Used for invoice-linked support files and commercial backup.',
  },
  bill: {
    typicalUse: 'Bill support documents',
    group: 'commercial',
    defaultNotes: 'Used for vendor bills and payables support attachments.',
  },
  receipt: {
    typicalUse: 'Receipt support documents',
    group: 'receipts',
    defaultNotes: 'Used for receipt-linked files and cashier support records.',
  },
  proof_of_payment: {
    typicalUse: 'Payment confirmation files',
    group: 'receipts',
    defaultNotes: 'Used to evidence customer or vendor payment completion.',
  },
  expense_receipt: {
    typicalUse: 'Expense support receipts',
    group: 'receipts',
    defaultNotes: 'Main archive bucket for expense attachments and petty cash support.',
  },
  bank_statement: {
    typicalUse: 'Banking and reconciliation files',
    group: 'banking',
    defaultNotes: 'Used by reconciliation, statement, and cash-position workflows.',
  },
  contract: {
    typicalUse: 'Reference and agreement files',
    group: 'reference',
    defaultNotes: 'Used where commercial or operational agreements need support files.',
  },
  tax: {
    typicalUse: 'Tax filings and compliance support',
    group: 'tax',
    defaultNotes: 'Used for tax compliance packs, reports, and filing backup.',
  },
  other: {
    typicalUse: 'Other support files',
    group: 'other',
    defaultNotes: 'Fallback category for linked files that do not fit a specific bucket.',
  },
}

const categoryLabelMap = new Map<string, string>(
  ACCOUNTING_DOCUMENT_CATEGORY_OPTIONS.map((option) => [option.value, option.label]),
)

const entityTypeLabelMap = new Map<string, string>(
  ACCOUNTING_ENTITY_TYPE_OPTIONS.map((option) => [option.value, option.label]),
)

const groupLabelMap = new Map<string, string>([
  ['commercial', 'Commercial'],
  ['receipts', 'Receipts'],
  ['banking', 'Banking'],
  ['tax', 'Tax'],
  ['reference', 'Reference'],
  ['other', 'Other'],
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

const buildSearchableText = (parts: Array<string | number | null | undefined>) =>
  parts
    .map((part) =>
      String(part ?? '')
        .toLowerCase()
        .trim(),
    )
    .filter(Boolean)
    .join(' ')

const getCategoryDefinition = (category: string) =>
  CATEGORY_DEFINITIONS[category] || {
    typicalUse: 'Other support files',
    group: 'other' as const,
    defaultNotes: 'Fallback category for linked files that do not fit a specific bucket.',
  }

const buildEntityCounts = (links: AccountingInboxDocumentLinkDoc[]) => {
  const counts = new Map<string, number>()

  for (const link of links) {
    const entityType = String(link.entityType || '').trim()
    if (!entityType) continue
    counts.set(entityType, (counts.get(entityType) || 0) + 1)
  }

  return Array.from(counts.entries()).sort((left, right) => right[1] - left[1])
}

const buildPrimaryUsageLabel = (primaryLinkCount: number) =>
  primaryLinkCount > 0
    ? `${primaryLinkCount} primary link${primaryLinkCount === 1 ? '' : 's'}`
    : 'No primary usage'

const buildCategoryNotes = (category: string, links: AccountingInboxDocumentLinkDoc[]) => {
  const entityCounts = buildEntityCounts(links)
  const topEntityTypes = entityCounts
    .slice(0, 2)
    .map(([entityType]) => entityTypeLabelMap.get(entityType) || entityType)
    .filter(Boolean)

  if (topEntityTypes.length > 0) {
    return `Most used on ${topEntityTypes.join(' and ')} support records.`
  }

  return getCategoryDefinition(category).defaultNotes
}

export type DocumentCategoryCell =
  | string
  | {
      text: string
      tone?: StatusTone
      emphasis?: boolean
      align?: 'left' | 'right' | 'center'
    }

export type DocumentCategoryRecentLink = {
  id: string
  entityType: string
  entityTypeLabel: string
  entityId: string
  documentDateLabel: string
  linkedAtLabel: string
  isPrimary: boolean
}

export type DocumentCategoryRow = {
  id: string
  category: string
  categoryLabel: string
  group: string
  groupLabel: string
  typicalUse: string
  linkedRecordCount: number
  linkedRecordCountLabel: string
  primaryLinkCount: number
  primaryUsageLabel: string
  notes: string
  status: string
  statusLabel: string
  statusTone: StatusTone
  latestLinkedAt: string | null
  latestLinkedAtLabel: string
  searchableText: string
  cells: DocumentCategoryCell[]
}

export type DocumentCategoryDetail = DocumentCategoryRow & {
  receiptOriented: boolean
  canBePrimary: boolean
  entityCoverageSummary: string
  recentLinks: DocumentCategoryRecentLink[]
}

export const buildDocumentCategoryRow = ({
  category,
  links,
}: {
  category: string
  links: AccountingInboxDocumentLinkDoc[]
}): DocumentCategoryRow => {
  const definition = getCategoryDefinition(category)
  const categoryLabel = categoryLabelMap.get(category) || category
  const linkedRecordCount = links.length
  const primaryLinkCount = links.filter((link) => Boolean(link.isPrimary)).length
  const latestLinkedAt = links
    .map((link) => link.updatedAt || link.createdAt || link.documentDate || null)
    .filter(Boolean)
    .sort((left, right) => new Date(String(right)).getTime() - new Date(String(left)).getTime())[0] || null
  const notes = buildCategoryNotes(category, links)
  const status = linkedRecordCount > 0 ? 'active' : 'unused'
  const statusLabel = linkedRecordCount > 0 ? 'Active' : 'Unused'
  const statusTone = linkedRecordCount > 0 ? 'green' : 'gray'

  return {
    id: category,
    category,
    categoryLabel,
    group: definition.group,
    groupLabel: groupLabelMap.get(definition.group) || 'Other',
    typicalUse: definition.typicalUse,
    linkedRecordCount,
    linkedRecordCountLabel: String(linkedRecordCount),
    primaryLinkCount,
    primaryUsageLabel: buildPrimaryUsageLabel(primaryLinkCount),
    notes,
    status,
    statusLabel,
    statusTone,
    latestLinkedAt,
    latestLinkedAtLabel: formatDateTime(latestLinkedAt),
    searchableText: buildSearchableText([
      category,
      categoryLabel,
      definition.group,
      groupLabelMap.get(definition.group),
      definition.typicalUse,
      notes,
      linkedRecordCount,
      primaryLinkCount,
      statusLabel,
    ]),
    cells: [
      { text: category, emphasis: true },
      definition.typicalUse,
      { text: String(linkedRecordCount), align: 'right' },
      buildPrimaryUsageLabel(primaryLinkCount),
      notes,
      { text: statusLabel, tone: statusTone },
    ],
  }
}

export const buildDocumentCategoryDetail = ({
  category,
  links,
}: {
  category: string
  links: AccountingInboxDocumentLinkDoc[]
}): DocumentCategoryDetail => {
  const row = buildDocumentCategoryRow({ category, links })
  const entityCounts = buildEntityCounts(links)

  return {
    ...row,
    receiptOriented: ['receipt', 'proof_of_payment', 'expense_receipt'].includes(category),
    canBePrimary: true,
    entityCoverageSummary:
      entityCounts.length > 0
        ? entityCounts
            .slice(0, 4)
            .map(
              ([entityType, count]) =>
                `${entityTypeLabelMap.get(entityType) || entityType} (${count})`,
            )
            .join(', ')
        : 'No linked entity usage yet.',
    recentLinks: links
      .slice()
      .sort((left, right) => {
        const leftTime = new Date(left.updatedAt || left.createdAt || left.documentDate || 0).getTime()
        const rightTime = new Date(right.updatedAt || right.createdAt || right.documentDate || 0).getTime()
        return rightTime - leftTime
      })
      .slice(0, 10)
      .map((link) => ({
        id: String(link.id),
        entityType: String(link.entityType || ''),
        entityTypeLabel:
          entityTypeLabelMap.get(String(link.entityType || '')) || String(link.entityType || '-'),
        entityId: String(link.entityId || '').trim() || '-',
        documentDateLabel: formatDate(link.documentDate),
        linkedAtLabel: formatDateTime(link.updatedAt || link.createdAt),
        isPrimary: Boolean(link.isPrimary),
      })),
  }
}

export const findDocumentCategoriesRegister = async (payload: Payload) => {
  const links = await findAccountingInboxDocumentLinks(payload)

  return ACCOUNTING_DOCUMENT_CATEGORY_OPTIONS.map((option) =>
    buildDocumentCategoryRow({
      category: option.value,
      links: links.filter((link) => String(link.documentCategory || '').trim() === option.value),
    }),
  )
}

export const findDocumentCategoryDetailById = async ({
  payload,
  id,
}: {
  payload: Payload
  id: string
}) => {
  const category = decodeURIComponent(String(id || '')).trim()
  const categoryExists = ACCOUNTING_DOCUMENT_CATEGORY_OPTIONS.some((option) => option.value === category)

  if (!categoryExists) {
    throw new AccountingApiError('Document category not found.', 404)
  }

  const links = await findAccountingInboxDocumentLinks(payload)

  return buildDocumentCategoryDetail({
    category,
    links: links.filter((link) => String(link.documentCategory || '').trim() === category),
  })
}

const matchesDocumentCategoryQuickFilter = (row: DocumentCategoryRow, quickFilter: string) => {
  const [group, value] = quickFilter.split(':')
  if (group === 'group') return row.group === value
  if (group === 'status') return row.status === value
  return false
}

export const matchesDocumentCategoryFilters = (
  row: DocumentCategoryRow,
  filters: {
    groups: string[]
    statuses: string[]
    quickFilters: string[]
  },
) => {
  const predicates = [
    ...filters.groups.map((group) => row.group === group),
    ...filters.statuses.map((status) => row.status === status),
    ...filters.quickFilters.map((quickFilter) => matchesDocumentCategoryQuickFilter(row, quickFilter)),
  ]

  if (predicates.length === 0) return true
  return predicates.some(Boolean)
}

export const buildDocumentCategoryMetrics = (rows: DocumentCategoryRow[]) => [
  {
    id: 'document-categories-supported',
    label: 'Supported Categories',
    value: rows.length,
    change: 'Category options currently visible in this governance view',
    trend: 'neutral' as const,
  },
  {
    id: 'document-categories-active',
    label: 'Active Categories',
    value: rows.filter((row) => row.linkedRecordCount > 0).length,
    change: 'Categories represented in current linked records',
    trend: 'up' as const,
  },
  {
    id: 'document-categories-receipt',
    label: 'Receipt-Oriented',
    value: rows.filter((row) => row.group === 'receipts').length,
    change: 'Receipt-like categories currently in the filtered set',
    trend: 'neutral' as const,
  },
  {
    id: 'document-categories-primary',
    label: 'Primary-Capable',
    value: rows.length,
    change: 'Visible categories that can carry the primary-document flag',
    trend: 'neutral' as const,
  },
]

export const buildDocumentCategoryReferenceData = () => ({
  groups: Array.from(new Set(Object.values(CATEGORY_DEFINITIONS).map((definition) => definition.group))).map(
    (group) => ({
      label: groupLabelMap.get(group) || 'Other',
      value: group,
    }),
  ),
  statuses: [
    { label: 'Active', value: 'active' },
    { label: 'Unused', value: 'unused' },
  ],
})

export { normalizeSearch, parseIntegerParam, parseListParam }
