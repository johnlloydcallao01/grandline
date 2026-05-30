import type { Payload } from 'payload'
import { ACCOUNTING_COLLECTION_SLUGS } from '../../constants/accounting'
import { findAllDocs } from '../../utils/findAllDocs'
import { normalizeAmount, roundCurrency } from '../../utils/amounts'
import { AccountingFixedAssetService } from '../assets/AccountingFixedAssetService'

export class AccountingAssetRegisterService {
  static async getAssetRegister(payload: Payload) {
    const assets = await findAllDocs<any>({
      payload,
      collection: ACCOUNTING_COLLECTION_SLUGS.fixedAssets,
      depth: 2,
    })

    return Promise.all(
      assets.map(async (asset) => {
        const accumulatedDepreciation = await AccountingFixedAssetService.getAccumulatedDepreciation(
          payload,
          asset.id,
        )
        const bookValue = roundCurrency(normalizeAmount(asset.cost) - accumulatedDepreciation)

        return {
          assetId: asset.id,
          assetCode: asset.assetCode,
          name: asset.name,
          assetCategory: asset.assetCategory,
          branch: asset.branch?.name || null,
          department: asset.department?.name || null,
          location: asset.location?.name || null,
          cost: normalizeAmount(asset.cost),
          accumulatedDepreciation,
          netBookValue: bookValue,
          status: asset.status,
        }
      }),
    )
  }
}
