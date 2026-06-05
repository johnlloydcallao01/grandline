import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../payload.config'
import { ACCOUNTING_COLLECTION_SLUGS } from '../accounting/constants/accounting'

type SeedTaxCode = {
  code: string
  name: string
  scope: 'sales' | 'purchase' | 'both'
  rate: number
  calculationMethod: 'exclusive' | 'inclusive'
  isActive: boolean
  description: string | null
}

const sampleTaxCodes: SeedTaxCode[] = [
  {
    code: 'VAT12',
    name: 'Standard VAT 12%',
    scope: 'both',
    rate: 12,
    calculationMethod: 'exclusive',
    isActive: true,
    description: 'Standard 12% value-added tax applicable to most goods and services.',
  },
  {
    code: 'VAT0',
    name: 'Zero-Rated VAT',
    scope: 'both',
    rate: 0,
    calculationMethod: 'exclusive',
    isActive: true,
    description: 'Zero-rated transactions — no output VAT charged, input VAT claimable.',
  },
  {
    code: 'NONVAT',
    name: 'Non-VAT Sale',
    scope: 'sales',
    rate: 0,
    calculationMethod: 'exclusive',
    isActive: true,
    description: 'Exempt from VAT. No output or input VAT applies.',
  },
  {
    code: 'EWTP2',
    name: 'Expanded Withholding Tax 2%',
    scope: 'purchase',
    rate: 2,
    calculationMethod: 'exclusive',
    isActive: true,
    description: 'Withholding tax on professional fees and services at 2%.',
  },
  {
    code: 'EWTP5',
    name: 'Expanded Withholding Tax 5%',
    scope: 'purchase',
    rate: 5,
    calculationMethod: 'exclusive',
    isActive: true,
    description: 'Withholding tax on rental and certain professional fees at 5%.',
  },
  {
    code: 'EWTP10',
    name: 'Expanded Withholding Tax 10%',
    scope: 'purchase',
    rate: 10,
    calculationMethod: 'exclusive',
    isActive: true,
    description: 'Withholding tax on certain income payments at 10%.',
  },
  {
    code: 'VAT12_INC',
    name: 'Inclusive VAT 12%',
    scope: 'both',
    rate: 12,
    calculationMethod: 'inclusive',
    isActive: true,
    description: 'VAT-inclusive pricing — tax is embedded in the gross amount.',
  },
  {
    code: 'EXEMPT',
    name: 'Tax-Exempt',
    scope: 'both',
    rate: 0,
    calculationMethod: 'exclusive',
    isActive: true,
    description: 'Transactions fully exempt from all taxes.',
  },
  {
    code: 'SRC_VAT',
    name: 'Surcharge VAT',
    scope: 'sales',
    rate: 12,
    calculationMethod: 'exclusive',
    isActive: false,
    description: 'Legacy surcharge VAT. No longer in active use.',
  },
  {
    code: 'IMPORT_DUTY',
    name: 'Import Duty Tax',
    scope: 'purchase',
    rate: 15,
    calculationMethod: 'exclusive',
    isActive: false,
    description: 'Import duty on purchased goods. Retained for historical reference.',
  },
]

async function seedTaxCodes(): Promise<void> {
  console.log('[seed] Connecting to Payload...')
  const payload = await getPayload({ config })
  console.log('[seed] Connected. Upserting tax codes...')

  let created = 0
  let updated = 0

  for (const taxCode of sampleTaxCodes) {
    const existing = await payload.find({
      collection: ACCOUNTING_COLLECTION_SLUGS.taxCodes,
      where: {
        code: { equals: taxCode.code } as never,
      },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })

    const data = {
      code: taxCode.code,
      name: taxCode.name,
      scope: taxCode.scope,
      rate: taxCode.rate,
      calculationMethod: taxCode.calculationMethod,
      isActive: taxCode.isActive,
      description: taxCode.description,
    } as never

    if (existing.docs.length > 0) {
      await payload.update({
        collection: ACCOUNTING_COLLECTION_SLUGS.taxCodes,
        id: existing.docs[0].id,
        overrideAccess: true,
        data,
      })
      updated++
    } else {
      await payload.create({
        collection: ACCOUNTING_COLLECTION_SLUGS.taxCodes,
        overrideAccess: true,
        data,
      })
      created++
    }
  }

  console.log(`[seed] Done. Created: ${created}, Updated: ${updated}`)
  process.exit(0)
}

seedTaxCodes().catch((error) => {
  console.error('[seed] Fatal error:', error)
  process.exit(1)
})
