import type { Payload } from 'payload'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { AccountingInvoiceService } from '@/accounting/services/invoices/AccountingInvoiceService'
import { AccountingBillService } from '@/accounting/services/bills/AccountingBillService'
import { AccountingPaymentReceivedService } from '@/accounting/services/payments/AccountingPaymentReceivedService'
import { AccountingPaymentMadeService } from '@/accounting/services/payments/AccountingPaymentMadeService'
import { AccountingLmsPaymentAllocationService } from '@/accounting/services/payments/AccountingLmsPaymentAllocationService'
import { AccountingExpenseService } from '@/accounting/services/expenses/AccountingExpenseService'
import { AccountingBankingService } from '@/accounting/services/banking/AccountingBankingService'
import { AccountingAgingReportService } from '@/accounting/services/reports/AccountingAgingReportService'
import { AccountingTaxReportService } from '@/accounting/services/reports/AccountingTaxReportService'
import { AccountingDashboardService } from '@/accounting/services/reports/AccountingDashboardService'
import { AccountingExpenseReportService } from '@/accounting/services/reports/AccountingExpenseReportService'
import { AccountingSalesReportService } from '@/accounting/services/reports/AccountingSalesReportService'
import { AccountingManualWorkflowService } from '@/accounting/services/journals/AccountingManualWorkflowService'
import { AccountingCreditNoteService } from '@/accounting/services/invoices/AccountingCreditNoteService'
import { AccountingVendorCreditService } from '@/accounting/services/bills/AccountingVendorCreditService'
import { AccountingCommercialService } from '@/accounting/services/AccountingCommercialService'
import { AccountingDocumentLinks } from '@/accounting/collections/AccountingDocumentLinks'

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

describe('Phase 2 commercial accounting workflows', () => {
  it('calculates invoice line totals with exclusive tax codes', async () => {
    const payload = createPayloadMock()
    const findByIDMock = payload.findByID as unknown as ReturnType<typeof vi.fn>

    findByIDMock.mockResolvedValue({
      id: 15,
      rate: 12,
      calculationMethod: 'exclusive',
    })

    await expect(
      AccountingInvoiceService.calculateLine(payload, {
        quantity: 2,
        unitPrice: 100,
        discountAmount: 10,
        taxCode: 15,
      }),
    ).resolves.toMatchObject({
      lineSubtotal: 190,
      lineTax: 22.8,
      lineTotal: 212.8,
    })
  })

  it('calculates bill line totals with inclusive tax codes', async () => {
    const payload = createPayloadMock()
    const findByIDMock = payload.findByID as unknown as ReturnType<typeof vi.fn>

    findByIDMock.mockResolvedValue({
      id: 25,
      rate: 12,
      calculationMethod: 'inclusive',
    })

    await expect(
      AccountingBillService.calculateLine(payload, {
        quantity: 1,
        unitPrice: 112,
        taxCode: 25,
      }),
    ).resolves.toMatchObject({
      lineSubtotal: 100,
      lineTax: 12,
      lineTotal: 112,
    })
  })

  it('posts invoices through the Phase 1 journal engine using receivable and revenue lines', async () => {
    const payload = createPayloadMock()
    const findMock = payload.find as unknown as ReturnType<typeof vi.fn>
    const findByIDMock = payload.findByID as unknown as ReturnType<typeof vi.fn>
    const updateMock = payload.update as unknown as ReturnType<typeof vi.fn>

    findByIDMock
      .mockResolvedValueOnce({
        id: 201,
        invoiceNumber: 'INV-201',
        invoiceDate: '2026-05-01T00:00:00.000Z',
        postingDate: '2026-05-01T00:00:00.000Z',
        total: 224,
        status: 'draft',
      })
      .mockResolvedValueOnce({
        id: 201,
        invoiceNumber: 'INV-201',
        invoiceDate: '2026-05-01T00:00:00.000Z',
        postingDate: '2026-05-01T00:00:00.000Z',
        total: 224,
        status: 'draft',
      })
      .mockResolvedValueOnce({
        id: 201,
        invoiceNumber: 'INV-201',
        status: 'posted',
      })
    findMock.mockResolvedValue({
      docs: [
        {
          id: 1,
          lineNumber: 1,
          description: 'Training Package',
          lineSubtotal: 200,
          lineTax: 24,
          incomeAccount: 4100,
        },
      ],
      totalPages: 1,
    })
    updateMock.mockResolvedValue({})

    vi.spyOn(AccountingInvoiceService, 'syncTotals').mockResolvedValue({
      subtotal: 200,
      taxTotal: 24,
      discountTotal: 0,
      total: 224,
    })
    const getDefaultAccountIdSpy = vi
      .spyOn(AccountingCommercialService, 'getDefaultAccountId')
      .mockResolvedValue(1100)
    const createStructuredJournalSpy = vi
      .spyOn(AccountingManualWorkflowService, 'createStructuredJournal')
      .mockResolvedValue({
        id: 710,
        fiscalYear: 2026,
        period: 5,
      } as any)

    await AccountingInvoiceService.postInvoice({
      payload,
      invoiceId: 201,
      userId: 1,
    })

    expect(createStructuredJournalSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        sourceType: 'system',
        autoPost: true,
        lines: expect.arrayContaining([
          expect.objectContaining({ account: 1100, debit: 224 }),
          expect.objectContaining({ account: 4100, credit: 200 }),
        ]),
      }),
    )
    expect(getDefaultAccountIdSpy).toHaveBeenCalledWith(payload, 'defaultReceivableAccount')
    expect(updateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'accounting-invoices',
        id: 201,
        data: expect.objectContaining({
          postingStatus: 'posted',
          postedJournalEntry: 710,
          balanceDue: 224,
        }),
      }),
    )
  })

  it('posts bills through the Phase 1 journal engine using expense and payable lines', async () => {
    const payload = createPayloadMock()
    const findMock = payload.find as unknown as ReturnType<typeof vi.fn>
    const findByIDMock = payload.findByID as unknown as ReturnType<typeof vi.fn>
    const updateMock = payload.update as unknown as ReturnType<typeof vi.fn>

    findByIDMock
      .mockResolvedValueOnce({
        id: 301,
        billNumber: 'BILL-301',
        billDate: '2026-05-02T00:00:00.000Z',
        postingDate: '2026-05-02T00:00:00.000Z',
        total: 336,
        status: 'draft',
      })
      .mockResolvedValueOnce({
        id: 301,
        billNumber: 'BILL-301',
        billDate: '2026-05-02T00:00:00.000Z',
        postingDate: '2026-05-02T00:00:00.000Z',
        total: 336,
        status: 'draft',
      })
      .mockResolvedValueOnce({
        id: 301,
        billNumber: 'BILL-301',
        status: 'posted',
      })
    findMock.mockResolvedValue({
      docs: [
        {
          id: 1,
          lineNumber: 1,
          description: 'Office Supplies',
          lineSubtotal: 300,
          lineTax: 36,
          expenseAccount: 5100,
        },
      ],
      totalPages: 1,
    })
    updateMock.mockResolvedValue({})

    vi.spyOn(AccountingBillService, 'syncTotals').mockResolvedValue({
      subtotal: 300,
      taxTotal: 36,
      total: 336,
    })
    const getDefaultAccountIdSpy = vi
      .spyOn(AccountingCommercialService, 'getDefaultAccountId')
      .mockResolvedValue(2100)
    const createStructuredJournalSpy = vi
      .spyOn(AccountingManualWorkflowService, 'createStructuredJournal')
      .mockResolvedValue({
        id: 711,
        fiscalYear: 2026,
        period: 5,
      } as any)

    await AccountingBillService.postBill({
      payload,
      billId: 301,
      userId: 1,
    })

    expect(createStructuredJournalSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        sourceType: 'system',
        autoPost: true,
        lines: expect.arrayContaining([
          expect.objectContaining({ account: 5100, debit: 300 }),
          expect.objectContaining({ account: 2100, credit: 336 }),
        ]),
      }),
    )
    expect(getDefaultAccountIdSpy).toHaveBeenCalledWith(payload, 'defaultPayableAccount')
    expect(updateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'accounting-bills',
        id: 301,
        data: expect.objectContaining({
          postingStatus: 'posted',
          postedJournalEntry: 711,
          balanceDue: 336,
        }),
      }),
    )
  })

  it('posts payment received through the Phase 1 journal engine and syncs affected invoices', async () => {
    const payload = createPayloadMock()
    const findByIDMock = payload.findByID as unknown as ReturnType<typeof vi.fn>
    const findGlobalMock = payload.findGlobal as unknown as ReturnType<typeof vi.fn>
    const updateMock = payload.update as unknown as ReturnType<typeof vi.fn>

    findByIDMock
      .mockResolvedValueOnce({
        id: 50,
        receiptNumber: 'RCPT-1',
        paymentDate: '2026-05-01T00:00:00.000Z',
        postingDate: '2026-05-01T00:00:00.000Z',
        amountReceived: 500,
        status: 'draft',
        customer: 44,
        depositAccount: {
          id: 90,
          accountName: 'Main Bank',
          ledgerAccount: 900,
        },
        applications: [
          {
            invoice: 301,
            amountApplied: 300,
          },
          {
            invoice: 302,
            amountApplied: 200,
          },
        ],
      })
      .mockResolvedValueOnce({
        id: 301,
        invoiceNumber: 'INV-301',
        customer: 44,
        status: 'posted',
        balanceDue: 300,
      })
      .mockResolvedValueOnce({
        id: 302,
        invoiceNumber: 'INV-302',
        customer: 44,
        status: 'posted',
        balanceDue: 250,
      })
    findGlobalMock.mockResolvedValue({
      defaultReceivableAccount: 1100,
      defaultUndepositedFundsAccount: 1200,
    })
    updateMock.mockResolvedValue({})

    const createStructuredJournalSpy = vi
      .spyOn(AccountingManualWorkflowService, 'createStructuredJournal')
      .mockResolvedValue({
        id: 700,
        fiscalYear: 2026,
        period: 5,
      } as any)
    const syncInvoiceBalanceSpy = vi
      .spyOn(AccountingInvoiceService, 'syncBalance')
      .mockResolvedValue({ balanceDue: 0, status: 'paid' })
    vi
      .spyOn(AccountingLmsPaymentAllocationService, 'rebuildAllocationsForPayment')
      .mockResolvedValue([])

    await AccountingPaymentReceivedService.postPayment({
      payload,
      paymentId: 50,
      userId: 1,
    })

    expect(createStructuredJournalSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        sourceType: 'system',
        autoPost: true,
        lines: expect.arrayContaining([
          expect.objectContaining({ account: 900, debit: 500 }),
          expect.objectContaining({ account: 1100, credit: 500 }),
        ]),
      }),
    )
    expect(syncInvoiceBalanceSpy).toHaveBeenCalledTimes(2)
  })

  it('rejects payment received allocations that exceed invoice balance', async () => {
    const payload = createPayloadMock()
    const findByIDMock = payload.findByID as unknown as ReturnType<typeof vi.fn>

    findByIDMock
      .mockResolvedValueOnce({
        id: 150,
        receiptNumber: 'RCPT-OVER',
        paymentDate: '2026-05-01T00:00:00.000Z',
        postingDate: '2026-05-01T00:00:00.000Z',
        amountReceived: 200,
        status: 'draft',
        customer: 77,
        applications: [
          {
            invoice: 301,
            amountApplied: 200,
          },
        ],
      })
      .mockResolvedValueOnce({
        id: 301,
        invoiceNumber: 'INV-301',
        customer: 77,
        status: 'posted',
        balanceDue: 150,
      })

    await expect(
      AccountingPaymentReceivedService.postPayment({
        payload,
        paymentId: 150,
        userId: 1,
      }),
    ).rejects.toThrow('Allocation exceeds the remaining balance for invoice INV-301.')
  })

  it('posts payment made through the Phase 1 journal engine and syncs affected bills', async () => {
    const payload = createPayloadMock()
    const findByIDMock = payload.findByID as unknown as ReturnType<typeof vi.fn>
    const findGlobalMock = payload.findGlobal as unknown as ReturnType<typeof vi.fn>
    const updateMock = payload.update as unknown as ReturnType<typeof vi.fn>

    findByIDMock
      .mockResolvedValueOnce({
        id: 51,
        paymentNumber: 'PAY-1',
        paymentDate: '2026-05-02T00:00:00.000Z',
        postingDate: '2026-05-02T00:00:00.000Z',
        amountPaid: 400,
        status: 'draft',
        vendor: 55,
        bankAccount: {
          id: 91,
          accountName: 'Operations Bank',
          ledgerAccount: 901,
        },
        applications: [
          {
            bill: 401,
            amountApplied: 400,
          },
        ],
      })
      .mockResolvedValueOnce({
        id: 401,
        billNumber: 'BILL-401',
        vendor: 55,
        status: 'posted',
        balanceDue: 450,
      })
    findGlobalMock.mockResolvedValue({
      defaultPayableAccount: 2100,
    })
    updateMock.mockResolvedValue({})

    const createStructuredJournalSpy = vi
      .spyOn(AccountingManualWorkflowService, 'createStructuredJournal')
      .mockResolvedValue({
        id: 701,
        fiscalYear: 2026,
        period: 5,
      } as any)
    const syncBillBalanceSpy = vi
      .spyOn(AccountingBillService, 'syncBalance')
      .mockResolvedValue({ balanceDue: 0, status: 'paid' })

    await AccountingPaymentMadeService.postPayment({
      payload,
      paymentId: 51,
      userId: 1,
    })

    expect(createStructuredJournalSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        sourceType: 'system',
        autoPost: true,
        lines: expect.arrayContaining([
          expect.objectContaining({ account: 2100, debit: 400 }),
          expect.objectContaining({ account: 901, credit: 400 }),
        ]),
      }),
    )
    expect(syncBillBalanceSpy).toHaveBeenCalledWith(payload, 401)
  })

  it('posts direct expenses through the journal engine with expense and cash accounts', async () => {
    const payload = createPayloadMock()
    const findByIDMock = payload.findByID as unknown as ReturnType<typeof vi.fn>
    const findGlobalMock = payload.findGlobal as unknown as ReturnType<typeof vi.fn>
    const updateMock = payload.update as unknown as ReturnType<typeof vi.fn>

    findByIDMock.mockResolvedValue({
      id: 61,
      expenseNumber: 'EXP-1',
      expenseDate: '2026-05-03T00:00:00.000Z',
      postingDate: '2026-05-03T00:00:00.000Z',
      subtotal: 1000,
      status: 'draft',
      expenseAccount: 5100,
      paymentAccount: 1000,
      taxCode: 35,
    })
    findGlobalMock.mockResolvedValue({
      defaultInputTaxAccount: 1205,
    })
    updateMock.mockResolvedValue({})

    const createStructuredJournalSpy = vi
      .spyOn(AccountingManualWorkflowService, 'createStructuredJournal')
      .mockResolvedValue({
        id: 702,
        fiscalYear: 2026,
        period: 5,
      } as any)

    await AccountingExpenseService.postExpense({
      payload,
      expenseId: 61,
      userId: 1,
    })

    expect(createStructuredJournalSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        sourceType: 'system',
        autoPost: true,
        lines: expect.arrayContaining([
          expect.objectContaining({ account: 5100, debit: 1000 }),
          expect.objectContaining({ account: 1000, credit: expect.any(Number) }),
        ]),
      }),
    )
  })

  it('posts a partially applied credit note and keeps remaining credit available', async () => {
    const payload = createPayloadMock()
    const findByIDMock = payload.findByID as unknown as ReturnType<typeof vi.fn>
    const findGlobalMock = payload.findGlobal as unknown as ReturnType<typeof vi.fn>
    const updateMock = payload.update as unknown as ReturnType<typeof vi.fn>

    findByIDMock
      .mockResolvedValueOnce({
        id: 88,
        creditNoteNumber: 'CN-1',
        creditDate: '2026-05-03T00:00:00.000Z',
        postingDate: '2026-05-03T00:00:00.000Z',
        status: 'draft',
        customer: 7,
        subtotal: 100,
        taxTotal: 12,
        total: 112,
        applications: [
          {
            invoice: 901,
            amountApplied: 70,
          },
        ],
        adjustmentAccount: 4300,
      })
      .mockResolvedValueOnce({
        id: 901,
        invoiceNumber: 'INV-901',
        customer: 7,
        status: 'posted',
        balanceDue: 90,
      })
    findGlobalMock.mockResolvedValue({
      defaultReceivableAccount: 1100,
      defaultOutputTaxAccount: 2200,
    })
    updateMock.mockResolvedValue({})

    const createStructuredJournalSpy = vi
      .spyOn(AccountingManualWorkflowService, 'createStructuredJournal')
      .mockResolvedValue({
        id: 801,
        fiscalYear: 2026,
        period: 5,
      } as any)
    const syncInvoiceBalanceSpy = vi
      .spyOn(AccountingInvoiceService, 'syncBalance')
      .mockResolvedValue({ balanceDue: 20, status: 'partially_paid' })

    await AccountingCreditNoteService.postCreditNote({
      payload,
      creditNoteId: 88,
      userId: 1,
    })

    expect(createStructuredJournalSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        lines: expect.arrayContaining([
          expect.objectContaining({ account: 4300, debit: 100 }),
          expect.objectContaining({ account: 2200, debit: 12 }),
          expect.objectContaining({ account: 1100, credit: 112 }),
        ]),
      }),
    )
    expect(updateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: 'partially_paid',
          appliedAmount: 70,
          remainingAmount: 42,
        }),
      }),
    )
    expect(syncInvoiceBalanceSpy).toHaveBeenCalledWith(payload, '901')
  })

  it('posts a partially applied vendor credit and keeps the remaining credit available', async () => {
    const payload = createPayloadMock()
    const findByIDMock = payload.findByID as unknown as ReturnType<typeof vi.fn>
    const findGlobalMock = payload.findGlobal as unknown as ReturnType<typeof vi.fn>
    const updateMock = payload.update as unknown as ReturnType<typeof vi.fn>

    findByIDMock
      .mockResolvedValueOnce({
        id: 89,
        vendorCreditNumber: 'VCN-1',
        creditDate: '2026-05-04T00:00:00.000Z',
        postingDate: '2026-05-04T00:00:00.000Z',
        status: 'draft',
        vendor: 12,
        subtotal: 200,
        taxTotal: 24,
        total: 224,
        applications: [
          {
            bill: 902,
            amountApplied: 150,
          },
        ],
        adjustmentAccount: 5200,
      })
      .mockResolvedValueOnce({
        id: 902,
        billNumber: 'BILL-902',
        vendor: 12,
        status: 'posted',
        balanceDue: 200,
      })
    findGlobalMock.mockResolvedValue({
      defaultPayableAccount: 2100,
      defaultInputTaxAccount: 1205,
    })
    updateMock.mockResolvedValue({})

    const createStructuredJournalSpy = vi
      .spyOn(AccountingManualWorkflowService, 'createStructuredJournal')
      .mockResolvedValue({
        id: 802,
        fiscalYear: 2026,
        period: 5,
      } as any)
    const syncBillBalanceSpy = vi
      .spyOn(AccountingBillService, 'syncBalance')
      .mockResolvedValue({ balanceDue: 50, status: 'partially_paid' })

    await AccountingVendorCreditService.postVendorCredit({
      payload,
      vendorCreditId: 89,
      userId: 1,
    })

    expect(createStructuredJournalSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        lines: expect.arrayContaining([
          expect.objectContaining({ account: 2100, debit: 224 }),
          expect.objectContaining({ account: 5200, credit: 200 }),
          expect.objectContaining({ account: 1205, credit: 24 }),
        ]),
      }),
    )
    expect(updateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: 'partially_paid',
          appliedAmount: 150,
          remainingAmount: 74,
        }),
      }),
    )
    expect(syncBillBalanceSpy).toHaveBeenCalledWith(payload, '902')
  })

  it('posts deposits and transfers through the journal engine', async () => {
    const payload = createPayloadMock()
    const findByIDMock = payload.findByID as unknown as ReturnType<typeof vi.fn>
    const updateMock = payload.update as unknown as ReturnType<typeof vi.fn>
    const createStructuredJournalSpy = vi
      .spyOn(AccountingManualWorkflowService, 'createStructuredJournal')
      .mockResolvedValue({
        id: 703,
      } as any)

    findByIDMock
      .mockResolvedValueOnce({
        id: 71,
        depositNumber: 'DEP-1',
        depositDate: '2026-05-04T00:00:00.000Z',
        status: 'draft',
        bankAccount: { id: 1, ledgerAccount: 1010 },
        sourceAccount: 1020,
        amount: 250,
      })
      .mockResolvedValueOnce({
        id: 72,
        transferNumber: 'TRF-1',
        transferDate: '2026-05-05T00:00:00.000Z',
        status: 'draft',
        fromBankAccount: { id: 1, ledgerAccount: 1010 },
        toBankAccount: { id: 2, ledgerAccount: 1030 },
        amount: 300,
      })
    updateMock.mockResolvedValue({})

    await AccountingBankingService.postDeposit({
      payload,
      depositId: 71,
      userId: 1,
    })
    await AccountingBankingService.postTransfer({
      payload,
      transferId: 72,
      userId: 1,
    })

    expect(createStructuredJournalSpy).toHaveBeenCalledTimes(2)
    expect(createStructuredJournalSpy.mock.calls[0][0].lines).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ account: 1010, debit: 250 }),
        expect.objectContaining({ account: 1020, credit: 250 }),
      ]),
    )
    expect(createStructuredJournalSpy.mock.calls[1][0].lines).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ account: 1030, debit: 300 }),
        expect.objectContaining({ account: 1010, credit: 300 }),
      ]),
    )
  })

  it('builds AR aging buckets from posted invoices with remaining balances', async () => {
    const payload = createPayloadMock()
    const findMock = payload.find as unknown as ReturnType<typeof vi.fn>

    findMock.mockResolvedValue({
      docs: [
        {
          id: 801,
          invoiceNumber: 'INV-1',
          invoiceDate: '2026-04-01T00:00:00.000Z',
          dueDate: '2026-04-15T00:00:00.000Z',
          currency: 'PHP',
          total: 1000,
          balanceDue: 400,
          status: 'posted',
          customer: {
            id: 1,
            customerCode: 'CUST-1',
            displayName: 'Sample Customer',
          },
        },
      ],
      totalPages: 1,
    })

    const rows = await AccountingAgingReportService.getAccountsReceivableAging(payload)

    expect(rows).toHaveLength(1)
    expect(rows[0]).toMatchObject({
      entityCode: 'CUST-1',
      documentNumber: 'INV-1',
      balanceDue: 400,
    })
    expect(
      rows[0].currentAmount +
        rows[0].bucket1to30 +
        rows[0].bucket31to60 +
        rows[0].bucket61to90 +
        rows[0].bucketOver90,
    ).toBe(400)
  })

  it('builds AP aging buckets from posted bills with remaining balances', async () => {
    const payload = createPayloadMock()
    const findMock = payload.find as unknown as ReturnType<typeof vi.fn>

    findMock.mockResolvedValue({
      docs: [
        {
          id: 901,
          billNumber: 'BILL-1',
          billDate: '2026-04-01T00:00:00.000Z',
          dueDate: '2026-04-20T00:00:00.000Z',
          currency: 'PHP',
          total: 800,
          balanceDue: 300,
          status: 'posted',
          vendor: {
            id: 2,
            vendorCode: 'VEND-1',
            displayName: 'Sample Vendor',
          },
        },
      ],
      totalPages: 1,
    })

    const rows = await AccountingAgingReportService.getAccountsPayableAging(payload)

    expect(rows).toHaveLength(1)
    expect(rows[0]).toMatchObject({
      entityCode: 'VEND-1',
      documentNumber: 'BILL-1',
      balanceDue: 300,
    })
    expect(
      rows[0].currentAmount +
        rows[0].bucket1to30 +
        rows[0].bucket31to60 +
        rows[0].bucket61to90 +
        rows[0].bucketOver90,
    ).toBe(300)
  })

  it('uses bank transactions when determining reconciliation completion', async () => {
    const payload = createPayloadMock()
    const findByIDMock = payload.findByID as unknown as ReturnType<typeof vi.fn>
    const findMock = payload.find as unknown as ReturnType<typeof vi.fn>
    const updateMock = payload.update as unknown as ReturnType<typeof vi.fn>

    findByIDMock
      .mockResolvedValueOnce({
        id: 990,
        bankAccount: 10,
        statementStartDate: '2026-05-01T00:00:00.000Z',
        statementEndDate: '2026-05-31T00:00:00.000Z',
        statementClosingBalance: 400,
      })
      .mockResolvedValueOnce({
        id: 10,
        ledgerAccount: 1010,
      })
    findMock
      .mockResolvedValueOnce({
        docs: [
          {
            id: 1,
            transactionDate: '2026-05-10T00:00:00.000Z',
            description: 'Deposit',
            amountIn: 500,
            amountOut: 0,
            matchStatus: 'matched',
          },
          {
            id: 2,
            transactionDate: '2026-05-11T00:00:00.000Z',
            description: 'Fee',
            amountIn: 0,
            amountOut: 100,
            matchStatus: 'matched',
          },
        ],
        totalPages: 1,
      })
      .mockResolvedValueOnce({
        docs: [
          {
            id: 1001,
            debit: 500,
            credit: 0,
            journalEntry: {
              status: 'posted',
              postingDate: '2026-05-10T00:00:00.000Z',
            },
          },
          {
            id: 1002,
            debit: 0,
            credit: 100,
            journalEntry: {
              status: 'posted',
              postingDate: '2026-05-11T00:00:00.000Z',
            },
          },
        ],
        totalPages: 1,
      })
    updateMock.mockResolvedValue({})

    const snapshot = await AccountingBankingService.getReconciliationSnapshot(payload, 990)

    expect(snapshot.canComplete).toBe(true)
    expect(snapshot.unmatchedTransactionCount).toBe(0)
    expect(snapshot.statementActivityNet).toBe(400)

    findByIDMock
      .mockResolvedValueOnce({
        id: 990,
        bankAccount: 10,
        statementStartDate: '2026-05-01T00:00:00.000Z',
        statementEndDate: '2026-05-31T00:00:00.000Z',
        statementClosingBalance: 400,
      })
      .mockResolvedValueOnce({
        id: 10,
        ledgerAccount: 1010,
      })
    findMock
      .mockResolvedValueOnce({
        docs: [
          {
            id: 1,
            transactionDate: '2026-05-10T00:00:00.000Z',
            description: 'Deposit',
            amountIn: 500,
            amountOut: 0,
            matchStatus: 'matched',
          },
          {
            id: 2,
            transactionDate: '2026-05-11T00:00:00.000Z',
            description: 'Fee',
            amountIn: 0,
            amountOut: 100,
            matchStatus: 'matched',
          },
        ],
        totalPages: 1,
      })
      .mockResolvedValueOnce({
        docs: [
          {
            id: 1001,
            debit: 500,
            credit: 0,
            journalEntry: {
              status: 'posted',
              postingDate: '2026-05-10T00:00:00.000Z',
            },
          },
          {
            id: 1002,
            debit: 0,
            credit: 100,
            journalEntry: {
              status: 'posted',
              postingDate: '2026-05-11T00:00:00.000Z',
            },
          },
        ],
        totalPages: 1,
      })

    await AccountingBankingService.completeReconciliation({
      payload,
      reconciliationId: 990,
      userId: 1,
    })

    expect(updateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: 'completed',
          differenceAmount: 0,
        }),
      }),
    )
  })

  it('builds tax summary rows from posted commercial documents', async () => {
    const payload = createPayloadMock()
    const findMock = payload.find as unknown as ReturnType<typeof vi.fn>

    findMock
      .mockResolvedValueOnce({
        docs: [
          {
            id: 1,
            lineSubtotal: 100,
            lineTax: 12,
            taxCode: {
              id: 11,
              code: 'VAT12S',
              name: 'Sales VAT 12%',
              scope: 'sales',
              calculationMethod: 'exclusive',
            },
            invoice: {
              id: 201,
              status: 'posted',
            },
          },
        ],
        totalPages: 1,
      })
      .mockResolvedValueOnce({
        docs: [
          {
            id: 2,
            lineSubtotal: 50,
            lineTax: 6,
            taxCode: {
              id: 12,
              code: 'VAT12P',
              name: 'Purchase VAT 12%',
              scope: 'purchase',
              calculationMethod: 'exclusive',
            },
            bill: {
              id: 301,
              status: 'posted',
            },
          },
        ],
        totalPages: 1,
      })
      .mockResolvedValueOnce({
        docs: [
          {
            id: 3,
            status: 'posted',
            subtotal: 25,
            taxTotal: 3,
            taxCode: {
              id: 12,
              code: 'VAT12P',
              name: 'Purchase VAT 12%',
              scope: 'purchase',
              calculationMethod: 'exclusive',
            },
          },
        ],
        totalPages: 1,
      })

    const rows = await AccountingTaxReportService.getTaxSummary(payload)

    expect(rows).toHaveLength(2)
    expect(rows).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          taxCode: 'VAT12S',
          taxableAmount: 100,
          taxAmount: 12,
        }),
        expect.objectContaining({
          taxCode: 'VAT12P',
          taxableAmount: 75,
          taxAmount: 9,
        }),
      ]),
    )
  })

  it('limits operational registers to posted accounting outputs', async () => {
    const payload = createPayloadMock()
    const findMock = payload.find as unknown as ReturnType<typeof vi.fn>

    findMock
      .mockResolvedValueOnce({
        docs: [
          {
            id: 1,
            invoiceNumber: 'INV-POSTED',
            invoiceDate: '2026-05-10T00:00:00.000Z',
            postingDate: '2026-05-10T00:00:00.000Z',
            dueDate: '2026-05-25T00:00:00.000Z',
            status: 'posted',
            total: 100,
            balanceDue: 100,
            customer: { id: 11, customerCode: 'CUST-1', displayName: 'Posted Customer' },
          },
        ],
        totalPages: 1,
      })
      .mockResolvedValueOnce({
        docs: [
          {
            id: 2,
            receiptNumber: 'RCPT-POSTED',
            paymentDate: '2026-05-11T00:00:00.000Z',
            postingDate: '2026-05-11T00:00:00.000Z',
            status: 'posted',
            amountReceived: 100,
            customer: { id: 11, customerCode: 'CUST-1', displayName: 'Posted Customer' },
          },
        ],
        totalPages: 1,
      })
      .mockResolvedValueOnce({
        docs: [
          {
            id: 3,
            billNumber: 'BILL-POSTED',
            billDate: '2026-05-12T00:00:00.000Z',
            postingDate: '2026-05-12T00:00:00.000Z',
            dueDate: '2026-05-30T00:00:00.000Z',
            status: 'paid',
            total: 100,
            balanceDue: 0,
            vendor: { id: 22, vendorCode: 'VEND-1', displayName: 'Posted Vendor' },
          },
        ],
        totalPages: 1,
      })
      .mockResolvedValueOnce({
        docs: [
          {
            id: 4,
            paymentNumber: 'PAY-POSTED',
            paymentDate: '2026-05-13T00:00:00.000Z',
            postingDate: '2026-05-13T00:00:00.000Z',
            status: 'posted',
            amountPaid: 100,
            vendor: { id: 22, vendorCode: 'VEND-1', displayName: 'Posted Vendor' },
          },
        ],
        totalPages: 1,
      })
      .mockResolvedValueOnce({
        docs: [
          {
            id: 5,
            expenseNumber: 'EXP-POSTED',
            expenseDate: '2026-05-14T00:00:00.000Z',
            postingDate: '2026-05-14T00:00:00.000Z',
            status: 'posted',
            total: 50,
            vendor: { id: 22, vendorCode: 'VEND-1', displayName: 'Posted Vendor' },
          },
        ],
        totalPages: 1,
      })

    await AccountingSalesReportService.getInvoiceRegister(payload)
    await AccountingSalesReportService.getPaymentsReceivedRegister(payload)
    await AccountingExpenseReportService.getBillRegister(payload)
    await AccountingExpenseReportService.getPaymentsMadeRegister(payload)
    await AccountingExpenseReportService.getExpenseRegister(payload)

    expect(findMock).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        collection: 'accounting-invoices',
        where: {
          status: {
            in: ['posted', 'partially_paid', 'paid'],
          },
        },
      }),
    )
    expect(findMock).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        collection: 'accounting-payments-received',
        where: {
          status: {
            equals: 'posted',
          },
        },
      }),
    )
    expect(findMock).toHaveBeenNthCalledWith(
      3,
      expect.objectContaining({
        collection: 'accounting-bills',
        where: {
          status: {
            in: ['posted', 'partially_paid', 'paid'],
          },
        },
      }),
    )
    expect(findMock).toHaveBeenNthCalledWith(
      4,
      expect.objectContaining({
        collection: 'accounting-payments-made',
        where: {
          status: {
            equals: 'posted',
          },
        },
      }),
    )
    expect(findMock).toHaveBeenNthCalledWith(
      5,
      expect.objectContaining({
        collection: 'accounting-expenses',
        where: {
          status: {
            equals: 'posted',
          },
        },
      }),
    )
  })

  it('builds dashboard metrics from posted commercial activity only', async () => {
    const payload = createPayloadMock()
    const findMock = payload.find as unknown as ReturnType<typeof vi.fn>

    findMock
      .mockResolvedValueOnce({
        docs: [
          {
            id: 801,
            invoiceNumber: 'INV-1',
            invoiceDate: '2026-04-01T00:00:00.000Z',
            dueDate: '2026-04-15T00:00:00.000Z',
            currency: 'PHP',
            total: 1000,
            balanceDue: 400,
            status: 'posted',
            customer: { id: 1, customerCode: 'CUST-1', displayName: 'Sample Customer' },
          },
        ],
        totalPages: 1,
      })
      .mockResolvedValueOnce({
        docs: [
          {
            id: 901,
            billNumber: 'BILL-1',
            billDate: '2026-04-01T00:00:00.000Z',
            dueDate: '2026-04-10T00:00:00.000Z',
            currency: 'PHP',
            total: 600,
            balanceDue: 250,
            status: 'posted',
            vendor: { id: 2, vendorCode: 'VEND-1', displayName: 'Sample Vendor' },
          },
        ],
        totalPages: 1,
      })
      .mockResolvedValueOnce({
        docs: [
          {
            id: 801,
            invoiceNumber: 'INV-1',
            invoiceDate: '2026-04-01T00:00:00.000Z',
            postingDate: '2026-04-01T00:00:00.000Z',
            dueDate: '2026-04-15T00:00:00.000Z',
            currency: 'PHP',
            total: 1000,
            balanceDue: 400,
            status: 'posted',
            customer: { id: 1, customerCode: 'CUST-1', displayName: 'Sample Customer' },
          },
        ],
        totalPages: 1,
      })
      .mockResolvedValueOnce({
        docs: [
          {
            id: 901,
            billNumber: 'BILL-1',
            billDate: '2026-04-01T00:00:00.000Z',
            postingDate: '2026-04-01T00:00:00.000Z',
            dueDate: '2026-04-10T00:00:00.000Z',
            currency: 'PHP',
            total: 600,
            balanceDue: 250,
            status: 'posted',
            vendor: { id: 2, vendorCode: 'VEND-1', displayName: 'Sample Vendor' },
          },
        ],
        totalPages: 1,
      })
      .mockResolvedValueOnce({
        docs: [
          {
            id: 1001,
            receiptNumber: 'RCPT-1',
            paymentDate: '2026-05-11T00:00:00.000Z',
            postingDate: '2026-05-11T00:00:00.000Z',
            status: 'posted',
            amountReceived: 500,
            currency: 'PHP',
            customer: { id: 1, customerCode: 'CUST-1', displayName: 'Sample Customer' },
          },
        ],
        totalPages: 1,
      })
      .mockResolvedValueOnce({
        docs: [
          {
            id: 1002,
            paymentNumber: 'PAY-1',
            paymentDate: '2026-05-12T00:00:00.000Z',
            postingDate: '2026-05-12T00:00:00.000Z',
            status: 'posted',
            amountPaid: 300,
            currency: 'PHP',
            vendor: { id: 2, vendorCode: 'VEND-1', displayName: 'Sample Vendor' },
          },
        ],
        totalPages: 1,
      })
      .mockResolvedValueOnce({
        docs: [
          { id: 77, accountName: 'Main Bank', isActive: true },
        ],
        totalPages: 1,
      })
      .mockResolvedValueOnce({
        docs: [],
        totalPages: 1,
      })

    const calculateBookClosingBalanceSpy = vi
      .spyOn(AccountingBankingService, 'calculateBookClosingBalance')
      .mockResolvedValue(1500)

    const dashboard = await AccountingDashboardService.getDashboard(payload)

    expect(calculateBookClosingBalanceSpy).toHaveBeenCalledWith(payload, 77)
    expect(dashboard.summary).toEqual({
      totalReceivables: 400,
      totalPayables: 250,
      overdueInvoiceCount: 1,
      overdueBillCount: 1,
      totalCashAndBank: 1500,
    })
    expect(dashboard.recentInvoices[0]?.documentNumber).toBe('INV-1')
    expect(dashboard.recentBills[0]?.documentNumber).toBe('BILL-1')
    expect(dashboard.recentPayments.map((row) => row.documentNumber)).toEqual(['PAY-1', 'RCPT-1'])
  })

  it('links accounting documents to existing media uploads without creating a separate upload system', async () => {
    const beforeChange = AccountingDocumentLinks.hooks?.beforeChange?.[0]

    expect(beforeChange).toBeTypeOf('function')

    const result = beforeChange?.({
      data: {
        media: 501,
        entityType: 'invoice',
        entityId: 201,
        documentCategory: 'invoice',
        notes: '  Supporting PDF  ',
      },
      req: {
        user: {
          id: 9,
        },
      },
    } as any)

    expect(result).toMatchObject({
      media: 501,
      entityType: 'invoice',
      entityId: '201',
      documentCategory: 'invoice',
      notes: 'Supporting PDF',
      uploadedBy: 9,
      createdBy: 9,
      updatedBy: 9,
    })
  })
})
