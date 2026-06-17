import { NextRequest, NextResponse } from 'next/server'
import { ACCOUNTING_COLLECTION_SLUGS, DOCUMENT_STATUS_OPTIONS } from '@/accounting/constants/accounting'
import { findAllDocs } from '@/accounting/utils/findAllDocs'
import { getRelationshipId } from '@/accounting/utils/accounting-audit'
import { normalizeAmount } from '@/accounting/utils/amounts'
import { handleAccountingApiError, requireAccountingAdmin } from '../../_utils/auth'

type HistoryCell =
  | string
  | { text: string; tone?: 'amber' | 'blue' | 'gray' | 'green' | 'red'; emphasis?: boolean; align?: 'left' | 'right' | 'center' }

type InvoiceDoc = {
  id: number | string
  invoiceNumber?: string | null
  customer?:
    | {
        id?: number | string
        customerCode?: string | null
        displayName?: string | null
      }
    | number
    | string
    | null
  status?: string | null
  postingStatus?: string | null
  taxTotal?: number | null
  balanceDue?: number | null
  postedJournalEntry?: unknown
}

type InvoiceLineDoc = {
  id: number | string
  invoice?: unknown
  description?: string | null
  lineTax?: number | null
  taxCode?:
    | {
        code?: string | null
        name?: string | null
      }
    | number
    | string
    | null
}

type DocumentLinkDoc = {
  id: number | string
  entityType?: string | null
  entityId?: string | null
  documentCategory?: string | null
}

type InvoiceDetailRegisterRow = {
  id: string
  invoiceNumber: string
  customerLabel: string
  lineItemCount: number
  lineItemLabel: string
  taxTotal: number
  taxTotalLabel: string
  balanceDue: number
  balanceDueLabel: string
  status: string
  statusLabel: string
  statusTone: 'amber' | 'blue' | 'gray' | 'green' | 'red'
  documentCount: number
  documentCountLabel: string
  journalLinked: boolean
  postedJournalEntryId: string
  hasTax: boolean
  lineDescriptions: string[]
  taxCodeLabels: string[]
  searchableText: string
  cells: HistoryCell[]
}

const statusLabels = new Map<string, string>(DOCUMENT_STATUS_OPTIONS.map((option) => [option.value, option.label]))

const parseIntegerParam = (value: string | null, fallback: number) => {
  if (!value) return fallback
  const parsedValue = Number(value)
  return Number.isFinite(parsedValue) ? parsedValue : fallback
}

const parseListParam = (searchParams: URLSearchParams, key: string): string[] =>
  Array.from(
    new Set(
      searchParams
        .getAll(key)
        .flatMap((value) => String(value || '').split(','))
        .map((value) => value.trim())
        .filter(Boolean),
    ),
  )

const normalizeSearch = (value: unknown) => String(value ?? '').toLowerCase().trim()

const formatCurrency = (value: number | null | undefined) =>
  new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value || 0))

const getStatusTone = (status: string | null | undefined): 'amber' | 'blue' | 'gray' | 'green' | 'red' => {
  switch (String(status || '')) {
    case 'draft':
      return 'blue'
    case 'approved':
    case 'partially_paid':
      return 'amber'
    case 'posted':
    case 'paid':
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

const matchesInvoiceDetailQuickFilter = (row: InvoiceDetailRegisterRow, quickFilter: string) => {
  const [group, value] = quickFilter.split(':')

  if (group === 'coverage') {
    if (value === 'with_lines') return row.lineItemCount > 0
    if (value === 'with_tax') return row.hasTax
    if (value === 'with_documents') return row.documentCount > 0
    if (value === 'journal_linked') return row.journalLinked
  }

  if (group === 'status') {
    return row.status === value
  }

  return false
}

export async function GET(request: NextRequest) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const { searchParams } = new URL(request.url)

    const search = searchParams.get('search') || ''
    const statuses = parseListParam(searchParams, 'status')
    const coverage = parseListParam(searchParams, 'coverage')
    const quickFilters = parseListParam(searchParams, 'quickFilter')
    const page = Math.max(1, parseIntegerParam(searchParams.get('page'), 1))
    const limit = Math.min(100, Math.max(1, parseIntegerParam(searchParams.get('limit'), 10)))

    const [invoiceDocs, lineDocs, documentLinks] = await Promise.all([
      findAllDocs<InvoiceDoc>({
        payload,
        collection: ACCOUNTING_COLLECTION_SLUGS.invoices,
        depth: 1,
        sort: '-invoiceDate',
      }),
      findAllDocs<InvoiceLineDoc>({
        payload,
        collection: ACCOUNTING_COLLECTION_SLUGS.invoiceLineItems,
        depth: 1,
        sort: 'lineNumber',
      }),
      findAllDocs<DocumentLinkDoc>({
        payload,
        collection: ACCOUNTING_COLLECTION_SLUGS.documentLinks,
        depth: 0,
        where: {
          entityType: {
            equals: 'invoice',
          },
        },
        sort: '-createdAt',
      }),
    ])

    const lineMap = new Map<string, InvoiceLineDoc[]>()
    for (const lineDoc of lineDocs) {
      const invoiceId = String(getRelationshipId(lineDoc.invoice) || '')
      if (!invoiceId) continue
      const existing = lineMap.get(invoiceId) || []
      existing.push(lineDoc)
      lineMap.set(invoiceId, existing)
    }

    const documentLinkMap = new Map<string, DocumentLinkDoc[]>()
    for (const documentLink of documentLinks) {
      const entityId = String(documentLink.entityId || '').trim()
      if (!entityId) continue
      const existing = documentLinkMap.get(entityId) || []
      existing.push(documentLink)
      documentLinkMap.set(entityId, existing)
    }

    const allRows = invoiceDocs.map<InvoiceDetailRegisterRow>((invoiceDoc) => {
      const invoiceId = String(invoiceDoc.id)
      const invoiceLines = lineMap.get(invoiceId) || []
      const invoiceDocuments = documentLinkMap.get(invoiceId) || []
      const taxCodeLabels = Array.from(
        new Set(
          invoiceLines
            .map((lineDoc) =>
              typeof lineDoc.taxCode === 'object' && lineDoc.taxCode
                ? `${lineDoc.taxCode.code ? `${lineDoc.taxCode.code} - ` : ''}${lineDoc.taxCode.name || 'Unnamed tax code'}`
                : '',
            )
            .filter(Boolean),
        ),
      )
      const lineDescriptions = invoiceLines.map((lineDoc) => String(lineDoc.description || '')).filter(Boolean)
      const customerLabel =
        typeof invoiceDoc.customer === 'object' && invoiceDoc.customer
          ? `${invoiceDoc.customer.customerCode ? `${invoiceDoc.customer.customerCode} - ` : ''}${invoiceDoc.customer.displayName || 'Unnamed customer'}`
          : String(invoiceDoc.customer || 'Unassigned Customer')
      const status = String(invoiceDoc.status || '')
      const lineItemCount = invoiceLines.length
      const taxTotal = normalizeAmount(invoiceDoc.taxTotal)
      const balanceDue = normalizeAmount(invoiceDoc.balanceDue)
      const postedJournalEntryId = String(getRelationshipId(invoiceDoc.postedJournalEntry) || '')
      const documentCount = invoiceDocuments.length

      return {
        id: invoiceId,
        invoiceNumber: String(invoiceDoc.invoiceNumber || `Invoice ${invoiceId}`),
        customerLabel,
        lineItemCount,
        lineItemLabel: `${lineItemCount} line${lineItemCount === 1 ? '' : 's'}`,
        taxTotal,
        taxTotalLabel: formatCurrency(taxTotal),
        balanceDue,
        balanceDueLabel: formatCurrency(balanceDue),
        status,
        statusLabel: statusLabels.get(status) || 'Unknown',
        statusTone: getStatusTone(status),
        documentCount,
        documentCountLabel: `${documentCount} support doc${documentCount === 1 ? '' : 's'}`,
        journalLinked: Boolean(postedJournalEntryId),
        postedJournalEntryId,
        hasTax: taxTotal > 0 || invoiceLines.some((lineDoc) => normalizeAmount(lineDoc.lineTax) > 0),
        lineDescriptions,
        taxCodeLabels,
        searchableText: buildSearchableText([
          invoiceDoc.invoiceNumber,
          customerLabel,
          ...lineDescriptions,
          ...taxCodeLabels,
          postedJournalEntryId,
          documentCount > 0 ? 'with documents' : '',
        ]),
        cells: [
          { text: String(invoiceDoc.invoiceNumber || `Invoice ${invoiceId}`), emphasis: true },
          customerLabel,
          `${lineItemCount} lines`,
          { text: formatCurrency(taxTotal), align: 'right' },
          { text: formatCurrency(balanceDue), emphasis: true, align: 'right' },
          { text: statusLabels.get(status) || 'Unknown', tone: getStatusTone(status) },
        ],
      }
    })

    const normalizedSearch = normalizeSearch(search)
    const filteredRows = allRows.filter((row) => {
      if (normalizedSearch && !row.searchableText.includes(normalizedSearch)) return false
      if (statuses.length > 0 && !statuses.includes(row.status)) return false
      if (coverage.length > 0) {
        const coverageMatch = coverage.some((coverageValue) => {
          if (coverageValue === 'with_lines') return row.lineItemCount > 0
          if (coverageValue === 'with_tax') return row.hasTax
          if (coverageValue === 'with_documents') return row.documentCount > 0
          if (coverageValue === 'journal_linked') return row.journalLinked
          return false
        })
        if (!coverageMatch) return false
      }
      if (quickFilters.length > 0) {
        const quickFilterMatch = quickFilters.some((quickFilter) => matchesInvoiceDetailQuickFilter(row, quickFilter))
        if (!quickFilterMatch) return false
      }
      return true
    })

    const totalDocs = filteredRows.length
    const totalPages = Math.max(1, Math.ceil(totalDocs / limit))
    const paginatedRows = filteredRows.slice((page - 1) * limit, page * limit)

    const invoicesWithLines = filteredRows.filter((row) => row.lineItemCount > 0).length
    const invoiceLineCount = filteredRows.reduce((sum, row) => sum + row.lineItemCount, 0)
    const linkedDocuments = filteredRows.reduce((sum, row) => sum + row.documentCount, 0)
    const journalLinkedInvoices = filteredRows.filter((row) => row.journalLinked).length

    return NextResponse.json({
      section: {
        id: 'invoice-detail',
        label: 'Invoice Detail',
        description: 'Inspect invoice headers, normalized line items, tax totals, document support, and journal linkage.',
        searchPlaceholder: 'Search invoice no., customer, line description, tax code, or journal ref',
        filters: {
          statuses: DOCUMENT_STATUS_OPTIONS.map((option) => ({ label: option.label, value: option.value })),
          coverage: [
            { label: 'With Lines', value: 'with_lines' },
            { label: 'With Tax', value: 'with_tax' },
            { label: 'With Documents', value: 'with_documents' },
            { label: 'Journal Linked', value: 'journal_linked' },
          ],
          quickFilters: [
            { label: 'With Lines', value: 'coverage:with_lines' },
            { label: 'With Tax', value: 'coverage:with_tax' },
            { label: 'With Documents', value: 'coverage:with_documents' },
            { label: 'Journal Linked', value: 'coverage:journal_linked' },
            { label: 'Posted', value: 'status:posted' },
            { label: 'Partially Paid', value: 'status:partially_paid' },
          ],
        },
        metrics: [
          {
            id: 'invoices-with-lines',
            label: 'Invoices With Lines',
            value: invoicesWithLines,
            change: 'Normalized through invoice line items',
            trend: 'up',
          },
          {
            id: 'invoice-lines',
            label: 'Invoice Lines',
            value: invoiceLineCount,
            change: 'Service and revenue-coded detail lines',
            trend: 'up',
          },
          {
            id: 'linked-documents',
            label: 'Linked Documents',
            value: linkedDocuments,
            change: 'Invoice support attached through document links',
            trend: 'neutral',
          },
          {
            id: 'journal-linked-invoices',
            label: 'Journal-Linked Invoices',
            value: journalLinkedInvoices,
            change: 'Posted invoices with journal references',
            trend: 'up',
          },
        ],
        table: {
          title: 'Invoice Detail Coverage',
          description: 'Detail-oriented view of invoice lines, tax totals, open balances, and linked accounting references.',
          columns: ['Invoice No.', 'Customer', 'Line Items', { label: 'Tax Total', align: 'right' }, { label: 'Balance Due', align: 'right' }, 'Status'],
          rows: paginatedRows,
        },
      },
      appliedFilters: {
        search,
        statuses,
        coverage,
        quickFilters,
      },
      pagination: {
        page,
        limit,
        totalDocs,
        totalPages,
        hasPrevPage: page > 1,
        hasNextPage: page < totalPages,
      },
      totals: {
        totalRows: allRows.length,
        filteredRows: totalDocs,
      },
    })
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
