import { APIError, type Payload } from 'payload'
import { ACCOUNTING_COLLECTION_SLUGS } from '../../constants/accounting'
import { AccountingPeriodService } from '../periods/AccountingPeriodService'
import { findAllDocs } from '../../utils/findAllDocs'
import { normalizeAmount, roundCurrency } from '../../utils/amounts'

const addMonths = (value: string, months: number) => {
  const date = new Date(value)
  date.setUTCMonth(date.getUTCMonth() + months)
  return date.toISOString()
}

export class AccountingFixedAssetService {
  static async generateAssetCode(_payload: Payload) {
    const stamp = new Date().toISOString().replace(/\D/g, '').slice(0, 12)
    const randomSuffix = Math.floor(Math.random() * 900 + 100)
    return `FA-${stamp}-${randomSuffix}`
  }

  static getDepreciableBase(asset: { cost?: unknown; salvageValue?: unknown }) {
    return Math.max(0, roundCurrency(normalizeAmount(asset.cost) - normalizeAmount(asset.salvageValue)))
  }

  static getMonthlyDepreciation(asset: { cost?: unknown; salvageValue?: unknown; usefulLifeMonths?: unknown }) {
    const usefulLifeMonths = Math.max(1, Number(asset.usefulLifeMonths || 1))
    return roundCurrency(this.getDepreciableBase(asset) / usefulLifeMonths)
  }

  static async getAccumulatedDepreciation(payload: Payload, assetId: number | string) {
    const entries = await findAllDocs<any>({
      payload,
      collection: ACCOUNTING_COLLECTION_SLUGS.depreciationEntries,
      depth: 0,
      where: {
        and: [
          {
            fixedAsset: {
              equals: assetId,
            },
          },
          {
            status: {
              equals: 'posted',
            },
          },
        ],
      },
    })

    return roundCurrency(entries.reduce((sum, entry) => sum + normalizeAmount(entry.amount), 0))
  }

  static async ensureDepreciationSchedule({
    payload,
    assetId,
  }: {
    payload: Payload
    assetId: number | string
  }) {
    const asset = await payload.findByID({
      collection: ACCOUNTING_COLLECTION_SLUGS.fixedAssets,
      id: assetId,
      depth: 1,
      overrideAccess: true,
    })

    if (!asset) {
      throw new APIError('Fixed asset not found.', 404)
    }

    if (!asset.inServiceDate && !asset.purchaseDate) {
      throw new APIError('Fixed asset requires an in-service date or purchase date.', 400)
    }

    const startDate = String(asset.inServiceDate || asset.purchaseDate)
    const usefulLifeMonths = Math.max(1, Number(asset.usefulLifeMonths || 1))
    const monthlyAmount = this.getMonthlyDepreciation(asset)
    const createdEntries: any[] = []

    for (let monthIndex = 0; monthIndex < usefulLifeMonths; monthIndex += 1) {
      const depreciationDate = addMonths(startDate, monthIndex)
      const postingWindow = await AccountingPeriodService.resolvePostingWindow(payload, depreciationDate)

      const existing = await payload.find({
        collection: ACCOUNTING_COLLECTION_SLUGS.depreciationEntries,
        where: {
          and: [
            {
              fixedAsset: {
                equals: assetId,
              },
            },
            {
              period: {
                equals: postingWindow.period.id,
              },
            },
          ],
        },
        limit: 1,
        depth: 0,
        overrideAccess: true,
      })

      if (existing.docs[0]) {
        createdEntries.push(existing.docs[0])
        continue
      }

      const created = await payload.create({
        collection: ACCOUNTING_COLLECTION_SLUGS.depreciationEntries,
        overrideAccess: true,
        depth: 0,
        data: {
          fixedAsset: asset.id,
          fiscalYear: Number(postingWindow.fiscalYear.id),
          period: Number(postingWindow.period.id),
          depreciationDate,
          amount: monthlyAmount,
          status: 'scheduled',
          notes: `Scheduled from ${asset.assetCode}`,
        },
      })

      createdEntries.push(created)
    }

    return createdEntries
  }
}
