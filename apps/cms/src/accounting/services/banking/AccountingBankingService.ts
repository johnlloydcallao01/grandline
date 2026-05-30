import { APIError, type Payload } from 'payload'
import { ACCOUNTING_COLLECTION_SLUGS } from '../../constants/accounting'
import { AccountingManualWorkflowService } from '../journals/AccountingManualWorkflowService'
import type { AccountingReconciliationSnapshot } from '../../types/accounting'
import { getRelationshipId } from '../../utils/accounting-audit'
import { normalizeAmount } from '../../utils/amounts'
import { normalizeCode, normalizeOptionalText } from '../../utils/commercial'
import { findAllDocs } from '../../utils/findAllDocs'

type BankAccountNormalizationFields = {
  accountName?: unknown
  accountNumberMasked?: unknown
  bankName?: unknown
  branchName?: unknown
  currency?: unknown
  notes?: unknown
}

type BankTransactionNormalizationFields = {
  referenceNumber?: unknown
  description?: unknown
}

export class AccountingBankingService {
  static normalizeBankAccount<T extends BankAccountNormalizationFields>(data: T) {
    data.accountName = normalizeOptionalText(data.accountName)
    data.accountNumberMasked = normalizeOptionalText(data.accountNumberMasked)
    data.bankName = normalizeOptionalText(data.bankName)
    data.branchName = normalizeOptionalText(data.branchName)
    data.currency = normalizeCode(data.currency || 'PHP')
    data.notes = normalizeOptionalText(data.notes)
    return data
  }

  static normalizeBankTransaction<T extends BankTransactionNormalizationFields>(data: T) {
    data.referenceNumber = normalizeOptionalText(data.referenceNumber)
    data.description = normalizeOptionalText(data.description)
    return data
  }

  static async postDeposit({
    payload,
    depositId,
    userId,
  }: {
    payload: Payload
    depositId: number | string
    userId?: number | string | null
  }) {
    const deposit = await payload.findByID({
      collection: ACCOUNTING_COLLECTION_SLUGS.deposits,
      id: depositId,
      depth: 2,
      overrideAccess: true,
    })

    if (!deposit) {
      throw new APIError('Deposit not found.', 404)
    }

    if (deposit.status === 'posted') {
      return deposit
    }

    const destinationAccountId =
      typeof deposit.bankAccount === 'object' && deposit.bankAccount !== null
        ? getRelationshipId(deposit.bankAccount.ledgerAccount || deposit.bankAccount)
        : getRelationshipId(deposit.bankAccount)
    const sourceAccountId = getRelationshipId(deposit.sourceAccount)
    const amount = normalizeAmount(deposit.amount)

    if (!destinationAccountId || !sourceAccountId || amount <= 0) {
      throw new APIError('Deposit requires valid source account, bank account, and amount.', 400)
    }

    const journalEntry = await AccountingManualWorkflowService.createStructuredJournal({
      payload,
      userId,
      sourceType: 'system',
      entryDate: deposit.depositDate,
      postingDate: deposit.depositDate,
      memo: deposit.notes || `Deposit ${deposit.depositNumber || depositId}`,
      referenceNumber: deposit.depositNumber || undefined,
      sourceReference: deposit.depositNumber || undefined,
      autoPost: true,
      lines: [
        {
          account: destinationAccountId,
          description: `Deposit into ${deposit.depositNumber || depositId}`,
          debit: amount,
          credit: 0,
        },
        {
          account: sourceAccountId,
          description: `Clear source funds for ${deposit.depositNumber || depositId}`,
          debit: 0,
          credit: amount,
        },
      ],
    })

    return payload.update({
      collection: ACCOUNTING_COLLECTION_SLUGS.deposits,
      id: depositId,
      overrideAccess: true,
      data: {
        status: 'posted',
        postedJournalEntry: journalEntry.id,
      },
      depth: 2,
    })
  }

  static async postTransfer({
    payload,
    transferId,
    userId,
  }: {
    payload: Payload
    transferId: number | string
    userId?: number | string | null
  }) {
    const transfer = await payload.findByID({
      collection: ACCOUNTING_COLLECTION_SLUGS.transfers,
      id: transferId,
      depth: 2,
      overrideAccess: true,
    })

    if (!transfer) {
      throw new APIError('Transfer not found.', 404)
    }

    if (transfer.status === 'posted') {
      return transfer
    }

    const fromAccountId =
      typeof transfer.fromBankAccount === 'object' && transfer.fromBankAccount !== null
        ? getRelationshipId(transfer.fromBankAccount.ledgerAccount || transfer.fromBankAccount)
        : getRelationshipId(transfer.fromBankAccount)
    const toAccountId =
      typeof transfer.toBankAccount === 'object' && transfer.toBankAccount !== null
        ? getRelationshipId(transfer.toBankAccount.ledgerAccount || transfer.toBankAccount)
        : getRelationshipId(transfer.toBankAccount)
    const amount = normalizeAmount(transfer.amount)

    if (!fromAccountId || !toAccountId || amount <= 0) {
      throw new APIError('Transfer requires valid origin account, destination account, and amount.', 400)
    }

    const journalEntry = await AccountingManualWorkflowService.createStructuredJournal({
      payload,
      userId,
      sourceType: 'system',
      entryDate: transfer.transferDate,
      postingDate: transfer.transferDate,
      memo: transfer.notes || `Transfer ${transfer.transferNumber || transferId}`,
      referenceNumber: transfer.transferNumber || undefined,
      sourceReference: transfer.transferNumber || undefined,
      autoPost: true,
      lines: [
        {
          account: toAccountId,
          description: `Transfer destination ${transfer.transferNumber || transferId}`,
          debit: amount,
          credit: 0,
        },
        {
          account: fromAccountId,
          description: `Transfer source ${transfer.transferNumber || transferId}`,
          debit: 0,
          credit: amount,
        },
      ],
    })

    return payload.update({
      collection: ACCOUNTING_COLLECTION_SLUGS.transfers,
      id: transferId,
      overrideAccess: true,
      data: {
        status: 'posted',
        postedJournalEntry: journalEntry.id,
      },
      depth: 2,
    })
  }

  static async calculateBookClosingBalance(
    payload: Payload,
    bankAccountId: number | string,
    statementEndDate?: string | null,
  ) {
    const bankAccount = await payload.findByID({
      collection: ACCOUNTING_COLLECTION_SLUGS.bankAccounts,
      id: bankAccountId,
      depth: 0,
      overrideAccess: true,
    })

    const ledgerAccountId = getRelationshipId(bankAccount?.ledgerAccount)

    if (!ledgerAccountId) {
      throw new APIError('Bank account must reference a ledger account.', 400)
    }

    const journals = await findAllDocs<any>({
      payload,
      collection: ACCOUNTING_COLLECTION_SLUGS.journalEntryLines,
      depth: 2,
      where: {
        account: {
          equals: ledgerAccountId,
        },
      },
    })

    return journals.reduce((balance, line) => {
      const journal = typeof line.journalEntry === 'object' ? line.journalEntry : null

      if (journal?.status !== 'posted') {
        return balance
      }

      if (statementEndDate && journal?.postingDate && new Date(journal.postingDate) > new Date(statementEndDate)) {
        return balance
      }

      return balance + normalizeAmount(line.debit) - normalizeAmount(line.credit)
    }, 0)
  }

  static async getReconciliationSnapshot(
    payload: Payload,
    reconciliationId: number | string,
  ): Promise<AccountingReconciliationSnapshot> {
    const reconciliation = await payload.findByID({
      collection: ACCOUNTING_COLLECTION_SLUGS.bankReconciliations,
      id: reconciliationId,
      depth: 1,
      overrideAccess: true,
    })

    if (!reconciliation) {
      throw new APIError('Bank reconciliation not found.', 404)
    }

    const bankAccountId = getRelationshipId(reconciliation.bankAccount)

    if (!bankAccountId) {
      throw new APIError('Bank reconciliation must reference a bank account.', 400)
    }

    const bankTransactions = await findAllDocs<any>({
      payload,
      collection: ACCOUNTING_COLLECTION_SLUGS.bankTransactions,
      depth: 0,
      where: {
        and: [
          {
            bankAccount: {
              equals: bankAccountId,
            },
          },
          {
            transactionDate: {
              greater_than_equal: reconciliation.statementStartDate,
            },
          },
          {
            transactionDate: {
              less_than_equal: reconciliation.statementEndDate,
            },
          },
        ],
      },
      sort: 'transactionDate',
    })

    const matches = bankTransactions.map((transaction) => ({
      bankTransactionId: transaction.id,
      transactionDate: transaction.transactionDate || null,
      description: transaction.description || null,
      referenceNumber: transaction.referenceNumber || null,
      amountIn: normalizeAmount(transaction.amountIn),
      amountOut: normalizeAmount(transaction.amountOut),
      runningBalance: normalizeAmount(transaction.runningBalance),
      matchStatus: transaction.matchStatus || null,
      matchedEntityType: transaction.matchedEntityType || null,
      matchedEntityId: transaction.matchedEntityId || null,
    }))

    const statementActivityNet = matches.reduce(
      (total, transaction) => total + normalizeAmount(transaction.amountIn) - normalizeAmount(transaction.amountOut),
      0,
    )
    const matchedTransactionCount = matches.filter((transaction) =>
      ['matched', 'ignored'].includes(String(transaction.matchStatus || '')),
    ).length
    const unmatchedTransactionCount = matches.length - matchedTransactionCount
    const bookClosingBalance = await this.calculateBookClosingBalance(
      payload,
      bankAccountId,
      reconciliation.statementEndDate,
    )
    const statementClosingBalance = normalizeAmount(reconciliation.statementClosingBalance)
    const differenceAmount = normalizeAmount(statementClosingBalance - bookClosingBalance)

    return {
      bankAccountId,
      statementStartDate: reconciliation.statementStartDate || null,
      statementEndDate: reconciliation.statementEndDate || null,
      bankTransactionCount: matches.length,
      matchedTransactionCount,
      unmatchedTransactionCount,
      statementActivityNet,
      statementClosingBalance,
      bookClosingBalance,
      differenceAmount,
      canComplete: differenceAmount === 0 && unmatchedTransactionCount === 0,
      matches,
    }
  }

  static async completeReconciliation({
    payload,
    reconciliationId,
    userId,
  }: {
    payload: Payload
    reconciliationId: number | string
    userId?: number | string | null
  }) {
    const snapshot = await this.getReconciliationSnapshot(payload, reconciliationId)
    const completedById =
      typeof userId === 'number' ? userId : userId ? Number(userId) : null

    return payload.update({
      collection: ACCOUNTING_COLLECTION_SLUGS.bankReconciliations,
      id: reconciliationId,
      overrideAccess: true,
      data: {
        status: snapshot.canComplete ? 'completed' : 'in_progress',
        bookClosingBalance: snapshot.bookClosingBalance,
        differenceAmount: snapshot.differenceAmount,
        completedAt: snapshot.canComplete ? new Date().toISOString() : null,
        completedBy: snapshot.canComplete ? completedById : null,
      },
      depth: 1,
    })
  }
}
