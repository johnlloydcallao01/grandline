import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../payload.config'
import { ACCOUNTING_COLLECTION_SLUGS } from '../accounting/constants/accounting'

type SeedDepartment = {
  departmentCode: string
  name: string
  status: 'active' | 'inactive' | 'archived'
  branchCode: string | null
  notes: string | null
}

const sampleDepartments: SeedDepartment[] = [
  { departmentCode: 'FIN', name: 'Finance', status: 'active', branchCode: 'MNL-MAIN', notes: 'Corporate finance and accounting team.' },
  { departmentCode: 'HR', name: 'Human Resources', status: 'active', branchCode: 'MNL-MAIN', notes: 'Recruitment, payroll, and employee relations.' },
  { departmentCode: 'IT', name: 'Information Technology', status: 'active', branchCode: 'MNL-MAIN', notes: 'Systems administration and software development.' },
  { departmentCode: 'OPS-MNL', name: 'Manila Operations', status: 'active', branchCode: 'MNL-MAIN', notes: 'Day-to-day operations for Metro Manila.' },
  { departmentCode: 'SALES-MNL', name: 'Manila Sales', status: 'active', branchCode: 'MNL-NORTH', notes: 'Sales team covering northern Metro Manila.' },
  { departmentCode: 'OPS-CEBU', name: 'Cebu Operations', status: 'active', branchCode: 'CEBU-CITY', notes: 'Field operations for Cebu and nearby provinces.' },
  { departmentCode: 'SALES-CEBU', name: 'Cebu Sales', status: 'active', branchCode: 'CEBU-CITY', notes: 'Sales team for Visayas region.' },
  { departmentCode: 'OPS-DVO', name: 'Davao Operations', status: 'active', branchCode: 'DAVAO-MAIN', notes: 'Mindanao field operations.' },
  { departmentCode: 'LOGISTICS', name: 'Logistics & Supply Chain', status: 'active', branchCode: 'MNL-MAIN', notes: 'Warehousing, inventory, and distribution.' },
  { departmentCode: 'LEGAL', name: 'Legal & Compliance', status: 'active', branchCode: 'MNL-MAIN', notes: 'Corporate legal services and regulatory compliance.' },
  { departmentCode: 'MKTG', name: 'Marketing', status: 'active', branchCode: 'MNL-MAIN', notes: 'Brand management, advertising, and market research.' },
  { departmentCode: 'OPS-BAC', name: 'Bacolod Operations', status: 'active', branchCode: 'BACOLOD', notes: 'Negros Occidental field office.' },
  { departmentCode: 'OPS-ILO', name: 'Iloilo Operations', status: 'active', branchCode: 'ILOILO', notes: 'Western Visayas field office.' },
  { departmentCode: 'OPS-CLARK', name: 'Clark Operations', status: 'active', branchCode: 'CLARK', notes: 'Central Luzon field office.' },
  { departmentCode: 'OPS-LAG', name: 'Laguna Operations', status: 'active', branchCode: 'LAGUNA', notes: 'CALABARZON industrial area operations.' },
  { departmentCode: 'RND', name: 'Research & Development', status: 'active', branchCode: null, notes: 'Product innovation and curriculum development.' },
  { departmentCode: 'QA', name: 'Quality Assurance', status: 'active', branchCode: null, notes: 'Audits, inspections, and quality control.' },
  { departmentCode: 'PROCUREMENT', name: 'Procurement', status: 'inactive', branchCode: 'MNL-MAIN', notes: 'Purchasing and vendor management. Under restructuring.' },
  { departmentCode: 'LEGACY-ARCH', name: 'Legacy Archives', status: 'archived', branchCode: null, notes: 'Closed department. All records migrated to Finance.' },
  { departmentCode: 'TRAINING', name: 'Training Delivery', status: 'active', branchCode: 'MNL-MAIN', notes: 'Instructor coordination and course delivery management.' },
]

async function seedDepartments(): Promise<void> {
  console.log('[seed] Connecting to Payload...')
  const payload = await getPayload({ config })
  console.log('[seed] Connected. Loading branches for reference...')

  const allBranches = await payload.find({
    collection: ACCOUNTING_COLLECTION_SLUGS.branches,
    limit: 100,
    depth: 0,
    overrideAccess: true,
  })
  const branchMap = new Map<string, number | string>()
  for (const b of allBranches.docs) {
    const code = (b as unknown as Record<string, unknown>).branchCode as string | undefined
    if (code) branchMap.set(code, b.id)
  }
  console.log(`[seed] Found ${branchMap.size} branches. Upserting departments...`)

  let created = 0
  let updated = 0

  for (const dept of sampleDepartments) {
    const existing = await payload.find({
      collection: ACCOUNTING_COLLECTION_SLUGS.departments,
      where: { departmentCode: { equals: dept.departmentCode } as never },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })

    const branchId = dept.branchCode ? (branchMap.get(dept.branchCode) ?? null) : null

    const data = {
      departmentCode: dept.departmentCode,
      name: dept.name,
      status: dept.status,
      branch: branchId,
      notes: dept.notes,
    } as never

    if (existing.docs.length > 0) {
      await payload.update({
        collection: ACCOUNTING_COLLECTION_SLUGS.departments,
        id: existing.docs[0].id,
        overrideAccess: true,
        data,
      })
      updated++
    } else {
      await payload.create({
        collection: ACCOUNTING_COLLECTION_SLUGS.departments,
        overrideAccess: true,
        data,
      })
      created++
    }
  }

  console.log(`[seed] Done. Created: ${created}, Updated: ${updated}`)
  process.exit(0)
}

seedDepartments().catch((error) => {
  console.error('[seed] Fatal error:', error)
  process.exit(1)
})
