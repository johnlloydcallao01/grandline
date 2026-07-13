'use server'

import { getServerToken } from '@/app/actions/auth'
import { env } from '@/lib/env'

export type CurrencyRecord = {
  id: number | string
  code: string
  name: string
  symbol?: string | null
  isBaseCurrency: boolean
  isActive: boolean
  notes?: string | null
  createdAt: string
  updatedAt: string
}

export type PaymentTermRecord = {
  id: number | string
  code: string
  name: string
  dueInDays: number
  description?: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export type ReferenceOverviewCounts = {
  bankAccounts: number
  activeBankAccounts: number
  taxCodes: number
  activeTaxCodes: number
  currencies: number
  activeCurrencies: number
  baseCurrencies: number
  paymentTerms: number
  activePaymentTerms: number
  branches: number
  departments: number
  locations: number
  chartOfAccounts: number
}

export type FinancialReferenceStateResponse = {
  currencies: CurrencyRecord[]
  paymentTerms: PaymentTermRecord[]
  counts: ReferenceOverviewCounts
}

export type CreateCurrencyData = {
  code: string
  name: string
  symbol?: string
  isBaseCurrency?: boolean
  isActive?: boolean
  notes?: string
}

export type UpdateCurrencyData = {
  code?: string
  name?: string
  symbol?: string
  isBaseCurrency?: boolean
  isActive?: boolean
  notes?: string
}

export type CreatePaymentTermData = {
  code: string
  name: string
  dueInDays?: number
  description?: string
  isActive?: boolean
}

export type UpdatePaymentTermData = {
  code?: string
  name?: string
  dueInDays?: number
  description?: string
  isActive?: boolean
}

async function fetchAccountingAdmin<T>(path: string, init?: RequestInit): Promise<T> {
  const token = await getServerToken()
  if (!token) throw new Error('No admin session available.')

  const response = await fetch(`${env.NEXT_PUBLIC_API_URL}${path}`, {
    ...init,
    headers: {
      Authorization: `JWT ${token}`,
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
    cache: 'no-store',
  })

  const payload = (await response.json().catch(() => null)) as T | { error?: string } | null
  if (!response.ok) {
    const errorMessage =
      payload && typeof payload === 'object' && 'error' in payload && typeof payload.error === 'string'
        ? payload.error
        : 'Request failed.'
    throw new Error(errorMessage)
  }

  return payload as T
}

export async function fetchFinancialReferenceState(): Promise<FinancialReferenceStateResponse> {
  return fetchAccountingAdmin<FinancialReferenceStateResponse>(
    '/accounting/setup-controls/financial-reference-state',
  )
}

export async function createCurrency(data: CreateCurrencyData): Promise<CurrencyRecord> {
  return fetchAccountingAdmin<CurrencyRecord>(
    '/accounting/currencies',
    { method: 'POST', body: JSON.stringify(data) },
  )
}

export async function updateCurrency(id: number | string, data: UpdateCurrencyData): Promise<CurrencyRecord> {
  return fetchAccountingAdmin<CurrencyRecord>(
    `/accounting/currencies/${id}`,
    { method: 'PATCH', body: JSON.stringify(data) },
  )
}

export async function deleteCurrency(id: number | string): Promise<{ success: boolean }> {
  return fetchAccountingAdmin<{ success: boolean }>(
    `/accounting/currencies/${id}`,
    { method: 'DELETE' },
  )
}

export async function createPaymentTerm(data: CreatePaymentTermData): Promise<PaymentTermRecord> {
  return fetchAccountingAdmin<PaymentTermRecord>(
    '/accounting/payment-terms',
    { method: 'POST', body: JSON.stringify(data) },
  )
}

export async function updatePaymentTerm(id: number | string, data: UpdatePaymentTermData): Promise<PaymentTermRecord> {
  return fetchAccountingAdmin<PaymentTermRecord>(
    `/accounting/payment-terms/${id}`,
    { method: 'PATCH', body: JSON.stringify(data) },
  )
}

export async function deletePaymentTerm(id: number | string): Promise<{ success: boolean }> {
  return fetchAccountingAdmin<{ success: boolean }>(
    `/accounting/payment-terms/${id}`,
    { method: 'DELETE' },
  )
}

export async function fetchCurrency(id: number | string): Promise<CurrencyRecord> {
  return fetchAccountingAdmin<CurrencyRecord>(`/accounting/currencies/${id}`)
}

export async function fetchPaymentTerm(id: number | string): Promise<PaymentTermRecord> {
  return fetchAccountingAdmin<PaymentTermRecord>(`/accounting/payment-terms/${id}`)
}
