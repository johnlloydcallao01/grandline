import type { Payload } from 'payload'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { AccountingCustomerRegisterService } from '@/accounting/services/customers/AccountingCustomerRegisterService'

const createPayloadMock = (overrides: Partial<Payload> = {}) =>
  ({
    find: vi.fn(),
    ...overrides,
  }) as unknown as Payload

afterEach(() => {
  vi.restoreAllMocks()
})

describe('Accounting customer master register service', () => {
  it('builds page-shaped customer rows with filters, metrics, and corporate label mapping', async () => {
    const payload = createPayloadMock()
    const findMock = payload.find as unknown as ReturnType<typeof vi.fn>

    findMock.mockImplementation(async ({ collection }) => {
      if (collection === 'accounting-customers') {
        return {
          docs: [
            {
              id: 1,
              customerCode: 'CUST-0001',
              displayName: 'Blue Anchor Marine',
              legalName: 'Blue Anchor Marine Inc.',
              customerType: 'company',
              email: 'billing@blueanchor.test',
              currencyReference: { id: 11, code: 'PHP', name: 'Philippine Peso' },
              paymentTermReference: { id: 21, code: 'NET30', name: '30 days', dueInDays: 30 },
              creditLimit: 25000,
              status: 'active',
            },
            {
              id: 2,
              customerCode: 'CUST-0002',
              displayName: 'Ana Santos',
              customerType: 'individual',
              email: 'ana@test.com',
              currencyReference: { id: 11, code: 'PHP', name: 'Philippine Peso' },
              paymentTermReference: { id: 22, code: 'CASH', name: 'Cash', dueInDays: 0 },
              creditLimit: 0,
              status: 'inactive',
            },
            {
              id: 3,
              customerCode: 'CUST-0003',
              displayName: 'Pier Sponsor',
              customerType: 'sponsor',
              email: 'finance@piersponsor.test',
              currencyReference: { id: 12, code: 'USD', name: 'US Dollar' },
              paymentTermReference: { id: 23, code: 'NET45', name: '45 days', dueInDays: 45 },
              creditLimit: 10000,
              status: 'archived',
            },
          ],
          totalPages: 1,
          totalDocs: 3,
        }
      }

      if (collection === 'accounting-currencies') {
        return {
          docs: [
            { id: 11, code: 'PHP', name: 'Philippine Peso', isActive: true },
            { id: 12, code: 'USD', name: 'US Dollar', isActive: true },
          ],
          totalPages: 1,
          totalDocs: 2,
        }
      }

      if (collection === 'accounting-payment-terms') {
        return {
          docs: [
            { id: 21, code: 'NET30', name: '30 days', dueInDays: 30, isActive: true },
            { id: 22, code: 'CASH', name: 'Cash', dueInDays: 0, isActive: true },
          ],
          totalPages: 1,
          totalDocs: 2,
        }
      }

      return { docs: [], totalPages: 1, totalDocs: 0 }
    })

    const result = await AccountingCustomerRegisterService.getCustomerMasterRegister(payload, {
      search: 'blue',
      customerTypes: ['company'],
      hasCreditLimit: true,
      page: 1,
      limit: 10,
    })

    expect(result.rows).toHaveLength(1)
    expect(result.rows[0]).toMatchObject({
      id: 1,
      customerCode: 'CUST-0001',
      displayName: 'Blue Anchor Marine',
      customerType: 'company',
      customerTypeLabel: 'Corporate',
      status: 'active',
      statusLabel: 'Active',
      hasCreditLimit: true,
      currencyReferenceId: 11,
      paymentTermReferenceId: 21,
    })

    expect(result.metrics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ label: 'Active Customers', value: 1 }),
        expect.objectContaining({ label: 'Corporate Customers', value: 1 }),
        expect.objectContaining({ label: 'With Credit Limits', value: 2 }),
        expect.objectContaining({ label: 'Inactive Customers', value: 2 }),
      ]),
    )

    expect(result.appliedFilters).toMatchObject({
      search: 'blue',
      customerTypes: ['company'],
      hasCreditLimit: true,
    })
    expect(result.referenceData.currencies).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: 11, code: 'PHP', name: 'Philippine Peso' }),
      ]),
    )
    expect(result.referenceData.paymentTerms).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: 21, code: 'NET30', name: '30 days', dueInDays: 30 }),
      ]),
    )
  })

  it('paginates filtered results and clamps oversize page requests', async () => {
    const payload = createPayloadMock()
    const findMock = payload.find as unknown as ReturnType<typeof vi.fn>

    findMock.mockImplementation(async ({ collection }) => {
      if (collection === 'accounting-customers') {
        return {
          docs: [
            {
              id: 1,
              customerCode: 'CUST-0001',
              displayName: 'Alpha Shipping',
              customerType: 'company',
              currencyReference: { id: 11, code: 'PHP', name: 'Philippine Peso' },
              paymentTermReference: { id: 21, code: 'NET30', name: '30 days', dueInDays: 30 },
              creditLimit: 5000,
              status: 'active',
            },
            {
              id: 2,
              customerCode: 'CUST-0002',
              displayName: 'Bravo Marine',
              customerType: 'company',
              currencyReference: { id: 11, code: 'PHP', name: 'Philippine Peso' },
              paymentTermReference: { id: 21, code: 'NET30', name: '30 days', dueInDays: 30 },
              creditLimit: 2000,
              status: 'active',
            },
            {
              id: 3,
              customerCode: 'CUST-0003',
              displayName: 'Charlie Port',
              customerType: 'company',
              currencyReference: { id: 11, code: 'PHP', name: 'Philippine Peso' },
              paymentTermReference: { id: 21, code: 'NET30', name: '30 days', dueInDays: 30 },
              creditLimit: 0,
              status: 'active',
            },
          ],
          totalPages: 1,
          totalDocs: 3,
        }
      }

      if (collection === 'accounting-currencies') {
        return { docs: [{ id: 11, code: 'PHP', name: 'Philippine Peso', isActive: true }], totalPages: 1, totalDocs: 1 }
      }

      if (collection === 'accounting-payment-terms') {
        return { docs: [{ id: 21, code: 'NET30', name: '30 days', dueInDays: 30, isActive: true }], totalPages: 1, totalDocs: 1 }
      }

      return { docs: [], totalPages: 1, totalDocs: 0 }
    })

    const result = await AccountingCustomerRegisterService.getCustomerMasterRegister(payload, {
      customerTypes: ['company'],
      page: 99,
      limit: 2,
    })

    expect(result.pagination).toMatchObject({
      page: 2,
      limit: 2,
      totalDocs: 3,
      totalPages: 2,
      hasPrevPage: true,
      hasNextPage: false,
    })
    expect(result.rows.map((row) => row.customerCode)).toEqual(['CUST-0003'])
  })
})
