import { APIError, type CollectionConfig } from 'payload'
import { adminOnly } from '../../access'
import {
  ACCOUNTING_ADMIN_GROUP,
  ACCOUNTING_COLLECTION_SLUGS,
  BOUNCED_PAYMENT_CASE_STATUS_OPTIONS,
  BOUNCED_PAYMENT_REASON_OPTIONS,
} from '../constants/accounting'
import { applyCreatedAndUpdatedBy, getRelationshipId, getRequestUserId } from '../utils/accounting-audit'
import { normalizeOptionalText } from '../utils/commercial'

const normalizeNonNegativeNumber = (value: unknown, fallback = 0) => {
  const parsed = Number(value)
  if (!Number.isFinite(parsed) || parsed < 0) return fallback
  return Math.round((parsed + Number.EPSILON) * 100) / 100
}

const normalizeNullableDate = (value: unknown) => {
  if (value === undefined) return undefined
  if (value === null || value === '') return null
  const date = new Date(String(value))
  if (Number.isNaN(date.getTime())) return null
  return date.toISOString()
}

const generateBounceCaseNumber = () => {
  const stamp = new Date().toISOString().replace(/\D/g, '').slice(0, 14)
  const suffix = Math.floor(100 + Math.random() * 900)
  return `BNC-${stamp}-${suffix}`
}

export const AccountingBouncedPayments: CollectionConfig = {
  slug: ACCOUNTING_COLLECTION_SLUGS.bouncedPayments,
  admin: {
    useAsTitle: 'caseNumber',
    defaultColumns: ['caseNumber', 'customer', 'originalReceiptNumber', 'bounceReason', 'caseStatus'],
    group: ACCOUNTING_ADMIN_GROUP,
    description:
      'Bounced customer payment cases with original receipt linkage, reversal journals, bank charges, and recovery tracking.',
  },
  access: {
    read: adminOnly,
    create: adminOnly,
    update: adminOnly,
    delete: adminOnly,
  },
  fields: [
    { name: 'caseNumber', type: 'text', required: true, index: true },
    { name: 'originalPayment', type: 'relationship', relationTo: ACCOUNTING_COLLECTION_SLUGS.paymentsReceived, required: true, index: true },
    { name: 'customer', type: 'relationship', relationTo: ACCOUNTING_COLLECTION_SLUGS.customers, required: true, index: true },
    { name: 'originalReceiptNumber', type: 'text', required: true, index: true, admin: { readOnly: true } },
    { name: 'originalPaymentDate', type: 'date', admin: { readOnly: true } },
    { name: 'originalPaymentAmount', type: 'number', min: 0, defaultValue: 0, admin: { readOnly: true } },
    { name: 'originalDepositAccount', type: 'relationship', relationTo: ACCOUNTING_COLLECTION_SLUGS.bankAccounts, index: true, admin: { readOnly: true } },
    { name: 'originalJournalEntry', type: 'relationship', relationTo: ACCOUNTING_COLLECTION_SLUGS.journalEntries, required: true, index: true, admin: { readOnly: true } },
    { name: 'bounceDate', type: 'date', required: true, index: true },
    { name: 'bankNoticeDate', type: 'date' },
    { name: 'bounceReason', type: 'select', required: true, defaultValue: 'insufficient_funds', options: [...BOUNCED_PAYMENT_REASON_OPTIONS], index: true },
    { name: 'caseStatus', type: 'select', required: true, defaultValue: 'open', options: [...BOUNCED_PAYMENT_CASE_STATUS_OPTIONS], index: true },
    { name: 'bankChargeAmount', type: 'number', min: 0, defaultValue: 0 },
    { name: 'chargeExpenseAccount', type: 'relationship', relationTo: ACCOUNTING_COLLECTION_SLUGS.chartOfAccounts },
    { name: 'reversalJournalEntry', type: 'relationship', relationTo: ACCOUNTING_COLLECTION_SLUGS.journalEntries, admin: { readOnly: true } },
    { name: 'chargeJournalEntry', type: 'relationship', relationTo: ACCOUNTING_COLLECTION_SLUGS.journalEntries, admin: { readOnly: true } },
    { name: 'recoveryPayment', type: 'relationship', relationTo: ACCOUNTING_COLLECTION_SLUGS.paymentsReceived },
    { name: 'recoveryDate', type: 'date' },
    { name: 'followUpDate', type: 'date' },
    { name: 'resolutionDate', type: 'date' },
    { name: 'notes', type: 'textarea' },
    { name: 'resolutionNotes', type: 'textarea' },
    { name: 'createdBy', type: 'relationship', relationTo: 'users', admin: { readOnly: true, position: 'sidebar' } },
    { name: 'updatedBy', type: 'relationship', relationTo: 'users', admin: { readOnly: true, position: 'sidebar' } },
  ],
  hooks: {
    beforeChange: [
      async ({ data, req, originalDoc }) => {
        if (!data) return data

        data.caseNumber = String(data.caseNumber || originalDoc?.caseNumber || generateBounceCaseNumber()).trim()
        data.bounceDate = normalizeNullableDate(data.bounceDate ?? originalDoc?.bounceDate)
        data.bankNoticeDate = normalizeNullableDate(data.bankNoticeDate ?? originalDoc?.bankNoticeDate)
        data.recoveryDate = normalizeNullableDate(data.recoveryDate ?? originalDoc?.recoveryDate)
        data.followUpDate = normalizeNullableDate(data.followUpDate ?? originalDoc?.followUpDate)
        data.resolutionDate = normalizeNullableDate(data.resolutionDate ?? originalDoc?.resolutionDate)
        data.notes = normalizeOptionalText(data.notes)
        data.resolutionNotes = normalizeOptionalText(data.resolutionNotes)
        data.bankChargeAmount = normalizeNonNegativeNumber(data.bankChargeAmount, normalizeNonNegativeNumber(originalDoc?.bankChargeAmount))
        data.bounceReason = String(data.bounceReason || originalDoc?.bounceReason || 'insufficient_funds').trim() || 'insufficient_funds'
        data.caseStatus = String(data.caseStatus || originalDoc?.caseStatus || 'open').trim() || 'open'

        const originalPaymentId = getRelationshipId(data.originalPayment ?? originalDoc?.originalPayment)
        if (!originalPaymentId) {
          throw new APIError('Original payment is required.', 400)
        }

        const originalPayment = await req.payload.findByID({
          collection: ACCOUNTING_COLLECTION_SLUGS.paymentsReceived,
          id: originalPaymentId,
          depth: 1,
          overrideAccess: true,
        })

        if (!originalPayment) {
          throw new APIError('Original payment could not be found.', 404)
        }

        if (String(originalPayment.status || '') !== 'posted') {
          throw new APIError('Only posted payment receipts can be used for bounced-payment cases.', 400)
        }

        const originalJournalEntryId = getRelationshipId(originalPayment.postedJournalEntry)
        if (!originalJournalEntryId) {
          throw new APIError('The original payment must have a posted journal entry before a bounced-payment case can be created.', 400)
        }

        const customerId = getRelationshipId(originalPayment.customer)
        if (!customerId) {
          throw new APIError('The original payment must have a linked customer.', 400)
        }

        data.originalPayment = originalPaymentId
        data.customer = customerId
        data.originalReceiptNumber = String(originalPayment.receiptNumber || `Receipt ${originalPayment.id}`)
        data.originalPaymentDate = normalizeNullableDate(originalPayment.paymentDate ?? originalPayment.postingDate ?? null)
        data.originalPaymentAmount = normalizeNonNegativeNumber(originalPayment.amountReceived)
        data.originalDepositAccount = getRelationshipId(originalPayment.depositAccount) || null
        data.originalJournalEntry = originalJournalEntryId

        if (data.bankChargeAmount > 0 && !getRelationshipId(data.chargeExpenseAccount ?? originalDoc?.chargeExpenseAccount)) {
          throw new APIError('Charge expense account is required when a bank charge amount is entered.', 400)
        }

        const recoveryPaymentId = getRelationshipId(data.recoveryPayment ?? originalDoc?.recoveryPayment)
        if (recoveryPaymentId) {
          const recoveryPayment = await req.payload.findByID({
            collection: ACCOUNTING_COLLECTION_SLUGS.paymentsReceived,
            id: recoveryPaymentId,
            depth: 1,
            overrideAccess: true,
          })

          if (!recoveryPayment) {
            throw new APIError('Recovery payment could not be found.', 404)
          }

          if (String(recoveryPayment.status || '') !== 'posted') {
            throw new APIError('Recovery payment must be posted before it can be linked to a bounced-payment case.', 400)
          }

          const recoveryCustomerId = getRelationshipId(recoveryPayment.customer)
          if (String(recoveryCustomerId || '') !== String(customerId)) {
            throw new APIError('Recovery payment must belong to the same customer as the original payment.', 400)
          }

          data.recoveryPayment = recoveryPaymentId
        }

        if (getRelationshipId(data.reversalJournalEntry ?? originalDoc?.reversalJournalEntry)) {
          data.caseStatus =
            getRelationshipId(data.recoveryPayment ?? originalDoc?.recoveryPayment) || data.resolutionDate
              ? 'resolved'
              : data.caseStatus === 'written_off'
                ? 'written_off'
                : 'collections_follow_up'
        }

        if (data.caseStatus === 'resolved' && !data.resolutionDate) {
          data.resolutionDate = new Date().toISOString()
        }

        if (!originalDoc?.createdBy) {
          data.createdBy = data.createdBy || getRequestUserId(req)
        }

        applyCreatedAndUpdatedBy({ data, originalDoc, req })
        return data
      },
    ],
    beforeDelete: [
      async ({ req, id }) => {
        const record = await req.payload.findByID({
          collection: ACCOUNTING_COLLECTION_SLUGS.bouncedPayments,
          id,
          depth: 0,
          overrideAccess: true,
        })

        if (record?.reversalJournalEntry || record?.chargeJournalEntry) {
          throw new APIError('Bounced-payment cases with posted reversal or charge journals cannot be deleted.', 400)
        }
      },
    ],
  },
}
