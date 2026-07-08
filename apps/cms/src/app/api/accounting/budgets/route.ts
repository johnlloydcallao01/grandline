import { NextRequest, NextResponse } from 'next/server'
import { ACCOUNTING_BUDGET_STATUS_OPTIONS, ACCOUNTING_BUDGET_TYPE_OPTIONS, ACCOUNTING_COLLECTION_SLUGS } from '@/accounting/constants/accounting'
import { findAllDocs } from '@/accounting/utils/findAllDocs'
import { handleAccountingApiError, requireAccountingAdmin } from '../_utils/auth'

const parseIntegerParam = (value: string | null, fallback: number) => { if (!value) return fallback; const p = Number(value); return Number.isFinite(p) ? p : fallback }
const parseListParam = (searchParams: URLSearchParams, key: string): string[] => Array.from(new Set(searchParams.getAll(key).flatMap((v) => String(v || '').split(',')).map((v) => v.trim()).filter(Boolean)))
const normalizeText = (value?: string | null) => String(value || '').trim().toLowerCase()
const STATUS_TONE: Record<string, string> = { draft: 'amber', approved: 'green', locked: 'blue', archived: 'gray' }
function getRelationLabel(rel: unknown): string { if (!rel) return '-'; if (typeof rel === 'object' && rel !== null) { const r = rel as Record<string, any>; return r.displayName || r.name || r.title || r.code || String(r.id || '') } return String(rel) }

export async function GET(request: NextRequest) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const { searchParams } = new URL(request.url)
    const search = normalizeText(searchParams.get('search'))
    const statuses = parseListParam(searchParams, 'status')
    const budgetTypes = parseListParam(searchParams, 'budgetType')
    const quickFilters = parseListParam(searchParams, 'quickFilter')
    const page = Math.max(1, parseIntegerParam(searchParams.get('page'), 1))
    const limit = Math.min(100, Math.max(1, parseIntegerParam(searchParams.get('limit'), 10)))

    const [budgetDocs, fyDocs, branchDocs, deptDocs, locDocs, projDocs, courseCatDocs, scenarioDocs] = await Promise.all([
      findAllDocs<any>({ payload, collection: ACCOUNTING_COLLECTION_SLUGS.budgets, depth: 2, sort: '-createdAt' }),
      findAllDocs<any>({ payload, collection: ACCOUNTING_COLLECTION_SLUGS.fiscalYears, depth: 0 }),
      findAllDocs<any>({ payload, collection: ACCOUNTING_COLLECTION_SLUGS.branches, depth: 0 }),
      findAllDocs<any>({ payload, collection: ACCOUNTING_COLLECTION_SLUGS.departments, depth: 0 }),
      findAllDocs<any>({ payload, collection: ACCOUNTING_COLLECTION_SLUGS.locations, depth: 0 }),
      findAllDocs<any>({ payload, collection: ACCOUNTING_COLLECTION_SLUGS.projects, depth: 0 }),
      findAllDocs<any>({ payload, collection: 'course-categories', depth: 0 }),
      findAllDocs<any>({ payload, collection: ACCOUNTING_COLLECTION_SLUGS.forecastScenarios, depth: 0 }),
    ])

    const fyList = fyDocs.map((f) => ({ id: String(f.id), label: f.code || f.name || `FY ${f.id}` }))
    const branches = branchDocs.filter((b: any) => b.isActive !== false).map((b) => ({ id: String(b.id), label: b.name || b.branchCode || '' }))
    const departments = deptDocs.filter((d: any) => d.isActive !== false).map((d) => ({ id: String(d.id), label: d.name || '' }))
    const locations = locDocs.filter((l: any) => l.isActive !== false).map((l) => ({ id: String(l.id), label: l.name || '' }))
    const projects = projDocs.map((p) => ({ id: String(p.id), label: `${p.projectCode ? `${p.projectCode} - ` : ''}${p.name || ''}`.trim() || `Project ${p.id}` }))
    const courseCategories = courseCatDocs.map((c) => ({ id: String(c.id), label: c.name || c.title || `Category ${c.id}` }))
    const scenarios = scenarioDocs.map((s) => ({ id: String(s.id), label: s.name || `Scenario ${s.id}` }))

    const rows = budgetDocs.map((doc) => {
      const s = doc.status || 'draft'; const sl = ACCOUNTING_BUDGET_STATUS_OPTIONS.find((o) => o.value === s)?.label || s
      const bt = doc.budgetType || 'annual'; const btl = ACCOUNTING_BUDGET_TYPE_OPTIONS.find((o) => o.value === bt)?.label || bt
      return {
        id: String(doc.id), budgetCode: doc.budgetCode || '', name: doc.name || '', status: s, statusLabel: sl, statusTone: STATUS_TONE[s] || 'gray',
        budgetType: bt, budgetTypeLabel: btl,
        fiscalYearId: doc.fiscalYear !== null && typeof doc.fiscalYear === 'object' ? String((doc.fiscalYear as any).id || '') : String(doc.fiscalYear || ''),
        fiscalYearLabel: getRelationLabel(doc.fiscalYear),
        scenarioId: doc.scenario !== null && typeof doc.scenario === 'object' ? String((doc.scenario as any).id || '') : String(doc.scenario || ''),
        scenarioLabel: getRelationLabel(doc.scenario),
        projectId: doc.project !== null && typeof doc.project === 'object' ? String((doc.project as any).id || '') : String(doc.project || ''),
        projectLabel: getRelationLabel(doc.project),
        courseCategoryId: doc.courseCategory !== null && typeof doc.courseCategory === 'object' ? String((doc.courseCategory as any).id || '') : String(doc.courseCategory || ''),
        courseCategoryLabel: getRelationLabel(doc.courseCategory),
        branchId: doc.branch !== null && typeof doc.branch === 'object' ? String((doc.branch as any).id || '') : String(doc.branch || ''),
        branchLabel: getRelationLabel(doc.branch),
        departmentId: doc.department !== null && typeof doc.department === 'object' ? String((doc.department as any).id || '') : String(doc.department || ''),
        departmentLabel: getRelationLabel(doc.department),
        locationId: doc.location !== null && typeof doc.location === 'object' ? String((doc.location as any).id || '') : String(doc.location || ''),
        locationLabel: getRelationLabel(doc.location),
        notes: doc.notes || '',
        searchableText: normalizeText([doc.budgetCode, doc.name, sl, btl, getRelationLabel(doc.fiscalYear), getRelationLabel(doc.scenario), doc.notes].join(' ')),
        cells: [
          { text: doc.budgetCode || '-', emphasis: true },
          doc.name || '-',
          getRelationLabel(doc.fiscalYear),
          btl,
          getRelationLabel(doc.scenario),
          { text: sl, tone: STATUS_TONE[s] || 'gray' },
        ],
      }
    })

    let filtered = rows
    if (search) { filtered = filtered.filter((r) => r.searchableText.includes(search)) }
    if (statuses.length > 0) { filtered = filtered.filter((r) => statuses.includes(r.status)) }
    if (budgetTypes.length > 0) { filtered = filtered.filter((r) => budgetTypes.includes(r.budgetType)) }
    if (quickFilters.length > 0) { filtered = filtered.filter((r) => quickFilters.some((q) => { if (q === 'approved') return r.status === 'approved'; if (q === 'draft') return r.status === 'draft'; if (q === 'annual') return r.budgetType === 'annual'; return false })) }

    const totalDocs = filtered.length; const tp = Math.max(1, Math.ceil(totalDocs / limit)); const cp = Math.min(page, tp); const pr = filtered.slice((cp - 1) * limit, cp * limit)
    const approvedCount = rows.filter((r) => r.status === 'approved').length; const annualCount = rows.filter((r) => r.budgetType === 'annual').length

    return NextResponse.json({
      section: { id: 'budgets', label: 'Budgets', description: 'Review budget headers that drive finance planning, approvals, and budget-vs-actual comparison.', searchPlaceholder: 'Search budget code, name, fiscal year, type, scenario, or status',
        filters: { statuses: ACCOUNTING_BUDGET_STATUS_OPTIONS.map((o) => ({ label: o.label, value: o.value })), budgetTypes: ACCOUNTING_BUDGET_TYPE_OPTIONS.map((o) => ({ label: o.label, value: o.value })), quickFilters: [{ label: 'Approved', value: 'approved' }, { label: 'Draft', value: 'draft' }, { label: 'Annual', value: 'annual' }] },
        metrics: [
          { id: 'total', label: 'Budgets', value: rows.length, change: 'Budget header records', trend: 'up' as const },
          { id: 'approved', label: 'Approved', value: approvedCount, change: 'Budgets approved for use', trend: approvedCount > 0 ? 'up' as const : 'neutral' as const },
          { id: 'annual', label: 'Annual Budgets', value: annualCount, change: 'Annual budget records', trend: 'neutral' as const },
          { id: 'types', label: 'Budget Types', value: new Set(rows.map((r) => r.budgetType)).size, change: 'Distinct budget types', trend: 'neutral' as const },
        ],
        table: { title: 'Budget Register', description: 'Budget records aligned to accounting-budgets, including fiscal year, type, scenario, and status.', columns: ['Budget Code', 'Name', 'Fiscal Year', 'Budget Type', 'Scenario', 'Status'], rows: pr },
      },
      appliedFilters: { search, statuses, budgetTypes, quickFilters },
      pagination: { page: cp, limit, totalDocs, totalPages: tp, hasPrevPage: cp > 1, hasNextPage: cp < tp },
      totals: { totalRows: rows.length, filteredRows: totalDocs, approvedCount, annualCount },
      referenceData: { fiscalYears: fyList, branches, departments, locations, projects, courseCategories, scenarios, statusOptions: ACCOUNTING_BUDGET_STATUS_OPTIONS.map((o) => ({ label: o.label, value: o.value })), typeOptions: ACCOUNTING_BUDGET_TYPE_OPTIONS.map((o) => ({ label: o.label, value: o.value })) },
    })
  } catch (e) { return handleAccountingApiError(e) }
}

export async function POST(request: NextRequest) {
  try {
    const { payload, user } = await requireAccountingAdmin(request)
    const body = await request.json()
    if (!body?.name || !body?.fiscalYearId) { return NextResponse.json({ error: 'Name and fiscal year are required.' }, { status: 400 }) }
    if (body.budgetCode) { const dup = await payload.find({ collection: ACCOUNTING_COLLECTION_SLUGS.budgets, where: { budgetCode: { equals: body.budgetCode } }, limit: 1, depth: 0, overrideAccess: true }); if (dup.docs.length > 0) { return NextResponse.json({ error: `A budget with code "${body.budgetCode}" already exists.` }, { status: 409 }) } }
    const data: Record<string, unknown> = { budgetCode: body.budgetCode || `BUD-${Date.now().toString(36).toUpperCase()}`, name: body.name, fiscalYear: Number(body.fiscalYearId), status: body.status || 'draft', budgetType: body.budgetType || 'annual', notes: body.notes || undefined, createdBy: user.id, updatedBy: user.id }
    if (body.branchId) { const n = Number(body.branchId); if (Number.isFinite(n)) data.branch = n }
    if (body.departmentId) { const n = Number(body.departmentId); if (Number.isFinite(n)) data.department = n }
    if (body.locationId) { const n = Number(body.locationId); if (Number.isFinite(n)) data.location = n }
    if (body.projectId) { const n = Number(body.projectId); if (Number.isFinite(n)) data.project = n }
    if (body.courseCategoryId) { const n = Number(body.courseCategoryId); if (Number.isFinite(n)) data.courseCategory = n }
    if (body.scenarioId) { const n = Number(body.scenarioId); if (Number.isFinite(n)) data.scenario = n }
    const created = await payload.create({ collection: ACCOUNTING_COLLECTION_SLUGS.budgets, depth: 2, overrideAccess: true, data: data as never })
    return NextResponse.json({ id: created.id, budget: created }, { status: 201 })
  } catch (e) { return handleAccountingApiError(e) }
}
