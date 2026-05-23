import type { Payload } from 'payload'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { AccountingJournalEntries } from '@/accounting/collections/AccountingJournalEntries'
import { AccountingJournalService } from '@/accounting/services/journals/AccountingJournalService'
import { AccountingManualWorkflowService } from '@/accounting/services/journals/AccountingManualWorkflowService'
import { AccountingPeriodService } from '@/accounting/services/periods/AccountingPeriodService'
import { AccountingCloseService } from '@/accounting/services/periods/AccountingCloseService'
import { AccountingLedgerReportService } from '@/accounting/services/reports/AccountingLedgerReportService'
import { AccountingTrialBalanceService } from '@/accounting/services/reports/AccountingTrialBalanceService'
import { createAccountingManualJournalDraftEndpoint } from '@/endpoints/accounting/create-manual-journal-draft'
import { createAccountingOpeningBalanceEntryEndpoint } from '@/endpoints/accounting/create-opening-balance-entry'

const createPayloadMock = (overrides: Partial<Payload> = {}) =>
  ({
    create: vi.fn(),
    find: vi.fn(),
    findByID: vi.fn(),
    findGlobal: vi.fn(),
    update: vi.fn(),
    ...overrides,
  }) as unknown as Payload

afterEach(() => {
  vi.restoreAllMocks()
})

describe('Phase 1 accounting enforcement', () => {
  it('rejects unbalanced journal entry totals before posting', async () => {
    const payload = createPayloadMock()

    await expect(
      AccountingJournalService.validateLinesForEntry(
        payload,
        [
          {
            account: 100,
            debit: 100,
          },
          {
            account: 200,
            credit: 50,
          },
        ],
        {
          sourceType: 'manual',
        },
      ),
    ).rejects.toThrow('must be balanced before posting')
  })

  it('rejects posting inside a locked fiscal year window', async () => {
    const payload = createPayloadMock()
    const findMock = payload.find as unknown as ReturnType<typeof vi.fn>
    const findGlobalMock = payload.findGlobal as unknown as ReturnType<typeof vi.fn>

    findMock
      .mockResolvedValueOnce({
        docs: [
          {
            id: 1,
            status: 'open',
            closeMode: 'hard_lock',
            startDate: '2026-01-01T00:00:00.000Z',
            endDate: '2026-12-31T23:59:59.999Z',
            lockedFromDate: '2026-03-31T23:59:59.999Z',
          },
        ],
      })
      .mockResolvedValueOnce({
        docs: [
          {
            id: 11,
            status: 'open',
            startDate: '2026-03-01T00:00:00.000Z',
            endDate: '2026-03-31T23:59:59.999Z',
            lockedFromDate: null,
          },
        ],
      })

    findGlobalMock.mockResolvedValue({
      allowBackdatedPosting: true,
    })

    await expect(
      AccountingPeriodService.ensurePostingAllowed(payload, '2026-03-15T00:00:00.000Z'),
    ).rejects.toThrow('hard-locked fiscal year')
  })

  it('rejects manual posting to control accounts or non-manual accounts', async () => {
    const payload = createPayloadMock()
    const findByIDMock = payload.findByID as unknown as ReturnType<typeof vi.fn>

    findByIDMock.mockResolvedValueOnce({
      id: 100,
      isActive: true,
      allowManualEntries: false,
      isControlAccount: false,
    })

    await expect(
      AccountingJournalService.validateAccountForSourceType(payload, 100, {
        sourceType: 'manual',
      }),
    ).rejects.toThrow('not allowed for manual accounting entries')

    findByIDMock.mockResolvedValueOnce({
      id: 101,
      isActive: true,
      allowManualEntries: true,
      isControlAccount: true,
    })

    await expect(
      AccountingJournalService.validateAccountForSourceType(payload, 101, {
        sourceType: 'adjustment',
      }),
    ).rejects.toThrow('Control accounts cannot be posted to directly')
  })

  it('sorts general ledger rows before calculating running balance', async () => {
    const payload = createPayloadMock()
    const findMock = payload.find as unknown as ReturnType<typeof vi.fn>

    findMock
      .mockResolvedValueOnce({
        docs: [{ id: 10, postingDate: '2026-01-01T00:00:00.000Z' }],
        totalPages: 1,
      })
      .mockResolvedValueOnce({
        docs: [
          {
            id: 2,
            lineNumber: 2,
            debit: 0,
            credit: 50,
            description: 'Second line',
            journalEntry: {
              id: 10,
              entryNumber: 'JE-2',
              status: 'posted',
              postingDate: '2026-01-01T00:00:00.000Z',
              entryDate: '2026-01-01T00:00:00.000Z',
              memo: 'Memo',
            },
            account: {
              id: 1,
              code: '1000',
              name: 'Cash',
              normalBalance: 'debit',
            },
          },
        ],
        totalPages: 2,
      })
      .mockResolvedValueOnce({
        docs: [
          {
            id: 1,
            lineNumber: 1,
            debit: 100,
            credit: 0,
            description: 'First line',
            journalEntry: {
              id: 10,
              entryNumber: 'JE-2',
              status: 'posted',
              postingDate: '2026-01-01T00:00:00.000Z',
              entryDate: '2026-01-01T00:00:00.000Z',
              memo: 'Memo',
            },
            account: {
              id: 1,
              code: '1000',
              name: 'Cash',
              normalBalance: 'debit',
            },
          },
        ],
        totalPages: 2,
      })

    const rows = await AccountingLedgerReportService.getGeneralLedger(payload, {
      accountId: 1,
    })

    expect(rows.map((row) => row.lineId)).toEqual([1, 2])
    expect(rows.map((row) => row.runningBalance)).toEqual([100, 50])
  })

  it('aggregates trial balance rows across batched result pages', async () => {
    const payload = createPayloadMock()
    const findMock = payload.find as unknown as ReturnType<typeof vi.fn>

    findMock
      .mockResolvedValueOnce({
        docs: [{ id: 10 }],
        totalPages: 1,
      })
      .mockResolvedValueOnce({
        docs: [
          {
            account: {
              id: 1,
              code: '1000',
              name: 'Cash',
              accountType: 'asset',
              normalBalance: 'debit',
            },
            debit: 100,
            credit: 0,
          },
        ],
        totalPages: 2,
      })
      .mockResolvedValueOnce({
        docs: [
          {
            account: {
              id: 1,
              code: '1000',
              name: 'Cash',
              accountType: 'asset',
              normalBalance: 'debit',
            },
            debit: 0,
            credit: 25,
          },
        ],
        totalPages: 2,
      })

    const rows = await AccountingTrialBalanceService.getTrialBalance(payload)

    expect(rows).toHaveLength(1)
    expect(rows[0]).toMatchObject({
      accountId: 1,
      totalDebit: 100,
      totalCredit: 25,
      closingBalance: 75,
    })
  })

  it('blocks fiscal year close while periods remain open', async () => {
    const payload = createPayloadMock()
    const findByIDMock = payload.findByID as unknown as ReturnType<typeof vi.fn>
    const findMock = payload.find as unknown as ReturnType<typeof vi.fn>

    findByIDMock.mockResolvedValue({
      id: 2026,
      status: 'open',
      endDate: '2026-12-31T23:59:59.999Z',
    })

    findMock.mockResolvedValue({
      docs: [{ id: 11, status: 'open' }],
      totalDocs: 1,
    })

    await expect(
      AccountingCloseService.closeFiscalYear({
        payload,
        fiscalYearId: 2026,
        userId: 1,
      }),
    ).rejects.toThrow('must be closed first')
  })

  it('rejects reversing a journal entry that already has a recorded reversal entry', async () => {
    const payload = createPayloadMock()
    const findByIDMock = payload.findByID as unknown as ReturnType<typeof vi.fn>

    findByIDMock.mockResolvedValue({
      id: 10,
      status: 'posted',
      reversalEntry: 77,
    })

    await expect(
      AccountingManualWorkflowService.createReversalEntry({
        payload,
        journalEntryId: 10,
        userId: 1,
      }),
    ).rejects.toThrow('already has a reversal entry')
  })

  it('records reversal linkage separately from reversing user audit fields', async () => {
    const payload = createPayloadMock()
    const findByIDMock = payload.findByID as unknown as ReturnType<typeof vi.fn>
    const updateMock = payload.update as unknown as ReturnType<typeof vi.fn>
    const afterChangeHook = AccountingJournalEntries.hooks?.afterChange?.[0]

    expect(afterChangeHook).toBeTypeOf('function')

    findByIDMock.mockResolvedValue({
      id: 10,
      reversalEntry: null,
      updatedBy: 7,
    })
    updateMock.mockResolvedValue({})

    await afterChangeHook?.({
      collection: {} as any,
      data: {},
      doc: {
        id: 99,
        sourceType: 'reversal',
        status: 'posted',
        reversalOf: 10,
      },
      req: {
        payload,
        user: {
          id: 42,
        },
      } as any,
      context: {},
      operation: 'update',
      previousDoc: null as any,
    })

    expect(updateMock).toHaveBeenCalledTimes(1)
    expect(updateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 10,
        data: expect.objectContaining({
          status: 'reversed',
          postingStatus: 'reversed',
          reversalEntry: 99,
          reversedByUser: 42,
          updatedBy: 42,
        }),
      }),
    )
    expect(updateMock.mock.calls[0][0].data.reversedAt).toEqual(expect.any(String))
  })

  it('resolves the matching fiscal year and period for a posting date', async () => {
    const payload = createPayloadMock()
    const findMock = payload.find as unknown as ReturnType<typeof vi.fn>

    findMock
      .mockResolvedValueOnce({
        docs: [
          {
            id: 2026,
            status: 'open',
            closeMode: 'manual',
            startDate: '2026-01-01T00:00:00.000Z',
            endDate: '2026-12-31T23:59:59.999Z',
            lockedFromDate: null,
          },
        ],
      })
      .mockResolvedValueOnce({
        docs: [
          {
            id: 4,
            status: 'open',
            startDate: '2026-04-01T00:00:00.000Z',
            endDate: '2026-04-30T23:59:59.999Z',
            lockedFromDate: null,
          },
        ],
      })

    await expect(
      AccountingPeriodService.resolvePostingWindow(payload, '2026-04-15T00:00:00.000Z'),
    ).resolves.toMatchObject({
      fiscalYear: {
        id: 2026,
        status: 'open',
      },
      period: {
        id: 4,
        status: 'open',
      },
    })
  })

  it('creates a manual journal draft through the dedicated endpoint', async () => {
    const createStructuredJournalSpy = vi
      .spyOn(AccountingManualWorkflowService, 'createStructuredJournal')
      .mockResolvedValue({
        id: 321,
        status: 'draft',
        sourceType: 'manual',
      } as any)

    const response = await createAccountingManualJournalDraftEndpoint({
      payload: createPayloadMock(),
      user: {
        id: 55,
        role: 'admin',
      },
      json: async () => ({
        memo: 'Manual correction draft',
        lines: [
          {
            account: 100,
            debit: 500,
          },
          {
            account: 200,
            credit: 500,
          },
        ],
      }),
    } as any)

    expect(createStructuredJournalSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 55,
        sourceType: 'manual',
        autoPost: false,
      }),
    )
    await expect(response.json()).resolves.toMatchObject({
      success: true,
      journalEntry: {
        id: 321,
        status: 'draft',
      },
    })
  })

  it('creates opening balance entries with the default memo when omitted', async () => {
    const createStructuredJournalSpy = vi
      .spyOn(AccountingManualWorkflowService, 'createStructuredJournal')
      .mockResolvedValue({
        id: 654,
        status: 'draft',
        sourceType: 'opening_balance',
      } as any)

    const response = await createAccountingOpeningBalanceEntryEndpoint({
      payload: createPayloadMock(),
      user: {
        id: 88,
        role: 'admin',
      },
      json: async () => ({
        lines: [
          {
            account: 100,
            debit: 1000,
          },
          {
            account: 300,
            credit: 1000,
          },
        ],
      }),
    } as any)

    expect(createStructuredJournalSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 88,
        sourceType: 'opening_balance',
        memo: 'Opening balance entry',
      }),
    )
    await expect(response.json()).resolves.toMatchObject({
      success: true,
      journalEntry: {
        id: 654,
        sourceType: 'opening_balance',
      },
    })
  })
})
