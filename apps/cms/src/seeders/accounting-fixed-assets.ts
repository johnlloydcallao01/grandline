import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../payload.config'
import { ACCOUNTING_COLLECTION_SLUGS } from '../accounting/constants/accounting'

const COA_ACCOUNTS_TO_ENSURE: Array<{
  code: string
  name: string
  accountType: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense'
  accountSubType: string
  normalBalance: 'debit' | 'credit'
  description: string
}> = [
  { code: '1401-ADEQ', name: 'Accumulated Depreciation - Equipment', accountType: 'asset', accountSubType: 'fixed_asset', normalBalance: 'credit', description: 'Contra-asset for equipment depreciation.' },
  { code: '1500-IT', name: 'IT Infrastructure', accountType: 'asset', accountSubType: 'fixed_asset', normalBalance: 'debit', description: 'Computer hardware, servers, and network equipment.' },
  { code: '1501-ADIT', name: 'Accumulated Depreciation - IT Infrastructure', accountType: 'asset', accountSubType: 'fixed_asset', normalBalance: 'credit', description: 'Contra-asset for IT infrastructure depreciation.' },
  { code: '1600-FUR', name: 'Furniture & Fixtures', accountType: 'asset', accountSubType: 'fixed_asset', normalBalance: 'debit', description: 'Office furniture, desks, chairs, and filing cabinets.' },
  { code: '1601-ADFUR', name: 'Accumulated Depreciation - Furniture', accountType: 'asset', accountSubType: 'fixed_asset', normalBalance: 'credit', description: 'Contra-asset for furniture depreciation.' },
  { code: '1700-VEH', name: 'Vehicles', accountType: 'asset', accountSubType: 'fixed_asset', normalBalance: 'debit', description: 'Company cars, vans, and delivery vehicles.' },
  { code: '1701-ADVEH', name: 'Accumulated Depreciation - Vehicles', accountType: 'asset', accountSubType: 'fixed_asset', normalBalance: 'credit', description: 'Contra-asset for vehicle depreciation.' },
  { code: '1800-LI', name: 'Leasehold Improvements', accountType: 'asset', accountSubType: 'fixed_asset', normalBalance: 'debit', description: 'Office renovations, partitions, and building improvements.' },
  { code: '1801-ADLI', name: 'Accumulated Depreciation - Leasehold Improvements', accountType: 'asset', accountSubType: 'fixed_asset', normalBalance: 'credit', description: 'Contra-asset for leasehold improvement depreciation.' },
  { code: '5800-DEP', name: 'Depreciation Expense', accountType: 'expense', accountSubType: 'operating_expense', normalBalance: 'debit', description: 'Monthly depreciation expense for fixed assets.' },
]

const ACCOUNT_CODE_MAP: Record<string, { asset: string; accumDepn: string }> = {
  equipment: { asset: '1400-EQ', accumDepn: '1401-ADEQ' },
  it_infrastructure: { asset: '1500-IT', accumDepn: '1501-ADIT' },
  furniture: { asset: '1600-FUR', accumDepn: '1601-ADFUR' },
  vehicle: { asset: '1700-VEH', accumDepn: '1701-ADVEH' },
  leasehold_improvement: { asset: '1800-LI', accumDepn: '1801-ADLI' },
  other: { asset: '1400-EQ', accumDepn: '1401-ADEQ' },
}

type SeedAsset = {
  name: string
  assetCategory: 'equipment' | 'furniture' | 'it_infrastructure' | 'vehicle' | 'leasehold_improvement' | 'other'
  purchaseDate: string
  inServiceDate: string
  cost: number
  salvageValue: number
  usefulLifeMonths: number
  depreciationMethod: 'straight_line' | 'manual'
  branchCode: string | null
  departmentCode: string | null
  locationCode: string | null
  status: 'draft' | 'active' | 'fully_depreciated' | 'disposed' | 'written_off'
  notes: string | null
}

const sampleAssets: SeedAsset[] = [
  {
    name: 'Dell Latitude 5540 Laptop (IT Dept)',
    assetCategory: 'it_infrastructure',
    purchaseDate: '2025-11-15',
    inServiceDate: '2025-11-20',
    cost: 89500,
    salvageValue: 5000,
    usefulLifeMonths: 36,
    depreciationMethod: 'straight_line',
    branchCode: 'MNL-MAIN',
    departmentCode: 'IT',
    locationCode: null,
    status: 'active',
    notes: 'Standard issue laptop for IT department staff.',
  },
  {
    name: 'Dell Latitude 5550 Laptop (Finance)',
    assetCategory: 'it_infrastructure',
    purchaseDate: '2025-12-01',
    inServiceDate: '2025-12-05',
    cost: 89500,
    salvageValue: 5000,
    usefulLifeMonths: 36,
    depreciationMethod: 'straight_line',
    branchCode: 'MNL-MAIN',
    departmentCode: 'FIN',
    locationCode: null,
    status: 'active',
    notes: 'Laptop assigned to Finance department lead.',
  },
  {
    name: 'HP EliteBook 860 G11 (Cebu Ops)',
    assetCategory: 'it_infrastructure',
    purchaseDate: '2026-01-10',
    inServiceDate: '2026-01-15',
    cost: 125000,
    salvageValue: 8000,
    usefulLifeMonths: 48,
    depreciationMethod: 'straight_line',
    branchCode: 'CEBU-CITY',
    departmentCode: 'OPS-CEBU',
    locationCode: null,
    status: 'active',
    notes: 'Regional manager laptop for Cebu operations.',
  },
  {
    name: 'HP EliteBook 860 G11 (Davao Ops)',
    assetCategory: 'it_infrastructure',
    purchaseDate: '2026-01-10',
    inServiceDate: '2026-01-15',
    cost: 125000,
    salvageValue: 8000,
    usefulLifeMonths: 48,
    depreciationMethod: 'straight_line',
    branchCode: 'DAVAO-MAIN',
    departmentCode: 'OPS-DVO',
    locationCode: null,
    status: 'active',
    notes: 'Regional manager laptop for Davao operations.',
  },
  {
    name: 'MacBook Pro 16" M3 Pro',
    assetCategory: 'it_infrastructure',
    purchaseDate: '2026-03-01',
    inServiceDate: '2026-03-05',
    cost: 189500,
    salvageValue: 12000,
    usefulLifeMonths: 48,
    depreciationMethod: 'straight_line',
    branchCode: 'MNL-MAIN',
    departmentCode: 'RND',
    locationCode: null,
    status: 'active',
    notes: 'Development workstation for curriculum design team.',
  },
  {
    name: 'Dell PowerEdge R760 (HQ Primary)',
    assetCategory: 'it_infrastructure',
    purchaseDate: '2025-09-01',
    inServiceDate: '2025-09-10',
    cost: 680000,
    salvageValue: 20000,
    usefulLifeMonths: 60,
    depreciationMethod: 'straight_line',
    branchCode: 'MNL-MAIN',
    departmentCode: 'IT',
    locationCode: null,
    status: 'active',
    notes: 'Primary application and database server for accounting platform.',
  },
  {
    name: 'Dell PowerEdge R760 (Cebu DR)',
    assetCategory: 'it_infrastructure',
    purchaseDate: '2026-02-01',
    inServiceDate: '2026-02-10',
    cost: 680000,
    salvageValue: 20000,
    usefulLifeMonths: 60,
    depreciationMethod: 'straight_line',
    branchCode: 'CEBU-CITY',
    departmentCode: 'IT',
    locationCode: null,
    status: 'active',
    notes: 'Backup and replication server for Cebu DR site.',
  },
  {
    name: 'Cisco Catalyst C9300-48P Switch',
    assetCategory: 'it_infrastructure',
    purchaseDate: '2025-10-15',
    inServiceDate: '2025-10-20',
    cost: 245000,
    salvageValue: 5000,
    usefulLifeMonths: 60,
    depreciationMethod: 'straight_line',
    branchCode: 'MNL-MAIN',
    departmentCode: 'IT',
    locationCode: null,
    status: 'active',
    notes: 'Core network switch serving HQ floor.',
  },
  {
    name: 'Synology RS2423+ NAS Storage',
    assetCategory: 'it_infrastructure',
    purchaseDate: '2026-01-20',
    inServiceDate: '2026-01-25',
    cost: 198000,
    salvageValue: 8000,
    usefulLifeMonths: 48,
    depreciationMethod: 'straight_line',
    branchCode: 'MNL-MAIN',
    departmentCode: 'IT',
    locationCode: null,
    status: 'active',
    notes: 'Network attached storage for shared accounting files.',
  },
  {
    name: 'Ergonomic Mesh Office Chair Set (6 units)',
    assetCategory: 'furniture',
    purchaseDate: '2025-08-01',
    inServiceDate: '2025-08-05',
    cost: 48000,
    salvageValue: 2000,
    usefulLifeMonths: 60,
    depreciationMethod: 'straight_line',
    branchCode: 'MNL-MAIN',
    departmentCode: 'OPS-MNL',
    locationCode: null,
    status: 'active',
    notes: 'Bulk purchase of ergonomic chairs for Manila operations floor.',
  },
  {
    name: 'L-Shape Executive Desk (Mahogany)',
    assetCategory: 'furniture',
    purchaseDate: '2025-07-15',
    inServiceDate: '2025-07-20',
    cost: 36500,
    salvageValue: 3000,
    usefulLifeMonths: 84,
    depreciationMethod: 'straight_line',
    branchCode: 'MNL-MAIN',
    departmentCode: 'FIN',
    locationCode: null,
    status: 'active',
    notes: 'Executive desk for Finance Director office.',
  },
  {
    name: 'Steel Filing Cabinet Set (8 units)',
    assetCategory: 'furniture',
    purchaseDate: '2025-09-10',
    inServiceDate: '2025-09-15',
    cost: 72000,
    salvageValue: 4000,
    usefulLifeMonths: 120,
    depreciationMethod: 'straight_line',
    branchCode: 'MNL-MAIN',
    departmentCode: 'LOGISTICS',
    locationCode: null,
    status: 'active',
    notes: 'Heavy-duty filing cabinets for records room.',
  },
  {
    name: 'Toyota Hilux 4x4 Pickup',
    assetCategory: 'vehicle',
    purchaseDate: '2025-06-01',
    inServiceDate: '2025-06-10',
    cost: 1450000,
    salvageValue: 150000,
    usefulLifeMonths: 60,
    depreciationMethod: 'straight_line',
    branchCode: 'MNL-MAIN',
    departmentCode: 'LOGISTICS',
    locationCode: null,
    status: 'active',
    notes: 'Logistics vehicle for Metro Manila deliveries and errands.',
  },
  {
    name: 'Toyota Vios 1.5 G CVT (Cebu)',
    assetCategory: 'vehicle',
    purchaseDate: '2025-08-15',
    inServiceDate: '2025-08-20',
    cost: 985000,
    salvageValue: 100000,
    usefulLifeMonths: 60,
    depreciationMethod: 'straight_line',
    branchCode: 'CEBU-CITY',
    departmentCode: 'SALES-CEBU',
    locationCode: null,
    status: 'active',
    notes: 'Company car for Cebu sales team client visits.',
  },
  {
    name: 'Toyota Vios 1.5 G CVT (Davao)',
    assetCategory: 'vehicle',
    purchaseDate: '2025-08-15',
    inServiceDate: '2025-08-20',
    cost: 985000,
    salvageValue: 100000,
    usefulLifeMonths: 60,
    depreciationMethod: 'straight_line',
    branchCode: 'DAVAO-MAIN',
    departmentCode: 'OPS-DVO',
    locationCode: null,
    status: 'active',
    notes: 'Company car for Davao field operations.',
  },
  {
    name: 'Mitsubishi L300 FB Van (Training)',
    assetCategory: 'vehicle',
    purchaseDate: '2025-10-01',
    inServiceDate: '2025-10-05',
    cost: 850000,
    salvageValue: 80000,
    usefulLifeMonths: 60,
    depreciationMethod: 'straight_line',
    branchCode: 'MNL-MAIN',
    departmentCode: 'TRAINING',
    locationCode: null,
    status: 'active',
    notes: 'Training materials delivery van across Metro Manila sites.',
  },
  {
    name: 'Mitsubishi L300 FB Van (Iloilo)',
    assetCategory: 'vehicle',
    purchaseDate: '2025-10-01',
    inServiceDate: '2025-10-05',
    cost: 850000,
    salvageValue: 80000,
    usefulLifeMonths: 60,
    depreciationMethod: 'straight_line',
    branchCode: 'ILOILO',
    departmentCode: 'OPS-ILO',
    locationCode: null,
    status: 'active',
    notes: 'Service van for Western Visayas field operations.',
  },
  {
    name: 'Training Simulator Unit Mark IV',
    assetCategory: 'equipment',
    purchaseDate: '2025-11-01',
    inServiceDate: '2025-11-10',
    cost: 2450000,
    salvageValue: 200000,
    usefulLifeMonths: 84,
    depreciationMethod: 'straight_line',
    branchCode: 'MNL-MAIN',
    departmentCode: 'TRAINING',
    locationCode: null,
    status: 'active',
    notes: 'Heavy equipment simulator for vocational training programs.',
  },
  {
    name: 'AV Presentation System (Conf Room)',
    assetCategory: 'equipment',
    purchaseDate: '2025-09-20',
    inServiceDate: '2025-09-25',
    cost: 320000,
    salvageValue: 15000,
    usefulLifeMonths: 60,
    depreciationMethod: 'straight_line',
    branchCode: 'MNL-MAIN',
    departmentCode: 'MKTG',
    locationCode: null,
    status: 'active',
    notes: 'Conference room AV setup for client presentations.',
  },
  {
    name: 'CCTV Surveillance System (Cebu)',
    assetCategory: 'equipment',
    purchaseDate: '2025-07-01',
    inServiceDate: '2025-07-10',
    cost: 185000,
    salvageValue: 10000,
    usefulLifeMonths: 60,
    depreciationMethod: 'straight_line',
    branchCode: 'CEBU-CITY',
    departmentCode: null,
    locationCode: null,
    status: 'active',
    notes: 'CCTV system for Cebu branch security.',
  },
  {
    name: 'Water Dispenser Station Set (5 units)',
    assetCategory: 'equipment',
    purchaseDate: '2026-03-15',
    inServiceDate: '2026-03-20',
    cost: 42500,
    salvageValue: 2000,
    usefulLifeMonths: 36,
    depreciationMethod: 'straight_line',
    branchCode: 'MNL-MAIN',
    departmentCode: 'HR',
    locationCode: null,
    status: 'active',
    notes: 'Water dispensers for pantry areas across HQ floors.',
  },
  {
    name: 'Office Partition System (HQ Fit-Out)',
    assetCategory: 'leasehold_improvement',
    purchaseDate: '2025-05-01',
    inServiceDate: '2025-06-01',
    cost: 1800000,
    salvageValue: 0,
    usefulLifeMonths: 96,
    depreciationMethod: 'straight_line',
    branchCode: 'MNL-MAIN',
    departmentCode: null,
    locationCode: null,
    status: 'active',
    notes: 'Open-plan office renovation with modular partitions and ceiling work.',
  },
  {
    name: 'Air Conditioning System (VRF Upgrade)',
    assetCategory: 'leasehold_improvement',
    purchaseDate: '2025-04-15',
    inServiceDate: '2025-05-01',
    cost: 1200000,
    salvageValue: 50000,
    usefulLifeMonths: 120,
    depreciationMethod: 'straight_line',
    branchCode: 'MNL-MAIN',
    departmentCode: null,
    locationCode: null,
    status: 'active',
    notes: 'VRF air conditioning system for HQ second floor.',
  },
  {
    name: 'Fire Suppression System (Server Room)',
    assetCategory: 'leasehold_improvement',
    purchaseDate: '2025-09-01',
    inServiceDate: '2025-09-15',
    cost: 450000,
    salvageValue: 20000,
    usefulLifeMonths: 120,
    depreciationMethod: 'straight_line',
    branchCode: 'MNL-MAIN',
    departmentCode: 'IT',
    locationCode: null,
    status: 'active',
    notes: 'FM200 fire suppression for main server room.',
  },
]

async function ensureAccounts(payload: Awaited<ReturnType<typeof getPayload>>): Promise<void> {
  console.log('[seed:fixed-assets] Ensuring chart-of-accounts entries...')

  let coaCreated = 0
  let coaFound = 0

  for (const acct of COA_ACCOUNTS_TO_ENSURE) {
    const existing = await payload.find({
      collection: ACCOUNTING_COLLECTION_SLUGS.chartOfAccounts,
      where: { code: { equals: acct.code } as never },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })

    if (existing.docs.length > 0) {
      coaFound++
      continue
    }

    await payload.create({
      collection: ACCOUNTING_COLLECTION_SLUGS.chartOfAccounts,
      overrideAccess: true,
      data: {
        code: acct.code,
        name: acct.name,
        accountType: acct.accountType,
        accountSubType: acct.accountSubType,
        normalBalance: acct.normalBalance,
        description: acct.description,
        isActive: true,
        allowManualEntries: false,
        isControlAccount: false,
        sortOrder: parseInt(acct.code.replace(/\D/g, ''), 10) || 0,
      } as never,
    })
    coaCreated++
    console.log(`  Created COA: ${acct.code} - ${acct.name}`)
  }

  console.log(`[seed:fixed-assets] COA check done. Created: ${coaCreated}, Already existed: ${coaFound}`)
}

async function seedFixedAssets(): Promise<void> {
  console.log('[seed:fixed-assets] Connecting to Payload...')
  const payload = await getPayload({ config })
  console.log('[seed:fixed-assets] Connected.')

  await ensureAccounts(payload)

  console.log('[seed:fixed-assets] Loading reference data...')
  const [allBranches, allDepartments, allLocations, allAccounts] = await Promise.all([
    payload.find({ collection: ACCOUNTING_COLLECTION_SLUGS.branches, limit: 100, depth: 0, overrideAccess: true }),
    payload.find({ collection: ACCOUNTING_COLLECTION_SLUGS.departments, limit: 100, depth: 0, overrideAccess: true }),
    payload.find({ collection: ACCOUNTING_COLLECTION_SLUGS.locations, limit: 100, depth: 0, overrideAccess: true }),
    payload.find({ collection: ACCOUNTING_COLLECTION_SLUGS.chartOfAccounts, limit: 500, depth: 0, overrideAccess: true }),
  ])

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

  const locationMap = new Map<string, number | string>()
  for (const l of allLocations.docs) {
    const code = (l as unknown as Record<string, unknown>).locationCode as string | undefined
    if (code) locationMap.set(code, l.id)
  }

  const accountMap = new Map<string, number | string>()
  for (const a of allAccounts.docs) {
    const code = (a as unknown as Record<string, unknown>).code as string | undefined
    if (code) accountMap.set(code, a.id)
  }

  console.log(`[seed:fixed-assets] Refs: ${branchMap.size} branches, ${deptMap.size} depts, ${locationMap.size} locs, ${accountMap.size} accounts`)

  const expenseAccountId = accountMap.get('5800-DEP')
  if (!expenseAccountId) {
    console.error('[seed:fixed-assets] FATAL: Depreciation expense account 5800-DEP not found. Aborting.')
    process.exit(1)
  }

  let created = 0
  let updated = 0

  for (const asset of sampleAssets) {
    const branchId = asset.branchCode ? (branchMap.get(asset.branchCode) ?? null) : null
    const departmentId = asset.departmentCode ? (deptMap.get(asset.departmentCode) ?? null) : null
    const locationId = asset.locationCode ? (locationMap.get(asset.locationCode) ?? null) : null

    const codeMap = ACCOUNT_CODE_MAP[asset.assetCategory]
    const assetAccountId = accountMap.get(codeMap.asset)
    const accumDepnAccountId = accountMap.get(codeMap.accumDepn)

    if (!assetAccountId || !accumDepnAccountId) {
      console.warn(`[seed:fixed-assets] SKIP "${asset.name}" — missing account: asset=${codeMap.asset} (${assetAccountId ? 'OK' : 'MISSING'}), accum=${codeMap.accumDepn} (${accumDepnAccountId ? 'OK' : 'MISSING'})`)
      continue
    }

    const existing = await payload.find({
      collection: ACCOUNTING_COLLECTION_SLUGS.fixedAssets,
      where: { name: { equals: asset.name } as never },
      limit: 100,
      depth: 0,
      overrideAccess: true,
    })
    const existingMatch = existing.docs.find(
      (doc) => (doc as unknown as Record<string, unknown>).branch === branchId,
    )

    const data = {
      name: asset.name,
      assetCategory: asset.assetCategory,
      purchaseDate: asset.purchaseDate,
      inServiceDate: asset.inServiceDate,
      cost: asset.cost,
      salvageValue: asset.salvageValue,
      usefulLifeMonths: asset.usefulLifeMonths,
      depreciationMethod: asset.depreciationMethod,
      expenseAccount: expenseAccountId,
      assetAccount: assetAccountId,
      accumulatedDepreciationAccount: accumDepnAccountId,
      branch: branchId,
      department: departmentId,
      location: locationId,
      status: asset.status,
      notes: asset.notes,
    } as never

    if (existingMatch) {
      await payload.update({
        collection: ACCOUNTING_COLLECTION_SLUGS.fixedAssets,
        id: existingMatch.id,
        overrideAccess: true,
        data,
      })
      updated++
      console.log(`  UPDATED "${asset.name}" (${asset.branchCode || 'HQ'})`)
    } else {
      await payload.create({
        collection: ACCOUNTING_COLLECTION_SLUGS.fixedAssets,
        overrideAccess: true,
        data,
      })
      created++
      console.log(`  CREATED "${asset.name}" (${asset.branchCode || 'HQ'})`)
    }
  }

  console.log(`[seed:fixed-assets] Done. Created: ${created}, Updated: ${updated}`)
  process.exit(0)
}

seedFixedAssets().catch((error) => {
  console.error('[seed:fixed-assets] Fatal error:', error)
  process.exit(1)
})
