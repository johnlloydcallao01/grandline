import { NextRequest, NextResponse } from 'next/server'
import { AccountingBankAccountRegisterService } from '@/accounting/services/banking/AccountingBankAccountRegisterService'
import type { AccountingBankAccountType } from '@/accounting/types/accounting'
import { handleAccountingApiError, requireAccountingAdmin } from '@/app/api/accounting/_utils/auth'

type BankAccountRegisterStatus = 'active' | 'inactive'

const parseIntegerParam = (value: string | null, fallback: number) => {
  if (!value) {
    return fallback
  }

  const parsedValue = Number(value)
  return Number.isFinite(parsedValue) ? parsedValue : fallback
}

const parseBooleanParam = (value: string | null) => {
  if (!value) {
    return false
  }

  return ['true', '1', 'yes'].includes(String(value).toLowerCase())
}

const parseListParam = <T extends string>(searchParams: URLSearchParams, key: string): T[] => {
  const values = searchParams
    .getAll(key)
    .flatMap((value) => String(value || '').split(','))
    .map((value) => value.trim())
    .filter(Boolean)

  return Array.from(new Set(values)) as T[]
}

export async function GET(request: NextRequest) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const { searchParams } = new URL(request.url)

    const result = await AccountingBankAccountRegisterService.getBankAccountMasterRegister(payload, {
      search: searchParams.get('search') || '',
      statuses: parseListParam<BankAccountRegisterStatus>(searchParams, 'status'),
      accountTypes: parseListParam<AccountingBankAccountType>(searchParams, 'accountType'),
      defaultReceiptOnly: parseBooleanParam(searchParams.get('defaultReceiptOnly')),
      defaultDisbursementOnly: parseBooleanParam(searchParams.get('defaultDisbursementOnly')),
      ledgerMappedOnly: parseBooleanParam(searchParams.get('ledgerMappedOnly')),
      quickFilters: parseListParam(searchParams, 'quickFilter'),
      page: parseIntegerParam(searchParams.get('page'), 1),
      limit: parseIntegerParam(searchParams.get('limit'), 10),
    })

    return NextResponse.json({
      section: {
        id: 'bank-accounts',
        label: 'Bank Accounts',
        description:
          'Manage bank, cash on hand, and undeposited funds accounts used across treasury and accounting workflows.',
        searchPlaceholder:
          'Search account name, bank name, type, currency, ledger account, or status',
        filters: result.filterOptions,
        metrics: result.metrics,
        table: {
          title: 'Bank Account Master Register',
          description:
            'Cash and bank accounts using account name, bank name, type, currency, ledger account, and status.',
          columns: [
            'Account Name',
            'Bank Name',
            'Type',
            'Currency',
            'Ledger Account',
            'Status',
          ],
          rows: result.rows.map((row) => ({
            id: row.id,
            bankAccountId: row.id,
            accountName: row.accountName,
            bankName: row.bankName,
            type: row.accountType,
            typeLabel: row.accountTypeLabel,
            currency: row.currency,
            currencyReferenceId: row.currencyReferenceId,
            ledgerAccountId: row.ledgerAccountId,
            ledgerAccountCode: row.ledgerAccountCode,
            ledgerAccountName: row.ledgerAccountName,
            ledgerAccountDisplay: row.ledgerAccountDisplay,
            status: row.status,
            statusLabel: row.statusLabel,
            isDefaultReceiptAccount: row.isDefaultReceiptAccount,
            isDefaultDisbursementAccount: row.isDefaultDisbursementAccount,
            isLedgerMapped: row.isLedgerMapped,
            accountNumberMasked: row.accountNumberMasked,
            branchName: row.branchName,
            notes: row.notes,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt,
            cells: [
              row.accountName,
              row.bankName || '-',
              row.accountTypeLabel,
              row.currency,
              row.ledgerAccountDisplay || '-',
              row.statusLabel,
            ],
          })),
        },
      },
      appliedFilters: result.appliedFilters,
      pagination: result.pagination,
      referenceData: result.referenceData,
      totals: result.totals,
    })
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
