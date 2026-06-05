import type { Payload } from 'payload'
import { ACCOUNTING_COLLECTION_SLUGS } from '../../constants/accounting'
import { getRelationshipId } from '../../utils/accounting-audit'
import { AccountingCommercialService } from '../AccountingCommercialService'
import { normalizeCode, normalizeOptionalText, normalizeText } from '../../utils/commercial'

type VendorNormalizationFields = {
  vendorCode?: unknown
  displayName?: unknown
  legalName?: unknown
  email?: unknown
  phone?: unknown
  taxId?: unknown
  currencyReference?: unknown
  paymentTermReference?: unknown
  notes?: unknown
}

type MasterReferenceDoc = {
  id: number | string
  code?: string | null
  name?: string | null
}

export class AccountingVendorService {
  static async generateVendorCode(payload: Payload) {
    return AccountingCommercialService.generateDocumentNumber(payload, 'vendorNumberPrefix')
  }

  static normalizeData<T extends VendorNormalizationFields>(data: T) {
    data.vendorCode = normalizeCode(data.vendorCode)
    data.displayName = normalizeText(data.displayName)
    data.legalName = normalizeOptionalText(data.legalName)
    data.email = normalizeOptionalText(data.email)?.toLowerCase()
    data.phone = normalizeOptionalText(data.phone)
    data.taxId = normalizeOptionalText(data.taxId)
    data.notes = normalizeOptionalText(data.notes)
    return data
  }

  static async validateLookupReferences<T extends VendorNormalizationFields>(payload: Payload, data: T) {
    const currencyReference = await AccountingVendorService.resolveMasterReference({
      payload,
      collection: ACCOUNTING_COLLECTION_SLUGS.currencies,
      relationshipValue: data.currencyReference,
    })

    if (!currencyReference) {
      throw new Error('Vendor currency reference is required and must point to a valid accounting currency.')
    }

    data.currencyReference = currencyReference.id

    const paymentTermReference = await AccountingVendorService.resolveMasterReference({
      payload,
      collection: ACCOUNTING_COLLECTION_SLUGS.paymentTerms,
      relationshipValue: data.paymentTermReference,
    })

    if (!paymentTermReference) {
      throw new Error('Vendor payment term reference is required and must point to a valid accounting payment term.')
    }

    data.paymentTermReference = paymentTermReference.id

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
