import type { Payload } from 'payload'
import {
  ACCOUNTING_COLLECTION_SLUGS,
  EXPENSE_PAYMENT_METHOD_OPTIONS,
  SIMPLE_POSTING_STATUS_OPTIONS,
} from '@/accounting/constants/accounting'
import { AccountingExpenseService } from '@/accounting/services/expenses/AccountingExpenseService'
import type {
  AccountingExpensePaymentMethod,
  AccountingSimplePostingStatus,
} from '@/accounting/types/accounting'
import { findAllDocs } from '@/accounting/utils/findAllDocs'
import { getRelationshipId } from '@/accounting/utils/accounting-audit'
import { normalizeAmount } from '@/accounting/utils/amounts'
import { parseNumberParam } from '../_utils/auth'

type StatusTone = 'amber' | 'blue' | 'gray' | 'green' | 'red'

export type ExpenseCell =
  | string
  | {
      text: string
      tone?: StatusTone
      emphasis?: boolean
      align?: 'left' | 'right' | 'center'
    }

export type ExpenseDoc = {
  id: number | string
  expenseNumber?: string | null
  expenseDate?: string | null
  postingDate?: string | null
  vendor?:
    | {
        id?: number | string
        vendorCode?: string | null
        displayName?: string | null
      }
    | number
    | string
    | null
  expenseCategory?: string | null
  paymentMethod?: string | null
  status?: string | null
  currency?: string | null
  subtotal?: number | null
  taxTotal?: number | null
  total?: number | null
  project?:
    | {
        id?: number | string
        projectCode?: string | null
        name?: string | null
      }
    | number
    | string
    | null
  expenseAccount?:
    | {
        id?: number | string
        code?: string | null
        name?: string | null
      }
    | number
    | string
    | null
  taxCode?:
    | {
        id?: number | string
        code?: string | null
        name?: string | null
        rate?: number | null
        calculationMethod?: string | null
        purchaseAccount?:
          | {
              id?: number | string
              code?: string | null
              name?: string | null
            }
          | number
          | string
          | null
      }
    | number
    | string
    | null
  paymentAccount?:
    | {
        id?: number | string
        code?: string | null
        name?: string | null
      }
    | number
    | string
    | null
  bankAccount?:
    | {
        id?: number | string
        accountName?: string | null
        bankName?: string | null
        accountNumberMasked?: string | null
        ledgerAccount?: {
          id?: number | string
          code?: string | null
          name?: string | null
        } | null
      }
    | number
    | string
    | null
  postedJournalEntry?:
    | {
        id?: number | string
      }
    | number
    | string
    | null
  notes?: string | null
  createdAt?: string | null
  updatedAt?: string | null
}

type DocumentLinkDoc = {
  id: number | string
  entityType?: string | null
  entityId?: string | null
  documentCategory?: string | null
  documentDate?: string | null
  isPrimary?: boolean | null
  notes?: string | null
}

export type ExpenseRow = {
  id: string
  expenseNumber: string
  expenseDate: string | null
  expenseDateLabel: string
  postingDate: string | null
  postingDateLabel: string
  vendorId: string
  vendorCode: string
  vendorLabel: string
  expenseCategory: string
  paymentMethod: string
  paymentMethodLabel: string
  status: string
  statusLabel: string
  statusTone: StatusTone
  currency: string
  subtotal: number
  subtotalLabel: string
  taxTotal: number
  taxTotalLabel: string
  total: number
  totalLabel: string
  projectId: string
  projectLabel: string
  expenseAccountId: string
  expenseAccountLabel: string
  taxCodeId: string
  taxCodeLabel: string
  paymentAccountId: string
  paymentAccountLabel: string
  bankAccountId: string
  bankAccountLabel: string
  postedJournalEntryId: string
  notes: string
  hasTaxCode: boolean
  isCash: boolean
  searchableText: string
  cells: ExpenseCell[]
}

export type ExpenseDetail = {
  id: string
  expenseNumber: string
  expenseDate: string | null
  expenseDateLabel: string
  postingDate: string | null
  postingDateLabel: string
  vendorId: string
  vendorLabel: string
  expenseCategory: string
  paymentMethod: string
  paymentMethodLabel: string
  status: string
  statusLabel: string
  statusTone: StatusTone
  currency: string
  subtotal: number
  subtotalLabel: string
  taxTotal: number
  taxTotalLabel: string
  total: number
  totalLabel: string
  projectId: string
  projectLabel: string
  expenseAccountId: string
  expenseAccountLabel: string
  taxCodeId: string
  taxCodeLabel: string
  taxRate: number
  taxCalculationMethod: string
  paymentAccountId: string
  paymentAccountLabel: string
  bankAccountId: string
  bankAccountLabel: string
  postedJournalEntryId: string
  notes: string
  createdAt: string | null
  updatedAt: string | null
  documentLinks: Array<{
    id: string
    documentCategory: string
    documentCategoryLabel: string
    documentDate: string | null
    documentDateLabel: string
    isPrimary: boolean
    notes: string
  }>
  usageSummary: {
    documentCount: number
    hasJournalLink: boolean
    hasDependents: boolean
  }
}

export type ExpenseDetailRegisterRow = {
  id: string
  expenseNumber: string
  vendorId: string
  vendorLabel: string
  taxCodeId: string
  taxCodeLabel: string
  taxTotal: number
  taxTotalLabel: string
  total: number
  totalLabel: string
  status: string
  statusLabel: string
  statusTone: StatusTone
  documentCount: number
  documentCountLabel: string
  hasJournalLink: boolean
  journalLinkLabel: string
  searchableText: string
  cells: ExpenseCell[]
}

export type ExpenseMutationBody = {
  expenseNumber?: string | null
  expenseDate?: string | null
  postingDate?: string | null
  vendor?: number | string | null
  expenseCategory?: string | null
  paymentMethod?: AccountingExpensePaymentMethod
  status?: AccountingSimplePostingStatus | 'draft'
  currency?: string | null
  subtotal?: number
  project?: number | string | null
  expenseAccount?: number | string | null
  taxCode?: number | string | null
  paymentAccount?: number | string | null
  bankAccount?: number | string | null
  notes?: string | null
  autoPost?: boolean
}

type ExpensePersistedMutationBody = {
  expenseNumber?: string
  expenseDate?: string
  postingDate?: string
  vendor?: number | string | null
  expenseCategory?: string | null
  paymentMethod?: AccountingExpensePaymentMethod
  status?: AccountingSimplePostingStatus | 'draft'
  currency?: string
  subtotal?: number
  project?: number | string | null
  expenseAccount?: number | string | null
  taxCode?: number | string | null
  paymentAccount?: number | string | null
  bankAccount?: number | string | null
  notes?: string | null
}

type ExpenseAccountLike =
  | {
      id?: number | string
      code?: string | null
      name?: string | null
    }
  | number
  | string
  | null
  | undefined

const statusLabelMap = new Map<string, string>(
  SIMPLE_POSTING_STATUS_OPTIONS.map((option) => [option.value, option.label]),
)
const paymentMethodLabelMap = new Map<string, string>(
  EXPENSE_PAYMENT_METHOD_OPTIONS.map((option) => [option.value, option.label]),
)

export type ExpensePostingFlags = {
  mutableExpenseIds: string[]
  postableExpenseIds: string[]
  postBlockedByExpenseId: Record<string, string[]>
  hasDefaultInputTaxAccount: boolean
}

export const parseIntegerParam = (value: string | null | undefined, fallback: number) => {
  const parsedValue = Number.parseInt(String(value ?? ''), 10)
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
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value || 0))

const toTitleLabel = (value: string | null | undefined) =>
  String(value || '')
    .split('_')
    .join(' ')
    .replace(/\b\w/g, (char: string) => char.toUpperCase())

const buildSearchableText = (parts: Array<unknown>) =>
  parts
    .map((part) => normalizeSearch(part))
    .filter(Boolean)
    .join(' ')

const normalizeRelationshipId = (value: unknown) => {
  if (value === undefined || value === null || value === '') return null
  const stringValue = String(value).trim()
  if (!stringValue || stringValue === 'null' || stringValue === 'undefined') return null
  return parseNumberParam(stringValue)
}

const normalizeOptionalString = (value: unknown) => {
  if (value === undefined) return undefined
  if (value === null) return null
  const normalized = String(value).trim()
  return normalized || null
}

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

const formatVendorLabel = (vendor: ExpenseDoc['vendor']) => {
  if (typeof vendor === 'object' && vendor) {
    return `${vendor.vendorCode ? `${vendor.vendorCode} - ` : ''}${vendor.displayName || `Vendor ${vendor.id || ''}`}`.trim()
  }

  return String(vendor || 'Walk-in / Unassigned')
}

const formatProjectLabel = (project: ExpenseDoc['project']) => {
  if (typeof project === 'object' && project) {
    return `${project.projectCode ? `${project.projectCode} - ` : ''}${project.name || `Project ${project.id || ''}`}`.trim()
  }

  return ''
}

const formatAccountLabel = (account: ExpenseAccountLike) => {
  if (typeof account === 'object' && account) {
    return `${account.code ? `${account.code} - ` : ''}${account.name || 'Unnamed account'}`
  }

  return ''
}

const formatBankAccountLabel = (bankAccount: ExpenseDoc['bankAccount']) => {
  if (typeof bankAccount === 'object' && bankAccount) {
    const suffix = bankAccount.accountNumberMasked ? ` (${bankAccount.accountNumberMasked})` : ''
    return `${bankAccount.accountName || 'Unnamed bank account'}${suffix}`
  }

  return ''
}

export const buildExpenseRow = (expense: ExpenseDoc): ExpenseRow => {
  const expenseId = String(expense.id)
  const currency = String(expense.currency || 'PHP')
  const status = String(expense.status || 'draft')
  const paymentMethod = String(expense.paymentMethod || 'bank')
  const vendorLabel = formatVendorLabel(expense.vendor)
  const total = normalizeAmount(expense.total)
  const subtotal = normalizeAmount(expense.subtotal)
  const taxTotal = normalizeAmount(expense.taxTotal)
  const taxCodeId = String(getRelationshipId(expense.taxCode) || '')
  const paymentAccountLabel =
    formatAccountLabel(expense.paymentAccount) ||
    (typeof expense.bankAccount === 'object' && expense.bankAccount
      ? formatAccountLabel(expense.bankAccount.ledgerAccount)
      : '')

  return {
    id: expenseId,
    expenseNumber: String(expense.expenseNumber || `Expense ${expenseId}`),
    expenseDate: expense.expenseDate || null,
    expenseDateLabel: formatDate(expense.expenseDate),
    postingDate: expense.postingDate || null,
    postingDateLabel: formatDate(expense.postingDate),
    vendorId: String(getRelationshipId(expense.vendor) || ''),
    vendorCode:
      typeof expense.vendor === 'object' && expense.vendor ? String(expense.vendor.vendorCode || '') : '',
    vendorLabel,
    expenseCategory: String(expense.expenseCategory || ''),
    paymentMethod,
    paymentMethodLabel: paymentMethodLabelMap.get(paymentMethod) || toTitleLabel(paymentMethod || 'bank'),
    status,
    statusLabel: statusLabelMap.get(status) || 'Unknown',
    statusTone: getStatusTone(status),
    currency,
    subtotal,
    subtotalLabel: formatCurrency(subtotal, currency),
    taxTotal,
    taxTotalLabel: formatCurrency(taxTotal, currency),
    total,
    totalLabel: formatCurrency(total, currency),
    projectId: String(getRelationshipId(expense.project) || ''),
    projectLabel: formatProjectLabel(expense.project),
    expenseAccountId: String(getRelationshipId(expense.expenseAccount) || ''),
    expenseAccountLabel: formatAccountLabel(expense.expenseAccount),
    taxCodeId,
    taxCodeLabel:
      typeof expense.taxCode === 'object' && expense.taxCode
        ? `${expense.taxCode.code ? `${expense.taxCode.code} - ` : ''}${expense.taxCode.name || 'Unnamed tax code'}`
        : '',
    paymentAccountId: String(getRelationshipId(expense.paymentAccount) || ''),
    paymentAccountLabel,
    bankAccountId: String(getRelationshipId(expense.bankAccount) || ''),
    bankAccountLabel: formatBankAccountLabel(expense.bankAccount),
    postedJournalEntryId: String(getRelationshipId(expense.postedJournalEntry) || ''),
    notes: String(expense.notes || ''),
    hasTaxCode: Boolean(taxCodeId),
    isCash: paymentMethod === 'cash',
    searchableText: buildSearchableText([
      expense.expenseNumber,
      vendorLabel,
      expense.expenseCategory,
      paymentMethodLabelMap.get(paymentMethod),
      formatCurrency(total, currency),
      formatDate(expense.expenseDate),
      statusLabelMap.get(status),
      expense.notes,
    ]),
    cells: [
      { text: String(expense.expenseNumber || `Expense ${expenseId}`), emphasis: true },
      formatDate(expense.expenseDate),
      vendorLabel,
      String(expense.expenseCategory || '-'),
      { text: formatCurrency(total, currency), emphasis: true, align: 'right' },
      { text: statusLabelMap.get(status) || 'Unknown', tone: getStatusTone(status) },
    ],
  }
}

const matchesExpenseQuickFilter = (row: ExpenseRow, quickFilter: string) => {
  const [group, value] = quickFilter.split(':')
  if (group === 'status') return row.status === value
  if (group === 'payment' && value === 'cash') return row.isCash
  if (group === 'tax' && value === 'with_code') return row.hasTaxCode
  return false
}

export const matchesSelectedExpenseFilters = (
  row: ExpenseRow,
  filters: {
    statuses: string[]
    paymentMethods: string[]
    taxStates: string[]
    quickFilters: string[]
  },
) => {
  const predicates = [
    ...filters.statuses.map((status) => row.status === status),
    ...filters.paymentMethods.map((paymentMethod) => row.paymentMethod === paymentMethod),
    ...filters.taxStates.map((taxState) =>
      taxState === 'with_tax_code' ? row.hasTaxCode : taxState === 'without_tax_code' ? !row.hasTaxCode : false,
    ),
    ...filters.quickFilters.map((quickFilter) => matchesExpenseQuickFilter(row, quickFilter)),
  ]

  if (predicates.length === 0) return true
  return predicates.some(Boolean)
}

export const buildExpenseMetrics = (rows: ExpenseRow[]) => [
  {
    id: 'expenses-draft',
    label: 'Draft Expenses',
    value: rows.filter((row) => row.status === 'draft').length,
    change: 'Ready for review or posting',
    trend: 'neutral' as const,
  },
  {
    id: 'expenses-posted',
    label: 'Posted Expenses',
    value: rows.filter((row) => row.status === 'posted').length,
    change: 'Included in the register',
    trend: 'up' as const,
  },
  {
    id: 'expenses-cash',
    label: 'Cash-Funded Entries',
    value: rows.filter((row) => row.isCash).length,
    change: 'Payment method set to cash',
    trend: 'neutral' as const,
  },
  {
    id: 'expenses-tax-code',
    label: 'With Tax Code',
    value: rows.filter((row) => row.hasTaxCode).length,
    change: 'Linked to accounting tax codes',
    trend: 'up' as const,
  },
]

export const buildExpenseDetailRegisterRow = ({
  expense,
  documentLinks,
}: {
  expense: ExpenseDoc
  documentLinks: DocumentLinkDoc[]
}): ExpenseDetailRegisterRow => {
  const baseRow = buildExpenseRow(expense)
  const hasJournalLink = Boolean(baseRow.postedJournalEntryId)
  const documentNotesSummary = documentLinks
    .map((documentLink) => [documentLink.documentCategory, documentLink.notes].filter(Boolean).join(' '))
    .filter(Boolean)
    .join(' ')

  return {
    id: baseRow.id,
    expenseNumber: baseRow.expenseNumber,
    vendorId: baseRow.vendorId,
    vendorLabel: baseRow.vendorLabel,
    taxCodeId: baseRow.taxCodeId,
    taxCodeLabel: baseRow.taxCodeLabel,
    taxTotal: baseRow.taxTotal,
    taxTotalLabel: baseRow.taxTotalLabel,
    total: baseRow.total,
    totalLabel: baseRow.totalLabel,
    status: baseRow.status,
    statusLabel: baseRow.statusLabel,
    statusTone: baseRow.statusTone,
    documentCount: documentLinks.length,
    documentCountLabel: `${documentLinks.length} linked`,
    hasJournalLink,
    journalLinkLabel: hasJournalLink ? 'Linked' : 'Not Linked',
    searchableText: buildSearchableText([
      baseRow.expenseNumber,
      baseRow.vendorLabel,
      baseRow.taxCodeLabel,
      baseRow.statusLabel,
      baseRow.postedJournalEntryId,
      documentNotesSummary,
      documentLinks.map((documentLink) => documentLink.documentCategory).join(' '),
    ]),
    cells: [
      { text: baseRow.expenseNumber, emphasis: true },
      baseRow.vendorLabel,
      baseRow.taxCodeLabel || '-',
      { text: String(documentLinks.length), align: 'center' },
      { text: hasJournalLink ? 'Yes' : 'No' },
      { text: baseRow.statusLabel, tone: baseRow.statusTone },
    ],
  }
}

const matchesExpenseDetailQuickFilter = (row: ExpenseDetailRegisterRow, quickFilter: string) => {
  const [group, value] = quickFilter.split(':')
  if (group === 'status') return row.status === value
  if (group === 'coverage' && value === 'with_tax') return Boolean(row.taxCodeId)
  if (group === 'coverage' && value === 'with_documents') return row.documentCount > 0
  if (group === 'coverage' && value === 'journal_linked') return row.hasJournalLink
  return false
}

export const matchesSelectedExpenseDetailFilters = (
  row: ExpenseDetailRegisterRow,
  filters: {
    statuses: string[]
    vendorIds: string[]
    coverageStates: string[]
    quickFilters: string[]
  },
) => {
  const predicates = [
    ...filters.statuses.map((status) => row.status === status),
    ...filters.vendorIds.map((vendorId) => row.vendorId === vendorId),
    ...filters.coverageStates.map((coverageState) =>
      coverageState === 'with_tax'
        ? Boolean(row.taxCodeId)
        : coverageState === 'with_documents'
          ? row.documentCount > 0
          : coverageState === 'journal_linked'
            ? row.hasJournalLink
            : false,
    ),
    ...filters.quickFilters.map((quickFilter) => matchesExpenseDetailQuickFilter(row, quickFilter)),
  ]

  if (predicates.length === 0) return true
  return predicates.some(Boolean)
}

export const buildExpenseDetailMetrics = (rows: ExpenseDetailRegisterRow[]) => [
  {
    id: 'expense-detail-draft',
    label: 'Draft Expenses',
    value: rows.filter((row) => row.status === 'draft').length,
    change: 'Available for detail review',
    trend: 'neutral' as const,
  },
  {
    id: 'expense-detail-tax',
    label: 'With Tax Code',
    value: rows.filter((row) => Boolean(row.taxCodeId)).length,
    change: 'Tax mapping visible in detail coverage',
    trend: 'up' as const,
  },
  {
    id: 'expense-detail-documents',
    label: 'With Documents',
    value: rows.filter((row) => row.documentCount > 0).length,
    change: 'Support files linked to expenses',
    trend: 'up' as const,
  },
  {
    id: 'expense-detail-journal',
    label: 'Journal Linked',
    value: rows.filter((row) => row.hasJournalLink).length,
    change: 'Posted journal references available',
    trend: 'up' as const,
  },
]

export const buildExpenseReferenceData = async (payload: Payload) => {
  const [vendors, projects, chartAccounts, taxCodes, bankAccounts] = await Promise.all([
    payload.find({
      collection: ACCOUNTING_COLLECTION_SLUGS.vendors,
      depth: 1,
      limit: 500,
      sort: 'displayName',
      overrideAccess: true,
    }),
    payload.find({
      collection: ACCOUNTING_COLLECTION_SLUGS.projects,
      depth: 0,
      limit: 500,
      sort: 'name',
      overrideAccess: true,
    }),
    payload.find({
      collection: ACCOUNTING_COLLECTION_SLUGS.chartOfAccounts,
      depth: 0,
      limit: 1000,
      sort: 'code',
      overrideAccess: true,
    }),
    payload.find({
      collection: ACCOUNTING_COLLECTION_SLUGS.taxCodes,
      depth: 0,
      limit: 500,
      sort: 'code',
      overrideAccess: true,
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
    vendors: vendors.docs.map((vendor: any) => ({
      id: vendor.id,
      vendorCode: vendor.vendorCode || null,
      displayName: vendor.displayName || null,
      status: vendor.status || null,
    })),
    projects: projects.docs.map((project: any) => ({
      id: project.id,
      projectCode: project.projectCode || null,
      name: project.name || null,
      status: project.status || null,
    })),
    chartAccounts: chartAccounts.docs.map((account: any) => ({
      id: account.id,
      code: account.code || null,
      name: account.name || null,
      accountType: account.accountType || null,
      accountSubType: account.accountSubType || null,
    })),
    taxCodes: taxCodes.docs.map((taxCode: any) => ({
      id: taxCode.id,
      code: taxCode.code || null,
      name: taxCode.name || null,
      rate: normalizeAmount(taxCode.rate),
      calculationMethod: String(taxCode.calculationMethod || 'exclusive'),
      purchaseAccountId: getRelationshipId(taxCode.purchaseAccount),
      isActive: Boolean(taxCode.isActive),
    })),
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

export const buildExpensePostingFlags = ({
  rows,
  taxCodes,
  hasDefaultInputTaxAccount,
}: {
  rows: ExpenseRow[]
  taxCodes: Array<{ id: number | string; purchaseAccountId: number | string | null }>
  hasDefaultInputTaxAccount: boolean
}): ExpensePostingFlags => {
  const taxCodesById = new Map(
    taxCodes.map((taxCode) => [String(taxCode.id), Boolean(taxCode.purchaseAccountId)]),
  )
  const postBlockedByExpenseId: Record<string, string[]> = {}

  for (const row of rows) {
    if (row.status !== 'draft') continue

    const blockers: string[] = []

    if (!row.expenseAccountId) {
      blockers.push('Expense account is required before posting.')
    }

    if (!row.paymentAccountId && !row.bankAccountId) {
      blockers.push('A payment account or bank account is required before posting.')
    }

    if (row.taxTotal > 0 && !hasDefaultInputTaxAccount) {
      const taxCodeHasPurchaseAccount = row.taxCodeId ? taxCodesById.get(row.taxCodeId) === true : false
      if (!taxCodeHasPurchaseAccount) {
        blockers.push(
          'Set a purchase account on the selected tax code or configure Accounting Settings default input tax account before posting.',
        )
      }
    }

    if (blockers.length > 0) {
      postBlockedByExpenseId[row.id] = blockers
    }
  }

  return {
    mutableExpenseIds: rows.filter((row) => row.status === 'draft').map((row) => row.id),
    postableExpenseIds: rows
      .filter((row) => row.status === 'draft' && !postBlockedByExpenseId[row.id]?.length)
      .map((row) => row.id),
    postBlockedByExpenseId,
    hasDefaultInputTaxAccount,
  }
}

export const buildExpenseDetailResponse = async (
  payload: Payload,
  expense: ExpenseDoc,
): Promise<ExpenseDetail> => {
  const expenseId = String(expense.id)
  const currency = String(expense.currency || 'PHP')
  const status = String(expense.status || 'draft')
  const paymentMethod = String(expense.paymentMethod || 'bank')
  const documentLinks = await findAllDocs<DocumentLinkDoc>({
    payload,
    collection: ACCOUNTING_COLLECTION_SLUGS.documentLinks,
    depth: 0,
    where: {
      and: [
        { entityType: { equals: 'expense' } },
        { entityId: { equals: expenseId } },
      ],
    },
    sort: '-createdAt',
  })

  return {
    id: expenseId,
    expenseNumber: String(expense.expenseNumber || `Expense ${expenseId}`),
    expenseDate: expense.expenseDate || null,
    expenseDateLabel: formatDate(expense.expenseDate),
    postingDate: expense.postingDate || null,
    postingDateLabel: formatDate(expense.postingDate),
    vendorId: String(getRelationshipId(expense.vendor) || ''),
    vendorLabel: formatVendorLabel(expense.vendor),
    expenseCategory: String(expense.expenseCategory || ''),
    paymentMethod,
    paymentMethodLabel: paymentMethodLabelMap.get(paymentMethod) || toTitleLabel(paymentMethod || 'bank'),
    status,
    statusLabel: statusLabelMap.get(status) || 'Unknown',
    statusTone: getStatusTone(status),
    currency,
    subtotal: normalizeAmount(expense.subtotal),
    subtotalLabel: formatCurrency(expense.subtotal, currency),
    taxTotal: normalizeAmount(expense.taxTotal),
    taxTotalLabel: formatCurrency(expense.taxTotal, currency),
    total: normalizeAmount(expense.total),
    totalLabel: formatCurrency(expense.total, currency),
    projectId: String(getRelationshipId(expense.project) || ''),
    projectLabel: formatProjectLabel(expense.project),
    expenseAccountId: String(getRelationshipId(expense.expenseAccount) || ''),
    expenseAccountLabel: formatAccountLabel(expense.expenseAccount),
    taxCodeId: String(getRelationshipId(expense.taxCode) || ''),
    taxCodeLabel:
      typeof expense.taxCode === 'object' && expense.taxCode
        ? `${expense.taxCode.code ? `${expense.taxCode.code} - ` : ''}${expense.taxCode.name || 'Unnamed tax code'}`
        : '',
    taxRate:
      typeof expense.taxCode === 'object' && expense.taxCode ? normalizeAmount(expense.taxCode.rate) : 0,
    taxCalculationMethod:
      typeof expense.taxCode === 'object' && expense.taxCode
        ? String(expense.taxCode.calculationMethod || 'exclusive')
        : 'exclusive',
    paymentAccountId: String(getRelationshipId(expense.paymentAccount) || ''),
    paymentAccountLabel:
      formatAccountLabel(expense.paymentAccount) ||
      (typeof expense.bankAccount === 'object' && expense.bankAccount
        ? formatAccountLabel(expense.bankAccount.ledgerAccount)
        : ''),
    bankAccountId: String(getRelationshipId(expense.bankAccount) || ''),
    bankAccountLabel: formatBankAccountLabel(expense.bankAccount),
    postedJournalEntryId: String(getRelationshipId(expense.postedJournalEntry) || ''),
    notes: String(expense.notes || ''),
    createdAt: expense.createdAt || null,
    updatedAt: expense.updatedAt || null,
    documentLinks: documentLinks.map((documentLink) => ({
      id: String(documentLink.id),
      documentCategory: String(documentLink.documentCategory || ''),
      documentCategoryLabel: toTitleLabel(documentLink.documentCategory),
      documentDate: documentLink.documentDate || null,
      documentDateLabel: formatDate(documentLink.documentDate),
      isPrimary: Boolean(documentLink.isPrimary),
      notes: String(documentLink.notes || ''),
    })),
    usageSummary: {
      documentCount: documentLinks.length,
      hasJournalLink: Boolean(getRelationshipId(expense.postedJournalEntry)),
      hasDependents:
        documentLinks.length > 0 || Boolean(getRelationshipId(expense.postedJournalEntry)),
    },
  }
}

export const normalizeExpenseMutationBody = (body: Record<string, unknown>): ExpenseMutationBody => {
  const expenseNumber =
    body.expenseNumber === undefined
      ? undefined
      : typeof body.expenseNumber === 'string'
        ? body.expenseNumber.trim() || null
        : String(body.expenseNumber ?? '').trim() || null

  return {
    ...(expenseNumber !== undefined ? { expenseNumber } : {}),
    ...(body.expenseDate !== undefined ? { expenseDate: normalizeOptionalString(body.expenseDate) } : {}),
    ...(body.postingDate !== undefined ? { postingDate: normalizeOptionalString(body.postingDate) } : {}),
    ...(body.vendor !== undefined ? { vendor: normalizeRelationshipId(body.vendor) } : {}),
    ...(body.expenseCategory !== undefined
      ? { expenseCategory: normalizeOptionalString(body.expenseCategory) }
      : {}),
    ...(body.paymentMethod !== undefined
      ? { paymentMethod: String(body.paymentMethod || 'bank') as AccountingExpensePaymentMethod }
      : {}),
    ...(body.status !== undefined
      ? { status: String(body.status || 'draft') as AccountingSimplePostingStatus | 'draft' }
      : {}),
    ...(body.currency !== undefined ? { currency: normalizeOptionalString(body.currency) } : {}),
    ...(body.subtotal !== undefined ? { subtotal: Number(body.subtotal ?? 0) } : {}),
    ...(body.project !== undefined ? { project: normalizeRelationshipId(body.project) } : {}),
    ...(body.expenseAccount !== undefined
      ? { expenseAccount: normalizeRelationshipId(body.expenseAccount) }
      : {}),
    ...(body.taxCode !== undefined ? { taxCode: normalizeRelationshipId(body.taxCode) } : {}),
    ...(body.paymentAccount !== undefined
      ? { paymentAccount: normalizeRelationshipId(body.paymentAccount) }
      : {}),
    ...(body.bankAccount !== undefined ? { bankAccount: normalizeRelationshipId(body.bankAccount) } : {}),
    ...(body.notes !== undefined ? { notes: normalizeOptionalString(body.notes) } : {}),
    ...(body.autoPost !== undefined ? { autoPost: Boolean(body.autoPost) } : {}),
  }
}

export const buildExpensePersistenceData = (
  body: ExpenseMutationBody,
): ExpensePersistedMutationBody => ({
  ...(body.expenseNumber !== undefined ? { expenseNumber: body.expenseNumber ?? undefined } : {}),
  ...(body.expenseDate !== undefined ? { expenseDate: body.expenseDate ?? undefined } : {}),
  ...(body.postingDate !== undefined ? { postingDate: body.postingDate ?? undefined } : {}),
  ...(body.vendor !== undefined ? { vendor: body.vendor } : {}),
  ...(body.expenseCategory !== undefined ? { expenseCategory: body.expenseCategory } : {}),
  ...(body.paymentMethod !== undefined ? { paymentMethod: body.paymentMethod } : {}),
  ...(body.status !== undefined ? { status: body.status } : {}),
  ...(body.currency !== undefined ? { currency: body.currency ?? undefined } : {}),
  ...(body.subtotal !== undefined ? { subtotal: body.subtotal } : {}),
  ...(body.project !== undefined ? { project: body.project } : {}),
  ...(body.expenseAccount !== undefined ? { expenseAccount: body.expenseAccount } : {}),
  ...(body.taxCode !== undefined ? { taxCode: body.taxCode } : {}),
  ...(body.paymentAccount !== undefined ? { paymentAccount: body.paymentAccount } : {}),
  ...(body.bankAccount !== undefined ? { bankAccount: body.bankAccount } : {}),
  ...(body.notes !== undefined ? { notes: body.notes } : {}),
})

const assertRelationshipExists = async (
  payload: Payload,
  collection: string,
  relationshipId: string | number | null | undefined,
  label: string,
) => {
  if (relationshipId === null || relationshipId === undefined) return
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

export const assertExpenseMutationPayload = async (
  payload: Payload,
  body: ExpenseMutationBody,
) => {
  if ('expenseDate' in body && !body.expenseDate) throw new Error('Expense date is required.')
  if ('postingDate' in body && !body.postingDate) throw new Error('Posting date is required.')
  if ('currency' in body && !body.currency) throw new Error('Currency is required.')
  if ('paymentMethod' in body && !EXPENSE_PAYMENT_METHOD_OPTIONS.some((option) => option.value === body.paymentMethod)) {
    throw new Error('Payment method is invalid.')
  }
  if ('status' in body && !['draft'].includes(String(body.status || 'draft'))) {
    throw new Error('Editable expenses may only be saved as Draft.')
  }
  if ('subtotal' in body && !(Number(body.subtotal || 0) >= 0)) {
    throw new Error('Subtotal cannot be negative.')
  }
  if ('expenseAccount' in body && !body.expenseAccount) {
    throw new Error('Expense account is required.')
  }

  await assertRelationshipExists(payload, ACCOUNTING_COLLECTION_SLUGS.vendors, body.vendor, 'Vendor')
  await assertRelationshipExists(payload, ACCOUNTING_COLLECTION_SLUGS.projects, body.project, 'Project')
  await assertRelationshipExists(
    payload,
    ACCOUNTING_COLLECTION_SLUGS.chartOfAccounts,
    body.expenseAccount,
    'Expense account',
  )
  await assertRelationshipExists(payload, ACCOUNTING_COLLECTION_SLUGS.taxCodes, body.taxCode, 'Tax code')
  await assertRelationshipExists(
    payload,
    ACCOUNTING_COLLECTION_SLUGS.chartOfAccounts,
    body.paymentAccount,
    'Payment account',
  )
  await assertRelationshipExists(payload, ACCOUNTING_COLLECTION_SLUGS.bankAccounts, body.bankAccount, 'Bank account')
}

export const buildExpenseTotals = async (
  payload: Payload,
  body: ExpenseMutationBody,
) =>
  AccountingExpenseService.calculateTotals(payload, {
    subtotal: body.subtotal ?? 0,
    taxCode: body.taxCode ?? null,
  })

export const computeExpenseDeleteBarriers = async (
  payload: Payload,
  expense: ExpenseDoc,
) => {
  const expenseId = String(expense.id)
  const barriers: string[] = []

  if (['posted', 'voided'].includes(String(expense.status || ''))) {
    barriers.push('expense is already posted or voided')
  }

  const documentLinks = await findAllDocs<DocumentLinkDoc>({
    payload,
    collection: ACCOUNTING_COLLECTION_SLUGS.documentLinks,
    depth: 0,
    where: {
      and: [
        { entityType: { equals: 'expense' } },
        { entityId: { equals: expenseId } },
      ],
    },
  })

  if (documentLinks.length > 0) {
    barriers.push(`linked to ${documentLinks.length} support document(s)`)
  }

  if (getRelationshipId(expense.postedJournalEntry)) {
    barriers.push('linked to a posted journal entry')
  }

  return barriers
}
