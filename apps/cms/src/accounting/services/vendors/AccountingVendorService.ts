import type { Payload } from 'payload'
import { AccountingCommercialService } from '../AccountingCommercialService'
import { normalizeCode, normalizeOptionalText, normalizeText } from '../../utils/commercial'

type VendorNormalizationFields = {
  vendorCode?: unknown
  displayName?: unknown
  legalName?: unknown
  email?: unknown
  phone?: unknown
  taxId?: unknown
  currency?: unknown
  paymentTerms?: unknown
  notes?: unknown
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
    data.currency = normalizeCode(data.currency || 'PHP')
    data.paymentTerms = normalizeOptionalText(data.paymentTerms)
    data.notes = normalizeOptionalText(data.notes)
    return data
  }
}
