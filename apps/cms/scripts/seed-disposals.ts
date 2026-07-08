import 'dotenv/config'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

const SAMPLE_DISPOSALS = [
  { disposalDate: '2026-04-12', disposalType: 'sale', proceedsAmount: 340000, bookValueAtDisposal: 322000, gainOrLossAmount: 18000, status: 'posted', notes: 'Sold company utility van at a gain via public auction.' },
  { disposalDate: '2026-04-28', disposalType: 'write_off', proceedsAmount: 0, bookValueAtDisposal: 11500, gainOrLossAmount: -11500, status: 'posted', notes: 'Legacy desktop cluster fully depreciated and written off.' },
  { disposalDate: '2026-05-09', disposalType: 'transfer', proceedsAmount: 0, bookValueAtDisposal: 0, gainOrLossAmount: 0, status: 'draft', notes: 'Transfer of Printer Bay 2 to satellite office pending approval.' },
  { disposalDate: '2026-05-21', disposalType: 'write_off', proceedsAmount: 0, bookValueAtDisposal: 8200, gainOrLossAmount: -8200, status: 'approved', notes: 'Damaged projector unit written off after insurance assessment.' },
  { disposalDate: '2026-06-03', disposalType: 'sale', proceedsAmount: 150000, bookValueAtDisposal: 165000, gainOrLossAmount: -15000, status: 'posted', notes: 'Sold server rack to third party at a loss.' },
  { disposalDate: '2026-06-14', disposalType: 'scrap', proceedsAmount: 2000, bookValueAtDisposal: 4500, gainOrLossAmount: -2500, status: 'approved', notes: 'Scrapped obsolete networking equipment.' },
  { disposalDate: '2026-06-28', disposalType: 'sale', proceedsAmount: 58000, bookValueAtDisposal: 62000, gainOrLossAmount: -4000, status: 'draft', notes: 'Sold conference room AV system to an employee.' },
  { disposalDate: '2026-07-05', disposalType: 'write_off', proceedsAmount: 0, bookValueAtDisposal: 3300, gainOrLossAmount: -3300, status: 'posted', notes: 'Write-off of broken aircon unit in warehouse.' },
  { disposalDate: '2026-07-15', disposalType: 'transfer', proceedsAmount: 0, bookValueAtDisposal: 0, gainOrLossAmount: 0, status: 'approved', notes: 'Transfer of office furniture to new branch in Cebu.' },
  { disposalDate: '2026-07-22', disposalType: 'sale', proceedsAmount: 92000, bookValueAtDisposal: 88000, gainOrLossAmount: 4000, status: 'draft', notes: 'Proposed sale of backup generator to neighboring company.' },
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
    console.log('No fixed assets found. Creating a sample fixed asset first.')
    const sampleAsset = await payload.create({
      collection: 'accounting-fixed-assets',
      overrideAccess: true,
      data: {
        name: 'Sample Asset',
        assetCode: 'SEED-001',
        assetCategory: 'equipment',
        purchaseDate: '2025-01-15',
        cost: 500000,
        salvageValue: 50000,
        usefulLifeMonths: 60,
        depreciationMethod: 'straight_line',
        status: 'active',
        createdBy: adminId,
        updatedBy: adminId,
      } as never,
    })
    fixedAssets.docs = [sampleAsset]
    fixedAssets.totalDocs = 1
  }

  const faIds = fixedAssets.docs.map((d: any) => d.id)

  let created = 0
  let skipped = 0

  for (let i = 0; i < SAMPLE_DISPOSALS.length; i++) {
    const disp = SAMPLE_DISPOSALS[i]
    const assetId = faIds[i % faIds.length]

    const existing = await payload.find({
      collection: 'accounting-asset-disposals',
      where: {
        and: [
          { fixedAsset: { equals: assetId } },
          { disposalDate: { equals: disp.disposalDate } },
          { disposalType: { equals: disp.disposalType } },
        ],
      } as never,
      limit: 1,
      overrideAccess: true,
    })

    if (existing.totalDocs > 0) {
      console.log(`Skipping disposal ${i + 1} for asset ${assetId} on ${disp.disposalDate} — already exists.`)
      skipped++
      continue
    }

    await payload.create({
      collection: 'accounting-asset-disposals',
      overrideAccess: true,
      data: {
        fixedAsset: assetId,
        disposalDate: disp.disposalDate,
        disposalType: disp.disposalType,
        proceedsAmount: disp.proceedsAmount,
        bookValueAtDisposal: disp.bookValueAtDisposal,
        gainOrLossAmount: disp.gainOrLossAmount,
        status: disp.status,
        notes: disp.notes,
        createdBy: adminId,
        updatedBy: adminId,
      } as never,
    })

    console.log(`Created disposal ${i + 1}: ${disp.disposalType} of asset ${assetId} on ${disp.disposalDate} (${disp.status})`)
    created++
  }

  console.log(`\nDone. ${created} created, ${skipped} skipped.`)
  process.exit(0)
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
