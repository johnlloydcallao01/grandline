import { NextRequest, NextResponse } from 'next/server'
import { getDashboard } from '@/accounting/queries/getDashboard'
import { handleAccountingApiError, requireAccountingAdmin } from '../_utils/auth'

const parseIntegerParam = (value: string | null, fallback: number) => {
  if (!value) return fallback; const p = Number(value); return Number.isFinite(p) ? p : fallback
}

const parseListParam = (searchParams: URLSearchParams, key: string): string[] =>
  Array.from(new Set(searchParams.getAll(key).flatMap((v) => String(v || '').split(',')).map((v) => v.trim()).filter(Boolean)))

const normalizeText = (value?: string | null) => String(value || '').trim().toLowerCase()
const formatCurrency = (value: number) => new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)

export async function GET(request: NextRequest) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const { searchParams } = new URL(request.url)
    const search = normalizeText(searchParams.get('search'))
    const types = parseListParam(searchParams, 'type')
    const quickFilters = parseListParam(searchParams, 'quickFilter')
    const page = Math.max(1, parseIntegerParam(searchParams.get('page'), 1))
    const limit = Math.min(100, Math.max(1, parseIntegerParam(searchParams.get('limit'), 10)))

    const dashboard = await getDashboard(payload)

    const dateLabel = (d: string | null | undefined) => {
      if (!d) return '-'
      return new Date(d).toLocaleDateString('en-CA')
    }

    const allRows = [
      ...dashboard.recentInvoices.map((inv) => ({
        id: `inv-${inv.documentId}`,
        reportType: 'recent_invoice',
        reportTypeLabel: 'Recent Invoice',
        reference: inv.documentNumber || '-',
        dateLabel: dateLabel(inv.documentDate),
        partyName: inv.partyName || '-',
        type: 'Invoice',
        typeTone: 'blue',
        amount: inv.total,
        status: inv.status || '-',
        statusLabel: String(inv.status || '-').charAt(0).toUpperCase() + String(inv.status || '').slice(1).replace('_', ' '),
        statusTone: inv.status === 'posted' ? 'green' : inv.status === 'paid' ? 'blue' : inv.status === 'partially_paid' ? 'amber' : 'gray',
        searchableText: normalizeText([inv.documentNumber, inv.partyName, 'Invoice', formatCurrency(inv.total)].join(' ')),
        cells: [
          'Recent Invoice',
          { text: inv.documentNumber || '-', emphasis: true },
          inv.partyName || '-',
          { text: formatCurrency(inv.total), align: 'right' },
          { text: String(inv.status || '-').charAt(0).toUpperCase() + String(inv.status || '').slice(1).replace('_', ' '), tone: inv.status === 'posted' ? 'green' : inv.status === 'paid' ? 'blue' : 'amber' },
        ],
      })),
      ...dashboard.recentBills.map((bill) => ({
        id: `bill-${bill.documentId}`,
        reportType: 'recent_bill',
        reportTypeLabel: 'Recent Bill',
        reference: bill.documentNumber || '-',
        dateLabel: dateLabel(bill.documentDate),
        partyName: bill.partyName || '-',
        type: 'Bill',
        typeTone: 'blue',
        amount: bill.total,
        status: bill.status || '-',
        statusLabel: String(bill.status || '-').charAt(0).toUpperCase() + String(bill.status || '').slice(1).replace('_', ' '),
        statusTone: bill.status === 'posted' ? 'green' : bill.status === 'paid' ? 'blue' : bill.status === 'partially_paid' ? 'amber' : 'gray',
        searchableText: normalizeText([bill.documentNumber, bill.partyName, 'Bill', formatCurrency(bill.total)].join(' ')),
        cells: [
          'Recent Bill',
          { text: bill.documentNumber || '-', emphasis: true },
          bill.partyName || '-',
          { text: formatCurrency(bill.total), align: 'right' },
          { text: String(bill.status || '-').charAt(0).toUpperCase() + String(bill.status || '').slice(1).replace('_', ' '), tone: bill.status === 'posted' ? 'green' : bill.status === 'paid' ? 'blue' : 'amber' },
        ],
      })),
      ...dashboard.recentPayments.map((pmt) => ({
        id: `pmt-${pmt.documentId}`,
        reportType: pmt.entityType === 'payment_received' ? 'payment_received' : 'payment_made',
        reportTypeLabel: pmt.entityType === 'payment_received' ? 'Payment Received' : 'Payment Made',
        reference: pmt.documentNumber || '-',
        dateLabel: dateLabel(pmt.documentDate),
        partyName: pmt.partyName || '-',
        type: pmt.entityType === 'payment_received' ? 'Payment Received' : 'Payment Made',
        typeTone: 'green',
        amount: pmt.total,
        status: 'posted',
        statusLabel: 'Posted',
        statusTone: 'green',
        searchableText: normalizeText([pmt.documentNumber, pmt.partyName, pmt.entityType === 'payment_received' ? 'Payment Received' : 'Payment Made', formatCurrency(pmt.total)].join(' ')),
        cells: [
          pmt.entityType === 'payment_received' ? 'Payment Received' : 'Payment Made',
          { text: pmt.documentNumber || '-', emphasis: true },
          pmt.partyName || '-',
          { text: formatCurrency(pmt.total), align: 'right' },
          { text: 'Posted', tone: 'green' },
        ],
      })),
    ]

    let filtered = allRows
    if (search) { filtered = filtered.filter((r) => r.searchableText.includes(search)) }
    if (types.length > 0) { filtered = filtered.filter((r) => types.includes(r.reportType)) }
    if (quickFilters.length > 0) {
      filtered = filtered.filter((r) => quickFilters.some((qf) => {
        const [prefix, value] = qf.split(':')
        if (prefix === 'type') return r.reportType === value
        return false
      }))
    }

    const totalDocs = filtered.length
    const totalPages = Math.max(1, Math.ceil(totalDocs / limit))
    const currentPage = Math.min(page, totalPages)
    const paginatedRows = filtered.slice((currentPage - 1) * limit, currentPage * limit)

    return NextResponse.json({
      section: {
        id: 'dashboard-summary',
        label: 'Dashboard Summary',
        description: 'Review receivables, payables, cash position, and recent transactions from the dashboard reporting service.',
        searchPlaceholder: 'Search document no., party name, type, or amount',
        filters: {
          types: [
            { label: 'Recent Invoices', value: 'recent_invoice' },
            { label: 'Recent Bills', value: 'recent_bill' },
            { label: 'Payments Received', value: 'payment_received' },
            { label: 'Payments Made', value: 'payment_made' },
          ],
          quickFilters: [
            { label: 'Invoices', value: 'type:recent_invoice' },
            { label: 'Bills', value: 'type:recent_bill' },
            { label: 'Payments Received', value: 'type:payment_received' },
            { label: 'Payments Made', value: 'type:payment_made' },
          ],
        },
        metrics: [
          { id: 'receivables', label: 'Receivables', value: formatCurrency(dashboard.summary.totalReceivables), change: 'Total outstanding receivables', trend: 'up' as const },
          { id: 'payables', label: 'Payables', value: formatCurrency(dashboard.summary.totalPayables), change: 'Total outstanding payables', trend: 'up' as const },
          { id: 'cash-bank', label: 'Cash & Bank', value: formatCurrency(dashboard.summary.totalCashAndBank), change: 'Total cash and bank balances', trend: 'up' as const },
          { id: 'overdue-invoices', label: 'Overdue Invoices', value: dashboard.summary.overdueInvoiceCount, change: 'Invoices past due date', trend: dashboard.summary.overdueInvoiceCount > 0 ? 'down' as const : 'neutral' as const },
        ],
        table: {
          title: 'Dashboard Summary Register',
          description: 'Recent accounting transactions from the exposed dashboard reporting endpoint in apps/cms.',
          columns: ['Report Type', 'Document No.', 'Party', 'Total', 'Status'],
          rows: paginatedRows,
        },
      },
      appliedFilters: { search, types, quickFilters },
      pagination: { page: currentPage, limit, totalDocs, totalPages, hasPrevPage: currentPage > 1, hasNextPage: currentPage < totalPages },
      totals: { totalRows: allRows.length, filteredRows: totalDocs },
    })
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
