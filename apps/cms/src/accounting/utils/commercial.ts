import { normalizeAmount, roundCurrency } from './amounts'

export const normalizeCode = (value: unknown) => String(value || '').trim().toUpperCase()

export const normalizeText = (value: unknown) => String(value || '').trim()

export const normalizeOptionalText = (value: unknown): string | undefined => {
  const normalized = normalizeText(value)
  return normalized || undefined
}

export const ensureIsoDate = (value?: string | Date | null) => {
  if (!value) {
    return new Date().toISOString()
  }

  return new Date(value).toISOString()
}

export const buildPrefixedDocumentNumber = (prefix: string) => {
  const stamp = new Date().toISOString().replace(/\D/g, '').slice(0, 14)
  const randomSuffix = Math.floor(Math.random() * 9000 + 1000)
  return `${normalizeCode(prefix)}-${stamp}-${randomSuffix}`
}

export const calculateExclusiveTax = (baseAmount: number, rate: number) =>
  roundCurrency(baseAmount * (rate / 100))

export const calculateInclusiveTax = (grossAmount: number, rate: number) => {
  if (rate <= 0) {
    return 0
  }

  return roundCurrency(grossAmount - grossAmount / (1 + rate / 100))
}

export const calculateTaxAmount = ({
  amount,
  rate,
  calculationMethod,
}: {
  amount: number
  rate: number
  calculationMethod?: string | null
}) => {
  const normalizedAmount = normalizeAmount(amount)
  const normalizedRate = normalizeAmount(rate)

  if (normalizedRate <= 0 || normalizedAmount <= 0) {
    return 0
  }

  if (calculationMethod === 'inclusive') {
    return calculateInclusiveTax(normalizedAmount, normalizedRate)
  }

  return calculateExclusiveTax(normalizedAmount, normalizedRate)
}

export const sumBy = <T>(items: T[], projector: (item: T) => unknown) =>
  roundCurrency(items.reduce((total, item) => total + normalizeAmount(projector(item)), 0))

export const getDocumentPaymentStatus = ({
  total,
  balanceDue,
  postedStatus = 'posted',
}: {
  total: number
  balanceDue: number
  postedStatus?: string
}) => {
  const normalizedTotal = normalizeAmount(total)
  const normalizedBalance = normalizeAmount(balanceDue)

  if (normalizedTotal <= 0 || normalizedBalance <= 0) {
    return 'paid'
  }

  if (normalizedBalance >= normalizedTotal) {
    return postedStatus
  }

  return 'partially_paid'
}

export const isTerminalDocumentStatus = (status?: string | null) =>
  ['posted', 'partially_paid', 'paid', 'voided'].includes(String(status || ''))

export const isTerminalSimplePostingStatus = (status?: string | null) =>
  ['posted', 'voided'].includes(String(status || ''))

export const isLockedReconciliationStatus = (status?: string | null) =>
  ['completed', 'locked'].includes(String(status || ''))

export const getCreditApplicationStatus = ({
  total,
  appliedAmount,
}: {
  total: number
  appliedAmount: number
}) => {
  const normalizedTotal = normalizeAmount(total)
  const normalizedApplied = normalizeAmount(appliedAmount)

  if (normalizedTotal <= 0 || normalizedApplied >= normalizedTotal) {
    return 'paid'
  }

  if (normalizedApplied <= 0) {
    return 'posted'
  }

  return 'partially_paid'
}
