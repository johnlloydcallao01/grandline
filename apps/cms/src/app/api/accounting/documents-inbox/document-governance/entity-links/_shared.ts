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

type EntityLinkDefinition = {
    group:
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
    typicalUse: string
    defaultNotes: string
}

const ENTITY_LINK_DEFINITIONS: Record<string, EntityLinkDefinition> = {
    customer: {
        group: 'commercial',
        typicalUse: 'Customer master and receivables support',
        defaultNotes: 'Used when files support customer records and receivables workflows.',
    },
    vendor: {
        group: 'commercial',
        typicalUse: 'Vendor master and payables support',
        defaultNotes: 'Used when files support vendor setup and payable workflows.',
    },
    invoice: {
        group: 'commercial',
        typicalUse: 'Invoice transaction support',
        defaultNotes: 'Used for invoice attachments, billing packs, and revenue support documents.',
    },
    bill: {
        group: 'commercial',
        typicalUse: 'Bill and payables support',
        defaultNotes: 'Used for vendor bills and payables support attachments.',
    },
    payment_received: {
        group: 'commercial',
        typicalUse: 'Customer receipt support',
        defaultNotes: 'Used for received-payment backup and receipt evidence.',
    },
    payment_made: {
        group: 'commercial',
        typicalUse: 'Vendor payment support',
        defaultNotes: 'Used for payment-made support packs and settlement evidence.',
    },
    credit_note: {
        group: 'commercial',
        typicalUse: 'Credit note support',
        defaultNotes: 'Used for customer credit note backup and adjustment support.',
    },
    vendor_credit: {
        group: 'commercial',
        typicalUse: 'Vendor credit support',
        defaultNotes: 'Used for vendor credit evidence and payable adjustments.',
    },
    payment_allocation: {
        group: 'commercial',
        typicalUse: 'Allocation and settlement support',
        defaultNotes: 'Used where receipts or payments are allocated across documents.',
    },
    receipt: {
        group: 'commercial',
        typicalUse: 'Receipt issuance support',
        defaultNotes: 'Used for official receipt backup and customer payment evidence.',
    },
    refund: {
        group: 'commercial',
        typicalUse: 'Refund support',
        defaultNotes: 'Used for refund approvals, references, and payment evidence.',
    },
    enrollment_billing_link: {
        group: 'commercial',
        typicalUse: 'Enrollment billing support',
        defaultNotes: 'Used for LMS billing link support and tuition-related documentation.',
    },
    corporate_billing_link: {
        group: 'commercial',
        typicalUse: 'Corporate billing support',
        defaultNotes: 'Used for corporate sponsorship and billing support documents.',
    },
    expense: {
        group: 'expenses',
        typicalUse: 'Expense transaction support',
        defaultNotes: 'Used for expense receipts, claim support, and petty cash attachments.',
    },
    approval_workflow: {
        group: 'expenses',
        typicalUse: 'Approval workflow support',
        defaultNotes: 'Used for approval routing evidence and finance sign-off support.',
    },
    approval_request: {
        group: 'expenses',
        typicalUse: 'Approval request support',
        defaultNotes: 'Used for request-level supporting documents during approvals.',
    },
    bank_transaction: {
        group: 'banking',
        typicalUse: 'Bank transaction support',
        defaultNotes: 'Used for bank transaction evidence and matching support files.',
    },
    bank_reconciliation: {
        group: 'banking',
        typicalUse: 'Reconciliation support',
        defaultNotes: 'Used for reconciliation packs, statements, and match evidence.',
    },
    deposit: {
        group: 'banking',
        typicalUse: 'Deposit support',
        defaultNotes: 'Used for deposit slips, summaries, and remittance attachments.',
    },
    transfer: {
        group: 'banking',
        typicalUse: 'Transfer support',
        defaultNotes: 'Used for inter-account transfer references and bank evidence.',
    },
    journal_entry: {
        group: 'journals',
        typicalUse: 'Journal entry support',
        defaultNotes: 'Used for manual journal support, narratives, and audit evidence.',
    },
    depreciation_entry: {
        group: 'journals',
        typicalUse: 'Depreciation posting support',
        defaultNotes: 'Used for depreciation schedules and posting support records.',
    },
    project: {
        group: 'projects',
        typicalUse: 'Project support',
        defaultNotes: 'Used for project-level contracts, references, and budget support.',
    },
    project_task: {
        group: 'projects',
        typicalUse: 'Project task support',
        defaultNotes: 'Used for task-level operational support and project evidence.',
    },
    time_entry: {
        group: 'projects',
        typicalUse: 'Time entry support',
        defaultNotes: 'Used for time capture evidence and supporting references.',
    },
    timesheet: {
        group: 'projects',
        typicalUse: 'Timesheet support',
        defaultNotes: 'Used for batch timesheet evidence and review support.',
    },
    budget: {
        group: 'projects',
        typicalUse: 'Budget support',
        defaultNotes: 'Used for budgeting packs, assumptions, and planning backup.',
    },
    forecast_scenario: {
        group: 'projects',
        typicalUse: 'Forecast scenario support',
        defaultNotes: 'Used for forecasting assumptions and scenario references.',
    },
    fixed_asset: {
        group: 'assets',
        typicalUse: 'Fixed asset support',
        defaultNotes: 'Used for asset acquisition files, warranties, and records.',
    },
    asset_disposal: {
        group: 'assets',
        typicalUse: 'Asset disposal support',
        defaultNotes: 'Used for disposal approvals, sale references, and write-off support.',
    },
    payroll_run: {
        group: 'payroll',
        typicalUse: 'Payroll run support',
        defaultNotes: 'Used for payroll batch packs and payrun references.',
    },
    payroll_entry: {
        group: 'payroll',
        typicalUse: 'Payroll posting support',
        defaultNotes: 'Used for payroll journal support and employee posting evidence.',
    },
    instructor_payout: {
        group: 'payroll',
        typicalUse: 'Instructor payout support',
        defaultNotes: 'Used for payout calculations and supporting payout files.',
    },
    scholarship_award: {
        group: 'payroll',
        typicalUse: 'Scholarship award support',
        defaultNotes: 'Used for award approvals and scholarship backing documents.',
    },
    revenue_recognition_schedule: {
        group: 'journals',
        typicalUse: 'Revenue recognition support',
        defaultNotes: 'Used for recognition schedules and deferred revenue support.',
    },
    branch: {
        group: 'organization',
        typicalUse: 'Branch support',
        defaultNotes: 'Used for branch-level records and local operational documents.',
    },
    department: {
        group: 'organization',
        typicalUse: 'Department support',
        defaultNotes: 'Used for departmental approvals, memos, and references.',
    },
    location: {
        group: 'organization',
        typicalUse: 'Location support',
        defaultNotes: 'Used for location-level agreements and operational references.',
    },
    audit_log: {
        group: 'governance',
        typicalUse: 'Audit and control support',
        defaultNotes: 'Used for audit evidence, control review, and governance files.',
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

const getEntityLinkDefinition = (entityType: string) =>
    ENTITY_LINK_DEFINITIONS[entityType] || {
        group: 'other' as const,
        typicalUse: 'General accounting support',
        defaultNotes: 'Used for support files linked to this accounting entity type.',
    }

const getNormalizedLinkTime = (link: AccountingInboxDocumentLinkDoc | null | undefined) =>
    link?.updatedAt || link?.createdAt || link?.documentDate || null

const sortLinksDescending = (links: AccountingInboxDocumentLinkDoc[]) =>
    links
        .filter((link): link is AccountingInboxDocumentLinkDoc => Boolean(link))
        .slice()
        .sort((left, right) => {
            const leftTime = new Date(getNormalizedLinkTime(left) || 0).getTime()
            const rightTime = new Date(getNormalizedLinkTime(right) || 0).getTime()
            return rightTime - leftTime
        })

const buildCategoryCounts = (links: AccountingInboxDocumentLinkDoc[]) => {
    const counts = new Map<string, number>()

    for (const link of links) {
        if (!link) continue
        const category = String(link.documentCategory || '').trim()
        if (!category) continue
        counts.set(category, (counts.get(category) || 0) + 1)
    }

    return Array.from(counts.entries()).sort((left, right) => right[1] - left[1])
}

const buildUniqueEntityIds = (links: AccountingInboxDocumentLinkDoc[]) =>
    Array.from(
        new Set(
            links
                .filter((link): link is AccountingInboxDocumentLinkDoc => Boolean(link))
                .map((link) => String(link.entityId || '').trim())
                .filter(Boolean),
        ),
    )

const buildEntityStatus = ({
    linkedRecordCount,
    primaryLinkCount,
}: {
    linkedRecordCount: number
    primaryLinkCount: number
}) => {
    if (primaryLinkCount > 0) {
        return {
            status: 'primary_covered',
            statusLabel: 'Primary Covered',
            statusTone: 'green' as const,
        }
    }

    if (linkedRecordCount > 0) {
        return {
            status: 'active',
            statusLabel: 'Active',
            statusTone: 'blue' as const,
        }
    }

    return {
        status: 'unused',
        statusLabel: 'Unused',
        statusTone: 'gray' as const,
    }
}

const buildEntityLinkNotes = (entityType: string, links: AccountingInboxDocumentLinkDoc[]) => {
    const categoryCounts = buildCategoryCounts(links)
    const topCategoryLabels = categoryCounts
        .slice(0, 2)
        .map(([category]) => categoryLabelMap.get(category) || category)
        .filter(Boolean)
    const uniqueEntityIds = buildUniqueEntityIds(links)

    if (topCategoryLabels.length > 0) {
        return `Most linked through ${topCategoryLabels.join(' and ')} documents across ${uniqueEntityIds.length || 1} record${uniqueEntityIds.length === 1 ? '' : 's'}.`
    }

    return getEntityLinkDefinition(entityType).defaultNotes
}

export type EntityLinksCell =
    | string
    | {
        text: string
        tone?: StatusTone
        emphasis?: boolean
        align?: 'left' | 'right' | 'center'
    }

export type EntityLinkRecentRecord = {
    id: string
    entityId: string
    documentCategory: string
    documentCategoryLabel: string
    documentDateLabel: string
    linkedAtLabel: string
    isPrimary: boolean
}

export type EntityLinksRow = {
    id: string
    entityType: string
    entityTypeLabel: string
    group: string
    groupLabel: string
    typicalUse: string
    linkedRecordCount: number
    linkedRecordCountLabel: string
    uniqueEntityIdCount: number
    uniqueEntityIdCountLabel: string
    latestEntityId: string
    latestLinkedAt: string | null
    latestLinkedAtLabel: string
    commonCategory: string
    commonCategoryLabel: string
    primaryLinkCount: number
    primaryLinkCountLabel: string
    notes: string
    status: string
    statusLabel: string
    statusTone: StatusTone
    searchableText: string
    cells: EntityLinksCell[]
}

export type EntityLinksDetail = EntityLinksRow & {
    categoryCoverageSummary: string
    activeEntityIdSummary: string
    recentLinks: EntityLinkRecentRecord[]
}

export const buildEntityLinksRow = ({
    entityType,
    links,
}: {
    entityType: string
    links: AccountingInboxDocumentLinkDoc[]
}): EntityLinksRow => {
    const definition = getEntityLinkDefinition(entityType)
    const entityTypeLabel = entityTypeLabelMap.get(entityType) || entityType
    const sortedLinks = sortLinksDescending(links)
    const linkedRecordCount = sortedLinks.length
    const primaryLinkCount = sortedLinks.filter((link) => Boolean(link.isPrimary)).length
    const uniqueEntityIds = buildUniqueEntityIds(sortedLinks)
    const latestLink = sortedLinks[0]
    const latestEntityId = String(latestLink?.entityId || '').trim() || '-'
    const latestLinkedAt = getNormalizedLinkTime(latestLink) || null
    const categoryCounts = buildCategoryCounts(sortedLinks)
    const topCategory = categoryCounts[0]?.[0] || ''
    const topCategoryLabel = topCategory
        ? categoryLabelMap.get(topCategory) || topCategory
        : 'No category usage yet'
    const entityStatus = buildEntityStatus({ linkedRecordCount, primaryLinkCount })
    const notes = buildEntityLinkNotes(entityType, sortedLinks)

    return {
        id: entityType,
        entityType,
        entityTypeLabel,
        group: definition.group,
        groupLabel: groupLabelMap.get(definition.group) || 'Other',
        typicalUse: definition.typicalUse,
        linkedRecordCount,
        linkedRecordCountLabel: String(linkedRecordCount),
        uniqueEntityIdCount: uniqueEntityIds.length,
        uniqueEntityIdCountLabel: String(uniqueEntityIds.length),
        latestEntityId,
        latestLinkedAt,
        latestLinkedAtLabel: formatDateTime(latestLinkedAt),
        commonCategory: topCategory,
        commonCategoryLabel: topCategoryLabel,
        primaryLinkCount,
        primaryLinkCountLabel: String(primaryLinkCount),
        notes,
        status: entityStatus.status,
        statusLabel: entityStatus.statusLabel,
        statusTone: entityStatus.statusTone,
        searchableText: buildSearchableText([
            entityType,
            entityTypeLabel,
            definition.group,
            groupLabelMap.get(definition.group),
            definition.typicalUse,
            latestEntityId,
            latestLinkedAt,
            topCategory,
            topCategoryLabel,
            linkedRecordCount,
            primaryLinkCount,
            notes,
            entityStatus.statusLabel,
        ]),
        cells: [
            { text: entityTypeLabel, emphasis: true },
            { text: String(linkedRecordCount), align: 'right' },
            latestEntityId,
            topCategoryLabel,
            { text: String(primaryLinkCount), align: 'right' },
            { text: entityStatus.statusLabel, tone: entityStatus.statusTone },
        ],
    }
}

export const buildEntityLinksDetail = ({
    entityType,
    links,
}: {
    entityType: string
    links: AccountingInboxDocumentLinkDoc[]
}): EntityLinksDetail => {
    const row = buildEntityLinksRow({ entityType, links })
    const categoryCounts = buildCategoryCounts(links)
    const uniqueEntityIds = buildUniqueEntityIds(links)

    return {
        ...row,
        categoryCoverageSummary:
            categoryCounts.length > 0
                ? categoryCounts
                    .slice(0, 4)
                    .map(([category, count]) => `${categoryLabelMap.get(category) || category} (${count})`)
                    .join(', ')
                : 'No category usage yet.',
        activeEntityIdSummary:
            uniqueEntityIds.length > 0 ? uniqueEntityIds.slice(0, 6).join(', ') : 'No linked entity IDs yet.',
        recentLinks: sortLinksDescending(links)
            .slice(0, 10)
            .map((link) => {
                const documentCategory = String(link.documentCategory || '').trim()

                return {
                    id: String(link.id),
                    entityId: String(link.entityId || '').trim() || '-',
                    documentCategory,
                    documentCategoryLabel:
                        categoryLabelMap.get(documentCategory) || documentCategory || 'Uncategorized',
                    documentDateLabel: formatDate(link.documentDate),
                    linkedAtLabel: formatDateTime(getNormalizedLinkTime(link)),
                    isPrimary: Boolean(link.isPrimary),
                }
            }),
    }
}

export const findEntityLinksRegister = async (payload: Payload) => {
    const links = await findAccountingInboxDocumentLinks(payload)

    return ACCOUNTING_ENTITY_TYPE_OPTIONS.map((option) =>
        buildEntityLinksRow({
            entityType: option.value,
            links: links.filter((link) => String(link.entityType || '').trim() === option.value),
        }),
    )
}

export const findEntityLinksDetailById = async ({
    payload,
    id,
}: {
    payload: Payload
    id: string
}) => {
    const entityType = decodeURIComponent(String(id || '')).trim()
    const entityTypeExists = ACCOUNTING_ENTITY_TYPE_OPTIONS.some((option) => option.value === entityType)

    if (!entityTypeExists) {
        throw new AccountingApiError('Entity link target not found.', 404)
    }

    const links = await findAccountingInboxDocumentLinks(payload)

    return buildEntityLinksDetail({
        entityType,
        links: links.filter((link) => String(link.entityType || '').trim() === entityType),
    })
}

const matchesEntityLinksQuickFilter = (row: EntityLinksRow, quickFilter: string) => {
    const [group, value] = quickFilter.split(':')
    if (group === 'group') return row.group === value
    if (group === 'status') return row.status === value
    return false
}

export const matchesEntityLinksFilters = (
    row: EntityLinksRow,
    filters: {
        groups: string[]
        statuses: string[]
        quickFilters: string[]
    },
) => {
    const predicates = [
        ...filters.groups.map((group) => row.group === group),
        ...filters.statuses.map((status) => row.status === status),
        ...filters.quickFilters.map((quickFilter) => matchesEntityLinksQuickFilter(row, quickFilter)),
    ]

    if (predicates.length === 0) return true
    return predicates.some(Boolean)
}

export const buildEntityLinksMetrics = (rows: EntityLinksRow[]) => [
    {
        id: 'entity-links-supported',
        label: 'Supported Entity Types',
        value: rows.length,
        change: 'Entity targets defined by backend options in this governance view',
        trend: 'neutral' as const,
    },
    {
        id: 'entity-links-active',
        label: 'Currently Used Types',
        value: rows.filter((row) => row.linkedRecordCount > 0).length,
        change: 'Entity types represented in current linked records',
        trend: 'up' as const,
    },
    {
        id: 'entity-links-commercial',
        label: 'Commercial Types',
        value: rows.filter((row) => row.group === 'commercial').length,
        change: 'Commercial entity coverage in the filtered set',
        trend: 'neutral' as const,
    },
    {
        id: 'entity-links-banking-journals',
        label: 'Banking / Journal Types',
        value: rows.filter((row) => row.group === 'banking' || row.group === 'journals').length,
        change: 'Banking and journal entity coverage in the filtered set',
        trend: 'neutral' as const,
    },
]

export const buildEntityLinksReferenceData = () => ({
    groups: Array.from(
        new Set(ACCOUNTING_ENTITY_TYPE_OPTIONS.map((option) => getEntityLinkDefinition(option.value).group)),
    ).map((group) => ({
        label: groupLabelMap.get(group) || 'Other',
        value: group,
    })),
    statuses: [
        { label: 'Primary Covered', value: 'primary_covered' },
        { label: 'Active', value: 'active' },
        { label: 'Unused', value: 'unused' },
    ],
})

export { normalizeSearch, parseIntegerParam, parseListParam }
