import type { Payload } from 'payload'
import type { AccountingCorporateReceivableRow } from '../types/accounting'
import { ACCOUNTING_COLLECTION_SLUGS } from '../constants/accounting'
import { findAllDocs } from '../utils/findAllDocs'
import { getRelationshipId } from '../utils/accounting-audit'
import { normalizeAmount, roundCurrency } from '../utils/amounts'

export const getCorporateReceivables = async (
  payload: Payload,
): Promise<AccountingCorporateReceivableRow[]> => {
  const links = await findAllDocs<any>({
    payload,
    collection: ACCOUNTING_COLLECTION_SLUGS.corporateBillingLinks,
    depth: 2,
    where: {
      status: {
        equals: 'active',
      },
    },
  })

  return links.map((link) => {
    const invoice = typeof link.invoice === 'object' ? link.invoice : null
    const corporateAccount = typeof link.corporateAccount === 'object' ? link.corporateAccount : null
    const coveredAmount = normalizeAmount(link.coveredAmount)
    const balanceDue = invoice
      ? roundCurrency(
          Math.min(coveredAmount, normalizeAmount(invoice.balanceDue)),
        )
      : coveredAmount

    return {
      corporateAccountId: getRelationshipId(link.corporateAccount) || link.id,
      corporateAccountCode: corporateAccount?.accountCode || null,
      corporateAccountName: corporateAccount?.name || null,
      invoiceId: getRelationshipId(link.invoice),
      invoiceNumber: invoice?.invoiceNumber || null,
      enrollmentBillingLinkId: getRelationshipId(link.enrollmentBillingLink),
      coveredAmount,
      traineeShareAmount: normalizeAmount(link.traineeShareAmount),
      balanceDue,
      status: link.status || null,
    }
  })
}
