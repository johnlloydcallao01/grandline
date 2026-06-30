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

type PrimaryDocumentGroup =
  | 'commercial'
  | 'expenses'
  | 'banking'
  | 'journals'
  | 'projects'
  | 'assets'
  | 'payroll'
  | 'organization'
  | 'governance'
  | 'other'

const ENTITY_GROUP_MAP: Record<string, PrimaryDocumentGroup> = {
  customer: 'commercial',
  vendor: 'commercial',
  invoice: 'commercial',
  bill: 'commercial',
  payment_received: 'commercial',
  payment_made: 'commercial',
  credit_note: 'commercial',
  vendor_credit: 'commercial',
  payment_allocation: 'commercial',
  receipt: 'commercial',
  refund: 'commercial',
  enrollment_billing_link: 'commercial',
  corporate_billing_link: 'commercial',
  expense: 'expenses',
  approval_workflow: 'expenses',
  approval_request: 'expenses',
  bank_transaction: 'banking',
  bank_reconciliation: 'banking',
  deposit: 'banking',
  transfer: 'banking',
  journal_entry: 'journals',
  depreciation_entry: 'journals',
  revenue_recognition_schedule: 'journals',
  project: 'projects',
  project_task: 'projects',
  time_entry: 'projects',
  timesheet: 'projects',
  budget: 'projects',
  forecast_scenario: 'projects',
  fixed_asset: 'assets',
  asset_disposal: 'assets',
  payroll_run: 'payroll',
  payroll_entry: 'payroll',
  instructor_payout: 'payroll',
  scholarship_award: 'payroll',
  branch: 'organization',
  department: 'organization',
  location: 'organization',
  audit_log: 'governance',
}

const categoryLabelMap = new Map<string, string>(
  ACCOUNTING_DOCUMENT_CATEGORY_OPTIONS.map((option) => [option.value, option.label]),
)

const entityTypeLabelMap = new Map<string, string>(
  ACCOUNTING_ENTITY_TYPE_OPTIONS.map((option) => [option.value, option.label]),
)

const groupLabelMap = new Map<string, string>([
  ['commercial', 'Commercial'],
  ['expenses', 'Expenses'],
  ['banking', 'Banking'],
  ['journals', 'Journals'],
  ['projects', 'Projects'],
  ['assets', 'Assets'],
  ['payroll', 'Payroll'],
  ['organization', 'Organization'],
  ['governance', 'Governance'],
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

const formatFileName = (link: AccountingInboxDocumentLinkDoc) => {
  if (link.media && typeof link.media === 'object' && 'filename' in link.media) {
    return String(link.media.filename || `File ${String(link.media.id)}`)
  }
  return `Document Link ${String(link.id)}`
}

type UserLike = {
  id?: number | string | null
  firstName?: string | null
  lastName?: string | null
  username?: string | null
  email?: string | null
}

const formatUserLabel = (value: unknown) => {
  if (typeof value === 'object' && value !== null) {
    const user = value as UserLike
    const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ').trim()
    return fullName || user.username || user.email || `User ${String(user.id || '')}` || '-'
  }
  return value ? `User ${String(value)}` : '-'
}

const getEntityGroup = (entityType: string): PrimaryDocumentGroup =>
  ENTITY_GROUP_MAP[entityType] || 'other'

export type PrimaryDocumentCell =
  | string
  | {
      text: string
      tone?: StatusTone
      emphasis?: boolean
      align?: 'left' | 'right' | 'center'
    }

export type PrimaryDocumentRecentLink = {
  id: string
  entityType: string
  entityTypeLabel: string
  entityId: string
  documentCategory: string
  documentCategoryLabel: string
  documentDateLabel: string
  linkedAtLabel: string
  isPrimary: boolean
}

export type PrimaryDocumentRow = {
  id: string
  linkId: string
  fileName: string
  entityType: string
  entityTypeLabel: string
  entityId: string
  category: string
  categoryLabel: string
  group: string
  groupLabel: string
  uploadedBy: string
  uploadedByLabel: string
  documentDate: string | null
  documentDateLabel: string
  status: string
  statusLabel: string
  statusTone: StatusTone
  notes: string
  createdAt: string | null
  createdAtLabel: string
  updatedAtLabel: string
  searchableText: string
  cells: PrimaryDocumentCell[]
}

export type PrimaryDocumentDetail = PrimaryDocumentRow & {
  fileMimeType: string
  fileSizeLabel: string
  categoryCoverageSummary: string
  recentLinks: PrimaryDocumentRecentLink[]
}

export const buildPrimaryDocumentRow = ({
  link,
  _allLinks,
}: {
  link: AccountingInboxDocumentLinkDoc
  _allLinks: AccountingInboxDocumentLinkDoc[]
}): PrimaryDocumentRow => {
  const entityType = String(link.entityType || '').trim()
  const entityTypeLabel = entityTypeLabelMap.get(entityType) || entityType || '-'
  const entityId = String(link.entityId || '').trim() || '-'
  const category = String(link.documentCategory || '').trim()
  const categoryLabel = categoryLabelMap.get(category) || category || 'Uncategorized'
  const group = getEntityGroup(entityType)
  const groupLabel = groupLabelMap.get(group) || 'Other'
  const uploadedBy = formatUserLabel(link.uploadedBy)
  const fileName = formatFileName(link)
  const documentDate = link.documentDate || null
  const notes = String(link.notes || '')
  const status = 'primary'
  const statusLabel = 'Primary'
  const statusTone: StatusTone = 'green'

  return {
    id: String(link.id),
    linkId: String(link.id),
    fileName,
    entityType,
    entityTypeLabel,
    entityId,
    category,
    categoryLabel,
    group,
    groupLabel,
    uploadedBy,
    uploadedByLabel: uploadedBy,
    documentDate,
    documentDateLabel: formatDate(documentDate),
    status,
    statusLabel,
    statusTone,
    notes,
    createdAt: link.createdAt || null,
    createdAtLabel: formatDateTime(link.createdAt),
    updatedAtLabel: formatDateTime(link.updatedAt),
    searchableText: buildSearchableText([
      fileName,
      entityType,
      entityTypeLabel,
      entityId,
      category,
      categoryLabel,
      uploadedBy,
      notes,
      statusLabel,
      formatDate(documentDate),
    ]),
    cells: [
      { text: fileName, emphasis: true },
      entityTypeLabel,
      entityId,
      categoryLabel,
      uploadedBy,
      { text: statusLabel, tone: statusTone },
    ],
  }
}

export const buildPrimaryDocumentDetail = ({
  link,
  allLinks,
}: {
  link: AccountingInboxDocumentLinkDoc
  allLinks: AccountingInboxDocumentLinkDoc[]
}): PrimaryDocumentDetail => {
  const row = buildPrimaryDocumentRow({ link, _allLinks: allLinks })

  const mimeType =
    link.media && typeof link.media === 'object'
      ? String((link.media as { mimeType?: string }).mimeType || '-')
      : '-'
  const fileSize =
    link.media && typeof link.media === 'object'
      ? Number((link.media as { filesize?: number }).filesize || 0)
      : 0
  const fileSizeLabel =
    fileSize > 0
      ? (() => {
          const units = ['Bytes', 'KB', 'MB', 'GB']
          const exponent = Math.min(
            Math.floor(Math.log(fileSize) / Math.log(1024)),
            units.length - 1,
          )
          const size = fileSize / 1024 ** exponent
          return `${size.toFixed(exponent === 0 ? 0 : 2)} ${units[exponent]}`
        })()
      : '-'

  const matchingEntityType = String(link.entityType || '').trim()
  const linksForEntity = allLinks.filter(
    (other) => String(other.entityType || '').trim() === matchingEntityType,
  )
  const categoryCounts = new Map<string, number>()
  for (const other of linksForEntity) {
    const cat = String(other.documentCategory || '').trim()
    if (cat) categoryCounts.set(cat, (categoryCounts.get(cat) || 0) + 1)
  }
  const sortedCategories = Array.from(categoryCounts.entries()).sort((a, b) => b[1] - a[1])
  const categoryCoverageSummary =
    sortedCategories.length > 0
      ? sortedCategories
          .slice(0, 4)
          .map(([cat, count]) => `${categoryLabelMap.get(cat) || cat} (${count})`)
          .join(', ')
      : 'No category usage'

  const recentLinks: PrimaryDocumentRecentLink[] = allLinks
    .filter((other) => String(other.entityType || '').trim() === matchingEntityType)
    .sort((a, b) => {
      const aTime = new Date(a.updatedAt || a.createdAt || a.documentDate || 0).getTime()
      const bTime = new Date(b.updatedAt || b.createdAt || b.documentDate || 0).getTime()
      return bTime - aTime
    })
    .slice(0, 10)
    .map((other) => {
      const otherCategory = String(other.documentCategory || '').trim()
      return {
        id: String(other.id),
        entityType: String(other.entityType || ''),
        entityTypeLabel:
          entityTypeLabelMap.get(String(other.entityType || '')) || String(other.entityType || '-'),
        entityId: String(other.entityId || '').trim() || '-',
        documentCategory: otherCategory,
        documentCategoryLabel:
          categoryLabelMap.get(otherCategory) || otherCategory || 'Uncategorized',
        documentDateLabel: formatDate(other.documentDate),
        linkedAtLabel: formatDateTime(other.updatedAt || other.createdAt),
        isPrimary: Boolean(other.isPrimary),
      }
    })

  return {
    ...row,
    fileMimeType: mimeType,
    fileSizeLabel,
    categoryCoverageSummary,
    recentLinks,
  }
}

export const findPrimaryDocumentsRegister = async (payload: Payload) => {
  const links = await findAccountingInboxDocumentLinks(payload)

  return links
    .filter((link) => Boolean(link.isPrimary))
    .map((link) => buildPrimaryDocumentRow({ link, _allLinks: links }))
}

export const findPrimaryDocumentDetailById = async ({
  payload,
  id,
}: {
  payload: Payload
  id: string
}) => {
  const links = await findAccountingInboxDocumentLinks(payload)
  const match = links.find((link) => String(link.id) === String(id))

  if (!match) {
    throw new AccountingApiError('Primary document link not found.', 404)
  }

  return buildPrimaryDocumentDetail({ link: match, allLinks: links })
}

const matchesPrimaryDocumentQuickFilter = (row: PrimaryDocumentRow, quickFilter: string) => {
  const [prefix, value] = quickFilter.split(':')
  if (prefix === 'group') return row.group === value
  if (prefix === 'entity') return row.entityType === value
  return false
}

export const matchesPrimaryDocumentFilters = (
  row: PrimaryDocumentRow,
  filters: {
    groups: string[]
    categories: string[]
    quickFilters: string[]
  },
) => {
  const predicates = [
    ...filters.groups.map((group) => row.group === group),
    ...filters.categories.map((category) => row.category === category),
    ...filters.quickFilters.map((qf) => matchesPrimaryDocumentQuickFilter(row, qf)),
  ]

  if (predicates.length === 0) return true
  return predicates.some(Boolean)
}

export const buildPrimaryDocumentMetrics = (rows: PrimaryDocumentRow[]) => {
  const commercialRows = rows.filter((row) => row.group === 'commercial')
  const expenseRows = rows.filter((row) => row.group === 'expenses')
  const bankingJournalRows = rows.filter(
    (row) => row.group === 'banking' || row.group === 'journals',
  )

  return [
    {
      id: 'primary-links',
      label: 'Primary Links',
      value: rows.length,
      change: 'Document links flagged as primary',
      trend: 'up' as const,
    },
    {
      id: 'primary-commercial',
      label: 'Commercial Primary',
      value: commercialRows.length,
      change: 'Primary files for invoices, bills, and receipts',
      trend: 'neutral' as const,
    },
    {
      id: 'primary-expense',
      label: 'Expense Primary',
      value: expenseRows.length,
      change: 'Primary files for expense records',
      trend: 'neutral' as const,
    },
    {
      id: 'primary-banking-journals',
      label: 'Banking / Journal Primary',
      value: bankingJournalRows.length,
      change: 'Primary files for banking and journal support',
      trend: 'neutral' as const,
    },
  ]
}

export const buildPrimaryDocumentReferenceData = () => ({
  groups: Array.from(new Set(Object.values(ENTITY_GROUP_MAP))).map((group) => ({
    label: groupLabelMap.get(group) || 'Other',
    value: group,
  })),
  categories: ACCOUNTING_DOCUMENT_CATEGORY_OPTIONS.map((option) => ({
    label: option.label,
    value: option.value,
  })),
})

export { normalizeSearch, parseIntegerParam, parseListParam }
