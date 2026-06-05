import type { Payload } from 'payload'
import { ACCOUNTING_COLLECTION_SLUGS } from '../../constants/accounting'
import { getRelationshipId } from '../../utils/accounting-audit'
import { AccountingCommercialService } from '../AccountingCommercialService'
import { normalizeCode, normalizeOptionalText, normalizeText } from '../../utils/commercial'

type CustomerNormalizationFields = {
  customerCode?: unknown
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

export class AccountingCustomerService {
  static async generateCustomerCode(payload: Payload) {
    return AccountingCommercialService.generateDocumentNumber(payload, 'customerNumberPrefix')
  }

  static normalizeData<T extends CustomerNormalizationFields>(data: T) {
    data.customerCode = normalizeCode(data.customerCode)
    data.displayName = normalizeText(data.displayName)
    data.legalName = normalizeOptionalText(data.legalName)
    data.email = normalizeOptionalText(data.email)?.toLowerCase()
    data.phone = normalizeOptionalText(data.phone)
    data.taxId = normalizeOptionalText(data.taxId)
    data.notes = normalizeOptionalText(data.notes)
    return data
  }

  static async validateLookupReferences<T extends CustomerNormalizationFields>(payload: Payload, data: T) {
    const currencyReference = await AccountingCustomerService.resolveMasterReference({
      payload,
      collection: ACCOUNTING_COLLECTION_SLUGS.currencies,
      relationshipValue: data.currencyReference,
    })

    if (!currencyReference) {
      throw new Error('Customer currency reference is required and must point to a valid accounting currency.')
    }

    data.currencyReference = currencyReference.id

    const paymentTermReference = await AccountingCustomerService.resolveMasterReference({
      payload,
      collection: ACCOUNTING_COLLECTION_SLUGS.paymentTerms,
      relationshipValue: data.paymentTermReference,
    })

    if (!paymentTermReference) {
      throw new Error('Customer payment term reference is required and must point to a valid accounting payment term.')
    }

    data.paymentTermReference = paymentTermReference.id

    return data
  }

  static async getRequiredCurrencyReference(payload: Payload, code = 'PHP') {
    const normalizedCode = normalizeCode(code)
    const match = await payload.find({
      collection: ACCOUNTING_COLLECTION_SLUGS.currencies as any,
      depth: 0,
      limit: 1,
      overrideAccess: true,
      where: {
        code: {
          equals: normalizedCode,
        },
      } as any,
    })

    const doc = (match.docs?.[0] || null) as MasterReferenceDoc | null

    if (doc?.id === undefined || doc?.id === null) {
      throw new Error(`Accounting currency '${normalizedCode}' was not found.`)
    }

    const relationId = typeof doc.id === 'number' ? doc.id : Number(doc.id)

    if (!Number.isFinite(relationId)) {
      throw new Error(`Accounting currency '${normalizedCode}' has a non-numeric relationship id.`)
    }

    return relationId
  }

  static async getRequiredPaymentTermReference(payload: Payload, options: {
    code?: string
    name?: string
  } = {}) {
    const orConditions: Array<Record<string, unknown>> = []

    if (options.code) {
      orConditions.push({
        code: {
          equals: normalizeCode(options.code),
        },
      })
    }

    if (options.name) {
      orConditions.push({
        name: {
          equals: normalizeText(options.name),
        },
      })
    }

    if (!orConditions.length) {
      throw new Error('A payment term lookup requires a code or name.')
    }

    const match = await payload.find({
      collection: ACCOUNTING_COLLECTION_SLUGS.paymentTerms as any,
      depth: 0,
      limit: 1,
      overrideAccess: true,
      where: {
        or: orConditions,
      } as any,
    })

    const doc = (match.docs?.[0] || null) as MasterReferenceDoc | null

    if (doc?.id === undefined || doc?.id === null) {
      throw new Error(
        `Accounting payment term was not found for code '${options.code || ''}' or name '${options.name || ''}'.`,
      )
    }

    const relationId = typeof doc.id === 'number' ? doc.id : Number(doc.id)

    if (!Number.isFinite(relationId)) {
      throw new Error(
        `Accounting payment term has a non-numeric relationship id for code '${options.code || ''}' or name '${options.name || ''}'.`,
      )
    }

    return relationId
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
