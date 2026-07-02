import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../payload.config'
import { ACCOUNTING_COLLECTION_SLUGS } from '../accounting/constants/accounting'

type SeedProject = {
  projectCode: string
  name: string
  status: 'draft' | 'active' | 'on_hold' | 'completed' | 'cancelled'
  customerCode: string | null
  projectType: 'internal' | 'customer_project' | 'training_delivery' | 'implementation'
  branchCode: string | null
  departmentCode: string | null
  budgetAmount: number
  startDate: string | null
  endDate: string | null
  notes: string | null
}

const sampleProjects: SeedProject[] = [
  { projectCode: 'PRJ-007', name: 'Maritime Batch 7 Rollout', status: 'active', customerCode: null, projectType: 'training_delivery', branchCode: 'MNL-MAIN', departmentCode: 'IT', budgetAmount: 2500000, startDate: '2026-01-15', endDate: '2026-12-31', notes: 'Full rollout of maritime training program batch 7 across all branches.' },
  { projectCode: 'PRJ-011', name: 'Harbor Expansion Training', status: 'active', customerCode: null, projectType: 'training_delivery', branchCode: 'CEBU-CITY', departmentCode: 'OPS-CEBU', budgetAmount: 2000000, startDate: '2026-03-01', endDate: '2026-11-30', notes: 'Harbor operations training expansion for Cebu and Visayas regions.' },
  { projectCode: 'PRJ-014', name: 'Simulator Upgrade Support', status: 'on_hold', customerCode: null, projectType: 'internal', branchCode: 'MNL-MAIN', departmentCode: 'IT', budgetAmount: 1500000, startDate: '2026-02-01', endDate: '2026-06-30', notes: 'Server and simulator infrastructure upgrade at HQ data center.' },
  { projectCode: 'PRJ-018', name: 'Corporate Cadet Program', status: 'active', customerCode: null, projectType: 'customer_project', branchCode: 'DAVAO-MAIN', departmentCode: 'OPS-DVO', budgetAmount: 3500000, startDate: '2026-01-01', endDate: '2026-10-31', notes: 'Corporate-sponsored cadet training program for marine and harbor industries.' },
  { projectCode: 'PRJ-021', name: 'IT Infrastructure Refresh', status: 'completed', customerCode: null, projectType: 'internal', branchCode: 'MNL-MAIN', departmentCode: 'IT', budgetAmount: 1200000, startDate: '2025-09-01', endDate: '2025-12-31', notes: 'Network and server hardware refresh cycle for HQ.' },
  { projectCode: 'PRJ-025', name: 'LMS Platform Migration', status: 'active', customerCode: null, projectType: 'implementation', branchCode: 'MNL-MAIN', departmentCode: 'IT', budgetAmount: 1800000, startDate: '2026-04-01', endDate: '2026-09-30', notes: 'Migration of LMS platform to new infrastructure with enhanced reporting.' },
  { projectCode: 'PRJ-028', name: 'Safety Certification Program', status: 'active', customerCode: null, projectType: 'training_delivery', branchCode: 'MNL-MAIN', departmentCode: 'TRAINING', budgetAmount: 900000, startDate: '2026-05-01', endDate: '2026-08-31', notes: 'Industry-standard safety certification delivery for maritime and construction clients.' },
  { projectCode: 'PRJ-031', name: 'Finance System Integration', status: 'draft', customerCode: null, projectType: 'implementation', branchCode: 'MNL-MAIN', departmentCode: 'FIN', budgetAmount: 2200000, startDate: '2026-07-01', endDate: '2026-12-31', notes: 'Integration of accounting system with external payroll and banking APIs.' },
]

async function seedProjects(): Promise<void> {
  console.log('[seed:projects] Connecting to Payload...')
  const payload = await getPayload({ config })
  console.log('[seed:projects] Connected. Loading reference data...')

  const [allBranches, allDepartments, allCustomers] = await Promise.all([
    payload.find({ collection: ACCOUNTING_COLLECTION_SLUGS.branches, limit: 100, depth: 0, overrideAccess: true }),
    payload.find({ collection: ACCOUNTING_COLLECTION_SLUGS.departments, limit: 100, depth: 0, overrideAccess: true }),
    payload.find({ collection: ACCOUNTING_COLLECTION_SLUGS.customers, limit: 100, depth: 0, overrideAccess: true }),
  ])

  const branchMap = new Map<string, number | string>()
  for (const b of allBranches.docs) { const code = (b as unknown as Record<string, unknown>).branchCode as string | undefined; if (code) branchMap.set(code, b.id) }
  const deptMap = new Map<string, number | string>()
  for (const d of allDepartments.docs) { const code = (d as unknown as Record<string, unknown>).departmentCode as string | undefined; if (code) deptMap.set(code, d.id) }
  const customerMap = new Map<string, number | string>()
  for (const c of allCustomers.docs) { const code = (c as unknown as Record<string, unknown>).customerCode as string | undefined; if (code) customerMap.set(code, c.id) }

  console.log(`[seed:projects] Refs: ${branchMap.size} branches, ${deptMap.size} depts, ${customerMap.size} customers`)

  let created = 0, updated = 0
  for (const project of sampleProjects) {
    const branchId = project.branchCode ? (branchMap.get(project.branchCode) ?? null) : null
    const deptId = project.departmentCode ? (deptMap.get(project.departmentCode) ?? null) : null
    const customerId = project.customerCode ? (customerMap.get(project.customerCode) ?? null) : null

    const existing = await payload.find({ collection: ACCOUNTING_COLLECTION_SLUGS.projects, where: { projectCode: { equals: project.projectCode } as never }, limit: 1, depth: 0, overrideAccess: true })

    const data = { name: project.name, status: project.status, customer: customerId, projectType: project.projectType, branch: branchId, department: deptId, budgetAmount: project.budgetAmount, startDate: project.startDate, endDate: project.endDate, notes: project.notes } as never

    if (existing.docs.length > 0) {
      await payload.update({ collection: ACCOUNTING_COLLECTION_SLUGS.projects, id: existing.docs[0].id, overrideAccess: true, data })
      updated++
      console.log(`  UPDATED "${project.projectCode}"`)
    } else {
      await payload.create({ collection: ACCOUNTING_COLLECTION_SLUGS.projects, overrideAccess: true, data: { projectCode: project.projectCode, name: project.name, status: project.status, customer: customerId, projectType: project.projectType, branch: branchId, department: deptId, budgetAmount: project.budgetAmount, startDate: project.startDate, endDate: project.endDate, notes: project.notes } as never })
      created++
      console.log(`  CREATED "${project.projectCode}"`)
    }
  }

  console.log(`[seed:projects] Done. Created: ${created}, Updated: ${updated}`)
  process.exit(0)
}

seedProjects().catch((error) => { console.error('[seed:projects] Fatal error:', error); process.exit(1) })
