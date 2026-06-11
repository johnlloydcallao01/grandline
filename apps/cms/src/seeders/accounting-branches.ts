import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../payload.config'
import { ACCOUNTING_COLLECTION_SLUGS } from '../accounting/constants/accounting'

type SeedBranch = {
  branchCode: string
  name: string
  status: 'active' | 'inactive' | 'archived'
  address: string | null
  notes: string | null
}

const sampleBranches: SeedBranch[] = [
  {
    branchCode: 'MNL-MAIN',
    name: 'Manila Main Office',
    status: 'active',
    address: '123 Rizal Avenue, Barangay San Lorenzo, Makati City 1223',
    notes: 'Headquarters and corporate operations center.',
  },
  {
    branchCode: 'MNL-NORTH',
    name: 'Manila North QC',
    status: 'active',
    address: '456 Quezon Avenue, Diliman, Quezon City 1101',
    notes: 'Northern Metro Manila operations.',
  },
  {
    branchCode: 'CEBU-CITY',
    name: 'Cebu City Branch',
    status: 'active',
    address: '789 Osmeña Boulevard, Cebu City 6000',
    notes: 'Central Visayas regional hub.',
  },
  {
    branchCode: 'DAVAO-MAIN',
    name: 'Davao City Main',
    status: 'active',
    address: '321 San Pedro Street, Poblacion District, Davao City 8000',
    notes: 'Mindanao regional headquarters.',
  },
  {
    branchCode: 'BACOLOD',
    name: 'Bacolod Branch',
    status: 'active',
    address: '654 Lacson Street, Bacolod City 6100',
    notes: 'Negros Occidental service center.',
  },
  {
    branchCode: 'ILOILO',
    name: 'Iloilo City Branch',
    status: 'active',
    address: '987 General Luna Street, Iloilo City 5000',
    notes: 'Western Visayas operations.',
  },
  {
    branchCode: 'CLARK',
    name: 'Clark Freeport Branch',
    status: 'active',
    address: '111 Clark Freeport Zone, Angeles City 2009',
    notes: 'Serves Pampanga and Central Luzon region.',
  },
  {
    branchCode: 'LAGUNA',
    name: 'Laguna Technopark Branch',
    status: 'active',
    address: '222 Laguna Technopark, Biñan, Laguna 4024',
    notes: 'CALABARZON industrial area branch.',
  },
  {
    branchCode: 'BAGUIO',
    name: 'Baguio City Branch',
    status: 'active',
    address: '333 Session Road, Baguio City 2600',
    notes: 'Cordillera Administrative Region service point.',
  },
  {
    branchCode: 'ZAMBOANGA',
    name: 'Zamboanga City Branch',
    status: 'active',
    address: '444 Veterans Avenue, Zamboanga City 7000',
    notes: 'Western Mindanao regional operations.',
  },
  {
    branchCode: 'CAVITE',
    name: 'Cavite Branch',
    status: 'active',
    address: '555 Aguinaldo Highway, Imus, Cavite 4103',
    notes: 'Cavite area client services.',
  },
  {
    branchCode: 'PAMPANGA',
    name: 'Pampanga Satellite',
    status: 'active',
    address: '666 Dau Access Road, Mabalacat, Pampanga 2010',
    notes: 'Satellite office for northern Pampanga.',
  },
  {
    branchCode: 'BATANGAS',
    name: 'Batangas City Branch',
    status: 'active',
    address: '777 P. Burgos Street, Batangas City 4200',
    notes: 'Batangas provincial operations.',
  },
  {
    branchCode: 'PALAWAN',
    name: 'Palawan Branch',
    status: 'active',
    address: '888 Rizal Avenue, Puerto Princesa City 5300',
    notes: 'MIMAROPA regional office.',
  },
  {
    branchCode: 'LEYTE',
    name: 'Tacloban City Branch',
    status: 'inactive',
    address: '999 Magsaysay Boulevard, Tacloban City 6500',
    notes: 'Eastern Visayas branch temporarily inactive for renovation.',
  },
  {
    branchCode: 'NUEVA_ECIJA',
    name: 'Nueva Ecija Branch',
    status: 'inactive',
    address: '101 Maharlika Highway, Cabanatuan City 3100',
    notes: 'Central Luzon expansion branch on hold.',
  },
  {
    branchCode: 'BICOL',
    name: 'Naga City Branch',
    status: 'inactive',
    address: '202 Elias Angeles Street, Naga City 4400',
    notes: 'Bicol region office under review.',
  },
  {
    branchCode: 'LEGACY01',
    name: 'Legacy Branch A',
    status: 'archived',
    address: '303 Old National Highway, San Pablo City 4000',
    notes: 'Closed in 2024. All records migrated.',
  },
  {
    branchCode: 'LEGACY02',
    name: 'Legacy Branch B (Merged)',
    status: 'archived',
    address: '404 Rizal Street, Calamba City 4027',
    notes: 'Merged with Laguna Technopark branch in Q1 2025.',
  },
  {
    branchCode: 'SALES-DEMO',
    name: 'Sales Demo Branch',
    status: 'archived',
    address: null,
    notes: 'Temporary demo branch created for sales presentations. Do not use for live transactions.',
  },
]

async function seedBranches(): Promise<void> {
  console.log('[seed] Connecting to Payload...')
  const payload = await getPayload({ config })
  console.log('[seed] Connected. Upserting branches...')

  let created = 0
  let updated = 0

  for (const branch of sampleBranches) {
    const existing = await payload.find({
      collection: ACCOUNTING_COLLECTION_SLUGS.branches,
      where: {
        branchCode: { equals: branch.branchCode } as never,
      },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })

    const data = {
      branchCode: branch.branchCode,
      name: branch.name,
      status: branch.status,
      address: branch.address,
      notes: branch.notes,
    } as never

    if (existing.docs.length > 0) {
      await payload.update({
        collection: ACCOUNTING_COLLECTION_SLUGS.branches,
        id: existing.docs[0].id,
        overrideAccess: true,
        data,
      })
      updated++
    } else {
      await payload.create({
        collection: ACCOUNTING_COLLECTION_SLUGS.branches,
        overrideAccess: true,
        data,
      })
      created++
    }
  }

  console.log(`[seed] Done. Created: ${created}, Updated: ${updated}`)
  process.exit(0)
}

seedBranches().catch((error) => {
  console.error('[seed] Fatal error:', error)
  process.exit(1)
})
