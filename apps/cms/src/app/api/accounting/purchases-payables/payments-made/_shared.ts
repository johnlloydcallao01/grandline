import { APIError, type Payload } from 'payload'
import {
    ACCOUNTING_COLLECTION_SLUGS,
    PAYMENT_METHOD_OPTIONS,
    SIMPLE_POSTING_STATUS_OPTIONS,
} from '@/accounting/constants/accounting'
import { AccountingCommercialService } from '@/accounting/services/AccountingCommercialService'
import { getRelationshipId } from '@/accounting/utils/accounting-audit'
import { findAllDocs } from '@/accounting/utils/findAllDocs'
import { normalizeAmount } from '@/accounting/utils/amounts'
import {
    buildBillsReferenceData,
    formatCurrency,
    formatDate,
    normalizeSearch,
    parseIntegerParam,
    parseListParam,
} from '../bills/_shared'

type StatusTone = 'amber' | 'blue' | 'gray' | 'green' | 'red'

type VendorDoc = {
    id: number | string
    vendorCode?: string | null
    displayName?: string | null
    status?: string | null
    currencyReference?: {
        code?: string | null
    } | null
    paymentTermReference?: {
        name?: string | null
    } | null
}

type BankAccountDoc = {
    id: number | string
    accountName?: string | null
    bankName?: string | null
    accountNumberMasked?: string | null
    accountType?: string | null
    isActive?: boolean | null
    currencyReference?: {
        code?: string | null
    } | null
    ledgerAccount?: {
        id?: number | string
        code?: string | null
        name?: string | null
    } | number | string | null
}

type DocumentLinkDoc = {
    id: number | string
}

type BankTransactionDoc = {
    id: number | string
}

type PaymentMadeApplicationDoc = {
    bill?:
    | {
        id?: number | string
        billNumber?: string | null
        balanceDue?: number | null
        status?: string | null
    }
    | number
    | string
    | null
    amountApplied?: number | null
} | null

export type PaymentMadeDoc = {
    id: number | string
    paymentNumber?: string | null
    vendor?: VendorDoc | number | string | null
    paymentDate?: string | null
    postingDate?: string | null
    fiscalYear?:
    | {
        id?: number | string
        name?: string | null
        yearCode?: string | null
    }
    | number
    | string
    | null
    period?:
    | {
        id?: number | string
        name?: string | null
        periodCode?: string | null
    }
    | number
    | string
    | null
    paymentMethod?: string | null
    bankAccount?: BankAccountDoc | number | string | null
    amountPaid?: number | null
    currency?: string | null
    exchangeRate?: number | null
    status?: string | null
    applications?: PaymentMadeApplicationDoc[] | null
    postedJournalEntry?:
    | {
        id?: number | string
    }
    | number
    | string
    | null
    referenceNumber?: string | null
    notes?: string | null
    createdAt?: string | null
    updatedAt?: string | null
}

type PaymentMadeMutationApplication = {
    bill?: unknown
    amountApplied?: unknown
}

export type PaymentsMadeCell =
    | string
    | {
        text: string
        tone?: StatusTone
        emphasis?: boolean
        align?: 'left' | 'right' | 'center'
    }

export type PaymentMadeRegisterRow = {
    id: string
    paymentNumber: string
    paymentDate: string | null
    paymentDateLabel: string
    vendorId: string
    vendorLabel: string
    paymentMethod: string
    paymentMethodLabel: string
    bankAccountId: string
    bankAccountLabel: string
    amountPaid: number
    amountPaidLabel: string
    appliedAmount: number
    appliedAmountLabel: string
    unappliedAmount: number
    unappliedAmountLabel: string
    status: string
    statusLabel: string
    statusTone: StatusTone
    referenceNumber: string
    postedJournalEntryId: string
    hasApplications: boolean
    hasUnappliedAmount: boolean
    searchableText: string
    cells: PaymentsMadeCell[]
}

export type PaymentMadeDetail = {
    id: string
    paymentNumber: string
    vendorId: string
    vendorLabel: string
    vendorCurrency: string
    vendorPaymentTerms: string
    paymentDate: string | null
    paymentDateLabel: string
    postingDate: string | null
    postingDateLabel: string
    paymentMethod: string
    paymentMethodLabel: string
    bankAccountId: string
    bankAccountLabel: string
    bankAccountType: string
    amountPaid: number
    amountPaidLabel: string
    appliedAmount: number
    appliedAmountLabel: string
    unappliedAmount: number
    unappliedAmountLabel: string
    currency: string
    exchangeRate: number
    status: string
    statusLabel: string
    statusTone: StatusTone
    referenceNumber: string
    notes: string
    postedJournalEntryId: string
    fiscalYearId: string
    fiscalYearLabel: string
    periodId: string
    periodLabel: string
    createdAt: string | null
    updatedAt: string | null
    applications: Array<{
        id: string
        billId: string
        billLabel: string
        billBalanceDue: number
        billBalanceDueLabel: string
        billStatus: string
        billStatusLabel: string
        amountApplied: number
        amountAppliedLabel: string
    }>
    usageSummary: {
        applicationCount: number
        documentCount: number
        matchedBankTransactionCount: number
        hasPostedJournalEntry: boolean
        canEdit: boolean
        canDelete: boolean
    }
}

export type PaymentMadeMetric = {
    id: string
    label: string
    value: number | string
    change: string
    trend: 'up' | 'down' | 'neutral'
}

const statusLabelMap = new Map<string, string>(
    SIMPLE_POSTING_STATUS_OPTIONS.map((option) => [option.value, option.label]),
)

const paymentMethodLabelMap = new Map<string, string>(
    PAYMENT_METHOD_OPTIONS.map((option) => [option.value, option.label]),
)

const toTitleLabel = (value: string | null | undefined) =>
    String(value || '')
        .split('_')
        .join(' ')
        .replace(/\b\w/g, (character: string) => character.toUpperCase())

const getStatusTone = (status: string | null | undefined): StatusTone => {
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

const buildSearchableText = (parts: Array<unknown>) =>
    parts
        .map((part) => normalizeSearch(part))
        .filter(Boolean)
        .join(' ')

const buildVendorLabel = (vendor: PaymentMadeDoc['vendor']) => {
    if (typeof vendor === 'object' && vendor) {
        return `${vendor.vendorCode ? `${vendor.vendorCode} - ` : ''}${vendor.displayName || `Vendor ${vendor.id || ''}`}`.trim()
    }

    return String(vendor || 'Unassigned Vendor')
}

const buildBankAccountLabel = (bankAccount: PaymentMadeDoc['bankAccount']) => {
    if (typeof bankAccount === 'object' && bankAccount) {
        return [
            bankAccount.accountName || `Bank Account ${bankAccount.id || ''}`,
            bankAccount.bankName || null,
            bankAccount.accountNumberMasked || null,
        ]
            .filter(Boolean)
            .join(' - ')
    }

    return String(bankAccount || '')
}

const normalizeRelationshipId = (value: unknown) => {
    if (value === undefined || value === null || value === '') return null
    const stringValue = String(value).trim()
    if (!stringValue || stringValue === 'null' || stringValue === 'undefined') return null
    const numeric = Number(stringValue)
    return Number.isFinite(numeric) ? numeric : stringValue
}

const normalizeOptionalString = (value: unknown) => {
    if (value === undefined) return undefined
    if (value === null) return null
    const normalized = String(value).trim()
    return normalized || null
}

const assertRelationshipExists = async (
    payload: Payload,
    collection: string,
    relationshipId: string | number | null,
    label: string,
) => {
    if (!relationshipId) {
        throw new Error(`${label} is required.`)
    }

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

export const normalizePaymentMadeMutationBody = (body: Record<string, unknown>) => {
    const applications = Array.isArray(body.applications)
        ? (body.applications as PaymentMadeMutationApplication[])
        : undefined

    return {
        ...(body.paymentNumber !== undefined ? { paymentNumber: normalizeOptionalString(body.paymentNumber) } : {}),
        ...(body.vendor !== undefined ? { vendor: normalizeRelationshipId(body.vendor) } : {}),
        ...(body.paymentDate !== undefined ? { paymentDate: normalizeOptionalString(body.paymentDate) } : {}),
        ...(body.postingDate !== undefined ? { postingDate: normalizeOptionalString(body.postingDate) } : {}),
        ...(body.paymentMethod !== undefined ? { paymentMethod: normalizeOptionalString(body.paymentMethod) } : {}),
        ...(body.bankAccount !== undefined ? { bankAccount: normalizeRelationshipId(body.bankAccount) } : {}),
        ...(body.amountPaid !== undefined ? { amountPaid: normalizeAmount(body.amountPaid) } : {}),
        ...(body.currency !== undefined ? { currency: normalizeOptionalString(body.currency) } : {}),
        ...(body.exchangeRate !== undefined ? { exchangeRate: Number(body.exchangeRate) } : {}),
        ...(body.status !== undefined ? { status: String(body.status || 'draft') } : {}),
        ...(body.referenceNumber !== undefined
            ? { referenceNumber: normalizeOptionalString(body.referenceNumber) }
            : {}),
        ...(body.notes !== undefined ? { notes: normalizeOptionalString(body.notes) } : {}),
        ...(applications !== undefined
            ? {
                applications: applications.map((application) => ({
                    bill: normalizeRelationshipId(application.bill),
                    amountApplied: normalizeAmount(application.amountApplied),
                })),
            }
            : {}),
    }
}

export const assertPaymentMadeMutationPayload = async (
    payload: Payload,
    body: ReturnType<typeof normalizePaymentMadeMutationBody>,
) => {
    if ('vendor' in body) {
        await assertRelationshipExists(payload, ACCOUNTING_COLLECTION_SLUGS.vendors, body.vendor || null, 'Vendor')
    }

    if ('bankAccount' in body) {
        await assertRelationshipExists(
            payload,
            ACCOUNTING_COLLECTION_SLUGS.bankAccounts,
            body.bankAccount || null,
            'Bank account',
        )
    }

    if ('paymentDate' in body && !body.paymentDate) throw new Error('Payment date is required.')
    if ('postingDate' in body && !body.postingDate) throw new Error('Posting date is required.')

    if ('paymentMethod' in body) {
        if (!body.paymentMethod) throw new Error('Payment method is required.')
        if (!paymentMethodLabelMap.has(String(body.paymentMethod))) {
            throw new Error('Payment method is invalid.')
        }
    }

    if (body.amountPaid !== undefined && body.amountPaid <= 0) {
        throw new Error('Amount paid must be greater than zero.')
    }

    if (body.exchangeRate !== undefined && (!Number.isFinite(body.exchangeRate) || body.exchangeRate <= 0)) {
        throw new Error('Exchange rate must be greater than zero.')
    }

    if ('status' in body && String(body.status || 'draft') !== 'draft') {
        throw new Error('Editable payments may only be saved as Draft. Use Post to finalize the disbursement.')
    }

    if (body.applications) {
        await AccountingCommercialService.validateBillApplications(payload, body.applications, body.vendor)
        const appliedAmount = AccountingCommercialService.getAppliedAmountFromArray(body.applications)
        if (body.amountPaid !== undefined && appliedAmount > body.amountPaid) {
            throw new Error('Applied bill allocations cannot exceed the payment amount.')
        }
    }
}

export const assertMutablePaymentMade = (paymentMade: PaymentMadeDoc) => {
    const status = String(paymentMade.status || '')
    if (['posted', 'voided'].includes(status)) {
        throw new APIError('Posted or voided payment disbursements cannot be edited directly.', 400)
    }
}

export const buildPaymentMadeRow = (paymentMade: PaymentMadeDoc): PaymentMadeRegisterRow => {
    const paymentMadeId = String(paymentMade.id)
    const amountPaid = normalizeAmount(paymentMade.amountPaid)
    const appliedAmount = AccountingCommercialService.getAppliedAmountFromArray(paymentMade.applications)
    const unappliedAmount = normalizeAmount(amountPaid - appliedAmount)
    const status = String(paymentMade.status || 'draft')
    const paymentMethod = String(paymentMade.paymentMethod || '')
    const vendorLabel = buildVendorLabel(paymentMade.vendor)
    const bankAccountLabel = buildBankAccountLabel(paymentMade.bankAccount)

    return {
        id: paymentMadeId,
        paymentNumber: String(paymentMade.paymentNumber || `Payment ${paymentMadeId}`),
        paymentDate: paymentMade.paymentDate || null,
        paymentDateLabel: formatDate(paymentMade.paymentDate),
        vendorId: String(getRelationshipId(paymentMade.vendor) || ''),
        vendorLabel,
        paymentMethod,
        paymentMethodLabel: paymentMethodLabelMap.get(paymentMethod) || toTitleLabel(paymentMethod),
        bankAccountId: String(getRelationshipId(paymentMade.bankAccount) || ''),
        bankAccountLabel,
        amountPaid,
        amountPaidLabel: formatCurrency(amountPaid, String(paymentMade.currency || 'PHP')),
        appliedAmount,
        appliedAmountLabel: formatCurrency(appliedAmount, String(paymentMade.currency || 'PHP')),
        unappliedAmount,
        unappliedAmountLabel: formatCurrency(unappliedAmount, String(paymentMade.currency || 'PHP')),
        status,
        statusLabel: statusLabelMap.get(status) || toTitleLabel(status),
        statusTone: getStatusTone(status),
        referenceNumber: String(paymentMade.referenceNumber || ''),
        postedJournalEntryId: String(getRelationshipId(paymentMade.postedJournalEntry) || ''),
        hasApplications: appliedAmount > 0,
        hasUnappliedAmount: unappliedAmount > 0,
        searchableText: buildSearchableText([
            paymentMade.paymentNumber,
            paymentMade.paymentDate,
            vendorLabel,
            paymentMethod,
            paymentMethodLabelMap.get(paymentMethod),
            bankAccountLabel,
            paymentMade.referenceNumber,
            paymentMade.notes,
        ]),
        cells: [
            { text: String(paymentMade.paymentNumber || `Payment ${paymentMadeId}`), emphasis: true },
            formatDate(paymentMade.paymentDate),
            vendorLabel,
            paymentMethodLabelMap.get(paymentMethod) || toTitleLabel(paymentMethod),
            { text: formatCurrency(amountPaid, String(paymentMade.currency || 'PHP')), emphasis: true, align: 'right' },
            { text: statusLabelMap.get(status) || toTitleLabel(status), tone: getStatusTone(status) },
        ],
    }
}

export const matchesPaymentsMadeQuickFilter = (row: PaymentMadeRegisterRow, quickFilter: string) => {
    const [group, value] = quickFilter.split(':')
    if (group === 'status') return row.status === value
    if (group === 'paymentMethod') return row.paymentMethod === value
    if (group === 'application' && value === 'with_applications') return row.hasApplications
    if (group === 'application' && value === 'unapplied') return row.hasUnappliedAmount
    return false
}

export const matchesSelectedPaymentsMadeFilters = (
    row: PaymentMadeRegisterRow,
    filters: {
        statuses: string[]
        paymentMethods: string[]
        vendorIds: string[]
        applicationStates: string[]
        quickFilters: string[]
    },
) => {
    const predicates = [
        ...filters.statuses.map((status) => row.status === status),
        ...filters.paymentMethods.map((paymentMethod) => row.paymentMethod === paymentMethod),
        ...filters.vendorIds.map((vendorId) => row.vendorId === vendorId),
        ...filters.applicationStates.map((state) => matchesPaymentsMadeQuickFilter(row, `application:${state}`)),
        ...filters.quickFilters.map((quickFilter) => matchesPaymentsMadeQuickFilter(row, quickFilter)),
    ]

    if (predicates.length === 0) {
        return true
    }

    return predicates.some(Boolean)
}

export const buildPaymentsMadeMetrics = (rows: PaymentMadeRegisterRow[]): PaymentMadeMetric[] => [
    {
        id: 'payments-made-draft',
        label: 'Draft Payments',
        value: rows.filter((row) => row.status === 'draft').length,
        change: 'Prepared for release or posting',
        trend: 'neutral',
    },
    {
        id: 'payments-made-posted',
        label: 'Posted Payments',
        value: rows.filter((row) => row.status === 'posted').length,
        change: 'Registered as completed disbursements',
        trend: 'up',
    },
    {
        id: 'payments-made-unapplied',
        label: 'Unapplied Value',
        value: formatCurrency(rows.reduce((sum, row) => sum + row.unappliedAmount, 0)),
        change: 'Payments not yet fully tied to bills',
        trend: 'down',
    },
    {
        id: 'payments-made-bank-transfer',
        label: 'Bank Transfer Volume',
        value: formatCurrency(
            rows
                .filter((row) => row.paymentMethod === 'bank_transfer')
                .reduce((sum, row) => sum + row.amountPaid, 0),
        ),
        change: 'Primary payment method in the filtered view',
        trend: 'up',
    },
]

export const buildPaymentsMadeReferenceData = async (payload: Payload) => {
    const [baseReferenceData, bills, bankAccounts] = await Promise.all([
        buildBillsReferenceData(payload),
        payload.find({
            collection: ACCOUNTING_COLLECTION_SLUGS.bills,
            depth: 1,
            limit: 500,
            sort: '-billDate',
            overrideAccess: true,
            where: {
                status: {
                    not_equals: 'voided',
                },
            } as never,
        }),
        payload.find({
            collection: ACCOUNTING_COLLECTION_SLUGS.bankAccounts,
            depth: 1,
            limit: 500,
            sort: 'accountName',
            overrideAccess: true,
        }),
    ])

    return {
        vendors: baseReferenceData.vendors,
        bills: bills.docs.map((bill: any) => {
            const vendor = typeof bill.vendor === 'object' && bill.vendor ? bill.vendor : null
            const vendorLabel = vendor
                ? `${vendor.vendorCode ? `${vendor.vendorCode} - ` : ''}${vendor.displayName || `Vendor ${vendor.id || ''}`}`.trim()
                : ''

            return {
                id: bill.id,
                billNumber: bill.billNumber || null,
                vendorId: String(getRelationshipId(bill.vendor) || ''),
                vendorLabel,
                status: bill.status || '',
                balanceDue: normalizeAmount(bill.balanceDue),
                currency: bill.currency || 'PHP',
            }
        }),
        bankAccounts: bankAccounts.docs.map((bankAccount: any) => ({
            id: bankAccount.id,
            accountName: bankAccount.accountName || null,
            bankName: bankAccount.bankName || null,
            accountNumberMasked: bankAccount.accountNumberMasked || null,
            accountType: bankAccount.accountType || null,
            currency: bankAccount.currencyReference?.code || null,
            ledgerAccountCode: bankAccount.ledgerAccount?.code || null,
            ledgerAccountName: bankAccount.ledgerAccount?.name || null,
            isActive: Boolean(bankAccount.isActive),
        })),
    }
}

export const buildPaymentMadeDetailContext = async (
    payload: Payload,
    paymentMadeId: string | number,
): Promise<PaymentMadeDetail> => {
    const paymentMade = (await payload.findByID({
        collection: ACCOUNTING_COLLECTION_SLUGS.paymentsMade,
        id: paymentMadeId,
        depth: 2,
        overrideAccess: true,
    })) as PaymentMadeDoc

    const [documentLinks, matchedBankTransactions] = await Promise.all([
        findAllDocs<DocumentLinkDoc>({
            payload,
            collection: ACCOUNTING_COLLECTION_SLUGS.documentLinks,
            depth: 0,
            where: {
                and: [
                    { entityType: { equals: 'payment_made' } },
                    { entityId: { equals: String(paymentMadeId) } },
                ],
            } as never,
        }),
        findAllDocs<BankTransactionDoc>({
            payload,
            collection: ACCOUNTING_COLLECTION_SLUGS.bankTransactions,
            depth: 0,
            where: {
                and: [
                    { matchedEntityType: { equals: 'payment_made' } },
                    { matchedEntityId: { equals: String(paymentMadeId) } },
                ],
            } as never,
        }),
    ])

    const vendor = typeof paymentMade.vendor === 'object' && paymentMade.vendor ? paymentMade.vendor : null
    const bankAccount =
        typeof paymentMade.bankAccount === 'object' && paymentMade.bankAccount ? paymentMade.bankAccount : null
    const amountPaid = normalizeAmount(paymentMade.amountPaid)
    const appliedAmount = AccountingCommercialService.getAppliedAmountFromArray(paymentMade.applications)
    const unappliedAmount = normalizeAmount(amountPaid - appliedAmount)
    const status = String(paymentMade.status || 'draft')
    const paymentMethod = String(paymentMade.paymentMethod || '')
    const canEdit = !['posted', 'voided'].includes(status)
    const canDelete =
        canEdit &&
        !getRelationshipId(paymentMade.postedJournalEntry) &&
        documentLinks.length === 0 &&
        matchedBankTransactions.length === 0

    return {
        id: String(paymentMade.id),
        paymentNumber: String(paymentMade.paymentNumber || `Payment ${paymentMade.id}`),
        vendorId: String(getRelationshipId(paymentMade.vendor) || ''),
        vendorLabel: buildVendorLabel(paymentMade.vendor),
        vendorCurrency: String(vendor?.currencyReference?.code || paymentMade.currency || ''),
        vendorPaymentTerms: String(vendor?.paymentTermReference?.name || ''),
        paymentDate: paymentMade.paymentDate || null,
        paymentDateLabel: formatDate(paymentMade.paymentDate),
        postingDate: paymentMade.postingDate || null,
        postingDateLabel: formatDate(paymentMade.postingDate),
        paymentMethod,
        paymentMethodLabel: paymentMethodLabelMap.get(paymentMethod) || toTitleLabel(paymentMethod),
        bankAccountId: String(getRelationshipId(paymentMade.bankAccount) || ''),
        bankAccountLabel: buildBankAccountLabel(paymentMade.bankAccount),
        bankAccountType: String(bankAccount?.accountType || ''),
        amountPaid,
        amountPaidLabel: formatCurrency(amountPaid, String(paymentMade.currency || 'PHP')),
        appliedAmount,
        appliedAmountLabel: formatCurrency(appliedAmount, String(paymentMade.currency || 'PHP')),
        unappliedAmount,
        unappliedAmountLabel: formatCurrency(unappliedAmount, String(paymentMade.currency || 'PHP')),
        currency: String(paymentMade.currency || 'PHP'),
        exchangeRate: Number(paymentMade.exchangeRate || 1),
        status,
        statusLabel: statusLabelMap.get(status) || toTitleLabel(status),
        statusTone: getStatusTone(status),
        referenceNumber: String(paymentMade.referenceNumber || ''),
        notes: String(paymentMade.notes || ''),
        postedJournalEntryId: String(getRelationshipId(paymentMade.postedJournalEntry) || ''),
        fiscalYearId: String(getRelationshipId(paymentMade.fiscalYear) || ''),
        fiscalYearLabel:
            typeof paymentMade.fiscalYear === 'object' && paymentMade.fiscalYear
                ? String(paymentMade.fiscalYear.yearCode || paymentMade.fiscalYear.name || '')
                : '',
        periodId: String(getRelationshipId(paymentMade.period) || ''),
        periodLabel:
            typeof paymentMade.period === 'object' && paymentMade.period
                ? String(paymentMade.period.periodCode || paymentMade.period.name || '')
                : '',
        createdAt: paymentMade.createdAt || null,
        updatedAt: paymentMade.updatedAt || null,
        applications: (paymentMade.applications || []).map((application, index) => {
            const bill = typeof application?.bill === 'object' && application.bill ? application.bill : null
            const billStatus = String(bill?.status || '')
            const amountAppliedValue = normalizeAmount(application?.amountApplied)

            return {
                id: `${paymentMade.id}-${index + 1}`,
                billId: String(getRelationshipId(application?.bill) || ''),
                billLabel: String(bill?.billNumber || `Bill ${getRelationshipId(application?.bill) || index + 1}`),
                billBalanceDue: normalizeAmount(bill?.balanceDue),
                billBalanceDueLabel: formatCurrency(normalizeAmount(bill?.balanceDue), String(paymentMade.currency || 'PHP')),
                billStatus,
                billStatusLabel: billStatus ? toTitleLabel(billStatus) : '-',
                amountApplied: amountAppliedValue,
                amountAppliedLabel: formatCurrency(amountAppliedValue, String(paymentMade.currency || 'PHP')),
            }
        }),
        usageSummary: {
            applicationCount: Array.isArray(paymentMade.applications) ? paymentMade.applications.length : 0,
            documentCount: documentLinks.length,
            matchedBankTransactionCount: matchedBankTransactions.length,
            hasPostedJournalEntry: Boolean(getRelationshipId(paymentMade.postedJournalEntry)),
            canEdit,
            canDelete,
        },
    }
}

export const computePaymentMadeDeleteBarriers = async (
    payload: Payload,
    paymentMade: PaymentMadeDoc,
) => {
    const barriers: string[] = []
    const status = String(paymentMade.status || '')

    if (['posted', 'voided'].includes(status)) {
        barriers.push(`status is ${status}`)
    }

    if (getRelationshipId(paymentMade.postedJournalEntry)) {
        barriers.push('linked posted journal entry exists')
    }

    const [documentLinks, matchedBankTransactions] = await Promise.all([
        findAllDocs<DocumentLinkDoc>({
            payload,
            collection: ACCOUNTING_COLLECTION_SLUGS.documentLinks,
            depth: 0,
            where: {
                and: [
                    { entityType: { equals: 'payment_made' } },
                    { entityId: { equals: String(paymentMade.id) } },
                ],
            } as never,
        }),
        findAllDocs<BankTransactionDoc>({
            payload,
            collection: ACCOUNTING_COLLECTION_SLUGS.bankTransactions,
            depth: 0,
            where: {
                and: [
                    { matchedEntityType: { equals: 'payment_made' } },
                    { matchedEntityId: { equals: String(paymentMade.id) } },
                ],
            } as never,
        }),
    ])

    if (documentLinks.length > 0) {
        barriers.push(`linked to ${documentLinks.length} support document(s)`)
    }

    if (matchedBankTransactions.length > 0) {
        barriers.push(`matched to ${matchedBankTransactions.length} bank transaction(s)`)
    }

    return barriers
}

export { normalizeSearch, parseIntegerParam, parseListParam }
