import 'dotenv/config'
import { getPayload, type Payload } from 'payload'
import config from '../payload.config'
import {
  ACCOUNTING_COLLECTION_SLUGS,
  BOUNCED_PAYMENT_REASON_OPTIONS,
} from '../accounting/constants/accounting'
import { AccountingCommercialService } from '../accounting/services/AccountingCommercialService'
import { AccountingManualWorkflowService } from '../accounting/services/journals/AccountingManualWorkflowService'
import { AccountingPaymentReceivedService } from '../accounting/services/payments/AccountingPaymentReceivedService'
import { AccountingPeriodService } from '../accounting/services/periods/AccountingPeriodService'
import { getRelationshipId } from '../accounting/utils/accounting-audit'

type UserDoc = {
  id: number | string
}

type CustomerDoc = {
  id: number | string
  customerCode?: string | null
  displayName?: string | null
  status?: string | null
}

type BankAccountDoc = {
  id: number | string
  accountName?: string | null
  bankName?: string | null
  accountType?: string | null
  isActive?: boolean | null
  ledgerAccount?: number | string | { id?: number | string | null } | null
}

type ChartAccountDoc = {
  id: number | string
  code?: string | null
  name?: string | null
  accountType?: string | null
  accountSubType?: string | null
  isActive?: boolean | null
}

type FiscalYearDoc = {
  id: number | string
  startDate?: string | null
  endDate?: string | null
  lockedFromDate?: string | null
  status?: string | null
}

type PeriodDoc = {
  id: number | string
  fiscalYear?: number | string | { id?: number | string | null } | null
  startDate?: string | null
  endDate?: string | null
  lockedFromDate?: string | null
  status?: string | null
}

type PaymentDoc = {
  id: number | string
  receiptNumber?: string | null
  status?: string | null
  notes?: string | null
  customer?: number | string | { id?: number | string | null } | null
  depositAccount?: number | string | BankAccountDoc | null
  undepositedFundsAccount?: number | string | { id?: number | string | null } | null
  amountReceived?: number | null
  paymentDate?: string | null
  postingDate?: string | null
  postedJournalEntry?: number | string | { id?: number | string | null } | null
}

type BouncedPaymentDoc = {
  id: number | string
  caseNumber?: string | null
  originalPayment?: number | string | PaymentDoc | null
  originalJournalEntry?: number | string | { id?: number | string | null } | null
  bounceDate?: string | null
  bankNoticeDate?: string | null
  bankChargeAmount?: number | null
  chargeExpenseAccount?: number | string | ChartAccountDoc | null
  reversalJournalEntry?: number | string | { id?: number | string | null } | null
  chargeJournalEntry?: number | string | { id?: number | string | null } | null
  recoveryPayment?: number | string | PaymentDoc | null
  caseStatus?: string | null
  resolutionDate?: string | null
}

type PaymentMethod = 'bank_transfer' | 'check' | 'card'

type BounceTemplate = {
  caseNumber: string
  originalReceiptNumber: string
  recoveryReceiptNumber: string
  originalReferenceNumber: string
  recoveryReferenceNumber: string
  originalPaymentDate: string
  bounceDate: string
  bankNoticeDate: string
  followUpDate: string
  recoveryDate: string
  resolutionDate: string
  amountReceived: number
  recoveryAmount: number
  bankChargeAmount: number
  bounceReason: string
  paymentMethod: PaymentMethod
  initialCaseStatus: 'open' | 'awaiting_reversal' | 'collections_follow_up' | 'written_off'
  shouldReverse: boolean
  shouldRecover: boolean
  shouldResolveWithoutRecovery: boolean
  notes: string
  recoveryNotes: string
}

const SAMPLE_COUNT = 20
const PAYMENT_METHODS: PaymentMethod[] = ['bank_transfer', 'check', 'card']
const BOUNCE_REASONS = BOUNCED_PAYMENT_REASON_OPTIONS.map((option) => option.value)

const roundAmount = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100

const setIsoHour = (dateValue: string, hour = 9) => {
  const date = new Date(dateValue)
  date.setUTCHours(hour, 0, 0, 0)
  return date.toISOString()
}

const buildAllowedPostingDates = (fiscalYear: FiscalYearDoc, periods: PeriodDoc[]) => {
  const fiscalLockFloor = fiscalYear.lockedFromDate ? new Date(fiscalYear.lockedFromDate) : null
  const allowedDates: string[] = []

  for (const period of periods) {
    if (!period.startDate || !period.endDate) continue

    const periodStart = new Date(period.startDate)
    const periodEnd = new Date(period.endDate)
    const firstAllowedDate = new Date(periodStart)

    if (period.lockedFromDate) {
      const periodLockFloor = new Date(period.lockedFromDate)
      periodLockFloor.setUTCDate(periodLockFloor.getUTCDate() + 1)
      if (periodLockFloor.getTime() > firstAllowedDate.getTime()) {
        firstAllowedDate.setTime(periodLockFloor.getTime())
      }
    }

    if (fiscalLockFloor) {
      const fiscalAllowedDate = new Date(fiscalLockFloor)
      fiscalAllowedDate.setUTCDate(fiscalAllowedDate.getUTCDate() + 1)
      if (fiscalAllowedDate.getTime() > firstAllowedDate.getTime()) {
        firstAllowedDate.setTime(fiscalAllowedDate.getTime())
      }
    }

    for (const cursor = new Date(firstAllowedDate); cursor.getTime() <= periodEnd.getTime(); cursor.setUTCDate(cursor.getUTCDate() + 1)) {
      allowedDates.push(setIsoHour(cursor.toISOString(), 9))
    }
  }

  return Array.from(new Set(allowedDates)).sort((left, right) => new Date(left).getTime() - new Date(right).getTime())
}

const pickPostingDate = (postingDates: string[], index: number, hour = 9) => {
  const safeIndex = Math.min(index, postingDates.length - 1)
  return setIsoHour(postingDates[safeIndex], hour)
}

const buildTemplates = (postingDates: string[]): BounceTemplate[] =>
  Array.from({ length: SAMPLE_COUNT }, (_, index) => {
    const sequence = index + 1
    const padded = String(sequence).padStart(3, '0')
    const originalPaymentDate = pickPostingDate(postingDates, index, 9)
    const bounceDate = pickPostingDate(postingDates, index + 1, 11)
    const bankNoticeDate = pickPostingDate(postingDates, index + 2, 14)
    const followUpDate = pickPostingDate(postingDates, index + 4, 10)
    const recoveryDate = pickPostingDate(postingDates, index + 5, 9)
    const resolutionDate = pickPostingDate(postingDates, index + 6, 16)
    const amountReceived = roundAmount(2450 + sequence * 285 + (index % 4) * 112.5)
    const recoveryAmount = roundAmount(amountReceived * (0.72 + (index % 2) * 0.08))
    const bankChargeAmount = sequence % 3 === 0 || sequence % 5 === 0 ? roundAmount(125 + sequence * 8.5) : 0
    const shouldReverse = sequence % 2 === 0 || sequence % 5 === 0
    const shouldRecover = shouldReverse && (sequence % 4 === 0 || sequence % 5 === 0)
    const shouldResolveWithoutRecovery = shouldReverse && !shouldRecover && sequence % 6 === 0
    const shouldWriteOff = shouldReverse && !shouldRecover && !shouldResolveWithoutRecovery && sequence % 7 === 0
    const initialCaseStatus =
      shouldWriteOff
        ? 'written_off'
        : shouldReverse
          ? 'awaiting_reversal'
          : sequence % 3 === 0
            ? 'collections_follow_up'
            : 'open'
    const seedKey = `[seed:bounced-payment-${padded}]`

    return {
      caseNumber: `BNC-SAMPLE-202606-${padded}`,
      originalReceiptNumber: `RCT-BNC-ORIG-2026-${padded}`,
      recoveryReceiptNumber: `RCT-BNC-RCV-2026-${padded}`,
      originalReferenceNumber: `REF-BNC-ORIG-${String(sequence).padStart(4, '0')}`,
      recoveryReferenceNumber: `REF-BNC-RCV-${String(sequence).padStart(4, '0')}`,
      originalPaymentDate,
      bounceDate,
      bankNoticeDate,
      followUpDate,
      recoveryDate,
      resolutionDate,
      amountReceived,
      recoveryAmount,
      bankChargeAmount,
      bounceReason: BOUNCE_REASONS[index % BOUNCE_REASONS.length] || 'insufficient_funds',
      paymentMethod: PAYMENT_METHODS[index % PAYMENT_METHODS.length],
      initialCaseStatus,
      shouldReverse,
      shouldRecover,
      shouldResolveWithoutRecovery,
      notes: `${seedKey} Sample bounced-payment case seeded for cash-movement coverage.`,
      recoveryNotes: `${seedKey} Recovery receipt created for a bounced-payment sample case.`,
    }
  })

const pickChargeAccount = (accounts: ChartAccountDoc[], index: number) => {
  const preferred = accounts.filter((account) => {
    const label = `${account.code || ''} ${account.name || ''} ${account.accountSubType || ''}`.toLowerCase()
    return account.accountType === 'expense' && /bank|fee|charge|penalty|expense|service/.test(label)
  })

  const expenseAccounts = accounts.filter((account) => account.accountType === 'expense')
  const pool = preferred.length > 0 ? preferred : expenseAccounts.length > 0 ? expenseAccounts : accounts
  return pool[index % pool.length] || null
}

const pickBankAccount = (accounts: BankAccountDoc[], index: number) => accounts[index % accounts.length] || null

const pickReceivableAccount = (accounts: ChartAccountDoc[]) => {
  const preferred = accounts.filter((account) => {
    const label = `${account.code || ''} ${account.name || ''} ${account.accountSubType || ''}`.toLowerCase()
    return account.accountType === 'asset' && /receivable|accounts receivable|\bar\b|trade debtors|customer/.test(label)
  })

  const assetAccounts = accounts.filter((account) => account.accountType === 'asset')
  return preferred[0] || assetAccounts[0] || accounts[0] || null
}

const takeReusablePostedPayment = (
  payments: PaymentDoc[],
  consumedIds: Set<string>,
  customerId?: number | string | null,
  requireCustomerMatch = false,
) => {
  const exactCustomerMatch =
    customerId !== undefined && customerId !== null
      ? payments.find((payment) => {
          const paymentId = String(payment.id)
          if (consumedIds.has(paymentId)) return false
          return String(getRelationshipId(payment.customer) || '') === String(customerId)
        })
      : null

  if (exactCustomerMatch) {
    consumedIds.add(String(exactCustomerMatch.id))
    return exactCustomerMatch
  }

  if (requireCustomerMatch) {
    return null
  }

  const fallback = payments.find((payment) => !consumedIds.has(String(payment.id))) || null
  if (fallback) {
    consumedIds.add(String(fallback.id))
  }

  return fallback
}

const getPaymentBankAccountId = (payment: PaymentDoc) => getRelationshipId(payment.depositAccount)

const isMissingReceivableSettingError = (error: unknown) =>
  error instanceof Error && /defaultReceivableAccount/i.test(error.message)

const findExistingPayment = async (payload: Payload, receiptNumber: string, notes: string) => {
  const existing = await payload.find({
    collection: ACCOUNTING_COLLECTION_SLUGS.paymentsReceived as any,
    where: {
      or: [
        { receiptNumber: { equals: receiptNumber } },
        { notes: { equals: notes } },
      ],
    } as never,
    limit: 1,
    depth: 2,
    overrideAccess: true,
  })

  return (existing.docs[0] as PaymentDoc | undefined) ?? null
}

async function ensurePostedPayment(args: {
  payload: Payload
  adminId: number | string | null
  fallbackReceivableAccountId: number | string | null
  customerId: number | string
  bankAccountId: number | string
  receiptNumber: string
  referenceNumber: string
  paymentDate: string
  postingDate: string
  amountReceived: number
  paymentMethod: PaymentMethod
  notes: string
}) {
  const {
    payload,
    adminId,
    fallbackReceivableAccountId,
    customerId,
    bankAccountId,
    receiptNumber,
    referenceNumber,
    paymentDate,
    postingDate,
    amountReceived,
    paymentMethod,
    notes,
  } = args

  let payment = await findExistingPayment(payload, receiptNumber, notes)
  let created = false
  let posted = false

  if (!payment) {
    payment = (await payload.create({
      collection: ACCOUNTING_COLLECTION_SLUGS.paymentsReceived as any,
      data: {
        receiptNumber,
        customer: customerId,
        paymentDate,
        postingDate,
        paymentMethod,
        depositAccount: bankAccountId,
        amountReceived,
        currency: 'PHP',
        exchangeRate: 1,
        status: 'draft',
        applications: [],
        referenceNumber,
        notes,
        createdBy: adminId,
        updatedBy: adminId,
      },
      depth: 2,
      overrideAccess: true,
    })) as PaymentDoc

    created = true
  } else if (String(payment.status || '') !== 'posted') {
    payment = (await payload.update({
      collection: ACCOUNTING_COLLECTION_SLUGS.paymentsReceived as any,
      id: payment.id,
      overrideAccess: true,
      depth: 2,
      data: {
        customer: customerId,
        paymentDate,
        postingDate,
        paymentMethod,
        depositAccount: bankAccountId,
        amountReceived,
        referenceNumber,
        notes,
        updatedBy: adminId,
      } as never,
    })) as PaymentDoc
  }

  if (String(payment.status || '') !== 'posted') {
    try {
      payment = (await AccountingPaymentReceivedService.postPayment({
        payload,
        paymentId: payment.id,
        userId: adminId,
      })) as PaymentDoc
    } catch (error) {
      if (!fallbackReceivableAccountId || !isMissingReceivableSettingError(error)) {
        throw error
      }

      const bankAccount =
        typeof payment.depositAccount === 'object' && payment.depositAccount !== null
          ? payment.depositAccount
          : payment.depositAccount
            ? ((await payload.findByID({
                collection: ACCOUNTING_COLLECTION_SLUGS.bankAccounts as any,
                id: payment.depositAccount,
                depth: 1,
                overrideAccess: true,
              })) as BankAccountDoc)
            : null
      const cashAccountId =
        getRelationshipId(bankAccount?.ledgerAccount) ||
        getRelationshipId(payment.undepositedFundsAccount) ||
        (await AccountingCommercialService.getDefaultAccountId(payload, 'defaultUndepositedFundsAccount'))

      if (!cashAccountId) {
        throw new Error(`Unable to determine the cash account for payment ${receiptNumber}.`)
      }

      const journalEntry = await AccountingManualWorkflowService.createStructuredJournal({
        payload,
        userId: adminId,
        sourceType: 'system',
        entryDate: payment.paymentDate || payment.postingDate || new Date().toISOString(),
        postingDate: payment.postingDate || payment.paymentDate || new Date().toISOString(),
        memo: payment.notes || `Payment received ${payment.receiptNumber || payment.id}`,
        referenceNumber: payment.receiptNumber || undefined,
        sourceReference: payment.receiptNumber || undefined,
        autoPost: true,
        lines: [
          {
            account: cashAccountId,
            description: `Receipt ${payment.receiptNumber || payment.id}`,
            debit: roundAmount(Number(payment.amountReceived || 0)),
            credit: 0,
          },
          {
            account: fallbackReceivableAccountId,
            description: `Clear receivable for receipt ${payment.receiptNumber || payment.id}`,
            debit: 0,
            credit: roundAmount(Number(payment.amountReceived || 0)),
          },
        ],
      })

      payment = (await payload.update({
        collection: ACCOUNTING_COLLECTION_SLUGS.paymentsReceived as any,
        id: payment.id,
        overrideAccess: true,
        depth: 2,
        data: {
          status: 'posted',
          fiscalYear: getRelationshipId(journalEntry.fiscalYear) || undefined,
          period: getRelationshipId(journalEntry.period) || undefined,
          postedJournalEntry: journalEntry.id,
        } as never,
      })) as PaymentDoc
    }

    posted = true
  }

  if (!getRelationshipId(payment.postedJournalEntry)) {
    throw new Error(`Payment ${receiptNumber} is missing a posted journal entry after posting.`)
  }

  return { payment, created, posted }
}

const findExistingBounceCase = async (
  payload: Payload,
  caseNumber: string,
  notes: string,
  originalPaymentId?: number | string | null,
) => {
  const predicates: Array<Record<string, unknown>> = [
    { caseNumber: { equals: caseNumber } },
    { notes: { equals: notes } },
  ]

  if (originalPaymentId !== undefined && originalPaymentId !== null) {
    predicates.push({ originalPayment: { equals: originalPaymentId } })
  }

  const existing = await payload.find({
    collection: ACCOUNTING_COLLECTION_SLUGS.bouncedPayments as any,
    where: {
      or: predicates,
    } as never,
    limit: 1,
    depth: 2,
    overrideAccess: true,
  })

  return (existing.docs[0] as BouncedPaymentDoc | undefined) ?? null
}

async function ensureBounceCase(args: {
  payload: Payload
  adminId: number | string | null
  originalPaymentId: number | string
  chargeExpenseAccountId: number | string | null
  template: BounceTemplate
}) {
  const { payload, adminId, originalPaymentId, chargeExpenseAccountId, template } = args
  let bounceCase = await findExistingBounceCase(payload, template.caseNumber, template.notes, originalPaymentId)
  let created = false

  if (!bounceCase) {
    bounceCase = (await payload.create({
      collection: ACCOUNTING_COLLECTION_SLUGS.bouncedPayments as any,
      depth: 2,
      overrideAccess: true,
      data: {
        caseNumber: template.caseNumber,
        originalPayment: originalPaymentId,
        bounceDate: template.bounceDate,
        bankNoticeDate: template.bankNoticeDate,
        bounceReason: template.bounceReason,
        caseStatus: template.initialCaseStatus,
        bankChargeAmount: template.bankChargeAmount,
        chargeExpenseAccount: template.bankChargeAmount > 0 ? chargeExpenseAccountId || undefined : undefined,
        followUpDate:
          template.initialCaseStatus === 'collections_follow_up' || template.initialCaseStatus === 'written_off'
            ? template.followUpDate
            : undefined,
        notes: template.notes,
        createdBy: adminId,
        updatedBy: adminId,
      } as never,
    })) as BouncedPaymentDoc
    created = true
  }

  return { bounceCase, created }
}

async function reverseBounceCase(args: {
  payload: Payload
  adminId: number | string | null
  caseRecord: BouncedPaymentDoc
}) {
  const { payload, adminId } = args
  let { caseRecord } = args

  if (getRelationshipId(caseRecord.reversalJournalEntry)) {
    return { caseRecord, reversed: false, charged: false }
  }

  const originalJournalEntryId = getRelationshipId(caseRecord.originalJournalEntry)
  if (!originalJournalEntryId) {
    throw new Error(`Bounce case ${caseRecord.caseNumber || caseRecord.id} is missing the original journal entry.`)
  }

  const reversalJournal = await AccountingManualWorkflowService.createReversalEntry({
    payload,
    journalEntryId: originalJournalEntryId,
    userId: adminId,
    postingDate: caseRecord.bounceDate || caseRecord.bankNoticeDate || new Date().toISOString(),
    entryDate: caseRecord.bounceDate || caseRecord.bankNoticeDate || new Date().toISOString(),
    memo: `Bounced payment reversal for ${caseRecord.caseNumber || `case ${caseRecord.id}`}`,
    referenceNumber: caseRecord.caseNumber || undefined,
  })

  let chargeJournalId: number | string | null = null
  const bankChargeAmount = roundAmount(Number(caseRecord.bankChargeAmount || 0))

  if (bankChargeAmount > 0) {
    const chargeExpenseAccountId = getRelationshipId(caseRecord.chargeExpenseAccount)
    if (!chargeExpenseAccountId) {
      throw new Error(`Bounce case ${caseRecord.caseNumber || caseRecord.id} is missing the charge expense account.`)
    }

    const originalPayment =
      typeof caseRecord.originalPayment === 'object' && caseRecord.originalPayment
        ? caseRecord.originalPayment
        : caseRecord.originalPayment
          ? ((await payload.findByID({
              collection: ACCOUNTING_COLLECTION_SLUGS.paymentsReceived as any,
              id: caseRecord.originalPayment,
              depth: 2,
              overrideAccess: true,
            })) as PaymentDoc)
          : null

    const originalDepositAccount =
      originalPayment && typeof originalPayment.depositAccount === 'object'
        ? originalPayment.depositAccount
        : getRelationshipId(originalPayment?.depositAccount)
          ? ((await payload.findByID({
              collection: ACCOUNTING_COLLECTION_SLUGS.bankAccounts as any,
              id: getRelationshipId(originalPayment?.depositAccount) as number | string,
              depth: 1,
              overrideAccess: true,
            })) as BankAccountDoc)
          : null

    const creditAccountId =
      getRelationshipId(originalDepositAccount?.ledgerAccount) ||
      getRelationshipId(originalPayment?.undepositedFundsAccount) ||
      (await AccountingCommercialService.getDefaultAccountId(payload, 'defaultUndepositedFundsAccount'))

    const chargeJournal = await AccountingManualWorkflowService.createStructuredJournal({
      payload,
      userId: adminId,
      sourceType: 'system',
      entryDate: caseRecord.bounceDate || caseRecord.bankNoticeDate || new Date().toISOString(),
      postingDate: caseRecord.bounceDate || caseRecord.bankNoticeDate || new Date().toISOString(),
      memo: `Bank charge for bounced payment ${caseRecord.caseNumber || caseRecord.id}`,
      referenceNumber: caseRecord.caseNumber || undefined,
      sourceReference:
        originalPayment && typeof originalPayment === 'object' ? originalPayment.receiptNumber || undefined : undefined,
      autoPost: true,
      lines: [
        {
          account: chargeExpenseAccountId,
          description: `Bank charge for ${caseRecord.caseNumber || caseRecord.id}`,
          debit: bankChargeAmount,
          credit: 0,
        },
        {
          account: creditAccountId,
          description: `Cash reduction for ${caseRecord.caseNumber || caseRecord.id}`,
          debit: 0,
          credit: bankChargeAmount,
        },
      ],
    })

    chargeJournalId = chargeJournal.id
  }

  caseRecord = (await payload.update({
    collection: ACCOUNTING_COLLECTION_SLUGS.bouncedPayments as any,
    id: caseRecord.id,
    overrideAccess: true,
    depth: 2,
    data: {
      reversalJournalEntry: reversalJournal.id,
      chargeJournalEntry: chargeJournalId || undefined,
      caseStatus:
        getRelationshipId(caseRecord.recoveryPayment) || caseRecord.resolutionDate
          ? 'resolved'
          : caseRecord.caseStatus === 'written_off'
            ? 'written_off'
            : 'collections_follow_up',
      updatedBy: adminId,
    } as never,
  })) as BouncedPaymentDoc

  return { caseRecord, reversed: true, charged: Boolean(chargeJournalId) }
}

async function seedAccountingBouncedPayments() {
  const payload = await getPayload({ config })

  const [
    adminUsers,
    customerResult,
    bankAccountResult,
    chartAccountResult,
    existingBounceCaseResult,
    postedPaymentsResult,
    fiscalYearResult,
    postingSettings,
    periodResult,
  ] =
    await Promise.all([
    payload.find({
      collection: 'users',
      where: { role: { equals: 'admin' } } as never,
      limit: 1,
      depth: 0,
      overrideAccess: true,
    }),
    payload.find({
      collection: ACCOUNTING_COLLECTION_SLUGS.customers as any,
      where: {
        status: {
          in: ['active', 'on_hold'],
        },
      } as never,
      limit: 200,
      depth: 0,
      sort: 'displayName',
      overrideAccess: true,
    }),
    payload.find({
      collection: ACCOUNTING_COLLECTION_SLUGS.bankAccounts as any,
      where: {
        and: [
          { isActive: { not_equals: false } },
          {
            or: [
              { accountType: { equals: 'bank' } },
              { accountType: { equals: 'cash_on_hand' } },
            ],
          },
        ],
      } as never,
      limit: 200,
      depth: 1,
      sort: 'accountName',
      overrideAccess: true,
    }),
    payload.find({
      collection: ACCOUNTING_COLLECTION_SLUGS.chartOfAccounts as any,
      where: {
        isActive: {
          not_equals: false,
        },
      } as never,
      limit: 500,
      depth: 0,
      sort: 'code',
      overrideAccess: true,
    }),
    payload.find({
      collection: ACCOUNTING_COLLECTION_SLUGS.bouncedPayments as any,
      limit: 500,
      depth: 0,
      overrideAccess: true,
    }),
    payload.find({
      collection: ACCOUNTING_COLLECTION_SLUGS.paymentsReceived as any,
      where: {
        status: {
          equals: 'posted',
        },
      } as never,
      limit: 500,
      depth: 2,
      sort: '-paymentDate',
      overrideAccess: true,
    }),
    payload.find({
      collection: ACCOUNTING_COLLECTION_SLUGS.fiscalYears as any,
      where: {
        status: {
          equals: 'open',
        },
      } as never,
      limit: 100,
      depth: 0,
      sort: '-startDate',
      overrideAccess: true,
    }),
    AccountingPeriodService.getSettings(payload),
    payload.find({
      collection: ACCOUNTING_COLLECTION_SLUGS.periods as any,
      where: {
        status: {
          in: ['open', 'soft_locked'],
        },
      } as never,
      limit: 500,
      depth: 0,
      sort: 'startDate',
      overrideAccess: true,
    }),
  ])

  const adminId = (adminUsers.docs[0] as UserDoc | undefined)?.id ?? null
  const customers = customerResult.docs as CustomerDoc[]
  const bankAccounts = (bankAccountResult.docs as BankAccountDoc[]).filter((account) => Boolean(getRelationshipId(account.ledgerAccount)))
  const chartAccounts = chartAccountResult.docs as ChartAccountDoc[]
  const fallbackReceivableAccount = pickReceivableAccount(chartAccounts)
  const fiscalYears = fiscalYearResult.docs as FiscalYearDoc[]
  const eligiblePeriodStatuses = postingSettings?.allowBackdatedPosting ? new Set(['open', 'soft_locked']) : new Set(['open'])
  const candidatePeriods = (periodResult.docs as PeriodDoc[]).filter((period) => eligiblePeriodStatuses.has(String(period.status || '')))
  const existingBounceCases = existingBounceCaseResult.docs as Array<{ originalPayment?: number | string | { id?: number | string | null } | null }>
  const usedOriginalPaymentIds = new Set(
    existingBounceCases
      .map((record) => getRelationshipId(record.originalPayment))
      .filter((value): value is number | string => value !== null && value !== undefined)
      .map((value) => String(value)),
  )
  const reusablePostedPayments = (postedPaymentsResult.docs as PaymentDoc[]).filter(
    (payment) =>
      Boolean(getRelationshipId(payment.postedJournalEntry)) &&
      !usedOriginalPaymentIds.has(String(payment.id)),
  )
  const consumedReusablePaymentIds = new Set<string>()

  if (customers.length === 0) {
    throw new Error('No eligible customers were found. Seed customers first, then rerun this bounced-payments seeder.')
  }

  if (bankAccounts.length === 0) {
    throw new Error('No active bank or cash accounts with ledger accounts were found. Seed bank accounts first, then rerun this bounced-payments seeder.')
  }

  if (chartAccounts.length === 0) {
    throw new Error('No active chart accounts were found. Seed the chart of accounts first, then rerun this bounced-payments seeder.')
  }

  if (!fallbackReceivableAccount) {
    throw new Error('No active receivable fallback account could be identified for bounced-payment receipt posting.')
  }

  if (fiscalYears.length === 0) {
    throw new Error('No open fiscal year was found for bounced-payment seeding.')
  }

  let postingDates: string[] = []

  for (const fiscalYear of fiscalYears) {
    const fiscalYearPeriods = candidatePeriods.filter(
      (period) => String(getRelationshipId(period.fiscalYear) || '') === String(fiscalYear.id),
    )
    postingDates = buildAllowedPostingDates(fiscalYear, fiscalYearPeriods)

    if (postingDates.length > 0) {
      break
    }
  }

  if (postingDates.length === 0) {
    throw new Error('No unlocked posting dates were found in the current open accounting periods.')
  }

  const templates = buildTemplates(postingDates)
  let createdOriginalPayments = 0
  let postedOriginalPayments = 0
  let createdRecoveryPayments = 0
  let postedRecoveryPayments = 0
  let createdBounceCases = 0
  let reversedCases = 0
  let chargedCases = 0
  let resolvedCases = 0
  let reusedOriginalPayments = 0
  let reusedRecoveryPayments = 0

  for (let index = 0; index < templates.length; index += 1) {
    const template = templates[index]
    const bankAccount = pickBankAccount(bankAccounts, index)
    const chargeAccount = pickChargeAccount(chartAccounts, index)
    let caseRecord = await findExistingBounceCase(payload, template.caseNumber, template.notes)

    if (!bankAccount) {
      throw new Error(`Unable to find an active bank account for bounced-payment case ${template.caseNumber}.`)
    }

    if (!chargeAccount && template.bankChargeAmount > 0) {
      throw new Error(`Unable to find an expense account for bank charges on ${template.caseNumber}.`)
    }

    if (!caseRecord) {
      const originalNotes = `${template.notes} Original posted receipt for bounced-payment seeding.`
      let originalPayment = await findExistingPayment(payload, template.originalReceiptNumber, originalNotes)

      if (originalPayment && String(originalPayment.status || '') === 'posted' && getRelationshipId(originalPayment.postedJournalEntry)) {
        // Reuse seeded receipts from prior successful runs before borrowing live posted receipts.
      } else if (originalPayment) {
        const customer = customers[index % customers.length]
        const originalPaymentResult = await ensurePostedPayment({
          payload,
          adminId,
          fallbackReceivableAccountId: fallbackReceivableAccount.id,
          customerId: customer.id,
          bankAccountId: bankAccount.id,
          receiptNumber: template.originalReceiptNumber,
          referenceNumber: template.originalReferenceNumber,
          paymentDate: template.originalPaymentDate,
          postingDate: template.originalPaymentDate,
          amountReceived: template.amountReceived,
          paymentMethod: template.paymentMethod,
          notes: originalNotes,
        })

        originalPayment = originalPaymentResult.payment
        if (originalPaymentResult.created) createdOriginalPayments += 1
        if (originalPaymentResult.posted) postedOriginalPayments += 1
      } else if (!originalPayment) {
        const reusablePayment = takeReusablePostedPayment(reusablePostedPayments, consumedReusablePaymentIds)

        if (reusablePayment) {
          originalPayment = reusablePayment
          reusedOriginalPayments += 1
        }
      }

      if (!originalPayment) {
        const customer = customers[index % customers.length]
        const originalPaymentResult = await ensurePostedPayment({
          payload,
          adminId,
          fallbackReceivableAccountId: fallbackReceivableAccount.id,
          customerId: customer.id,
          bankAccountId: bankAccount.id,
          receiptNumber: template.originalReceiptNumber,
          referenceNumber: template.originalReferenceNumber,
          paymentDate: template.originalPaymentDate,
          postingDate: template.originalPaymentDate,
          amountReceived: template.amountReceived,
          paymentMethod: template.paymentMethod,
          notes: originalNotes,
        })

        originalPayment = originalPaymentResult.payment
        if (originalPaymentResult.created) createdOriginalPayments += 1
        if (originalPaymentResult.posted) postedOriginalPayments += 1
      }

      const bounceCaseResult = await ensureBounceCase({
        payload,
        adminId,
        originalPaymentId: originalPayment.id,
        chargeExpenseAccountId: chargeAccount?.id ?? null,
        template,
      })

      caseRecord = bounceCaseResult.bounceCase

      if (bounceCaseResult.created) {
        createdBounceCases += 1
        console.log(`Created bounced-payment case ${template.caseNumber} for receipt ${originalPayment.receiptNumber || originalPayment.id}`)
      } else {
        console.log(`Skipped bounced-payment case ${template.caseNumber} (already exists)`)
      }
    } else {
      console.log(`Skipped bounced-payment case ${template.caseNumber} (already exists)`)
    }

    if (template.shouldReverse) {
      const reverseResult = await reverseBounceCase({
        payload,
        adminId,
        caseRecord,
      })

      caseRecord = reverseResult.caseRecord
      if (reverseResult.reversed) reversedCases += 1
      if (reverseResult.charged) chargedCases += 1
    }

    if (template.shouldRecover) {
      const originalPayment =
        typeof caseRecord.originalPayment === 'object' && caseRecord.originalPayment ? caseRecord.originalPayment : null
      const originalCustomerId = getRelationshipId(originalPayment?.customer)
      const recoveryBankAccountId = getPaymentBankAccountId(originalPayment || ({} as PaymentDoc)) || bankAccount.id
      const expectedRecoveryCustomerId = originalCustomerId || customers[index % customers.length]?.id || null
      let recoveryReceiptNumber = template.recoveryReceiptNumber
      let recoveryNotes = template.recoveryNotes
      let recoveryPayment = await findExistingPayment(payload, recoveryReceiptNumber, recoveryNotes)

      if (
        recoveryPayment &&
        expectedRecoveryCustomerId &&
        String(getRelationshipId(recoveryPayment.customer) || '') !== String(expectedRecoveryCustomerId)
      ) {
        recoveryReceiptNumber = `${template.recoveryReceiptNumber}-ALT`
        recoveryNotes = `${template.recoveryNotes} Alternate recovery receipt after a prior partial run used the primary seed number for another customer.`
        recoveryPayment = await findExistingPayment(payload, recoveryReceiptNumber, recoveryNotes)
      }

      if (recoveryPayment && String(recoveryPayment.status || '') !== 'posted') {
        const recoveryCustomerId = expectedRecoveryCustomerId

        if (recoveryCustomerId) {
          const recoveryPaymentResult = await ensurePostedPayment({
            payload,
            adminId,
            fallbackReceivableAccountId: fallbackReceivableAccount.id,
            customerId: recoveryCustomerId,
            bankAccountId: recoveryBankAccountId,
            receiptNumber: recoveryReceiptNumber,
            referenceNumber: template.recoveryReferenceNumber,
            paymentDate: template.recoveryDate,
            postingDate: template.recoveryDate,
            amountReceived: template.recoveryAmount,
            paymentMethod: 'bank_transfer',
            notes: recoveryNotes,
          })

          recoveryPayment = recoveryPaymentResult.payment
          if (recoveryPaymentResult.created) createdRecoveryPayments += 1
          if (recoveryPaymentResult.posted) postedRecoveryPayments += 1
        }
      }

      if (!recoveryPayment) {
        const reusableRecovery = takeReusablePostedPayment(
          reusablePostedPayments,
          consumedReusablePaymentIds,
          expectedRecoveryCustomerId,
          true,
        )

        if (reusableRecovery && String(reusableRecovery.id) !== String(getRelationshipId(caseRecord.originalPayment) || '')) {
          recoveryPayment = reusableRecovery
          reusedRecoveryPayments += 1
        }
      }

      if (!recoveryPayment && expectedRecoveryCustomerId) {
        const recoveryCustomerId = expectedRecoveryCustomerId
        const recoveryPaymentResult = await ensurePostedPayment({
          payload,
          adminId,
          fallbackReceivableAccountId: fallbackReceivableAccount.id,
          customerId: recoveryCustomerId,
          bankAccountId: recoveryBankAccountId,
          receiptNumber: recoveryReceiptNumber,
          referenceNumber: template.recoveryReferenceNumber,
          paymentDate: template.recoveryDate,
          postingDate: template.recoveryDate,
          amountReceived: template.recoveryAmount,
          paymentMethod: 'bank_transfer',
          notes: recoveryNotes,
        })

        recoveryPayment = recoveryPaymentResult.payment
        if (recoveryPaymentResult.created) createdRecoveryPayments += 1
        if (recoveryPaymentResult.posted) postedRecoveryPayments += 1
      }

      if (
        recoveryPayment &&
        String(getRelationshipId(caseRecord.recoveryPayment) || '') !== String(recoveryPayment.id) ||
        (recoveryPayment && !caseRecord.resolutionDate)
      ) {
        caseRecord = (await payload.update({
          collection: ACCOUNTING_COLLECTION_SLUGS.bouncedPayments as any,
          id: caseRecord.id,
          overrideAccess: true,
          depth: 2,
          data: {
            recoveryPayment: recoveryPayment.id,
            recoveryDate: template.recoveryDate,
            resolutionDate: template.resolutionDate,
            resolutionNotes: 'Recovered through a follow-up replacement receipt.',
            updatedBy: adminId,
          } as never,
        })) as BouncedPaymentDoc
        resolvedCases += 1
      } else if (!recoveryPayment && (!caseRecord.resolutionDate || String(caseRecord.caseStatus || '') !== 'resolved')) {
        caseRecord = (await payload.update({
          collection: ACCOUNTING_COLLECTION_SLUGS.bouncedPayments as any,
          id: caseRecord.id,
          overrideAccess: true,
          depth: 2,
          data: {
            resolutionDate: template.resolutionDate,
            resolutionNotes: 'Resolved after follow-up because no dedicated recovery receipt could be generated in this environment.',
            updatedBy: adminId,
          } as never,
        })) as BouncedPaymentDoc
        resolvedCases += 1
      }
    } else if (template.shouldResolveWithoutRecovery) {
      if (!caseRecord.resolutionDate || String(caseRecord.caseStatus || '') !== 'resolved') {
        caseRecord = (await payload.update({
          collection: ACCOUNTING_COLLECTION_SLUGS.bouncedPayments as any,
          id: caseRecord.id,
          overrideAccess: true,
          depth: 2,
          data: {
            resolutionDate: template.resolutionDate,
            resolutionNotes: 'Resolved through direct adjustment and customer follow-up.',
            updatedBy: adminId,
          } as never,
        })) as BouncedPaymentDoc
        resolvedCases += 1
      }
    }
  }

  const totals = await payload.count({
    collection: ACCOUNTING_COLLECTION_SLUGS.bouncedPayments as any,
    overrideAccess: true,
  })

  console.log(
    `Done. Original receipts created: ${createdOriginalPayments}, original receipts reused: ${reusedOriginalPayments}, posted now: ${postedOriginalPayments}, recovery receipts created: ${createdRecoveryPayments}, recovery receipts reused: ${reusedRecoveryPayments}, recovery receipts posted now: ${postedRecoveryPayments}, bounce cases created: ${createdBounceCases}, reversals posted now: ${reversedCases}, charge journals posted now: ${chargedCases}, cases resolved on this run: ${resolvedCases}, total bounce cases now: ${totals.totalDocs}`,
  )
}

seedAccountingBouncedPayments()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Failed to seed accounting bounced payments:', error)
    process.exit(1)
  })
