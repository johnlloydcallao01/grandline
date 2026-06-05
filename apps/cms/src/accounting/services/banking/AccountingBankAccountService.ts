import type { Payload } from 'payload'
import { ACCOUNTING_COLLECTION_SLUGS } from '../../constants/accounting'
import { getRelationshipId } from '../../utils/accounting-audit'
import { normalizeOptionalText, normalizeText } from '../../utils/commercial'

type BankAccountNormalizationFields = {
  accountName?: unknown
  accountNumberMasked?: unknown
  bankName?: unknown
  branchName?: unknown
  currencyReference?: unknown
  notes?: unknown
}

type MasterReferenceDoc = {
  id: number | string
  code?: string | null
  name?: string | null
}

export class AccountingBankAccountService {
  static normalizeData<T extends BankAccountNormalizationFields>(data: T) {
    data.accountName = normalizeText(data.accountName)
    data.accountNumberMasked = normalizeOptionalText(data.accountNumberMasked)
    data.bankName = normalizeOptionalText(data.bankName)
    data.branchName = normalizeOptionalText(data.branchName)
    data.notes = normalizeOptionalText(data.notes)
    return data
  }

  static async validateLookupReferences<T extends BankAccountNormalizationFields>(payload: Payload, data: T) {
    const currencyReference = await AccountingBankAccountService.resolveMasterReference({
      payload,
      collection: ACCOUNTING_COLLECTION_SLUGS.currencies,
      relationshipValue: data.currencyReference,
    })

    if (!currencyReference) {
      throw new Error('Bank account currency reference is required and must point to a valid accounting currency.')
    }

    data.currencyReference = currencyReference.id

    return data
  }

  private static async resolveMasterReference({
    payload,
    collection,
    relationshipValue,
  }: {
    payload: Payload
    collection: string
    relationshipValue: unknown
  }): Promise<MasterReferenceDoc | null> {
    const relationshipId = getRelationshipId(relationshipValue)

    if (relationshipId === null) {
      return null
    }

    return (await payload.findByID({
      collection: collection as any,
      id: relationshipId,
      depth: 0,
      overrideAccess: true,
    }).catch(() => null)) as MasterReferenceDoc | null
  }
}
