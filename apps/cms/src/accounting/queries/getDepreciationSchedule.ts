import type { Payload } from 'payload'
import { ACCOUNTING_COLLECTION_SLUGS } from '../constants/accounting'
import { findAllDocs } from '../utils/findAllDocs'

export const getDepreciationSchedule = async (
  payload: Payload,
  fixedAssetId?: number | string,
) =>
  findAllDocs<any>({
    payload,
    collection: ACCOUNTING_COLLECTION_SLUGS.depreciationEntries,
    depth: 2,
    sort: 'depreciationDate',
    where: fixedAssetId
      ? {
          fixedAsset: {
            equals: fixedAssetId,
          },
        }
      : undefined,
  })
