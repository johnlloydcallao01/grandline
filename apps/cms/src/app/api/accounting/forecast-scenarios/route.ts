import { NextRequest, NextResponse } from 'next/server'
import { ACCOUNTING_COLLECTION_SLUGS, ACCOUNTING_SCENARIO_STATUS_OPTIONS, ACCOUNTING_SCENARIO_TYPE_OPTIONS } from '@/accounting/constants/accounting'
import { findAllDocs } from '@/accounting/utils/findAllDocs'
import { handleAccountingApiError, requireAccountingAdmin } from '../_utils/auth'

const parseIntegerParam = (value: string | null, fallback: number) => { if (!value) return fallback; const p = Number(value); return Number.isFinite(p) ? p : fallback }
const parseListParam = (searchParams: URLSearchParams, key: string): string[] => Array.from(new Set(searchParams.getAll(key).flatMap((v) => String(v || '').split(',')).map((v) => v.trim()).filter(Boolean)))
const normalizeText = (value?: string | null) => String(value || '').trim().toLowerCase()
const STATUS_TONE: Record<string, string> = { draft: 'amber', approved: 'green', archived: 'gray' }
function getRelationLabel(rel: unknown): string { if (!rel) return '-'; if (typeof rel === 'object' && rel !== null) { const r = rel as Record<string, any>; return r.code || r.name || r.title || String(r.id || '') } return String(rel) }

export async function GET(request: NextRequest) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const { searchParams } = new URL(request.url)
    const search = normalizeText(searchParams.get('search'))
    const statuses = parseListParam(searchParams, 'status')
    const scenarioTypes = parseListParam(searchParams, 'scenarioType')
    const quickFilters = parseListParam(searchParams, 'quickFilter')
    const page = Math.max(1, parseIntegerParam(searchParams.get('page'), 1))
    const limit = Math.min(100, Math.max(1, parseIntegerParam(searchParams.get('limit'), 10)))

    const [scenarioDocs, fyDocs] = await Promise.all([
      findAllDocs<any>({ payload, collection: ACCOUNTING_COLLECTION_SLUGS.forecastScenarios, depth: 2, sort: '-createdAt' }),
      findAllDocs<any>({ payload, collection: ACCOUNTING_COLLECTION_SLUGS.fiscalYears, depth: 0 }),
    ])
    const fyList = fyDocs.map((f) => ({ id: String(f.id), label: f.code || f.name || `FY ${f.id}` }))

    const rows = scenarioDocs.map((doc) => {
      const s = doc.status || 'draft'; const sl = ACCOUNTING_SCENARIO_STATUS_OPTIONS.find((o) => o.value === s)?.label || s
      const st = doc.scenarioType || 'base_case'; const stl = ACCOUNTING_SCENARIO_TYPE_OPTIONS.find((o) => o.value === st)?.label || st
      const assumptions = doc.assumptions
      const hasAssumptions = assumptions !== null && assumptions !== undefined && (Array.isArray(assumptions) ? assumptions.length > 0 : typeof assumptions === 'object' ? Object.keys(assumptions).length > 0 : true)
      return {
        id: String(doc.id), name: doc.name || '', status: s, statusLabel: sl, statusTone: STATUS_TONE[s] || 'gray',
        scenarioType: st, scenarioTypeLabel: stl, hasAssumptions,
        assumptionsLabel: hasAssumptions ? 'Loaded' : 'None',
        fiscalYearId: doc.fiscalYear !== null && typeof doc.fiscalYear === 'object' ? String((doc.fiscalYear as any).id || '') : String(doc.fiscalYear || ''),
        fiscalYearLabel: getRelationLabel(doc.fiscalYear),
        notes: doc.notes || '',
        searchableText: normalizeText([doc.name, sl, stl, getRelationLabel(doc.fiscalYear), doc.notes].join(' ')),
        cells: [
          { text: doc.name || '-', emphasis: true },
          stl,
          getRelationLabel(doc.fiscalYear),
          { text: sl, tone: STATUS_TONE[s] || 'gray' },
          hasAssumptions ? 'Loaded' : 'None',
          doc.notes || '-',
        ],
      }
    })

    let filtered = rows
    if (search) { filtered = filtered.filter((r) => r.searchableText.includes(search)) }
    if (statuses.length > 0) { filtered = filtered.filter((r) => statuses.includes(r.status)) }
    if (scenarioTypes.length > 0) { filtered = filtered.filter((r) => scenarioTypes.includes(r.scenarioType)) }
    if (quickFilters.length > 0) { filtered = filtered.filter((r) => quickFilters.some((q) => { if (q === 'approved') return r.status === 'approved'; if (q === 'draft') return r.status === 'draft'; if (q === 'base_case') return r.scenarioType === 'base_case'; return false })) }

    const totalDocs = filtered.length; const tp = Math.max(1, Math.ceil(totalDocs / limit)); const cp = Math.min(page, tp); const pr = filtered.slice((cp - 1) * limit, cp * limit)
    const approvedCount = rows.filter((r) => r.status === 'approved').length

    return NextResponse.json({
      section: { id: 'forecast-scenarios', label: 'Forecast Scenarios', description: 'Review forecast scenario headers using scenario name, type, fiscal year, status, and scenario notes.', searchPlaceholder: 'Search scenario name, type, fiscal year, status, or notes',
        filters: { statuses: ACCOUNTING_SCENARIO_STATUS_OPTIONS.map((o) => ({ label: o.label, value: o.value })), scenarioTypes: ACCOUNTING_SCENARIO_TYPE_OPTIONS.map((o) => ({ label: o.label, value: o.value })), quickFilters: [{ label: 'Approved', value: 'approved' }, { label: 'Draft', value: 'draft' }, { label: 'Base Case', value: 'base_case' }] },
        metrics: [
          { id: 'total', label: 'Scenarios', value: rows.length, change: 'Forecast scenario records', trend: 'up' as const },
          { id: 'approved', label: 'Approved', value: approvedCount, change: 'Scenarios ready for planning', trend: approvedCount > 0 ? 'up' as const : 'neutral' as const },
          { id: 'draft', label: 'Draft', value: rows.length - approvedCount - rows.filter((r) => r.status === 'archived').length, change: 'Scenarios under preparation', trend: 'neutral' as const },
          { id: 'types', label: 'Scenario Types', value: new Set(rows.map((r) => r.scenarioType)).size, change: 'Distinct types in use', trend: 'neutral' as const },
        ],
        table: { title: 'Forecast Scenario Register', description: 'Scenario records aligned to accounting-forecast-scenarios.', columns: ['Scenario Name', 'Scenario Type', 'Fiscal Year', 'Status', 'Assumptions', 'Notes'], rows: pr },
      },
      appliedFilters: { search, statuses, scenarioTypes, quickFilters },
      pagination: { page: cp, limit, totalDocs, totalPages: tp, hasPrevPage: cp > 1, hasNextPage: cp < tp },
      totals: { totalRows: rows.length, filteredRows: totalDocs, approvedCount },
      referenceData: { fiscalYears: fyList, statusOptions: ACCOUNTING_SCENARIO_STATUS_OPTIONS.map((o) => ({ label: o.label, value: o.value })), typeOptions: ACCOUNTING_SCENARIO_TYPE_OPTIONS.map((o) => ({ label: o.label, value: o.value })) },
    })
  } catch (e) { return handleAccountingApiError(e) }
}

export async function POST(request: NextRequest) {
  try {
    const { payload, user } = await requireAccountingAdmin(request)
    const body = await request.json()
    if (!body?.name || !body?.fiscalYearId) { return NextResponse.json({ error: 'Name and fiscal year are required.' }, { status: 400 }) }
    const data = { name: body.name, fiscalYear: Number(body.fiscalYearId), status: body.status || 'draft', scenarioType: body.scenarioType || 'base_case', assumptions: body.assumptions || undefined, notes: body.notes || undefined, createdBy: user.id, updatedBy: user.id } as never
    const created = await payload.create({ collection: ACCOUNTING_COLLECTION_SLUGS.forecastScenarios, depth: 2, overrideAccess: true, data })
    return NextResponse.json({ id: created.id, scenario: created }, { status: 201 })
  } catch (e) { return handleAccountingApiError(e) }
}
