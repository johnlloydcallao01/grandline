import type { Payload } from 'payload'
import type { AccountingScholarshipUtilizationRow } from '../types/accounting'
import { ACCOUNTING_COLLECTION_SLUGS } from '../constants/accounting'
import { findAllDocs } from '../utils/findAllDocs'
import { normalizeAmount, roundCurrency } from '../utils/amounts'
import { getRelationshipId } from '../utils/accounting-audit'

export const getScholarshipUtilization = async (
  payload: Payload,
): Promise<AccountingScholarshipUtilizationRow[]> => {
  const awards = await findAllDocs<any>({
    payload,
    collection: ACCOUNTING_COLLECTION_SLUGS.scholarshipAwards,
    depth: 1,
    where: {
      status: {
        equals: 'active',
      },
    },
  })

  const map = new Map<string, AccountingScholarshipUtilizationRow>()

  for (const award of awards) {
    const sponsor = typeof award.scholarshipSponsor === 'object' ? award.scholarshipSponsor : null
    const key = String(getRelationshipId(award.scholarshipSponsor) || award.id)
    const current = map.get(key) || {
      sponsorId: getRelationshipId(award.scholarshipSponsor) || award.id,
      sponsorCode: sponsor?.sponsorCode || null,
      sponsorName: sponsor?.name || null,
      awardCount: 0,
      awardedAmount: 0,
      traineeShareAmount: 0,
      billedSponsorAmount: 0,
    }

    current.awardCount += 1
    current.awardedAmount = roundCurrency(current.awardedAmount + normalizeAmount(award.awardAmount))
    current.traineeShareAmount = roundCurrency(
      current.traineeShareAmount + normalizeAmount(award.traineeShareAmount),
    )
    current.billedSponsorAmount = roundCurrency(
      current.billedSponsorAmount +
        (String(award.awardType || '') === 'third_party_billed'
          ? normalizeAmount(award.awardAmount)
          : 0),
    )
    map.set(key, current)
  }

  return Array.from(map.values()).sort((left, right) => right.awardedAmount - left.awardedAmount)
}
