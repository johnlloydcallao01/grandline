import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../payload.config'
import { ACCOUNTING_COLLECTION_SLUGS } from '../accounting/constants/accounting'

type Seed = { name: string; scenarioType: string; status: string; assumptions: Record<string, number> | null; notes: string | null }

const entries: Seed[] = [
  { name: 'Base Case FY 2026', scenarioType: 'base_case', status: 'approved', assumptions: { revenueGrowth: 0.05, enrollmentRate: 0.85, marginTarget: 0.30, utilizationRate: 0.80 }, notes: 'Primary planning baseline with moderate growth and stable enrollment.' },
  { name: 'Best Case FY 2026', scenarioType: 'best_case', status: 'approved', assumptions: { revenueGrowth: 0.12, enrollmentRate: 0.95, marginTarget: 0.38, utilizationRate: 0.90 }, notes: 'Optimistic scenario assuming strong demand and pricing power.' },
  { name: 'Worst Case FY 2026', scenarioType: 'worst_case', status: 'approved', assumptions: { revenueGrowth: -0.03, enrollmentRate: 0.65, marginTarget: 0.20, utilizationRate: 0.65 }, notes: 'Downside scenario with reduced enrollment and margin pressure.' },
  { name: 'Q2 Reforecast FY 2026', scenarioType: 'custom', status: 'draft', assumptions: { revenueGrowth: 0.07, enrollmentRate: 0.78, marginTarget: 0.28, utilizationRate: 0.75, costAdjustment: 0.03 }, notes: 'Mid-year refresh using actual Q1 results.' },
  { name: 'Base Case FY 2027', scenarioType: 'base_case', status: 'draft', assumptions: { revenueGrowth: 0.06, enrollmentRate: 0.87, marginTarget: 0.32, utilizationRate: 0.82 }, notes: 'Forward planning scenario for next fiscal year.' },
  { name: 'Training Expansion FY 2026', scenarioType: 'best_case', status: 'draft', assumptions: { revenueGrowth: 0.15, enrollmentRate: 0.92, marginTarget: 0.35 }, notes: 'Assumes two new training facilities open in H2.' },
  { name: 'Cost Reduction FY 2026', scenarioType: 'custom', status: 'approved', assumptions: { revenueGrowth: 0.04, enrollmentRate: 0.80, marginTarget: 0.25, costAdjustment: -0.05 }, notes: 'Efficiency improvement scenario reducing operational costs by 5%.' },
  { name: 'High Growth FY 2027', scenarioType: 'best_case', status: 'draft', assumptions: { revenueGrowth: 0.18, enrollmentRate: 0.98, marginTarget: 0.40, utilizationRate: 0.95 }, notes: 'Aggressive growth scenario for FY 2027 planning.' },
  { name: 'Recession FY 2026', scenarioType: 'worst_case', status: 'archived', assumptions: { revenueGrowth: -0.10, enrollmentRate: 0.50, marginTarget: 0.15, utilizationRate: 0.55, costAdjustment: -0.15 }, notes: 'Archived severe downturn scenario no longer considered likely.' },
  { name: 'Instructor Capacity FY 2026', scenarioType: 'custom', status: 'draft', assumptions: { enrollmentRate: 0.75, utilizationRate: 0.70, marginTarget: 0.28 }, notes: 'Models impact of instructor shortage on delivery capacity.' },
]

async function seed(): Promise<void> {
  console.log('[seed:forecast-scenarios] Connecting...')
  const payload = await getPayload({ config })
  const fyResult = await payload.find({ collection: ACCOUNTING_COLLECTION_SLUGS.fiscalYears, limit: 20, depth: 0, overrideAccess: true, sort: 'code' })
  const fyList = fyResult.docs.map((d) => ({ id: d.id, code: (d as any).code || '' })).filter((f) => f.code)
  if (fyList.length < 1) { console.error('No fiscal years found.'); process.exit(1) }
  console.log(`[seed:forecast-scenarios] ${fyList.length} fiscal years, using "${fyList[0].code}"`)

  let created = 0; let updated = 0
  for (const e of entries) {
    const fy = fyList[0]
    const existing = await payload.find({ collection: ACCOUNTING_COLLECTION_SLUGS.forecastScenarios, where: { name: { equals: e.name } as any }, limit: 1, depth: 0, overrideAccess: true })
    const data = { name: e.name, scenarioType: e.scenarioType, fiscalYear: fy.id, status: e.status, assumptions: e.assumptions, notes: e.notes } as never
    if (existing.docs.length > 0) { await payload.update({ collection: ACCOUNTING_COLLECTION_SLUGS.forecastScenarios, id: existing.docs[0].id, overrideAccess: true, data }); updated++; console.log(`  UPDATED "${e.name}"`) }
    else { await payload.create({ collection: ACCOUNTING_COLLECTION_SLUGS.forecastScenarios, overrideAccess: true, data }); created++; console.log(`  CREATED "${e.name}"`) }
  }
  console.log(`[seed:forecast-scenarios] Done. Created: ${created}, Updated: ${updated}`)
  process.exit(0)
}
seed().catch((e) => { console.error('[seed:forecast-scenarios] Fatal:', e); process.exit(1) })
