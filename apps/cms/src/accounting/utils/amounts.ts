export const roundCurrency = (value: number): number => Number(value.toFixed(2))

export const normalizeAmount = (value: unknown): number => {
  if (value === null || value === undefined || value === '') {
    return 0
  }

  const parsed = Number(value)

  if (!Number.isFinite(parsed)) {
    throw new Error('Amount must be a valid number.')
  }

  return roundCurrency(parsed)
}

export const isPositiveAmount = (value: unknown): boolean => normalizeAmount(value) > 0

export const sumAmounts = (values: unknown[]): number =>
  roundCurrency(values.reduce<number>((total, value) => total + normalizeAmount(value), 0))
