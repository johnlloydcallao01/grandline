import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../payload.config'
import { ACCOUNTING_COLLECTION_SLUGS } from '../accounting/constants/accounting'

type SeedLocation = {
  locationCode: string
  name: string
  status: 'active' | 'inactive' | 'archived'
  branchCode: string | null
  address: string | null
  city: string | null
  state: string | null
  postalCode: string | null
  country: string | null
  notes: string | null
}

const sampleLocations: SeedLocation[] = [
  { locationCode: 'MNL-MAKATI', name: 'Makati Head Office', status: 'active', branchCode: 'MNL-MAIN', address: '123 Rizal Avenue', city: 'Makati', state: 'Metro Manila', postalCode: '1223', country: 'Philippines', notes: 'Corporate headquarters.' },
  { locationCode: 'MNL-QC', name: 'Quezon City Office', status: 'active', branchCode: 'MNL-NORTH', address: '456 Quezon Avenue', city: 'Quezon City', state: 'Metro Manila', postalCode: '1101', country: 'Philippines', notes: 'Northern Metro Manila operations hub.' },
  { locationCode: 'CEBU-CITY', name: 'Cebu City Office', status: 'active', branchCode: 'CEBU-CITY', address: '789 Osmeña Boulevard', city: 'Cebu City', state: 'Cebu', postalCode: '6000', country: 'Philippines', notes: 'Visayas regional operations center.' },
  { locationCode: 'CEBU-MACTAN', name: 'Mactan Training Center', status: 'active', branchCode: 'CEBU-CITY', address: '111 Mactan Airport Road', city: 'Lapu-Lapu City', state: 'Cebu', postalCode: '6015', country: 'Philippines', notes: 'On-site training facility near Mactan-Cebu International Airport.' },
  { locationCode: 'DVO-CITY', name: 'Davao City Office', status: 'active', branchCode: 'DAVAO-MAIN', address: '321 San Pedro Street', city: 'Davao City', state: 'Davao del Sur', postalCode: '8000', country: 'Philippines', notes: 'Mindanao headquarters.' },
  { locationCode: 'DVO-DIGOS', name: 'Digos Satellite Office', status: 'active', branchCode: 'DAVAO-MAIN', address: '555 Rizal Avenue', city: 'Digos', state: 'Davao del Sur', postalCode: '8002', country: 'Philippines', notes: 'Satellite office serving Davao del Sur.' },
  { locationCode: 'BACOLOD', name: 'Bacolod Office', status: 'active', branchCode: 'BACOLOD', address: '654 Lacson Street', city: 'Bacolod', state: 'Negros Occidental', postalCode: '6100', country: 'Philippines', notes: 'Negros Occidental operations.' },
  { locationCode: 'ILOILO-CITY', name: 'Iloilo City Office', status: 'active', branchCode: 'ILOILO', address: '987 General Luna Street', city: 'Iloilo City', state: 'Iloilo', postalCode: '5000', country: 'Philippines', notes: 'Western Visayas field office.' },
  { locationCode: 'CLARK-FREEPORT', name: 'Clark Freeport Office', status: 'active', branchCode: 'CLARK', address: '111 Clark Freeport Zone', city: 'Angeles City', state: 'Pampanga', postalCode: '2009', country: 'Philippines', notes: 'Central Luzon operations within Clark Freeport.' },
  { locationCode: 'LAGUNA-TECH', name: 'Laguna Technopark Office', status: 'active', branchCode: 'LAGUNA', address: '222 Laguna Technopark', city: 'Biñan', state: 'Laguna', postalCode: '4024', country: 'Philippines', notes: 'CALABARZON industrial area location.' },
  { locationCode: 'BAGUIO-CITY', name: 'Baguio City Office', status: 'active', branchCode: 'BAGUIO', address: '333 Session Road', city: 'Baguio', state: 'Benguet', postalCode: '2600', country: 'Philippines', notes: 'Cordillera Administrative Region office.' },
  { locationCode: 'ZAMBOANGA', name: 'Zamboanga City Office', status: 'active', branchCode: 'ZAMBOANGA', address: '444 Veterans Avenue', city: 'Zamboanga City', state: 'Zamboanga del Sur', postalCode: '7000', country: 'Philippines', notes: 'Western Mindanao operations.' },
  { locationCode: 'CAVITE-IMUS', name: 'Cavite Office', status: 'active', branchCode: 'CAVITE', address: '555 Aguinaldo Highway', city: 'Imus', state: 'Cavite', postalCode: '4103', country: 'Philippines', notes: 'Cavite area client services.' },
  { locationCode: 'PAMPANGA', name: 'Pampanga Satellite Office', status: 'active', branchCode: 'PAMPANGA', address: '666 Dau Access Road', city: 'Mabalacat', state: 'Pampanga', postalCode: '2010', country: 'Philippines', notes: 'Northern Pampanga satellite.' },
  { locationCode: 'BATANGAS-CITY', name: 'Batangas City Office', status: 'active', branchCode: 'BATANGAS', address: '777 P. Burgos Street', city: 'Batangas City', state: 'Batangas', postalCode: '4200', country: 'Philippines', notes: 'Batangas provincial operations.' },
  { locationCode: 'PALAWAN-PPC', name: 'Puerto Princesa Office', status: 'active', branchCode: 'PALAWAN', address: '888 Rizal Avenue', city: 'Puerto Princesa', state: 'Palawan', postalCode: '5300', country: 'Philippines', notes: 'MIMAROPA regional office.' },
  { locationCode: 'LEYTE-TACLOBAN', name: 'Tacloban City Office', status: 'inactive', branchCode: 'LEYTE', address: '999 Magsaysay Boulevard', city: 'Tacloban City', state: 'Leyte', postalCode: '6500', country: 'Philippines', notes: 'Eastern Visayas office. Temporarily closed for renovation.' },
  { locationCode: 'MNL-TAGUIG', name: 'Taguig Satellite Office', status: 'inactive', branchCode: null, address: '101 5th Avenue', city: 'Taguig', state: 'Metro Manila', postalCode: '1630', country: 'Philippines', notes: 'BGC office. Pending lease renewal.' },
  { locationCode: 'LEGACY-WAREHOUSE', name: 'Old Warehouse Facility', status: 'archived', branchCode: null, address: null, city: null, state: null, postalCode: null, country: null, notes: 'Decommissioned warehouse. No longer in use.' },
  { locationCode: 'TRAINING-ONLINE', name: 'Virtual Training Center', status: 'active', branchCode: null, address: null, city: null, state: null, postalCode: null, country: null, notes: 'Virtual location for online instructor-led training sessions.' },
]

async function seedLocations(): Promise<void> {
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
  console.log(`[seed] Found ${branchMap.size} branches. Upserting locations...`)

  let created = 0
  let updated = 0

  for (const loc of sampleLocations) {
    const existing = await payload.find({
      collection: ACCOUNTING_COLLECTION_SLUGS.locations,
      where: { locationCode: { equals: loc.locationCode } as never },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })

    const branchId = loc.branchCode ? (branchMap.get(loc.branchCode) ?? null) : null

    const data = {
      locationCode: loc.locationCode,
      name: loc.name,
      status: loc.status,
      branch: branchId,
      address: loc.address,
      city: loc.city,
      state: loc.state,
      postalCode: loc.postalCode,
      country: loc.country,
      notes: loc.notes,
    } as never

    if (existing.docs.length > 0) {
      await payload.update({
        collection: ACCOUNTING_COLLECTION_SLUGS.locations,
        id: existing.docs[0].id,
        overrideAccess: true,
        data,
      })
      updated++
    } else {
      await payload.create({
        collection: ACCOUNTING_COLLECTION_SLUGS.locations,
        overrideAccess: true,
        data,
      })
      created++
    }
  }

  console.log(`[seed] Done. Created: ${created}, Updated: ${updated}`)
  process.exit(0)
}

seedLocations().catch((error) => {
  console.error('[seed] Fatal error:', error)
  process.exit(1)
})
