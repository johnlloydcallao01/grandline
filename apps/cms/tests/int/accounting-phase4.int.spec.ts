import type { Payload } from 'payload'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { AccountingProjectProfitabilityService } from '@/accounting/services/reports/AccountingProjectProfitabilityService'
import { AccountingBudgetService } from '@/accounting/services/budgets/AccountingBudgetService'
import { AccountingDepreciationService } from '@/accounting/services/assets/AccountingDepreciationService'
import { AccountingPayrollService } from '@/accounting/services/payroll/AccountingPayrollService'
import { AccountingApprovalService } from '@/accounting/services/approvals/AccountingApprovalService'
import { AccountingTimeTrackingService } from '@/accounting/services/time/AccountingTimeTrackingService'
import { AccountingAuditService } from '@/accounting/services/audit/AccountingAuditService'
import { AccountingFixedAssetService } from '@/accounting/services/assets/AccountingFixedAssetService'
import { AccountingManualWorkflowService } from '@/accounting/services/journals/AccountingManualWorkflowService'

const createPayloadMock = (overrides: Partial<Payload> = {}) =>
  ({
    create: vi.fn(),
    find: vi.fn(),
    findByID: vi.fn(),
    findGlobal: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    ...overrides,
  }) as unknown as Payload

afterEach(() => {
  vi.restoreAllMocks()
})

describe('Phase 4 operational finance workflows', () => {
  it('computes project profitability from linked revenue, expense, payroll, and time costs', async () => {
    const payload = createPayloadMock()
    const findByIDMock = payload.findByID as unknown as ReturnType<typeof vi.fn>
    const findMock = payload.find as unknown as ReturnType<typeof vi.fn>

    findByIDMock.mockResolvedValue({
      id: 201,
      projectCode: 'PRJ-001',
      name: 'Corporate Bridge Training',
      status: 'active',
      budgetAmount: 1500,
    })

    findMock.mockImplementation(async ({ collection }) => {
      if (collection === 'accounting-invoices') {
        return {
          docs: [{ id: 1, total: 5000 }],
          totalPages: 1,
          totalDocs: 1,
        }
      }
      if (collection === 'accounting-expenses') {
        return {
          docs: [{ id: 2, total: 700 }],
          totalPages: 1,
          totalDocs: 1,
        }
      }
      if (collection === 'accounting-payroll-entries') {
        return {
          docs: [{ id: 3, netAmount: 900 }],
          totalPages: 1,
          totalDocs: 1,
        }
      }
      if (collection === 'accounting-time-entries') {
        return {
          docs: [
            { id: 4, hours: 8, minutes: 30, billingRate: 200, costRate: 100 },
            { id: 5, hours: 2, minutes: 0, billingRate: 200, costRate: 100 },
          ],
          totalPages: 1,
          totalDocs: 2,
        }
      }
      if (collection === 'accounting-budgets') {
        return {
          docs: [{ id: 6, budgetAmount: 2500 }],
          totalPages: 1,
          totalDocs: 1,
        }
      }
      return { docs: [], totalPages: 1, totalDocs: 0 }
    })

    const result = await AccountingProjectProfitabilityService.getProjectProfitability(payload, 201)

    expect(result).toMatchObject({
      revenue: 5000,
      directExpenseCost: 700,
      payrollCost: 900,
      timeCost: 1050,
      totalTrackedHours: 10.5,
      grossProfit: 2350,
    })
  })

  it('builds budget vs actual from posted journal lines and account natural balance', async () => {
    const payload = createPayloadMock()
    vi.spyOn(AccountingBudgetService, 'getBudget').mockResolvedValue({
      id: 301,
      budgetCode: 'BUD-2026',
      name: '2026 Operations',
      status: 'approved',
      fiscalYear: 11,
    } as any)
    vi.spyOn(AccountingBudgetService, 'getBudgetLines').mockResolvedValue([
      {
        id: 401,
        account: {
          id: 501,
          accountCode: '6100',
          name: 'Operating Expense',
          normalBalance: 'debit',
        },
        period: 601,
        plannedAmount: 1000,
      },
    ] as any)

    const findMock = payload.find as unknown as ReturnType<typeof vi.fn>
    findMock.mockImplementation(async ({ collection }) => {
      if (collection === 'accounting-journal-entry-lines') {
        return {
          docs: [
            {
              id: 1,
              account: { id: 501, normalBalance: 'debit' },
              debit: 1200,
              credit: 0,
              journalEntry: { id: 701, status: 'posted', fiscalYear: 11, period: 601 },
            },
          ],
          totalPages: 1,
          totalDocs: 1,
        }
      }
      return { docs: [], totalPages: 1, totalDocs: 0 }
    })

    const result = await AccountingBudgetService.getBudgetVsActual(payload, 301)

    expect(result.rows[0]).toMatchObject({
      plannedAmount: 1000,
      actualAmount: 1200,
      varianceAmount: 200,
    })
  })

  it('posts depreciation through the journal engine and updates the asset lifecycle', async () => {
    const payload = createPayloadMock()
    const findByIDMock = payload.findByID as unknown as ReturnType<typeof vi.fn>
    const updateMock = payload.update as unknown as ReturnType<typeof vi.fn>

    findByIDMock.mockResolvedValue({
      id: 801,
      amount: 500,
      depreciationDate: '2026-06-30T00:00:00.000Z',
      status: 'scheduled',
      fixedAsset: {
        id: 901,
        assetCode: 'FA-001',
        name: 'Simulator',
        status: 'active',
        cost: 6000,
        salvageValue: 0,
        expenseAccount: 4100,
        accumulatedDepreciationAccount: 1500,
      },
    })
    updateMock.mockImplementation(async ({ id, data }) => ({ id, ...data }))

    vi.spyOn(AccountingManualWorkflowService, 'createStructuredJournal').mockResolvedValue({
      id: 1001,
    } as any)
    vi.spyOn(AccountingFixedAssetService, 'getAccumulatedDepreciation').mockResolvedValue(6000)

    const result = await AccountingDepreciationService.postDepreciationEntry({
      payload,
      depreciationEntryId: 801,
      userId: 1,
    })

    expect(result).toMatchObject({
      status: 'posted',
      postedJournalEntry: 1001,
    })
    expect(updateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'accounting-fixed-assets',
        id: 901,
        data: expect.objectContaining({
          status: 'fully_depreciated',
        }),
      }),
    )
  })

  it('posts payroll runs only after approval and creates standard journal lines', async () => {
    const payload = createPayloadMock()
    const findByIDMock = payload.findByID as unknown as ReturnType<typeof vi.fn>
    const findMock = payload.find as unknown as ReturnType<typeof vi.fn>
    const updateMock = payload.update as unknown as ReturnType<typeof vi.fn>

    vi.spyOn(AccountingApprovalService, 'ensureApprovedForEntity').mockResolvedValue({ id: 77 } as any)

    findByIDMock.mockResolvedValue({
      id: 1101,
      payrollCode: 'PAYRUN-001',
      paymentDate: '2026-06-30T00:00:00.000Z',
      status: 'approved',
    })
    findMock.mockImplementation(async ({ collection }) => {
      if (collection === 'accounting-payroll-entries') {
        return {
          docs: [
            {
              id: 1201,
              grossAmount: 2000,
              deductionAmount: 200,
              netAmount: 1800,
              expenseAccount: 5100,
              payableAccount: 2100,
            },
            {
              id: 1202,
              grossAmount: 1000,
              deductionAmount: 0,
              netAmount: 1000,
              expenseAccount: 5100,
              payableAccount: 2100,
            },
          ],
          totalPages: 1,
          totalDocs: 2,
        }
      }
      return { docs: [], totalPages: 1, totalDocs: 0 }
    })
    updateMock.mockImplementation(async ({ id, data }) => ({ id, ...data }))

    const journalSpy = vi.spyOn(AccountingManualWorkflowService, 'createStructuredJournal').mockResolvedValue({
      id: 1301,
    } as any)

    await AccountingPayrollService.postPayrollRun({
      payload,
      payrollRunId: 1101,
      userId: 1,
    })

    expect(journalSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        lines: expect.arrayContaining([
          expect.objectContaining({ debit: 3000, credit: 0 }),
          expect.objectContaining({ debit: 0, credit: 2800 }),
        ]),
      }),
    )
  })

  it('creates approval requests and submits timesheets through workflow services', async () => {
    const payload = createPayloadMock()
    const findMock = payload.find as unknown as ReturnType<typeof vi.fn>
    const createMock = payload.create as unknown as ReturnType<typeof vi.fn>
    const updateMock = payload.update as unknown as ReturnType<typeof vi.fn>

    findMock
      .mockResolvedValueOnce({
        docs: [
          {
            id: 1401,
            entityType: 'timesheet',
            isActive: true,
            steps: [{ stepNumber: 1, approverUser: 55 }],
          },
        ],
        totalPages: 1,
        totalDocs: 1,
      })
      .mockResolvedValueOnce({
        docs: [],
        totalPages: 1,
        totalDocs: 0,
      })
    createMock.mockImplementation(async ({ data }) => ({ id: 1501, ...data }))
    updateMock.mockImplementation(async ({ id, data }) => ({ id, ...data }))
    vi.spyOn(AccountingTimeTrackingService, 'submitTimesheet').mockResolvedValue({ id: 1601 } as any)

    const request = await AccountingApprovalService.requestApproval({
      payload,
      entityType: 'timesheet',
      entityId: 1601,
      requestedBy: 1,
    })

    expect(request).toMatchObject({
      entityType: 'timesheet',
      entityId: '1601',
      status: 'pending',
      currentApprover: 55,
    })
  })

  it('records finance audit logs and swallows non-critical audit failures', async () => {
    const payload = createPayloadMock()
    const createMock = payload.create as unknown as ReturnType<typeof vi.fn>

    createMock.mockRejectedValueOnce(new Error('temporary audit issue'))

    await expect(
      AccountingAuditService.logAction({
        payload,
        entityType: 'payroll_run',
        entityId: 1,
        actionType: 'posted',
        performedBy: 1,
        afterData: { status: 'posted' },
      }),
    ).resolves.toBeUndefined()
  })
})
