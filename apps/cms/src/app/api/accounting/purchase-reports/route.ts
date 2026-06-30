import { NextRequest, NextResponse } from 'next/server'
import { AccountingExpenseReportService } from '@/accounting/services/reports/AccountingExpenseReportService'
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

    const [bills, payments] = await Promise.all([
      AccountingExpenseReportService.getBillRegister(payload),
      AccountingExpenseReportService.getPaymentsMadeRegister(payload),
    ])

    const allRows = [
      ...bills.map((bill) => ({
        id: `bill-${bill.documentId}`,
        documentNumber: bill.documentNumber || '-',
        documentDate: bill.documentDate || null,
        partyName: bill.partyName || '-',
        documentType: 'bill',
        documentTypeLabel: 'Bill',
        documentTypeTone: 'blue',
        status: bill.status || 'draft',
        statusLabel: STATUS_LABEL_MAP[bill.status || ''] || (bill.status || 'Draft'),
        statusTone: STATUS_TONE_MAP[bill.status || ''] || 'gray',
        total: bill.total,
        balanceDue: bill.balanceDue ?? 0,
        dueDate: bill.dueDate || null,
        currency: bill.currency || 'PHP',
      })),
      ...payments.map((pmt) => ({
        id: `pmt-${pmt.documentId}`,
        documentNumber: pmt.documentNumber || '-',
        documentDate: pmt.documentDate || null,
        partyName: pmt.partyName || '-',
        documentType: 'payment_made',
        documentTypeLabel: 'Payment Made',
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
    if (search) { filtered = filtered.filter((r) => r.searchableText.includes(search)) }
    if (types.length > 0) { filtered = filtered.filter((r) => types.includes(r.documentType)) }
    if (statuses.length > 0) { filtered = filtered.filter((r) => statuses.includes(r.status)) }
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

    const openApTotal = bills
      .filter((bill) => (bill.status === 'posted' || bill.status === 'partially_paid') && (bill.balanceDue ?? 0) > 0)
      .reduce((sum, bill) => sum + (bill.balanceDue ?? 0), 0)

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const overdueCount = bills.filter((bill) => {
      if (bill.status === 'paid' || bill.status === 'voided' || bill.status === 'cancelled') return false
      if (!bill.dueDate) return false
      return new Date(bill.dueDate) < today
    }).length

    return NextResponse.json({
      section: {
        id: 'purchase-reports',
        label: 'Purchase Reports',
        description: 'Review bill and payments-made register outputs backed by the expense reporting service.',
        searchPlaceholder: 'Search bill no., payment no., vendor, status, or amount',
        filters: {
          types: [
            { label: 'Bill', value: 'bill' },
            { label: 'Payment Made', value: 'payment_made' },
          ],
          statuses: [
            { label: 'Posted', value: 'posted' },
            { label: 'Paid', value: 'paid' },
            { label: 'Partially Paid', value: 'partially_paid' },
            { label: 'Draft', value: 'draft' },
          ],
          quickFilters: [
            { label: 'Bills', value: 'type:bill' },
            { label: 'Payments', value: 'type:payment_made' },
            { label: 'Posted', value: 'status:posted' },
            { label: 'Partially Paid', value: 'status:partially_paid' },
          ],
        },
        metrics: [
          { id: 'recent-bills', label: 'Recent Bills', value: bills.length, change: 'Latest bill-register rows', trend: 'up' as const },
          { id: 'recent-payments', label: 'Recent Payments', value: payments.length, change: 'Latest payments-made rows', trend: 'up' as const },
          { id: 'open-ap-total', label: 'Open AP Total', value: formatCurrency(openApTotal), change: 'Payables balance from purchase reports', trend: 'up' as const },
          { id: 'overdue-bills', label: 'Overdue Bills', value: overdueCount, change: 'Bills overdue in aging support', trend: overdueCount > 0 ? 'down' as const : 'neutral' as const },
        ],
        table: {
          title: 'Purchase Report Register',
          description: 'Purchase-side report rows aligned to bill-register and payments-made-register support in apps/cms.',
          columns: ['Document No.', 'Date', 'Vendor', 'Type', 'Total', 'Status'],
          rows: paginatedRows,
        },
      },
      appliedFilters: { search, types, statuses, quickFilters },
      pagination: { page: currentPage, limit, totalDocs, totalPages, hasPrevPage: currentPage > 1, hasNextPage: currentPage < totalPages },
      totals: { totalRows: allRows.length, filteredRows: totalDocs, billCount: bills.length, paymentCount: payments.length, openApTotal, overdueCount },
    })
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
