import 'dotenv/config'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

const SAMPLE_SCHEDULES = [
  { amount: 38000, depreciationDate: '2026-06-30', status: 'scheduled', notes: 'Monthly depreciation for Bridge Simulator Set A — June 2026' },
  { amount: 7500, depreciationDate: '2026-06-30', status: 'scheduled', notes: 'Monthly depreciation for Training Room Furniture Block 3 — June 2026' },
  { amount: 17778, depreciationDate: '2026-07-31', status: 'scheduled', notes: 'Monthly depreciation for Server Rack Upgrade — July 2026' },
  { amount: 22917, depreciationDate: '2026-05-31', status: 'posted', notes: 'Monthly depreciation for Company Utility Van — May 2026' },
  { amount: 38000, depreciationDate: '2026-05-31', status: 'posted', notes: 'Monthly depreciation for Bridge Simulator Set A — May 2026' },
  { amount: 7500, depreciationDate: '2026-05-31', status: 'posted', notes: 'Monthly depreciation for Training Room Furniture Block 3 — May 2026' },
  { amount: 17778, depreciationDate: '2026-06-30', status: 'scheduled', notes: 'Monthly depreciation for Server Rack Upgrade — June 2026' },
  { amount: 22917, depreciationDate: '2026-06-30', status: 'scheduled', notes: 'Monthly depreciation for Company Utility Van — June 2026' },
  { amount: 12000, depreciationDate: '2026-07-15', status: 'scheduled', notes: 'Monthly depreciation for Office IT Equipment — July 2026' },
  { amount: 5500, depreciationDate: '2026-08-15', status: 'scheduled', notes: 'Monthly depreciation for Reception Furniture — August 2026' },
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
    limit: 10,
    sort: 'name',
    overrideAccess: true,
  })
  if (fiscalYears.totalDocs === 0) {
    console.log('ERROR: No fiscal years found. Look up slug or check DB.')
    process.exit(1)
  }
  const fyId = (fiscalYears.docs[0] as any).id
  console.log(`Using fiscal year ID: ${fyId} (${(fiscalYears.docs[0] as any).name})`)

  const periods = await payload.find({
    collection: 'accounting-periods',
    depth: 0,
    limit: 50,
    sort: 'label',
    overrideAccess: true,
  })
  if (periods.totalDocs === 0) {
    console.log('ERROR: No periods found.')
    process.exit(1)
  }
  const periodList = periods.docs.map((d: any) => ({ id: d.id, label: d.label }))
  console.log(`Found ${periodList.length} periods`)

  let created = 0
  let skipped = 0

  for (let i = 0; i < SAMPLE_SCHEDULES.length; i++) {
    const sched = SAMPLE_SCHEDULES[i]
    const assetId = faList[i % faList.length]
    const period = periodList[i % periodList.length]

    const existing = await payload.find({
      collection: 'accounting-depreciation-entries',
      where: {
        and: [
          { fixedAsset: { equals: assetId } },
          { period: { equals: period.id } },
          { depreciationDate: { equals: sched.depreciationDate } },
        ],
      } as never,
      limit: 1,
      overrideAccess: true,
    })

    if (existing.totalDocs > 0) {
      console.log(`Skipping schedule ${i + 1}: asset ${assetId}, period ${period.label} (${sched.depreciationDate}) — already exists.`)
      skipped++
      continue
    }

    await payload.create({
      collection: 'accounting-depreciation-entries',
      overrideAccess: true,
      data: {
        fixedAsset: assetId,
        fiscalYear: fyId,
        period: period.id,
        depreciationDate: sched.depreciationDate,
        amount: sched.amount,
        status: sched.status,
        notes: sched.notes,
        createdBy: adminId,
        updatedBy: adminId,
      } as never,
    })

    console.log(`Created schedule ${i + 1}: asset ${assetId} | period ${period.label} | ${sched.depreciationDate} | PHP ${sched.amount} | ${sched.status}`)
    created++
  }

  console.log(`\nDone. ${created} created, ${skipped} skipped.`)
  process.exit(0)
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
