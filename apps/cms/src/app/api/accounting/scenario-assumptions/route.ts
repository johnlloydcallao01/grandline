import { NextRequest, NextResponse } from 'next/server'
import { ACCOUNTING_COLLECTION_SLUGS } from '@/accounting/constants/accounting'
import { findAllDocs } from '@/accounting/utils/findAllDocs'
import { handleAccountingApiError, requireAccountingAdmin } from '../_utils/auth'

const parseIntegerParam = (value: string | null, fallback: number) => { if (!value) return fallback; const p = Number(value); return Number.isFinite(p) ? p : fallback }
const parseListParam = (searchParams: URLSearchParams, key: string): string[] => Array.from(new Set(searchParams.getAll(key).flatMap((v) => String(v || '').split(',')).map((v) => v.trim()).filter(Boolean)))
const normalizeText = (value?: string | null) => String(value || '').trim().toLowerCase()

function categorizeKey(key: string): string {
  const lower = key.toLowerCase()
  if (lower.includes('growth') || lower.includes('revenue')) return 'Growth'
  if (lower.includes('enrollment') || lower.includes('demand')) return 'Demand'
  if (lower.includes('margin') || lower.includes('pricing')) return 'Pricing'
  if (lower.includes('cost') || lower.includes('expense')) return 'Cost'
  if (lower.includes('utilization') || lower.includes('capacity')) return 'Capacity'
  return 'Other'
}

function getRelationLabel(rel: unknown): string { if (!rel) return '-'; if (typeof rel === 'object' && rel !== null) { const r = rel as Record<string, any>; return r.code || r.name || String(r.id || '') } return String(rel) }

export async function GET(request: NextRequest) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const { searchParams } = new URL(request.url)
    const search = normalizeText(searchParams.get('search'))
    const scenarioIds = parseListParam(searchParams, 'scenarioId')
    const categories = parseListParam(searchParams, 'category')
    const quickFilters = parseListParam(searchParams, 'quickFilter')
    const page = Math.max(1, parseIntegerParam(searchParams.get('page'), 1))
    const limit = Math.min(100, Math.max(1, parseIntegerParam(searchParams.get('limit'), 10)))

    const scenarioDocs = await findAllDocs<any>({ payload, collection: ACCOUNTING_COLLECTION_SLUGS.forecastScenarios, depth: 2, sort: '-createdAt' })

    type AsmRow = {
      id: string; scenarioId: string; scenarioName: string; scenarioStatus: string; scenarioStatusLabel: string; scenarioStatusTone: string;
      fiscalYearLabel: string; key: string; rawKey: string; category: string; value: number; valueLabel: string;
      searchableText: string;
      cells: Array<string | { text: string; emphasis?: boolean; tone?: string; align?: string }>;
    }

    const allRows: AsmRow[] = []
    const STATUS_TONE: Record<string, string> = { draft: 'amber', approved: 'green', archived: 'gray' }

    for (const doc of scenarioDocs) {
      const assumptions = doc.assumptions
      if (!assumptions || typeof assumptions !== 'object') continue
      const entries = Object.entries(assumptions as Record<string, unknown>)
      if (entries.length === 0) continue

      const ss = doc.status || 'draft'
      const sLabel = String(ss).charAt(0).toUpperCase() + String(ss).slice(1)

      for (const [key, rawValue] of entries) {
        if (typeof rawValue !== 'number') continue
        const value = Math.round(rawValue * 100)
        const category = categorizeKey(key)
        const displayKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase()).trim()

        allRows.push({
          id: `${doc.id}:${key}`, scenarioId: String(doc.id), scenarioName: doc.name || '-',
          scenarioStatus: ss, scenarioStatusLabel: sLabel, scenarioStatusTone: STATUS_TONE[ss] || 'gray',
          fiscalYearLabel: getRelationLabel(doc.fiscalYear), key: displayKey, rawKey: key, category,
          value, valueLabel: `${value}%`,
          searchableText: normalizeText([doc.name, displayKey, category, String(value) + '%', sLabel].join(' ')),
          cells: [
            { text: doc.name || '-', emphasis: true },
            displayKey,
            category,
            `${value}%`,
            getRelationLabel(doc.fiscalYear),
            { text: sLabel, tone: STATUS_TONE[ss] || 'gray' },
          ],
        })
      }
    }

    let filtered = allRows
    if (search) { filtered = filtered.filter((r) => r.searchableText.includes(search)) }
    if (scenarioIds.length > 0) { filtered = filtered.filter((r) => scenarioIds.includes(r.scenarioId)) }
    if (categories.length > 0) { filtered = filtered.filter((r) => categories.includes(r.category)) }
    if (quickFilters.length > 0) { filtered = filtered.filter((r) => quickFilters.some((q) => { if (q === 'growth') return r.category === 'Growth'; if (q === 'demand') return r.category === 'Demand'; if (q === 'pricing') return r.category === 'Pricing'; if (q === 'cost') return r.category === 'Cost'; return false })) }

    const totalDocs = filtered.length; const tp = Math.max(1, Math.ceil(totalDocs / limit)); const cp = Math.min(page, tp); const pr = filtered.slice((cp - 1) * limit, cp * limit)
    const catSet = new Set(allRows.map((r) => r.category))
    const growthCount = allRows.filter((r) => r.category === 'Growth').length
    const scenariosWithAssumptions = new Set(allRows.map((r) => r.scenarioId)).size

    return NextResponse.json({
      section: { id: 'scenario-assumptions', label: 'Scenario Assumptions', description: 'Review individual assumption key-value pairs stored across forecast scenarios.', searchPlaceholder: 'Search scenario, assumption key, category, value, or fiscal year',
        filters: { categories: Array.from(catSet).map((c) => ({ label: c, value: c })), quickFilters: [{ label: 'Growth', value: 'growth' }, { label: 'Demand', value: 'demand' }, { label: 'Pricing', value: 'pricing' }, { label: 'Cost', value: 'cost' }] },
        metrics: [
          { id: 'total', label: 'Assumptions', value: allRows.length, change: 'Key-value pairs stored across scenarios', trend: 'up' as const },
          { id: 'growth', label: 'Growth Assumptions', value: growthCount, change: 'Revenue and growth-related assumptions', trend: 'up' as const },
          { id: 'scenarios', label: 'Scenarios With Data', value: scenariosWithAssumptions, change: 'Scenarios carrying assumption pairs', trend: 'neutral' as const },
          { id: 'categories', label: 'Categories', value: catSet.size, change: 'Distinct assumption categories', trend: 'neutral' as const },
        ],
        table: { title: 'Scenario Assumptions', description: 'Assumptions extracted from forecast scenario JSON, showing key, value, category, scenario, fiscal year, and status.', columns: ['Scenario', 'Key', 'Category', 'Value', 'Fiscal Year', 'Status'], rows: pr },
      },
      appliedFilters: { search, scenarioIds, categories, quickFilters },
      pagination: { page: cp, limit, totalDocs, totalPages: tp, hasPrevPage: cp > 1, hasNextPage: cp < tp },
      totals: { totalRows: allRows.length, filteredRows: totalDocs, growthCount },
      referenceData: { scenarios: scenarioDocs.filter((d) => d.assumptions && typeof d.assumptions === 'object' && Object.keys(d.assumptions as object).length > 0).map((d) => ({ id: String(d.id), label: d.name || `Scenario ${d.id}`, status: d.status || 'draft' })), categories: Array.from(catSet).map((c) => ({ label: c, value: c })) },
    })
  } catch (e) { return handleAccountingApiError(e) }
}

export async function POST(request: NextRequest) {
  try {
    const { payload, user } = await requireAccountingAdmin(request)
    const body = await request.json()
    if (!body?.scenarioId || !body?.key) { return NextResponse.json({ error: 'Scenario and key are required.' }, { status: 400 }) }
    const doc = await payload.findByID({ collection: ACCOUNTING_COLLECTION_SLUGS.forecastScenarios, id: body.scenarioId, depth: 0, overrideAccess: true })
    if (!doc) return NextResponse.json({ error: 'Scenario not found.' }, { status: 404 })
    const existing = (doc as any).assumptions && typeof (doc as any).assumptions === 'object' ? { ...(doc as any).assumptions } : {}
    const camelKey = body.key.replace(/\s+(.)/g, (_: string, c: string) => c.toUpperCase()).replace(/^./, (s: string) => s.toLowerCase())
    existing[camelKey] = typeof body.value === 'number' ? body.value / 100 : 0
    await payload.update({ collection: ACCOUNTING_COLLECTION_SLUGS.forecastScenarios, id: body.scenarioId, depth: 0, overrideAccess: true, data: { assumptions: existing, updatedBy: user.id } as never })
    return NextResponse.json({ success: true }, { status: 201 })
  } catch (e) { return handleAccountingApiError(e) }
}
