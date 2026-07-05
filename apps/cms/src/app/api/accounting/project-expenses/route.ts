import { NextRequest, NextResponse } from 'next/server'
import { ACCOUNTING_COLLECTION_SLUGS } from '@/accounting/constants/accounting'
import { findAllDocs } from '@/accounting/utils/findAllDocs'
import { handleAccountingApiError, requireAccountingAdmin } from '../_utils/auth'

const parseIntegerParam = (value: string | null, fallback: number) => { if (!value) return fallback; const p = Number(value); return Number.isFinite(p) ? p : fallback }
const parseListParam = (searchParams: URLSearchParams, key: string): string[] => Array.from(new Set(searchParams.getAll(key).flatMap((v) => String(v || '').split(',')).map((v) => v.trim()).filter(Boolean)))
const normalizeText = (value?: string | null) => String(value || '').trim().toLowerCase()
const formatDate = (v: string | null | undefined) => { if (!v) return '-'; const d = new Date(v); if (Number.isNaN(d.getTime())) return String(v); return d.toLocaleDateString('en-CA') }
const formatCurrency = (v: number | null | undefined) => { const n = v ?? 0; return `PHP ${n.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` }
const STATUS_TONE: Record<string, string> = { draft: 'amber', posted: 'green', voided: 'red' }

function getRelationLabel(rel: unknown): string { if (!rel) return '-'; if (typeof rel === 'object' && rel !== null) { const r = rel as Record<string, any>; return r.name || r.displayName || r.projectCode || r.vendorCode || [r.firstName, r.lastName].filter(Boolean).join(' ') || r.email || String(r.id || '') } return String(rel) }

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

    const [expenseDocs, projectDocs, vendorDocs, accountDocs] = await Promise.all([
      findAllDocs<any>({ payload, collection: ACCOUNTING_COLLECTION_SLUGS.expenses, depth: 2, sort: '-expenseDate' }),
      findAllDocs<any>({ payload, collection: ACCOUNTING_COLLECTION_SLUGS.projects, depth: 0 }),
      findAllDocs<any>({ payload, collection: ACCOUNTING_COLLECTION_SLUGS.vendors, depth: 0 }),
      findAllDocs<any>({ payload, collection: ACCOUNTING_COLLECTION_SLUGS.chartOfAccounts, depth: 0 }),
    ])

    const projectExpenses = expenseDocs.filter((doc) => doc.project !== null && doc.project !== undefined)
    const projects = projectDocs.map((p) => ({ id: String(p.id), label: `${p.projectCode ? `${p.projectCode} - ` : ''}${p.name || ''}`.trim() || `Project ${p.id}` }))
    const vendors = vendorDocs.filter((v: any) => v.status === 'active').map((v: any) => ({ id: String(v.id), label: v.displayName || v.vendorCode || '', code: v.vendorCode || '' }))
    const chartAccounts = accountDocs.filter((a: any) => a.isActive !== false).map((a: any) => ({ id: String(a.id), label: `${a.code ? `${a.code} - ` : ''}${a.name || ''}`.trim() || `Account ${a.id}`, code: a.code || '' }))

    const rows = projectExpenses.map((doc) => {
      const s = doc.status || 'draft'
      const vendorLabel = getRelationLabel(doc.vendor)
      const projectLabel = getRelationLabel(doc.project)
      const total = typeof doc.total === 'number' ? doc.total : 0

      return {
        id: String(doc.id), expenseNumber: doc.expenseNumber || '', expenseDate: doc.expenseDate || null, expenseDateLabel: formatDate(doc.expenseDate),
        status: s, statusLabel: s.charAt(0).toUpperCase() + s.slice(1), statusTone: STATUS_TONE[s] || 'gray',
        projectId: doc.project !== null && typeof doc.project === 'object' ? String((doc.project as any).id || '') : String(doc.project || ''),
        projectLabel,
        vendorId: doc.vendor !== null && typeof doc.vendor === 'object' ? String((doc.vendor as any).id || '') : String(doc.vendor || ''),
        vendorLabel, vendorCode: doc.vendor !== null && typeof doc.vendor === 'object' ? ((doc.vendor as any).vendorCode || '') : '',
        postingDate: doc.postingDate || null, postingDateLabel: formatDate(doc.postingDate),
        total, totalLabel: formatCurrency(total),
        currency: doc.currency || 'PHP', expenseCategory: doc.expenseCategory || '',
        notes: doc.notes || '',
        searchableText: normalizeText([doc.expenseNumber, projectLabel, vendorLabel, s, doc.expenseCategory, doc.notes].join(' ')),
        cells: [
          { text: doc.expenseNumber || '-', emphasis: true },
          projectLabel,
          vendorLabel,
          formatDate(doc.postingDate),
          { text: formatCurrency(total), align: 'right' },
          { text: s.charAt(0).toUpperCase() + s.slice(1), tone: STATUS_TONE[s] || 'gray' },
        ],
      }
    })

    let filtered = rows
    if (search) { filtered = filtered.filter((r) => r.searchableText.includes(search)) }
    if (statuses.length > 0) { filtered = filtered.filter((r) => statuses.includes(r.status)) }
    if (projectIds.length > 0) { filtered = filtered.filter((r) => projectIds.includes(r.projectId)) }
    if (quickFilters.length > 0) { filtered = filtered.filter((r) => quickFilters.some((q) => { if (q === 'posted') return r.status === 'posted'; if (q === 'high_cost') return r.total > 50000; return false })) }

    const totalDocs = filtered.length; const tp = Math.max(1, Math.ceil(totalDocs / limit)); const cp = Math.min(page, tp); const pr = filtered.slice((cp - 1) * limit, cp * limit)
    const postedCount = rows.filter((r) => r.status === 'posted').length
    const totalCost = rows.reduce((s, r) => s + r.total, 0)
    const avgCost = rows.length > 0 ? totalCost / rows.length : 0
    const projectCount = new Set(rows.map((r) => r.projectId)).size

    return NextResponse.json({
      section: { id: 'project-expenses', label: 'Project Expenses', description: 'Review posted project-linked expenses used in profitability calculations, grouped by project, document number, vendor, and total cost.', searchPlaceholder: 'Search project, expense number, vendor, posting status, or project expense total',
        filters: { statuses: [{ label: 'Draft', value: 'draft' }, { label: 'Posted', value: 'posted' }, { label: 'Voided', value: 'voided' }], quickFilters: [{ label: 'Posted', value: 'posted' }, { label: 'High Cost', value: 'high_cost' }] },
        metrics: [
          { id: 'posted', label: 'Project Expenses', value: rows.length, change: 'Expense records tied to projects', trend: 'up' as const },
          { id: 'cost', label: 'Direct Expense Cost', value: formatCurrency(totalCost), change: `Across ${projectCount} project${projectCount > 1 ? 's' : ''}`, trend: 'up' as const },
          { id: 'avg', label: 'Avg Expense', value: formatCurrency(avgCost), change: `Average project-expense amount`, trend: 'neutral' as const },
          { id: 'projects', label: 'Projects With Expenses', value: projectCount, change: 'Projects currently carrying direct expenses', trend: 'up' as const },
        ],
        table: { title: 'Project Expense Register', description: 'Expense rows aligned to project-linked records in accounting-expenses, matching the cost components used by the project profitability service.', columns: ['Expense Number', 'Project', 'Vendor', 'Posting Date', 'Total Cost', 'Status'], rows: pr },
      },
      appliedFilters: { search, statuses, projectIds, quickFilters },
      pagination: { page: cp, limit, totalDocs, totalPages: tp, hasPrevPage: cp > 1, hasNextPage: cp < tp },
      totals: { totalRows: rows.length, filteredRows: totalDocs, postedCount, totalCost, projectCount },
      referenceData: { projects, vendors, chartAccounts, statusOptions: [{ label: 'Draft', value: 'draft' }, { label: 'Posted', value: 'posted' }, { label: 'Voided', value: 'voided' }] },
    })
  } catch (e) { return handleAccountingApiError(e) }
}
