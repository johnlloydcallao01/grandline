import { APIError, type Payload } from 'payload'
import { ACCOUNTING_COLLECTION_SLUGS } from '../../constants/accounting'
import { findAllDocs } from '../../utils/findAllDocs'
import { normalizeAmount, roundCurrency } from '../../utils/amounts'
import { AccountingApprovalService } from '../approvals/AccountingApprovalService'
import { AccountingManualWorkflowService } from '../journals/AccountingManualWorkflowService'
import { AccountingAuditService } from '../audit/AccountingAuditService'
import { getRelationshipId } from '../../utils/accounting-audit'

export class AccountingPayrollService {
  static normalizeNumericId(value: unknown, fieldName: string) {
    const relationshipId = getRelationshipId(value)
    const numericId = typeof relationshipId === 'number' ? relationshipId : relationshipId ? Number(relationshipId) : undefined

    if (!numericId || !Number.isFinite(numericId)) {
      throw new APIError(`${fieldName} must resolve to a numeric relationship id.`, 400)
    }

    return numericId
  }

  static async generatePayrollCode(_payload: Payload) {
    const stamp = new Date().toISOString().replace(/\D/g, '').slice(0, 12)
    const randomSuffix = Math.floor(Math.random() * 900 + 100)
    return `PAYRUN-${stamp}-${randomSuffix}`
  }

  static calculateNetAmount(entry: { grossAmount?: unknown; deductionAmount?: unknown }) {
    return roundCurrency(normalizeAmount(entry.grossAmount) - normalizeAmount(entry.deductionAmount))
  }

  static async syncPayrollEntryNetAmount(payload: Payload, payrollEntryId: number | string) {
    const entry = await payload.findByID({
      collection: ACCOUNTING_COLLECTION_SLUGS.payrollEntries,
      id: payrollEntryId,
      depth: 0,
      overrideAccess: true,
    })

    if (!entry) {
      throw new APIError('Payroll entry not found.', 404)
    }

    return payload.update({
      collection: ACCOUNTING_COLLECTION_SLUGS.payrollEntries,
      id: payrollEntryId,
      overrideAccess: true,
      depth: 0,
      data: {
        netAmount: this.calculateNetAmount(entry),
      },
    })
  }

  static async postPayrollRun({
    payload,
    payrollRunId,
    userId,
  }: {
    payload: Payload
    payrollRunId: number | string
    userId?: number | string | null
  }) {
    await AccountingApprovalService.ensureApprovedForEntity({
      payload,
      entityType: 'payroll_run',
      entityId: payrollRunId,
    })

    const payrollRun = await payload.findByID({
      collection: ACCOUNTING_COLLECTION_SLUGS.payrollRuns,
      id: payrollRunId,
      depth: 1,
      overrideAccess: true,
    })

    if (!payrollRun) {
      throw new APIError('Payroll run not found.', 404)
    }

    if (payrollRun.status === 'posted') {
      return payrollRun
    }

    const entries = await findAllDocs<any>({
      payload,
      collection: ACCOUNTING_COLLECTION_SLUGS.payrollEntries,
      depth: 1,
      where: {
        payrollRun: {
          equals: payrollRunId,
        },
      },
    })

    if (!entries.length) {
      throw new APIError('Payroll runs require at least one payroll entry before posting.', 400)
    }

    const expenseByAccount = new Map<string, { account: number; amount: number }>()
    const payableByAccount = new Map<string, { account: number; amount: number }>()

    for (const entry of entries) {
      const grossAmount = normalizeAmount(entry.grossAmount)
      const netAmount = this.calculateNetAmount(entry)
      const expenseAccountId = String(this.normalizeNumericId(entry.expenseAccount, 'expenseAccount'))
      const payableAccountId = String(this.normalizeNumericId(entry.payableAccount, 'payableAccount'))

      expenseByAccount.set(expenseAccountId, {
        account: this.normalizeNumericId(entry.expenseAccount, 'expenseAccount'),
        amount: roundCurrency((expenseByAccount.get(expenseAccountId)?.amount || 0) + grossAmount),
      })
      payableByAccount.set(payableAccountId, {
        account: this.normalizeNumericId(entry.payableAccount, 'payableAccount'),
        amount: roundCurrency((payableByAccount.get(payableAccountId)?.amount || 0) + netAmount),
      })
    }

    const lines = [
      ...Array.from(expenseByAccount.values()).map((row) => ({
        account: row.account,
        description: `Payroll expense for ${payrollRun.payrollCode}`,
        debit: row.amount,
        credit: 0,
        referenceEntityType: 'payroll_run',
        referenceEntityId: String(payrollRun.id),
      })),
      ...Array.from(payableByAccount.values()).map((row) => ({
        account: row.account,
        description: `Payroll payable for ${payrollRun.payrollCode}`,
        debit: 0,
        credit: row.amount,
        referenceEntityType: 'payroll_run',
        referenceEntityId: String(payrollRun.id),
      })),
    ]

    const journalEntry = await AccountingManualWorkflowService.createStructuredJournal({
      payload,
      userId,
      sourceType: 'system',
      entryDate: payrollRun.paymentDate,
      postingDate: payrollRun.paymentDate,
      memo: `Payroll run ${payrollRun.payrollCode}`,
      sourceReference: payrollRun.payrollCode,
      autoPost: true,
      lines,
    })

    for (const entry of entries) {
      await payload.update({
        collection: ACCOUNTING_COLLECTION_SLUGS.payrollEntries,
        id: entry.id,
        overrideAccess: true,
        depth: 0,
        data: {
          netAmount: this.calculateNetAmount(entry),
          status: 'posted',
        },
      })
    }

    const updatedRun = await payload.update({
      collection: ACCOUNTING_COLLECTION_SLUGS.payrollRuns,
      id: payrollRunId,
      overrideAccess: true,
      depth: 1,
      data: {
        status: 'posted',
        postedJournalEntry: journalEntry.id,
      },
    })

    await AccountingAuditService.logAction({
      payload,
      entityType: 'payroll_run',
      entityId: payrollRunId,
      actionType: 'posted',
      performedBy: userId,
      beforeData: payrollRun,
      afterData: updatedRun,
    })

    return updatedRun
  }
}
