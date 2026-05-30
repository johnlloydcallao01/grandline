import { APIError, type Payload } from 'payload'
import { ACCOUNTING_COLLECTION_SLUGS } from '../../constants/accounting'
import { AccountingFixedAssetService } from './AccountingFixedAssetService'
import { AccountingManualWorkflowService } from '../journals/AccountingManualWorkflowService'
import { normalizeAmount, roundCurrency } from '../../utils/amounts'
import { AccountingApprovalService } from '../approvals/AccountingApprovalService'
import { AccountingAuditService } from '../audit/AccountingAuditService'
import { getRelationshipId } from '../../utils/accounting-audit'

type FixedAssetLike = {
  id: number | string
  assetCode?: string | null
  name?: string | null
  expenseAccount?: unknown
  accumulatedDepreciationAccount?: unknown
  assetAccount?: unknown
  cost?: unknown
  salvageValue?: unknown
  status?: string | null
}

const toNumericId = (value: unknown) => {
  const relationshipId = getRelationshipId(value)
  return typeof relationshipId === 'number' ? relationshipId : relationshipId ? Number(relationshipId) : undefined
}

const requireNumericId = (value: unknown, fieldName: string) => {
  const numericId = toNumericId(value)

  if (!numericId || !Number.isFinite(numericId)) {
    throw new APIError(`${fieldName} must resolve to a numeric relationship id.`, 400)
  }

  return numericId
}

export class AccountingDepreciationService {
  static async resolveFixedAsset(payload: Payload, value: unknown): Promise<FixedAssetLike> {
    const assetId = getRelationshipId(value)

    if (!assetId) {
      throw new APIError('A fixed asset is required for this operation.', 400)
    }

    if (typeof value === 'object' && value !== null && 'id' in value) {
      return value as FixedAssetLike
    }

    const asset = await payload.findByID({
      collection: ACCOUNTING_COLLECTION_SLUGS.fixedAssets,
      id: assetId,
      depth: 0,
      overrideAccess: true,
    })

    if (!asset) {
      throw new APIError('Fixed asset not found.', 404)
    }

    return asset as FixedAssetLike
  }

  static async postDepreciationEntry({
    payload,
    depreciationEntryId,
    userId,
  }: {
    payload: Payload
    depreciationEntryId: number | string
    userId?: number | string | null
  }) {
    const entry = await payload.findByID({
      collection: ACCOUNTING_COLLECTION_SLUGS.depreciationEntries,
      id: depreciationEntryId,
      depth: 2,
      overrideAccess: true,
    })

    if (!entry) {
      throw new APIError('Depreciation entry not found.', 404)
    }

    if (entry.status === 'posted') {
      return entry
    }

    const asset = await this.resolveFixedAsset(payload, entry.fixedAsset)
    const assetId = getRelationshipId(asset.id)

    if (!assetId) {
      throw new APIError('Fixed asset relationship is invalid.', 400)
    }

    const assetLabel = asset.assetCode || asset.name || String(assetId)
    const amount = normalizeAmount(entry.amount)

    const journalEntry = await AccountingManualWorkflowService.createStructuredJournal({
      payload,
      userId,
      sourceType: 'system',
      entryDate: entry.depreciationDate,
      postingDate: entry.depreciationDate,
      memo: `Depreciation for ${assetLabel}`,
      sourceReference: asset.assetCode || String(assetId),
      autoPost: true,
      lines: [
        {
          account: requireNumericId(asset.expenseAccount, 'expenseAccount'),
          description: `Depreciation expense for ${assetLabel}`,
          debit: amount,
          credit: 0,
          referenceEntityType: 'fixed_asset',
          referenceEntityId: String(assetId),
        },
        {
          account: requireNumericId(
            asset.accumulatedDepreciationAccount,
            'accumulatedDepreciationAccount',
          ),
          description: `Accumulated depreciation for ${assetLabel}`,
          debit: 0,
          credit: amount,
          referenceEntityType: 'fixed_asset',
          referenceEntityId: String(assetId),
        },
      ],
    })

    const updatedEntry = await payload.update({
      collection: ACCOUNTING_COLLECTION_SLUGS.depreciationEntries,
      id: depreciationEntryId,
      overrideAccess: true,
      depth: 1,
      data: {
        status: 'posted',
        postedJournalEntry: journalEntry.id,
      },
    })

    const accumulatedDepreciation = await AccountingFixedAssetService.getAccumulatedDepreciation(
      payload,
      assetId,
    )
    const depreciableBase = AccountingFixedAssetService.getDepreciableBase(asset)

    if (accumulatedDepreciation >= depreciableBase) {
      await payload.update({
        collection: ACCOUNTING_COLLECTION_SLUGS.fixedAssets,
        id: assetId,
        overrideAccess: true,
        depth: 0,
        data: {
          status: 'fully_depreciated',
        },
      })
    } else if (String(asset.status || '') === 'draft') {
      await payload.update({
        collection: ACCOUNTING_COLLECTION_SLUGS.fixedAssets,
        id: assetId,
        overrideAccess: true,
        depth: 0,
        data: {
          status: 'active',
        },
      })
    }

    await AccountingAuditService.logAction({
      payload,
      entityType: 'depreciation_entry',
      entityId: depreciationEntryId,
      actionType: 'posted',
      performedBy: userId,
      beforeData: entry,
      afterData: updatedEntry,
    })

    return updatedEntry
  }

  static async postAssetDisposal({
    payload,
    disposalId,
    userId,
  }: {
    payload: Payload
    disposalId: number | string
    userId?: number | string | null
  }) {
    await AccountingApprovalService.ensureApprovedForEntity({
      payload,
      entityType: 'asset_disposal',
      entityId: disposalId,
    })

    const disposal = await payload.findByID({
      collection: ACCOUNTING_COLLECTION_SLUGS.assetDisposals,
      id: disposalId,
      depth: 2,
      overrideAccess: true,
    })

    if (!disposal) {
      throw new APIError('Asset disposal not found.', 404)
    }

    if (disposal.status === 'posted') {
      return disposal
    }

    const asset = await this.resolveFixedAsset(payload, disposal.fixedAsset)
    const assetId = getRelationshipId(asset.id)

    if (!assetId) {
      throw new APIError('Fixed asset relationship is invalid.', 400)
    }

    const assetLabel = asset.assetCode || asset.name || String(assetId)
    const assetCost = normalizeAmount(asset.cost)
    const accumulatedDepreciation = await AccountingFixedAssetService.getAccumulatedDepreciation(
      payload,
      assetId,
    )
    const bookValue = roundCurrency(assetCost - accumulatedDepreciation)
    const proceedsAmount = normalizeAmount(disposal.proceedsAmount)
    const gainOrLossAmount = roundCurrency(proceedsAmount - bookValue)

    const lines = [
      {
        account: requireNumericId(
          asset.accumulatedDepreciationAccount,
          'accumulatedDepreciationAccount',
        ),
        description: `Derecognize accumulated depreciation for ${assetLabel}`,
        debit: accumulatedDepreciation,
        credit: 0,
      },
      {
        account: requireNumericId(asset.assetAccount, 'assetAccount'),
        description: `Derecognize cost for ${assetLabel}`,
        debit: 0,
        credit: assetCost,
      },
    ]

    if (proceedsAmount > 0) {
      if (!disposal.proceedsAccount) {
        throw new APIError('A proceeds account is required when posting a disposal with proceeds.', 400)
      }
      lines.push({
        account: requireNumericId(disposal.proceedsAccount, 'proceedsAccount'),
        description: `Disposal proceeds for ${assetLabel}`,
        debit: proceedsAmount,
        credit: 0,
      })
    }

    if (gainOrLossAmount > 0) {
      if (!disposal.gainAccount) {
        throw new APIError('A gain account is required when a disposal results in a gain.', 400)
      }
      lines.push({
        account: requireNumericId(disposal.gainAccount, 'gainAccount'),
        description: `Gain on disposal for ${assetLabel}`,
        debit: 0,
        credit: gainOrLossAmount,
      })
    } else if (gainOrLossAmount < 0) {
      if (!disposal.lossAccount) {
        throw new APIError('A loss account is required when a disposal results in a loss.', 400)
      }
      lines.push({
        account: requireNumericId(disposal.lossAccount, 'lossAccount'),
        description: `Loss on disposal for ${assetLabel}`,
        debit: Math.abs(gainOrLossAmount),
        credit: 0,
      })
    }

    const journalEntry = await AccountingManualWorkflowService.createStructuredJournal({
      payload,
      userId,
      sourceType: 'system',
      entryDate: disposal.disposalDate,
      postingDate: disposal.disposalDate,
      memo: `Asset disposal ${assetLabel}`,
      sourceReference: asset.assetCode || String(assetId),
      autoPost: true,
      lines,
    })

    const updatedDisposal = await payload.update({
      collection: ACCOUNTING_COLLECTION_SLUGS.assetDisposals,
      id: disposalId,
      overrideAccess: true,
      depth: 1,
      data: {
        bookValueAtDisposal: bookValue,
        gainOrLossAmount,
        status: 'posted',
        postedJournalEntry: journalEntry.id,
      },
    })

    await payload.update({
      collection: ACCOUNTING_COLLECTION_SLUGS.fixedAssets,
      id: assetId,
      overrideAccess: true,
      depth: 0,
      data: {
        status: disposal.disposalType === 'write_off' ? 'written_off' : 'disposed',
      },
    })

    await AccountingAuditService.logAction({
      payload,
      entityType: 'asset_disposal',
      entityId: disposalId,
      actionType: 'posted',
      performedBy: userId,
      beforeData: disposal,
      afterData: updatedDisposal,
    })

    return updatedDisposal
  }
}
