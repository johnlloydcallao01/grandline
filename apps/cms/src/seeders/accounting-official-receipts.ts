import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../payload.config'
import { ACCOUNTING_COLLECTION_SLUGS } from '../accounting/constants/accounting'

type PaymentDoc = {
  id: number | string
  receiptNumber?: string | null
  customer?:
    | {
        id?: number | string
      }
    | number
    | string
    | null
  paymentDate?: string | null
  postingDate?: string | null
  amountReceived?: number | null
  currency?: string | null
}

type ReceiptDoc = {
  id: number | string
  paymentReceived?:
    | {
        id?: number | string
      }
    | number
    | string
    | null
}

type UserDoc = {
  id: number | string
}

type MediaDoc = {
  id: number | string
}

type SeedOfficialReceiptRecord = {
  receiptNumber: string
  paymentReceived: number | string
  customer: number | string
  receiptDate: string
  amount: number
  currency: string
  status: 'draft' | 'issued' | 'voided'
  proofDocument?: number | string
  issuedBy?: number | string | null
  voidedAt?: string
  voidedBy?: number | string | null
  notes: string
  createdBy?: number | string | null
  updatedBy?: number | string | null
}

const SAMPLE_COUNT = 20

const baseDates = [
  '2026-05-02',
  '2026-05-04',
  '2026-05-06',
  '2026-05-08',
  '2026-05-10',
  '2026-05-12',
  '2026-05-14',
  '2026-05-16',
  '2026-05-18',
  '2026-05-20',
  '2026-05-22',
  '2026-05-24',
  '2026-05-26',
  '2026-05-28',
  '2026-05-30',
  '2026-06-01',
  '2026-06-03',
  '2026-06-05',
  '2026-06-07',
  '2026-06-09',
] as const

const getRelationshipId = (value: PaymentDoc['customer'] | ReceiptDoc['paymentReceived']) => {
  if (!value) return null
  if (typeof value === 'number' || typeof value === 'string') return value
  return value.id ?? null
}

async function seedAccountingOfficialReceipts() {
  const payload = await getPayload({ config })

  const [adminUsers, paymentResult, receiptResult, mediaResult] = await Promise.all([
    payload.find({
      collection: 'users',
      where: { role: { equals: 'admin' } } as never,
      limit: 1,
      depth: 0,
      overrideAccess: true,
    }),
    payload.find({
      collection: ACCOUNTING_COLLECTION_SLUGS.paymentsReceived as any,
      limit: 500,
      depth: 1,
      sort: '-paymentDate',
      overrideAccess: true,
    }),
    payload.find({
      collection: ACCOUNTING_COLLECTION_SLUGS.receipts as any,
      limit: 500,
      depth: 0,
      sort: '-receiptDate',
      overrideAccess: true,
    }),
    payload.find({
      collection: 'media',
      limit: 100,
      depth: 0,
      sort: '-updatedAt',
      overrideAccess: true,
    }),
  ])

  const adminId = (adminUsers.docs[0] as UserDoc | undefined)?.id ?? null
  const payments = paymentResult.docs as PaymentDoc[]
  const existingReceipts = receiptResult.docs as ReceiptDoc[]
  const mediaDocs = mediaResult.docs as MediaDoc[]

  if (payments.length === 0) {
    throw new Error('No payment received records were found. Seed payments received first, then rerun this official-receipts seeder.')
  }

  const linkedPaymentIds = new Set(
    existingReceipts
      .map((receipt) => getRelationshipId(receipt.paymentReceived))
      .filter((paymentId): paymentId is number | string => paymentId !== null)
      .map((paymentId) => String(paymentId)),
  )

  const availablePayments = payments.filter((payment) => !linkedPaymentIds.has(String(payment.id)))
  let paymentCursor = 0
  let createdCount = 0
  let skippedCount = 0

  for (let index = 0; index < SAMPLE_COUNT; index += 1) {
    const sequence = index + 1
    const receiptNumber = `OR-SEED-2026-${String(sequence).padStart(3, '0')}`
    const noteSeedKey = `[seed:official-receipt-${String(sequence).padStart(3, '0')}]`
    const notes = `${noteSeedKey} Sample official receipt seeded for receipts-customer-balances coverage.`

    const existing = await payload.find({
      collection: ACCOUNTING_COLLECTION_SLUGS.receipts as any,
      where: {
        or: [
          {
            receiptNumber: {
              equals: receiptNumber,
            },
          },
          {
            notes: {
              equals: notes,
            },
          },
        ],
      } as never,
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })

    if (existing.docs[0]) {
      skippedCount += 1
      console.log(`Skipped official receipt seed ${receiptNumber} (already exists)`)
      continue
    }

    const payment = availablePayments[paymentCursor]
    paymentCursor += 1

    if (!payment) {
      throw new Error(
        `Not enough unlinked payments received were found to create ${SAMPLE_COUNT} official receipts. Available unlinked payments: ${availablePayments.length}.`,
      )
    }

    const customerId = getRelationshipId(payment.customer)
    if (!customerId) {
      throw new Error(`Payment ${payment.id} does not have a linked customer and cannot be used for official receipt seeding.`)
    }

    const status: SeedOfficialReceiptRecord['status'] =
      sequence % 5 === 0 ? 'voided' : sequence % 2 === 0 ? 'issued' : 'draft'
    const receiptDate = payment.paymentDate || payment.postingDate || `${baseDates[index]}T11:00:00.000Z`
    const proofDocument = mediaDocs.length > 0 && sequence % 3 !== 0 ? mediaDocs[index % mediaDocs.length]?.id : undefined
    const voidedAt = status === 'voided' ? `${baseDates[index]}T17:30:00.000Z` : undefined

    const data: SeedOfficialReceiptRecord = {
      receiptNumber,
      paymentReceived: payment.id,
      customer: customerId,
      receiptDate,
      amount: Number(payment.amountReceived || 0),
      currency: String(payment.currency || 'PHP'),
      status,
      proofDocument,
      issuedBy: status === 'issued' || status === 'voided' ? adminId : undefined,
      voidedAt,
      voidedBy: status === 'voided' ? adminId : undefined,
      notes,
      createdBy: adminId,
      updatedBy: adminId,
    }

    await payload.create({
      collection: ACCOUNTING_COLLECTION_SLUGS.receipts as any,
      data,
      depth: 0,
      overrideAccess: true,
    })

    createdCount += 1
    console.log(`Created official receipt seed ${receiptNumber} for payment ${payment.receiptNumber || payment.id}`)
  }

  const total = await payload.count({
    collection: ACCOUNTING_COLLECTION_SLUGS.receipts as any,
    overrideAccess: true,
  })

  console.log(`Done. Official receipts created: ${createdCount}, skipped: ${skippedCount}, total now: ${total.totalDocs}`)
}

seedAccountingOfficialReceipts()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Failed to seed accounting official receipts:', error)
    process.exit(1)
  })
