import { NextRequest, NextResponse } from 'next/server'
import { ACCOUNTING_COLLECTION_SLUGS } from '@/accounting/constants/accounting'
import { findAllDocs } from '@/accounting/utils/findAllDocs'
import { handleAccountingApiError, requireAccountingAdmin } from '../_utils/auth'

const parseIntegerParam = (value: string | null, fallback: number) => { if (!value) return fallback; const p = Number(value); return Number.isFinite(p) ? p : fallback }
const parseListParam = (searchParams: URLSearchParams, key: string): string[] => Array.from(new Set(searchParams.getAll(key).flatMap((v) => String(v || '').split(',')).map((v) => v.trim()).filter(Boolean)))
const normalizeText = (value?: string | null) => String(value || '').trim().toLowerCase()
const formatDate = (v: string | null | undefined) => { if (!v) return '-'; const d = new Date(v); if (Number.isNaN(d.getTime())) return String(v); return d.toLocaleDateString('en-CA') }
const formatCurrency = (v: number | null | undefined) => { const n = v ?? 0; return `PHP ${n.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` }
const STATUS_TONE: Record<string, string> = { draft: 'amber', posted: 'blue', partially_paid: 'amber', paid: 'green', voided: 'red', cancelled: 'gray', overdue: 'red' }
function getRelationLabel(rel: unknown): string { if (!rel) return '-'; if (typeof rel === 'object' && rel !== null) { const r = rel as Record<string, any>; return r.displayName || r.name || r.projectCode || r.customerCode || String(r.id || '') } return String(rel) }

export async function GET(request: NextRequest) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const { searchParams } = new URL(request.url)
    const search = normalizeText(searchParams.get('search'))
    const statuses = parseListParam(searchParams, 'status')
    const projectIds = parseListParam(searchParams, 'projectId')
    const quickFilters = parseListParam(searchParams, 'quickFilter')
    const page = Math.max(1, parseIntegerParam(searchParams.get('page'), 1))
    const limit = Math.min(100, Math.max(1, parseIntegerParam(searchParams.get('limit'), 10)))

    const [invoiceDocs, projectDocs, customerDocs] = await Promise.all([
      findAllDocs<any>({ payload, collection: ACCOUNTING_COLLECTION_SLUGS.invoices, depth: 2, sort: '-invoiceDate' }),
      findAllDocs<any>({ payload, collection: ACCOUNTING_COLLECTION_SLUGS.projects, depth: 0 }),
      findAllDocs<any>({ payload, collection: ACCOUNTING_COLLECTION_SLUGS.customers, depth: 0 }),
    ])

    const projectInvoices = invoiceDocs.filter((doc) => doc.project !== null && doc.project !== undefined)
    const projects = projectDocs.map((p) => ({ id: String(p.id), label: `${p.projectCode ? `${p.projectCode} - ` : ''}${p.name || ''}`.trim() || `Project ${p.id}` }))
    const customers = customerDocs.filter((c: any) => c.status === 'active').map((c: any) => ({ id: String(c.id), label: c.displayName || c.customerCode || '', code: c.customerCode || '' }))

    const rows = projectInvoices.map((doc) => {
      const s = doc.status || 'draft'; const sl = s.replace('_', ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())
      const total = typeof doc.total === 'number' ? doc.total : 0; const bd = typeof doc.balanceDue === 'number' ? doc.balanceDue : 0
      return {
        id: String(doc.id), invoiceNumber: doc.invoiceNumber || '', invoiceDate: doc.invoiceDate || null, invoiceDateLabel: formatDate(doc.invoiceDate),
        status: s, statusLabel: sl, statusTone: STATUS_TONE[s] || 'gray',
        projectId: doc.project !== null && typeof doc.project === 'object' ? String((doc.project as any).id || '') : String(doc.project || ''), projectLabel: getRelationLabel(doc.project),
        customerId: doc.customer !== null && typeof doc.customer === 'object' ? String((doc.customer as any).id || '') : String(doc.customer || ''), customerLabel: getRelationLabel(doc.customer),
        dueDate: doc.dueDate || null, dueDateLabel: formatDate(doc.dueDate), postingDate: doc.postingDate || null, postingDateLabel: formatDate(doc.postingDate),
        total, totalLabel: formatCurrency(total), balanceDue: bd, balanceDueLabel: formatCurrency(bd),
        currency: doc.currency || 'PHP', memo: doc.memo || '', notes: doc.notes || '',
        searchableText: normalizeText([doc.invoiceNumber, getRelationLabel(doc.project), getRelationLabel(doc.customer), sl, doc.memo, doc.notes].join(' ')),
        cells: [
          { text: doc.invoiceNumber || '-', emphasis: true },
          getRelationLabel(doc.project),
          getRelationLabel(doc.customer),
          { text: formatCurrency(total), align: 'right' },
          { text: formatCurrency(bd), align: 'right' },
          { text: sl, tone: STATUS_TONE[s] || 'gray' },
        ],
      }
    })

    let filtered = rows
    if (search) { filtered = filtered.filter((r) => r.searchableText.includes(search)) }
    if (statuses.length > 0) { filtered = filtered.filter((r) => statuses.includes(r.status)) }
    if (projectIds.length > 0) { filtered = filtered.filter((r) => projectIds.includes(r.projectId)) }
    if (quickFilters.length > 0) { filtered = filtered.filter((r) => quickFilters.some((q) => { if (q === 'posted') return r.status === 'posted'; if (q === 'paid') return r.status === 'paid'; if (q === 'unpaid') return r.status === 'posted' || r.status === 'partially_paid'; return false })) }

    const totalDocs = filtered.length; const tp = Math.max(1, Math.ceil(totalDocs / limit)); const cp = Math.min(page, tp); const pr = filtered.slice((cp - 1) * limit, cp * limit)
    const totalRev = rows.reduce((s, r) => s + r.total, 0); const outstanding = rows.reduce((s, r) => s + r.balanceDue, 0)
    const projectCount = new Set(rows.map((r) => r.projectId)).size

    return NextResponse.json({
      section: { id: 'project-billing', label: 'Project Billing', description: 'Review posted and collectible project-linked invoices used as the revenue side of project profitability.', searchPlaceholder: 'Search project, invoice number, customer, total, or status',
        filters: { statuses: [{ label: 'Draft', value: 'draft' }, { label: 'Posted', value: 'posted' }, { label: 'Partially Paid', value: 'partially_paid' }, { label: 'Paid', value: 'paid' }, { label: 'Voided', value: 'voided' }], quickFilters: [{ label: 'Posted', value: 'posted' }, { label: 'Paid', value: 'paid' }, { label: 'Outstanding', value: 'unpaid' }] },
        metrics: [
          { id: 'invoices', label: 'Project Invoices', value: rows.length, change: 'Posted project-linked invoices', trend: 'up' as const },
          { id: 'revenue', label: 'Total Revenue', value: formatCurrency(totalRev), change: `Across ${projectCount} project${projectCount > 1 ? 's' : ''}`, trend: 'up' as const },
          { id: 'outstanding', label: 'Outstanding', value: formatCurrency(outstanding), change: 'Unpaid portion of project invoices', trend: outstanding > 0 ? 'down' as const : 'neutral' as const },
          { id: 'projects', label: 'Projects With Revenue', value: projectCount, change: 'Projects generating invoice revenue', trend: 'up' as const },
        ],
        table: { title: 'Project Billing Register', description: 'Invoice rows aligned to project-linked records in accounting-invoices.', columns: ['Invoice Number', 'Project', 'Customer', 'Total', 'Balance Due', 'Status'], rows: pr },
      },
      appliedFilters: { search, statuses, projectIds, quickFilters },
      pagination: { page: cp, limit, totalDocs, totalPages: tp, hasPrevPage: cp > 1, hasNextPage: cp < tp },
      totals: { totalRows: rows.length, filteredRows: totalDocs, totalRevenue: totalRev, outstanding, projectCount },
      referenceData: { projects, customers, statusOptions: [{ label: 'Draft', value: 'draft' }, { label: 'Posted', value: 'posted' }, { label: 'Partially Paid', value: 'partially_paid' }, { label: 'Paid', value: 'paid' }, { label: 'Voided', value: 'voided' }] },
    })
  } catch (e) { return handleAccountingApiError(e) }
}
