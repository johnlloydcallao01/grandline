import 'dotenv/config'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

const SAMPLE_ENTRIES = [
  { amount: 38000, depreciationDate: '2026-05-31', status: 'posted', notes: 'Monthly depreciation for Bridge Simulator Set A — posted via batch JE-2026-1109' },
  { amount: 7500, depreciationDate: '2026-05-31', status: 'posted', notes: 'Monthly depreciation for Training Room Furniture Block 3 — posted via batch JE-2026-1114' },
  { amount: 17778, depreciationDate: '2026-06-30', status: 'scheduled', notes: 'Monthly depreciation for Server Rack Upgrade — scheduled for June close' },
  { amount: 22917, depreciationDate: '2026-05-31', status: 'posted', notes: 'Monthly depreciation for Company Utility Van — posted via batch JE-2026-1088' },
  { amount: 12000, depreciationDate: '2026-06-30', status: 'scheduled', notes: 'Monthly depreciation for Office IT Equipment — scheduled for June close' },
  { amount: 5500, depreciationDate: '2026-06-30', status: 'scheduled', notes: 'Monthly depreciation for Reception Furniture — scheduled for June close' },
  { amount: 44000, depreciationDate: '2026-07-31', status: 'scheduled', notes: 'Monthly depreciation for Main Building — scheduled for July close' },
  { amount: 8900, depreciationDate: '2026-07-31', status: 'scheduled', notes: 'Monthly depreciation for Warehouse Forklift — scheduled for July close' },
  { amount: 32000, depreciationDate: '2026-05-31', status: 'posted', notes: 'Monthly depreciation for Security System — posted via batch JE-2026-1122' },
  { amount: 15000, depreciationDate: '2026-06-30', status: 'scheduled', notes: 'Monthly depreciation for CCTV Network — scheduled for June close' },
]

async function seed() {
  const payload = await getPayload({ config: configPromise })

  const adminUser = await payload.find({
    collection: 'users',
    where: { role: { equals: 'admin' } } as never,
    limit: 1,
    overrideAccess: true,
  })
  const adminId = adminUser.docs[0]?.id ?? null

  const fixedAssets = await payload.find({
    collection: 'accounting-fixed-assets',
    depth: 0,
    limit: 20,
    sort: 'createdAt',
    overrideAccess: true,
  })
  if (fixedAssets.totalDocs === 0) {
    console.log('ERROR: No fixed assets found. Aborting.')
    process.exit(1)
  }
  const faList = fixedAssets.docs.map((d: any) => d.id)
  console.log(`Found ${faList.length} fixed assets: [${faList.join(', ')}]`)

  const fiscalYears = await payload.find({
    collection: 'accounting-fiscal-years',
    depth: 0,
    limit: 20,
    sort: 'name',
    overrideAccess: true,
  })
  if (fiscalYears.totalDocs === 0) {
    console.log('ERROR: No fiscal years found.')
    process.exit(1)
  }
  const fyList = fiscalYears.docs.map((d: any) => ({ id: d.id, name: d.name }))
  console.log(`Found ${fyList.length} fiscal years (first: ${fyList[0]?.name})`)

  const periods = await payload.find({
    collection: 'accounting-periods',
    depth: 1,
    limit: 50,
    sort: 'label',
    overrideAccess: true,
  })
  if (periods.totalDocs === 0) {
    console.log('ERROR: No periods found.')
    process.exit(1)
  }
  const periodList = periods.docs.map((d: any) => ({ id: d.id, label: d.label, fiscalYear: d.fiscalYear }))
  console.log(`Found ${periodList.length} periods (first: ${periodList[0]?.label})`)

  let created = 0
  let skipped = 0

  for (let i = 0; i < SAMPLE_ENTRIES.length; i++) {
    const entry = SAMPLE_ENTRIES[i]
    const assetId = faList[i % faList.length]
    const period = periodList[i % periodList.length]

    const existing = await payload.find({
      collection: 'accounting-depreciation-entries',
      where: {
        and: [
          { fixedAsset: { equals: assetId } },
          { depreciationDate: { equals: entry.depreciationDate } },
          { amount: { equals: entry.amount } },
        ],
      } as never,
      limit: 1,
      overrideAccess: true,
    })

    if (existing.totalDocs > 0) {
      console.log(`Skipping entry ${i + 1}: asset ${assetId}, ${entry.depreciationDate} — already exists.`)
      skipped++
      continue
    }

    const fiscalYearId = period.fiscalYear && typeof period.fiscalYear === 'object' ? period.fiscalYear.id : fyList[0].id

    await payload.create({
      collection: 'accounting-depreciation-entries',
      overrideAccess: true,
      data: {
        fixedAsset: assetId,
        fiscalYear: fiscalYearId,
        period: period.id,
        depreciationDate: entry.depreciationDate,
        amount: entry.amount,
        status: entry.status,
        notes: entry.notes,
        createdBy: adminId,
        updatedBy: adminId,
      } as never,
    })

    console.log(`Created entry ${i + 1}: asset ${assetId} | period ${period.label} | ${entry.depreciationDate} | PHP ${entry.amount} | ${entry.status}`)
    created++
  }

  console.log(`\nDone. ${created} created, ${skipped} skipped.`)
  process.exit(0)
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
