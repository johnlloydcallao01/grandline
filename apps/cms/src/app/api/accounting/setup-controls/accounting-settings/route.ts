import { NextRequest, NextResponse } from 'next/server'
import { ACCOUNTING_COLLECTION_SLUGS, ACCOUNTING_GLOBAL_SLUGS } from '@/accounting/constants/accounting'
import { handleAccountingApiError, requireAccountingAdmin } from '../../_utils/auth'

type AccountRef = { id: number | string; code: string; name: string } | null

type AccountOption = {
  id: number | string
  code: string
  name: string
  accountType: string
}

type SettingsResponse = {
  baseCurrency: string
  timezone: string
  journalNumberPrefix: string
  customerNumberPrefix: string
  vendorNumberPrefix: string
  invoiceNumberPrefix: string
  billNumberPrefix: string
  paymentReceivedNumberPrefix: string
  paymentMadeNumberPrefix: string
  officialReceiptNumberPrefix: string
  creditNoteNumberPrefix: string
  vendorCreditNumberPrefix: string
  refundNumberPrefix: string
  depositNumberPrefix: string
  transferNumberPrefix: string
  openingBalanceSourceType: string
  defaultSuspenseAccount: AccountRef
  defaultReceivableAccount: AccountRef
  defaultPayableAccount: AccountRef
  defaultUndepositedFundsAccount: AccountRef
  defaultOutputTaxAccount: AccountRef
  defaultInputTaxAccount: AccountRef
  retainedEarningsAccount: AccountRef
  allowBackdatedPosting: boolean
  defaultTaxBehavior: string
}

function resolveAccountRef(raw: unknown): AccountRef {
  if (!raw || typeof raw !== 'object') return null
  const obj = raw as Record<string, unknown>
  const id = obj.id
  if (id === null || id === undefined || id === '') return null
  const code = String(obj.code ?? '')
  const name = String(obj.name ?? '')
  return { id: id as number | string, code, name }
}

function normalizeBoolean(value: unknown): boolean {
  if (typeof value === 'boolean') return value
  if (typeof value === 'string') return value === 'true'
  return false
}

function buildSettings(raw: Record<string, unknown> | null): SettingsResponse {
  return {
    baseCurrency: String(raw?.baseCurrency ?? 'PHP'),
    timezone: String(raw?.timezone ?? 'Asia/Manila'),
    journalNumberPrefix: String(raw?.journalNumberPrefix ?? 'JE'),
    customerNumberPrefix: String(raw?.customerNumberPrefix ?? 'CUST'),
    vendorNumberPrefix: String(raw?.vendorNumberPrefix ?? 'VEND'),
    invoiceNumberPrefix: String(raw?.invoiceNumberPrefix ?? 'INV'),
    billNumberPrefix: String(raw?.billNumberPrefix ?? 'BILL'),
    paymentReceivedNumberPrefix: String(raw?.paymentReceivedNumberPrefix ?? 'RCPT'),
    paymentMadeNumberPrefix: String(raw?.paymentMadeNumberPrefix ?? 'PAY'),
    officialReceiptNumberPrefix: String(raw?.officialReceiptNumberPrefix ?? 'OR'),
    creditNoteNumberPrefix: String(raw?.creditNoteNumberPrefix ?? 'CN'),
    vendorCreditNumberPrefix: String(raw?.vendorCreditNumberPrefix ?? 'VCN'),
    refundNumberPrefix: String(raw?.refundNumberPrefix ?? 'REF'),
    depositNumberPrefix: String(raw?.depositNumberPrefix ?? 'DEP'),
    transferNumberPrefix: String(raw?.transferNumberPrefix ?? 'TRF'),
    openingBalanceSourceType: String(raw?.openingBalanceSourceType ?? 'opening_balance'),
    defaultSuspenseAccount: resolveAccountRef(raw?.defaultSuspenseAccount),
    defaultReceivableAccount: resolveAccountRef(raw?.defaultReceivableAccount),
    defaultPayableAccount: resolveAccountRef(raw?.defaultPayableAccount),
    defaultUndepositedFundsAccount: resolveAccountRef(raw?.defaultUndepositedFundsAccount),
    defaultOutputTaxAccount: resolveAccountRef(raw?.defaultOutputTaxAccount),
    defaultInputTaxAccount: resolveAccountRef(raw?.defaultInputTaxAccount),
    retainedEarningsAccount: resolveAccountRef(raw?.retainedEarningsAccount),
    allowBackdatedPosting: normalizeBoolean(raw?.allowBackdatedPosting),
    defaultTaxBehavior: String(raw?.defaultTaxBehavior ?? 'exclusive'),
  }
}

async function fetchChartOfAccounts(payload: Awaited<ReturnType<typeof requireAccountingAdmin>>['payload']): Promise<AccountOption[]> {
  const result = await payload.find({
    collection: ACCOUNTING_COLLECTION_SLUGS.chartOfAccounts,
    where: { isActive: { equals: true } } as never,
    limit: 500,
    depth: 0,
    overrideAccess: true,
  })

  return result.docs.map((a: any) => ({
    id: a.id as number | string,
    code: String(a.code ?? ''),
    name: String(a.name ?? ''),
    accountType: String(a.accountType ?? ''),
  }))
}

export async function GET(request: NextRequest) {
  try {
    const { payload } = await requireAccountingAdmin(request)

    const raw = await payload.findGlobal({
      slug: ACCOUNTING_GLOBAL_SLUGS.settings,
      depth: 1,
    })

    const settings = buildSettings(raw as unknown as Record<string, unknown> | null)
    const chartOfAccounts = await fetchChartOfAccounts(payload)

    return NextResponse.json({ settings, chartOfAccounts })
  } catch (error) {
    return handleAccountingApiError(error)
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { payload, user } = await requireAccountingAdmin(request)
    const body: Record<string, unknown> = await request.json()

    const updateData: Record<string, unknown> = {
      ...body,
      updatedBy: user.id,
    }

    const result = await payload.updateGlobal({
      slug: ACCOUNTING_GLOBAL_SLUGS.settings,
      data: updateData as never,
      depth: 1,
    })

    const settings = buildSettings(result as unknown as Record<string, unknown> | null)
    const chartOfAccounts = await fetchChartOfAccounts(payload)

    return NextResponse.json({ settings, chartOfAccounts })
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
