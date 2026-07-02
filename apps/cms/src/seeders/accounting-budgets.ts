import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../payload.config'
import { ACCOUNTING_COLLECTION_SLUGS } from '../accounting/constants/accounting'

type SeedBudget = {
  budgetCode: string
  name: string
  fiscalYearCode: string
  status: 'draft' | 'approved' | 'locked' | 'archived'
  budgetType: 'annual' | 'monthly' | 'project' | 'department' | 'course_category'
  branchCode: string | null
  departmentCode: string | null
  notes: string | null
}

type SeedBudgetLine = {
  budgetCode: string
  accountCode: string
  periodNumber: number
  plannedAmount: number
}

const sampleBudgets: SeedBudget[] = [
  { budgetCode: 'BUD-2026-OPS', name: 'FY2026 Operations Budget', fiscalYearCode: 'FY2026', status: 'approved', budgetType: 'annual', branchCode: null, departmentCode: null, notes: 'Company-wide annual operating budget covering all departments and branches.' },
  { budgetCode: 'BUD-2026-TRAIN', name: 'FY2026 Training Delivery', fiscalYearCode: 'FY2026', status: 'approved', budgetType: 'department', branchCode: 'MNL-MAIN', departmentCode: 'TRAINING', notes: 'Training delivery department budget for instructor costs, materials, and equipment.' },
  { budgetCode: 'BUD-2026-IT', name: 'FY2026 IT Infrastructure', fiscalYearCode: 'FY2026', status: 'approved', budgetType: 'department', branchCode: 'MNL-MAIN', departmentCode: 'IT', notes: 'IT department budget covering hardware, software, and network costs.' },
  { budgetCode: 'BUD-2026-FIN', name: 'FY2026 Finance Operations', fiscalYearCode: 'FY2026', status: 'approved', budgetType: 'department', branchCode: 'MNL-MAIN', departmentCode: 'FIN', notes: 'Finance department operational budget.' },
  { budgetCode: 'BUD-2026-MKTG', name: 'FY2026 Marketing Budget', fiscalYearCode: 'FY2026', status: 'approved', budgetType: 'department', branchCode: 'MNL-MAIN', departmentCode: 'MKTG', notes: 'Marketing department budget for campaigns, events, and promotions.' },
  { budgetCode: 'BUD-2026-SALES-MNL', name: 'FY2026 Manila Sales Budget', fiscalYearCode: 'FY2026', status: 'approved', budgetType: 'department', branchCode: 'MNL-NORTH', departmentCode: 'SALES-MNL', notes: 'Northern Metro Manila sales team budget.' },
  { budgetCode: 'BUD-2026-CEBU', name: 'FY2026 Cebu Operations Budget', fiscalYearCode: 'FY2026', status: 'approved', budgetType: 'annual', branchCode: 'CEBU-CITY', departmentCode: null, notes: 'Cebu branch operational budget covering all departments in the Visayas region.' },
  { budgetCode: 'BUD-2026-DAVAO', name: 'FY2026 Davao Operations Budget', fiscalYearCode: 'FY2026', status: 'approved', budgetType: 'annual', branchCode: 'DAVAO-MAIN', departmentCode: null, notes: 'Davao branch operational budget covering Mindanao operations.' },
]

const sampleBudgetLines: SeedBudgetLine[] = [
  { budgetCode: 'BUD-2026-OPS', accountCode: '1010-OP', periodNumber: 1, plannedAmount: 250000 },
  { budgetCode: 'BUD-2026-OPS', accountCode: '1010-OP', periodNumber: 2, plannedAmount: 250000 },
  { budgetCode: 'BUD-2026-OPS', accountCode: '1010-OP', periodNumber: 3, plannedAmount: 250000 },
  { budgetCode: 'BUD-2026-OPS', accountCode: '1010-OP', periodNumber: 4, plannedAmount: 250000 },
  { budgetCode: 'BUD-2026-OPS', accountCode: '1010-OP', periodNumber: 5, plannedAmount: 250000 },
  { budgetCode: 'BUD-2026-OPS', accountCode: '1010-OP', periodNumber: 6, plannedAmount: 250000 },
  { budgetCode: 'BUD-2026-OPS', accountCode: '5100-SAL', periodNumber: 1, plannedAmount: 180000 },
  { budgetCode: 'BUD-2026-OPS', accountCode: '5100-SAL', periodNumber: 2, plannedAmount: 180000 },
  { budgetCode: 'BUD-2026-OPS', accountCode: '5100-SAL', periodNumber: 3, plannedAmount: 180000 },
  { budgetCode: 'BUD-2026-OPS', accountCode: '5100-SAL', periodNumber: 4, plannedAmount: 180000 },
  { budgetCode: 'BUD-2026-OPS', accountCode: '5100-SAL', periodNumber: 5, plannedAmount: 180000 },
  { budgetCode: 'BUD-2026-OPS', accountCode: '5100-SAL', periodNumber: 6, plannedAmount: 180000 },
  { budgetCode: 'BUD-2026-OPS', accountCode: '5200-REN', periodNumber: 1, plannedAmount: 60000 },
  { budgetCode: 'BUD-2026-OPS', accountCode: '5200-REN', periodNumber: 2, plannedAmount: 60000 },
  { budgetCode: 'BUD-2026-OPS', accountCode: '5200-REN', periodNumber: 3, plannedAmount: 60000 },
  { budgetCode: 'BUD-2026-OPS', accountCode: '5200-REN', periodNumber: 4, plannedAmount: 60000 },
  { budgetCode: 'BUD-2026-OPS', accountCode: '5200-REN', periodNumber: 5, plannedAmount: 60000 },
  { budgetCode: 'BUD-2026-OPS', accountCode: '5200-REN', periodNumber: 6, plannedAmount: 60000 },
  { budgetCode: 'BUD-2026-OPS', accountCode: '6100-REV', periodNumber: 1, plannedAmount: 500000 },
  { budgetCode: 'BUD-2026-OPS', accountCode: '6100-REV', periodNumber: 2, plannedAmount: 500000 },
  { budgetCode: 'BUD-2026-OPS', accountCode: '6100-REV', periodNumber: 3, plannedAmount: 500000 },
  { budgetCode: 'BUD-2026-OPS', accountCode: '6100-REV', periodNumber: 4, plannedAmount: 500000 },
  { budgetCode: 'BUD-2026-OPS', accountCode: '6100-REV', periodNumber: 5, plannedAmount: 500000 },
  { budgetCode: 'BUD-2026-OPS', accountCode: '6100-REV', periodNumber: 6, plannedAmount: 500000 },

  { budgetCode: 'BUD-2026-TRAIN', accountCode: '5100-SAL', periodNumber: 1, plannedAmount: 120000 },
  { budgetCode: 'BUD-2026-TRAIN', accountCode: '5100-SAL', periodNumber: 2, plannedAmount: 120000 },
  { budgetCode: 'BUD-2026-TRAIN', accountCode: '5100-SAL', periodNumber: 3, plannedAmount: 120000 },
  { budgetCode: 'BUD-2026-TRAIN', accountCode: '5100-SAL', periodNumber: 4, plannedAmount: 120000 },
  { budgetCode: 'BUD-2026-TRAIN', accountCode: '5100-SAL', periodNumber: 5, plannedAmount: 120000 },
  { budgetCode: 'BUD-2026-TRAIN', accountCode: '5100-SAL', periodNumber: 6, plannedAmount: 120000 },
  { budgetCode: 'BUD-2026-TRAIN', accountCode: '1400-EQ', periodNumber: 1, plannedAmount: 200000 },
  { budgetCode: 'BUD-2026-TRAIN', accountCode: '5800-DEP', periodNumber: 1, plannedAmount: 25000 },
  { budgetCode: 'BUD-2026-TRAIN', accountCode: '5800-DEP', periodNumber: 2, plannedAmount: 25000 },
  { budgetCode: 'BUD-2026-TRAIN', accountCode: '5800-DEP', periodNumber: 3, plannedAmount: 25000 },
  { budgetCode: 'BUD-2026-TRAIN', accountCode: '5800-DEP', periodNumber: 4, plannedAmount: 25000 },
  { budgetCode: 'BUD-2026-TRAIN', accountCode: '5800-DEP', periodNumber: 5, plannedAmount: 25000 },
  { budgetCode: 'BUD-2026-TRAIN', accountCode: '5800-DEP', periodNumber: 6, plannedAmount: 25000 },

  { budgetCode: 'BUD-2026-IT', accountCode: '1500-IT', periodNumber: 1, plannedAmount: 180000 },
  { budgetCode: 'BUD-2026-IT', accountCode: '1500-IT', periodNumber: 2, plannedAmount: 180000 },
  { budgetCode: 'BUD-2026-IT', accountCode: '1500-IT', periodNumber: 3, plannedAmount: 180000 },
  { budgetCode: 'BUD-2026-IT', accountCode: '1500-IT', periodNumber: 4, plannedAmount: 180000 },
  { budgetCode: 'BUD-2026-IT', accountCode: '5800-DEP', periodNumber: 1, plannedAmount: 30000 },
  { budgetCode: 'BUD-2026-IT', accountCode: '5800-DEP', periodNumber: 2, plannedAmount: 30000 },
  { budgetCode: 'BUD-2026-IT', accountCode: '5800-DEP', periodNumber: 3, plannedAmount: 30000 },
  { budgetCode: 'BUD-2026-IT', accountCode: '5800-DEP', periodNumber: 4, plannedAmount: 30000 },

  { budgetCode: 'BUD-2026-FIN', accountCode: '5100-SAL', periodNumber: 1, plannedAmount: 150000 },
  { budgetCode: 'BUD-2026-FIN', accountCode: '5100-SAL', periodNumber: 2, plannedAmount: 150000 },
  { budgetCode: 'BUD-2026-FIN', accountCode: '5100-SAL', periodNumber: 3, plannedAmount: 150000 },
  { budgetCode: 'BUD-2026-FIN', accountCode: '5100-SAL', periodNumber: 4, plannedAmount: 150000 },
  { budgetCode: 'BUD-2026-FIN', accountCode: '5100-SAL', periodNumber: 5, plannedAmount: 150000 },
  { budgetCode: 'BUD-2026-FIN', accountCode: '5100-SAL', periodNumber: 6, plannedAmount: 150000 },
  { budgetCode: 'BUD-2026-FIN', accountCode: '5200-REN', periodNumber: 1, plannedAmount: 35000 },
  { budgetCode: 'BUD-2026-FIN', accountCode: '5200-REN', periodNumber: 2, plannedAmount: 35000 },
  { budgetCode: 'BUD-2026-FIN', accountCode: '5200-REN', periodNumber: 3, plannedAmount: 35000 },
  { budgetCode: 'BUD-2026-FIN', accountCode: '5200-REN', periodNumber: 4, plannedAmount: 35000 },
  { budgetCode: 'BUD-2026-FIN', accountCode: '5200-REN', periodNumber: 5, plannedAmount: 35000 },
  { budgetCode: 'BUD-2026-FIN', accountCode: '5200-REN', periodNumber: 6, plannedAmount: 35000 },

  { budgetCode: 'BUD-2026-MKTG', accountCode: '5100-SAL', periodNumber: 1, plannedAmount: 100000 },
  { budgetCode: 'BUD-2026-MKTG', accountCode: '5100-SAL', periodNumber: 2, plannedAmount: 100000 },
  { budgetCode: 'BUD-2026-MKTG', accountCode: '5100-SAL', periodNumber: 3, plannedAmount: 100000 },
  { budgetCode: 'BUD-2026-MKTG', accountCode: '5100-SAL', periodNumber: 4, plannedAmount: 100000 },
  { budgetCode: 'BUD-2026-MKTG', accountCode: '5200-REN', periodNumber: 1, plannedAmount: 45000 },
  { budgetCode: 'BUD-2026-MKTG', accountCode: '5200-REN', periodNumber: 2, plannedAmount: 45000 },
  { budgetCode: 'BUD-2026-MKTG', accountCode: '5200-REN', periodNumber: 3, plannedAmount: 45000 },
  { budgetCode: 'BUD-2026-MKTG', accountCode: '5200-REN', periodNumber: 4, plannedAmount: 45000 },

  { budgetCode: 'BUD-2026-SALES-MNL', accountCode: '5100-SAL', periodNumber: 1, plannedAmount: 130000 },
  { budgetCode: 'BUD-2026-SALES-MNL', accountCode: '5100-SAL', periodNumber: 2, plannedAmount: 130000 },
  { budgetCode: 'BUD-2026-SALES-MNL', accountCode: '5100-SAL', periodNumber: 3, plannedAmount: 130000 },
  { budgetCode: 'BUD-2026-SALES-MNL', accountCode: '5100-SAL', periodNumber: 4, plannedAmount: 130000 },
  { budgetCode: 'BUD-2026-SALES-MNL', accountCode: '6100-REV', periodNumber: 1, plannedAmount: 350000 },
  { budgetCode: 'BUD-2026-SALES-MNL', accountCode: '6100-REV', periodNumber: 2, plannedAmount: 350000 },
  { budgetCode: 'BUD-2026-SALES-MNL', accountCode: '6100-REV', periodNumber: 3, plannedAmount: 350000 },
  { budgetCode: 'BUD-2026-SALES-MNL', accountCode: '6100-REV', periodNumber: 4, plannedAmount: 350000 },

  { budgetCode: 'BUD-2026-CEBU', accountCode: '5100-SAL', periodNumber: 1, plannedAmount: 110000 },
  { budgetCode: 'BUD-2026-CEBU', accountCode: '5100-SAL', periodNumber: 2, plannedAmount: 110000 },
  { budgetCode: 'BUD-2026-CEBU', accountCode: '5100-SAL', periodNumber: 3, plannedAmount: 110000 },
  { budgetCode: 'BUD-2026-CEBU', accountCode: '5100-SAL', periodNumber: 4, plannedAmount: 110000 },
  { budgetCode: 'BUD-2026-CEBU', accountCode: '5200-REN', periodNumber: 1, plannedAmount: 40000 },
  { budgetCode: 'BUD-2026-CEBU', accountCode: '5200-REN', periodNumber: 2, plannedAmount: 40000 },
  { budgetCode: 'BUD-2026-CEBU', accountCode: '5200-REN', periodNumber: 3, plannedAmount: 40000 },
  { budgetCode: 'BUD-2026-CEBU', accountCode: '5200-REN', periodNumber: 4, plannedAmount: 40000 },
  { budgetCode: 'BUD-2026-CEBU', accountCode: '6100-REV', periodNumber: 1, plannedAmount: 250000 },
  { budgetCode: 'BUD-2026-CEBU', accountCode: '6100-REV', periodNumber: 2, plannedAmount: 250000 },
  { budgetCode: 'BUD-2026-CEBU', accountCode: '6100-REV', periodNumber: 3, plannedAmount: 250000 },
  { budgetCode: 'BUD-2026-CEBU', accountCode: '6100-REV', periodNumber: 4, plannedAmount: 250000 },

  { budgetCode: 'BUD-2026-DAVAO', accountCode: '5100-SAL', periodNumber: 1, plannedAmount: 100000 },
  { budgetCode: 'BUD-2026-DAVAO', accountCode: '5100-SAL', periodNumber: 2, plannedAmount: 100000 },
  { budgetCode: 'BUD-2026-DAVAO', accountCode: '5100-SAL', periodNumber: 3, plannedAmount: 100000 },
  { budgetCode: 'BUD-2026-DAVAO', accountCode: '5100-SAL', periodNumber: 4, plannedAmount: 100000 },
  { budgetCode: 'BUD-2026-DAVAO', accountCode: '5200-REN', periodNumber: 1, plannedAmount: 35000 },
  { budgetCode: 'BUD-2026-DAVAO', accountCode: '5200-REN', periodNumber: 2, plannedAmount: 35000 },
  { budgetCode: 'BUD-2026-DAVAO', accountCode: '5200-REN', periodNumber: 3, plannedAmount: 35000 },
  { budgetCode: 'BUD-2026-DAVAO', accountCode: '5200-REN', periodNumber: 4, plannedAmount: 35000 },
  { budgetCode: 'BUD-2026-DAVAO', accountCode: '6100-REV', periodNumber: 1, plannedAmount: 200000 },
  { budgetCode: 'BUD-2026-DAVAO', accountCode: '6100-REV', periodNumber: 2, plannedAmount: 200000 },
  { budgetCode: 'BUD-2026-DAVAO', accountCode: '6100-REV', periodNumber: 3, plannedAmount: 200000 },
  { budgetCode: 'BUD-2026-DAVAO', accountCode: '6100-REV', periodNumber: 4, plannedAmount: 200000 },
]

async function seedBudgets(): Promise<void> {
  console.log('[seed:budgets] Connecting to Payload...')
  const payload = await getPayload({ config })
  console.log('[seed:budgets] Connected. Loading reference data...')

  const [allFiscalYears, allPeriods, allAccounts, allBranches, allDepartments] = await Promise.all([
    payload.find({ collection: ACCOUNTING_COLLECTION_SLUGS.fiscalYears, limit: 50, depth: 0, overrideAccess: true }),
    payload.find({ collection: ACCOUNTING_COLLECTION_SLUGS.periods, limit: 200, depth: 0, overrideAccess: true }),
    payload.find({ collection: ACCOUNTING_COLLECTION_SLUGS.chartOfAccounts, limit: 500, depth: 0, overrideAccess: true }),
    payload.find({ collection: ACCOUNTING_COLLECTION_SLUGS.branches, limit: 100, depth: 0, overrideAccess: true }),
    payload.find({ collection: ACCOUNTING_COLLECTION_SLUGS.departments, limit: 100, depth: 0, overrideAccess: true }),
  ])

  const fyMap = new Map<string, number | string>()
  for (const fy of allFiscalYears.docs) {
    const code = (fy as unknown as Record<string, unknown>).code as string | undefined
    if (code) fyMap.set(code, fy.id)
  }

  const periodMap = new Map<string, number | string>()
  for (const p of allPeriods.docs) {
    const fyId = (p as unknown as Record<string, unknown>).fiscalYear
    const pn = (p as unknown as Record<string, unknown>).periodNumber
    const key = `${String(fyId || '').trim()}_${String(pn || '').trim()}`
    if (fyId && pn) periodMap.set(key, p.id)
  }

  const accountMap = new Map<string, number | string>()
  for (const a of allAccounts.docs) {
    const code = (a as unknown as Record<string, unknown>).code as string | undefined
    if (code) accountMap.set(code, a.id)
  }

  const branchMap = new Map<string, number | string>()
  for (const b of allBranches.docs) {
    const code = (b as unknown as Record<string, unknown>).branchCode as string | undefined
    if (code) branchMap.set(code, b.id)
  }

  const deptMap = new Map<string, number | string>()
  for (const d of allDepartments.docs) {
    const code = (d as unknown as Record<string, unknown>).departmentCode as string | undefined
    if (code) deptMap.set(code, d.id)
  }

  console.log(`[seed:budgets] Refs: ${fyMap.size} FYs, ${periodMap.size} periods, ${accountMap.size} accounts, ${branchMap.size} branches, ${deptMap.size} depts`)

  const budgetIdMap = new Map<string, number | string>()

  let budgetsCreated = 0
  let budgetsUpdated = 0

  for (const budget of sampleBudgets) {
    const fyId = fyMap.get(budget.fiscalYearCode)
    if (!fyId) { console.warn(`[seed:budgets] SKIP budget "${budget.budgetCode}" — fiscal year ${budget.fiscalYearCode} not found`); continue }

    const branchId = budget.branchCode ? (branchMap.get(budget.branchCode) ?? null) : null
    const deptId = budget.departmentCode ? (deptMap.get(budget.departmentCode) ?? null) : null

    const existing = await payload.find({
      collection: ACCOUNTING_COLLECTION_SLUGS.budgets,
      where: { budgetCode: { equals: budget.budgetCode } as never },
      limit: 1, depth: 0, overrideAccess: true,
    })

    const data = { name: budget.name, fiscalYear: fyId, status: budget.status, budgetType: budget.budgetType, branch: branchId, department: deptId, notes: budget.notes } as never

    let budgetId: number | string
    if (existing.docs.length > 0) {
      budgetId = existing.docs[0].id
      await payload.update({ collection: ACCOUNTING_COLLECTION_SLUGS.budgets, id: budgetId, overrideAccess: true, data })
      budgetsUpdated++
      console.log(`  UPDATED budget "${budget.budgetCode}"`)
    } else {
      const created = await payload.create({ collection: ACCOUNTING_COLLECTION_SLUGS.budgets, overrideAccess: true, data: { budgetCode: budget.budgetCode, name: budget.name, fiscalYear: fyId, status: budget.status, budgetType: budget.budgetType, branch: branchId, department: deptId, notes: budget.notes } as never })
      budgetId = created.id
      budgetsCreated++
      console.log(`  CREATED budget "${budget.budgetCode}"`)
    }
    budgetIdMap.set(budget.budgetCode, budgetId)
  }

  console.log(`[seed:budgets] Budgets done. Created: ${budgetsCreated}, Updated: ${budgetsUpdated}`)

  let linesCreated = 0
  let linesUpdated = 0

  for (const line of sampleBudgetLines) {
    const budgetId = budgetIdMap.get(line.budgetCode)
    if (!budgetId) { console.warn(`[seed:budgets] SKIP line for "${line.budgetCode}" — budget not seeded`); continue }

    const accountId = accountMap.get(line.accountCode)
    if (!accountId) { console.warn(`[seed:budgets] SKIP line — account ${line.accountCode} not found`); continue }

    const periodKey = `${String(budgetIdMap.get(line.budgetCode) ? fyMap.get('FY2026') || '' : '').trim()}_${line.periodNumber}`
    const periodId = periodMap.get(periodKey)
    if (!periodId) { console.warn(`[seed:budgets] SKIP line — period ${line.periodNumber} not found for FY2026`); continue }

    const existing = await payload.find({
      collection: ACCOUNTING_COLLECTION_SLUGS.budgetLines,
      where: { and: [{ budget: { equals: budgetId } as never }, { account: { equals: accountId } as never }, { period: { equals: periodId } as never }] },
      limit: 1, depth: 0, overrideAccess: true,
    })

    const lineData = { budget: budgetId, account: accountId, period: periodId, plannedAmount: line.plannedAmount } as never

    if (existing.docs.length > 0) {
      await payload.update({ collection: ACCOUNTING_COLLECTION_SLUGS.budgetLines, id: existing.docs[0].id, overrideAccess: true, data: lineData })
      linesUpdated++
    } else {
      await payload.create({ collection: ACCOUNTING_COLLECTION_SLUGS.budgetLines, overrideAccess: true, data: lineData })
      linesCreated++
    }
  }

  console.log(`[seed:budgets] Budget lines done. Created: ${linesCreated}, Updated: ${linesUpdated}`)
  process.exit(0)
}

seedBudgets().catch((error) => {
  console.error('[seed:budgets] Fatal error:', error)
  process.exit(1)
})
