import { NextRequest, NextResponse } from 'next/server'
import { AccountingSalesReportService } from '@/accounting/services/reports/AccountingSalesReportService'
import { handleAccountingApiError, requireAccountingAdmin } from '../_utils/auth'

const parseIntegerParam = (value: string | null, fallback: number) => {
  if (!value) return fallback; const p = Number(value); return Number.isFinite(p) ? p : fallback
}

const parseListParam = (searchParams: URLSearchParams, key: string): string[] =>
  Array.from(new Set(searchParams.getAll(key).flatMap((v) => String(v || '').split(',')).map((v) => v.trim()).filter(Boolean)))

const normalizeText = (value?: string | null) => String(value || '').trim().toLowerCase()
const formatCurrency = (value: number) => new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)

const STATUS_LABEL_MAP: Record<string, string> = {
  draft: 'Draft', posted: 'Posted', paid: 'Paid', partially_paid: 'Partially Paid',
  voided: 'Voided', reversed: 'Reversed', cancelled: 'Cancelled', overdue: 'Overdue',
}
const STATUS_TONE_MAP: Record<string, string> = {
  draft: 'gray', posted: 'green', paid: 'blue', partially_paid: 'amber',
  voided: 'red', reversed: 'gray', cancelled: 'red', overdue: 'amber',
}

export async function GET(request: NextRequest) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const { searchParams } = new URL(request.url)
    const search = normalizeText(searchParams.get('search'))
    const types = parseListParam(searchParams, 'type')
    const statuses = parseListParam(searchParams, 'status')
    const quickFilters = parseListParam(searchParams, 'quickFilter')
    const page = Math.max(1, parseIntegerParam(searchParams.get('page'), 1))
    const limit = Math.min(100, Math.max(1, parseIntegerParam(searchParams.get('limit'), 10)))

    const [invoices, payments] = await Promise.all([
      AccountingSalesReportService.getInvoiceRegister(payload),
      AccountingSalesReportService.getPaymentsReceivedRegister(payload),
    ])

    const allRows = [
      ...invoices.map((inv) => ({
        id: `inv-${inv.documentId}`,
        documentNumber: inv.documentNumber || '-',
        documentDate: inv.documentDate || null,
        partyName: inv.partyName || '-',
        documentType: 'invoice',
        documentTypeLabel: 'Invoice',
        documentTypeTone: 'blue',
        status: inv.status || 'draft',
        statusLabel: STATUS_LABEL_MAP[inv.status || ''] || (inv.status || 'Draft'),
        statusTone: STATUS_TONE_MAP[inv.status || ''] || 'gray',
        total: inv.total,
        balanceDue: inv.balanceDue ?? 0,
        dueDate: inv.dueDate || null,
        currency: inv.currency || 'PHP',
      })),
      ...payments.map((pmt) => ({
        id: `pmt-${pmt.documentId}`,
        documentNumber: pmt.documentNumber || '-',
        documentDate: pmt.documentDate || null,
        partyName: pmt.partyName || '-',
        documentType: 'payment_received',
        documentTypeLabel: 'Payment Received',
        documentTypeTone: 'green',
        status: pmt.status || 'draft',
        statusLabel: STATUS_LABEL_MAP[pmt.status || ''] || (pmt.status || 'Draft'),
        statusTone: STATUS_TONE_MAP[pmt.status || ''] || 'gray',
        total: pmt.total,
        balanceDue: 0,
        dueDate: null,
        currency: pmt.currency || 'PHP',
      })),
    ]

    const dateLabel = (d: string | null) => {
      if (!d) return '-'
      return new Date(d).toLocaleDateString('en-CA')
    }

    const mappedRows = allRows.map((r) => ({
      id: r.id,
      documentNumber: r.documentNumber,
      documentDate: r.documentDate,
      documentDateLabel: dateLabel(r.documentDate),
      partyName: r.partyName,
      documentType: r.documentType,
      documentTypeLabel: r.documentTypeLabel,
      documentTypeTone: r.documentTypeTone,
      status: r.status,
      statusLabel: r.statusLabel,
      statusTone: r.statusTone,
      total: r.total,
      balanceDue: r.balanceDue,
      dueDate: r.dueDate,
      currency: r.currency,
      searchableText: normalizeText([r.documentNumber, r.partyName, r.documentTypeLabel, r.statusLabel, formatCurrency(r.total)].join(' ')),
      cells: [
        { text: r.documentNumber, emphasis: true },
        dateLabel(r.documentDate),
        r.partyName,
        { text: r.documentTypeLabel, tone: r.documentTypeTone },
        { text: formatCurrency(r.total), align: 'right' },
        { text: r.statusLabel, tone: r.statusTone },
      ],
    }))

    let filtered = mappedRows
    if (search) {
      filtered = filtered.filter((r) => r.searchableText.includes(search))
    }
    if (types.length > 0) {
      filtered = filtered.filter((r) => types.includes(r.documentType))
    }
    if (statuses.length > 0) {
      filtered = filtered.filter((r) => statuses.includes(r.status))
    }
    if (quickFilters.length > 0) {
      filtered = filtered.filter((r) =>
        quickFilters.some((qf) => {
          const [prefix, value] = qf.split(':')
          if (prefix === 'type') return r.documentType === value
          if (prefix === 'status') return r.status === value
          return false
        }),
      )
    }

    const totalDocs = filtered.length
    const totalPages = Math.max(1, Math.ceil(totalDocs / limit))
    const currentPage = Math.min(page, totalPages)
    const paginatedRows = filtered.slice((currentPage - 1) * limit, currentPage * limit)

    const openArTotal = invoices
      .filter((inv) => (inv.status === 'posted' || inv.status === 'partially_paid') && (inv.balanceDue ?? 0) > 0)
      .reduce((sum, inv) => sum + (inv.balanceDue ?? 0), 0)

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const overdueCount = invoices.filter((inv) => {
      if (inv.status === 'paid' || inv.status === 'voided' || inv.status === 'cancelled') return false
      if (!inv.dueDate) return false
      return new Date(inv.dueDate) < today
    }).length

    return NextResponse.json({
      section: {
        id: 'sales-reports',
        label: 'Sales Reports',
        description: 'Review invoice and payments-received register outputs backed by the sales reporting service.',
        searchPlaceholder: 'Search invoice no., receipt no., customer, status, or amount',
        filters: {
          types: [
            { label: 'Invoice', value: 'invoice' },
            { label: 'Payment Received', value: 'payment_received' },
          ],
          statuses: [
            { label: 'Posted', value: 'posted' },
            { label: 'Paid', value: 'paid' },
            { label: 'Partially Paid', value: 'partially_paid' },
            { label: 'Draft', value: 'draft' },
          ],
          quickFilters: [
            { label: 'Invoices', value: 'type:invoice' },
            { label: 'Payments', value: 'type:payment_received' },
            { label: 'Posted', value: 'status:posted' },
            { label: 'Partially Paid', value: 'status:partially_paid' },
          ],
        },
        metrics: [
          { id: 'recent-invoices', label: 'Recent Invoices', value: invoices.length, change: 'Latest invoice-register rows', trend: 'up' as const },
          { id: 'recent-receipts', label: 'Recent Receipts', value: payments.length, change: 'Latest payments-received rows', trend: 'up' as const },
          { id: 'open-ar-total', label: 'Open AR Total', value: formatCurrency(openArTotal), change: 'Receivables balance from sales reports', trend: 'up' as const },
          { id: 'overdue-invoices', label: 'Overdue Invoices', value: overdueCount, change: 'Invoices overdue in aging support', trend: overdueCount > 0 ? 'down' as const : 'neutral' as const },
        ],
        table: {
          title: 'Sales Report Register',
          description: 'Sales-side report rows aligned to invoice-register and payments-received-register support in apps/cms.',
          columns: ['Document No.', 'Date', 'Customer', 'Type', 'Total', 'Status'],
          rows: paginatedRows,
        },
      },
      appliedFilters: { search, types, statuses, quickFilters },
      pagination: { page: currentPage, limit, totalDocs, totalPages, hasPrevPage: currentPage > 1, hasNextPage: currentPage < totalPages },
      totals: { totalRows: allRows.length, filteredRows: totalDocs, invoiceCount: invoices.length, paymentCount: payments.length, openArTotal, overdueCount },
    })
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
