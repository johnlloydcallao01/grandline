import type { Payload } from 'payload'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { AccountingCustomerService } from '@/accounting/services/customers/AccountingCustomerService'

const createPayloadMock = (overrides: Partial<Payload> = {}) =>
  ({
    find: vi.fn(),
    findByID: vi.fn(),
    ...overrides,
  }) as unknown as Payload

afterEach(() => {
  vi.restoreAllMocks()
})

describe('Accounting customer lookup syncing', () => {
  it('accepts selected currency and payment term master references', async () => {
    const payload = createPayloadMock()
    const findByIDMock = payload.findByID as unknown as ReturnType<typeof vi.fn>

    findByIDMock.mockImplementation(async ({ collection, id }) => {
      if (collection === 'accounting-currencies' && id === 11) {
        return { id: 11, code: 'PHP', name: 'Philippine Peso' }
      }

      if (collection === 'accounting-payment-terms' && id === 21) {
        return { id: 21, code: 'NET30', name: '30 days', dueInDays: 30 }
      }

      return null
    })

    const data: Record<string, unknown> = {
      customerCode: 'cust-1',
      displayName: 'Blue Anchor Marine',
      currencyReference: 11,
      paymentTermReference: 21,
    }

    AccountingCustomerService.normalizeData(data)
    await AccountingCustomerService.validateLookupReferences(payload, data)

    expect(data.currencyReference).toBe(11)
    expect(data.paymentTermReference).toBe(21)
  })

  it('rejects customer payloads that omit the required master references', async () => {
    const payload = createPayloadMock()
    const data: Record<string, unknown> = {
      customerCode: 'cust-1',
      displayName: 'Blue Anchor Marine',
    }

    AccountingCustomerService.normalizeData(data)
    await expect(
      AccountingCustomerService.validateLookupReferences(payload, data),
    ).rejects.toThrow('Customer currency reference is required')
  })
})
