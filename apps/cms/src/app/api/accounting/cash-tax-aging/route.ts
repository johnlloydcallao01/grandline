import { NextRequest, NextResponse } from 'next/server'
import { AccountingCashReportService } from '@/accounting/services/reports/AccountingCashReportService'
import { AccountingTaxReportService } from '@/accounting/services/reports/AccountingTaxReportService'
import { AccountingAgingReportService } from '@/accounting/services/reports/AccountingAgingReportService'
import { handleAccountingApiError, requireAccountingAdmin } from '../_utils/auth'

const parseIntegerParam = (value: string | null, fallback: number) => {
  if (!value) return fallback; const p = Number(value); return Number.isFinite(p) ? p : fallback
}

const parseListParam = (searchParams: URLSearchParams, key: string): string[] =>
  Array.from(new Set(searchParams.getAll(key).flatMap((v) => String(v || '').split(',')).map((v) => v.trim()).filter(Boolean)))

const normalizeText = (value?: string | null) => String(value || '').trim().toLowerCase()
const formatCurrency = (value: number) => new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)

function getAgingBucket(row: { currentAmount: number; bucket1to30: number; bucket31to60: number; bucket61to90: number; bucketOver90: number }) {
  if (row.bucketOver90 > 0) return '90+'
  if (row.bucket61to90 > 0) return '61-90'
  if (row.bucket31to60 > 0) return '31-60'
  if (row.bucket1to30 > 0) return '1-30'
  return 'Current'
}

const DIRECTION_TONE: Record<string, string> = { inflow: 'green', outflow: 'red', transfer: 'blue' }
const DIRECTION_LABEL: Record<string, string> = { inflow: 'Inflow', outflow: 'Outflow', transfer: 'Transfer' }
const BUCKET_TONE: Record<string, string> = { '90+': 'red', '61-90': 'amber', '31-60': 'amber', '1-30': 'amber', Current: 'green' }

export async function GET(request: NextRequest) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const { searchParams } = new URL(request.url)
    const search = normalizeText(searchParams.get('search'))
    const types = parseListParam(searchParams, 'type')
    const quickFilters = parseListParam(searchParams, 'quickFilter')
    const page = Math.max(1, parseIntegerParam(searchParams.get('page'), 1))
    const limit = Math.min(100, Math.max(1, parseIntegerParam(searchParams.get('limit'), 10)))

    const [cashRows, taxResult, arAgingRows, apAgingRows] = await Promise.all([
      AccountingCashReportService.getCashActivity(payload),
      AccountingTaxReportService.getTaxSummary(payload, {}),
      AccountingAgingReportService.getAccountsReceivableAging(payload),
      AccountingAgingReportService.getAccountsPayableAging(payload),
    ])

    const allRows = [
      ...cashRows.map((c) => ({
        id: `cash-${c.entityType}-${c.entityId}`,
        reportType: 'cash_activity',
        reportTypeLabel: 'Cash Activity',
        reference: c.documentNumber || '-',
        partyName: c.bankAccountName || c.entityType || 'Bank Account',
        bucketLabel: DIRECTION_LABEL[c.direction] || c.direction,
        bucketTone: DIRECTION_TONE[c.direction] || 'gray',
        amount: c.amount,
        status: c.status || 'posted',
        statusLabel: 'Posted',
        statusTone: 'green',
        searchableText: normalizeText([c.documentNumber, c.bankAccountName, c.direction, c.memo, formatCurrency(c.amount)].join(' ')),
        cells: [
          'Cash Activity',
          { text: c.documentNumber || '-', emphasis: true },
          c.bankAccountName || '-',
          DIRECTION_LABEL[c.direction] || c.direction,
          { text: formatCurrency(c.amount), emphasis: true, align: 'right' },
          { text: 'Posted', tone: 'green' },
        ],
      })),
      ...taxResult.rows.map((t) => ({
        id: `tax-${t.id}`,
        reportType: 'tax_summary',
        reportTypeLabel: 'Tax Summary',
        reference: t.taxCode || '-',
        partyName: t.taxName || '-',
        bucketLabel: (t.taxScope || 'both').replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
        bucketTone: 'blue',
        amount: t.taxAmount,
        status: 'active',
        statusLabel: 'Active',
        statusTone: 'blue',
        searchableText: normalizeText([t.taxCode, t.taxName, t.taxScope, t.calculationMethod, formatCurrency(t.taxAmount)].join(' ')),
        cells: [
          'Tax Summary',
          { text: t.taxCode || '-', emphasis: true },
          t.taxName || '-',
          (t.taxScope || 'both').replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
          { text: formatCurrency(t.taxAmount), emphasis: true, align: 'right' },
          { text: 'Active', tone: 'blue' },
        ],
      })),
      ...arAgingRows.map((ar) => {
        const bucket = getAgingBucket(ar)
        return {
          id: `ar-${ar.documentId}`,
          reportType: 'ar_aging',
          reportTypeLabel: 'AR Aging',
          reference: ar.documentNumber || '-',
          partyName: ar.entityName || '-',
          bucketLabel: bucket,
          bucketTone: BUCKET_TONE[bucket] || 'gray',
          amount: ar.balanceDue,
          status: ar.daysOverdue > 0 ? 'overdue' : 'current',
          statusLabel: ar.daysOverdue > 0 ? 'Overdue' : 'Current',
          statusTone: ar.daysOverdue > 0 ? 'amber' : 'green',
          searchableText: normalizeText([ar.documentNumber, ar.entityName, bucket, formatCurrency(ar.balanceDue)].join(' ')),
          cells: [
            'AR Aging',
            { text: ar.documentNumber || '-', emphasis: true },
            ar.entityName || '-',
            bucket,
            { text: formatCurrency(ar.balanceDue), emphasis: true, align: 'right' },
            { text: ar.daysOverdue > 0 ? 'Overdue' : 'Current', tone: ar.daysOverdue > 0 ? 'amber' : 'green' },
          ],
        }
      }),
      ...apAgingRows.map((ap) => {
        const bucket = getAgingBucket(ap)
        return {
          id: `ap-${ap.documentId}`,
          reportType: 'ap_aging',
          reportTypeLabel: 'AP Aging',
          reference: ap.documentNumber || '-',
          partyName: ap.entityName || '-',
          bucketLabel: bucket,
          bucketTone: BUCKET_TONE[bucket] || 'gray',
          amount: ap.balanceDue,
          status: ap.daysOverdue > 0 ? 'overdue' : 'current',
          statusLabel: ap.daysOverdue > 0 ? 'Overdue' : 'Current',
          statusTone: ap.daysOverdue > 0 ? 'amber' : 'green',
          searchableText: normalizeText([ap.documentNumber, ap.entityName, bucket, formatCurrency(ap.balanceDue)].join(' ')),
          cells: [
            'AP Aging',
            { text: ap.documentNumber || '-', emphasis: true },
            ap.entityName || '-',
            bucket,
            { text: formatCurrency(ap.balanceDue), emphasis: true, align: 'right' },
            { text: ap.daysOverdue > 0 ? 'Overdue' : 'Current', tone: ap.daysOverdue > 0 ? 'amber' : 'green' },
          ],
        }
      }),
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
        id: 'cash-tax-aging',
        label: 'Cash, Tax & Aging',
        description: 'Review cash activity, tax summary, and AR/AP aging outputs backed by exposed report endpoints and report services.',
        searchPlaceholder: 'Search bank account, tax code, customer, vendor, aging bucket, or amount',
        filters: {
          types: [
            { label: 'Cash Activity', value: 'cash_activity' },
            { label: 'Tax Summary', value: 'tax_summary' },
            { label: 'AR Aging', value: 'ar_aging' },
            { label: 'AP Aging', value: 'ap_aging' },
          ],
          quickFilters: [
            { label: 'Cash Activity', value: 'type:cash_activity' },
            { label: 'Tax Summary', value: 'type:tax_summary' },
            { label: 'AR Aging', value: 'type:ar_aging' },
            { label: 'AP Aging', value: 'type:ap_aging' },
          ],
        },
        metrics: [
          { id: 'cash-activity-rows', label: 'Cash Activity Rows', value: cashRows.length, change: 'Posted cash inflow/outflow rows', trend: 'up' as const },
          { id: 'tax-summary-codes', label: 'Tax Summary Codes', value: taxResult.rows.length, change: 'Tax-code rows in summary output', trend: 'neutral' as const },
          { id: 'ar-aging-rows', label: 'AR Aging Rows', value: arAgingRows.length, change: 'Receivable aging balances', trend: 'up' as const },
          { id: 'ap-aging-rows', label: 'AP Aging Rows', value: apAgingRows.length, change: 'Payable aging balances', trend: 'up' as const },
        ],
        table: {
          title: 'Cash / Tax / Aging Snapshot',
          description: 'Mixed operational report snapshot aligned to cash-activity, tax-summary, and aging-report support in apps/cms.',
          columns: ['Report Type', 'Reference', 'Party / Account', 'Bucket / Scope', 'Amount', 'Status'],
          rows: paginatedRows,
        },
      },
      appliedFilters: { search, types, quickFilters },
      pagination: { page: currentPage, limit, totalDocs, totalPages, hasPrevPage: currentPage > 1, hasNextPage: currentPage < totalPages },
      totals: { totalRows: allRows.length, filteredRows: totalDocs, cashRows: cashRows.length, taxRows: taxResult.rows.length, arRows: arAgingRows.length, apRows: apAgingRows.length },
    })
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
