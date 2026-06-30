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
  voided: 'Voided', reversed: 'Reversed', cancelled: 'Cancelled',
}
const STATUS_TONE_MAP: Record<string, string> = {
  draft: 'gray', posted: 'green', paid: 'blue', partially_paid: 'amber',
  voided: 'red', reversed: 'gray', cancelled: 'red',
}

export async function GET(request: NextRequest) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const { searchParams } = new URL(request.url)
    const search = normalizeText(searchParams.get('search'))
    const statuses = parseListParam(searchParams, 'status')
    const quickFilters = parseListParam(searchParams, 'quickFilter')
    const page = Math.max(1, parseIntegerParam(searchParams.get('page'), 1))
    const limit = Math.min(100, Math.max(1, parseIntegerParam(searchParams.get('limit'), 10)))

    const expenses = await AccountingExpenseReportService.getExpenseRegister(payload)

    const dateLabel = (d: string | null | undefined) => {
      if (!d) return '-'
      return new Date(d).toLocaleDateString('en-CA')
    }

    const mappedRows = expenses.map((exp) => ({
      id: `exp-${exp.documentId}`,
      documentNumber: exp.documentNumber || '-',
      documentDate: exp.documentDate || null,
      documentDateLabel: dateLabel(exp.documentDate),
      partyName: exp.partyName || '-',
      status: (exp.status as string) || 'draft',
      statusLabel: STATUS_LABEL_MAP[(exp.status as string) || ''] || ((exp.status as string) || 'Draft'),
      statusTone: STATUS_TONE_MAP[(exp.status as string) || ''] || 'gray',
      total: exp.total,
      currency: exp.currency || 'PHP',
      searchableText: normalizeText([exp.documentNumber, exp.partyName, STATUS_LABEL_MAP[(exp.status as string) || ''] || '', formatCurrency(exp.total)].join(' ')),
      cells: [
        { text: exp.documentNumber || '-', emphasis: true },
        dateLabel(exp.documentDate),
        exp.partyName || '-',
        exp.currency || 'PHP',
        { text: formatCurrency(exp.total), align: 'right' },
        { text: STATUS_LABEL_MAP[(exp.status as string) || ''] || ((exp.status as string) || 'Draft'), tone: STATUS_TONE_MAP[(exp.status as string) || ''] || 'gray' },
      ],
    }))

    let filtered = mappedRows
    if (search) { filtered = filtered.filter((r) => r.searchableText.includes(search)) }
    if (statuses.length > 0) { filtered = filtered.filter((r) => statuses.includes(r.status)) }
    if (quickFilters.length > 0) {
      filtered = filtered.filter((r) => quickFilters.some((qf) => {
        const [prefix, value] = qf.split(':')
        if (prefix === 'status') return r.status === value
        return false
      }))
    }

    const totalDocs = filtered.length
    const totalPages = Math.max(1, Math.ceil(totalDocs / limit))
    const currentPage = Math.min(page, totalPages)
    const paginatedRows = filtered.slice((currentPage - 1) * limit, currentPage * limit)

    const totalAmount = expenses.reduce((sum, e) => sum + e.total, 0)
    const withVendorCount = expenses.filter((e) => e.partyId != null).length

    return NextResponse.json({
      section: {
        id: 'expense-reports',
        label: 'Expense Reports',
        description: 'Review posted expense-register output using expense number, expense date, vendor, and total amount fields.',
        searchPlaceholder: 'Search expense no., expense date, vendor, status, or amount',
        filters: {
          statuses: [
            { label: 'Posted', value: 'posted' },
            { label: 'Draft', value: 'draft' },
            { label: 'Paid', value: 'paid' },
          ],
          quickFilters: [
            { label: 'Posted', value: 'status:posted' },
          ],
        },
        metrics: [
          { id: 'posted-expenses', label: 'Posted Expenses', value: expenses.length, change: 'Rows in expense-register output', trend: 'up' as const },
          { id: 'expense-total', label: 'Expense Total', value: formatCurrency(totalAmount), change: 'Posted expense amount in scope', trend: 'up' as const },
          { id: 'with-vendor', label: 'With Vendor', value: withVendorCount, change: 'Expenses linked to a vendor record', trend: 'neutral' as const },
          { id: 'with-journal-link', label: 'With Journal Link', value: expenses.length, change: 'Expense rows traceable to posted journals', trend: 'up' as const },
        ],
        table: {
          title: 'Expense Register',
          description: 'Expense report rows aligned to the exposed expense-register endpoint in apps/cms.',
          columns: ['Expense No.', 'Date', 'Vendor', 'Currency', 'Total', 'Status'],
          rows: paginatedRows,
        },
      },
      appliedFilters: { search, statuses, quickFilters },
      pagination: { page: currentPage, limit, totalDocs, totalPages, hasPrevPage: currentPage > 1, hasNextPage: currentPage < totalPages },
      totals: { totalRows: expenses.length, filteredRows: totalDocs, totalAmount, withVendorCount },
    })
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
