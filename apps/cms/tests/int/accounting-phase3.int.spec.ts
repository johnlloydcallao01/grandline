import type { Payload } from 'payload'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { AccountingEnrollmentBillingService } from '@/accounting/services/enrollment-billing/AccountingEnrollmentBillingService'
import { AccountingLmsBridgeSyncService } from '@/accounting/services/enrollment-billing/AccountingLmsBridgeSyncService'
import { AccountingEnrollmentInvoiceService } from '@/accounting/services/enrollment-billing/AccountingEnrollmentInvoiceService'
import { AccountingLmsPaymentAllocationService } from '@/accounting/services/payments/AccountingLmsPaymentAllocationService'
import { AccountingReceiptService } from '@/accounting/services/receipts/AccountingReceiptService'
import { AccountingRevenueRecognitionService } from '@/accounting/services/revenue-recognition/AccountingRevenueRecognitionService'
import { AccountingLmsRefundService } from '@/accounting/services/refunds/AccountingLmsRefundService'
import { AccountingCertificateMonetizationService } from '@/accounting/services/certificates/AccountingCertificateMonetizationService'
import { AccountingCreditNoteService } from '@/accounting/services/invoices/AccountingCreditNoteService'
import { AccountingEnrollmentBillingLinks } from '@/accounting/collections/AccountingEnrollmentBillingLinks'
import { AccountingLmsDashboardService } from '@/accounting/services/reports/AccountingLmsDashboardService'
import { getCertificateRevenue } from '@/accounting/queries/getCertificateRevenue'

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

describe('Phase 3 LMS accounting workflows', () => {
  it('creates an enrollment billing link from LMS pricing snapshots and auto-creates the customer', async () => {
    const payload = createPayloadMock()
    const findMock = payload.find as unknown as ReturnType<typeof vi.fn>
    const findByIDMock = payload.findByID as unknown as ReturnType<typeof vi.fn>
    const createMock = payload.create as unknown as ReturnType<typeof vi.fn>

    findByIDMock.mockResolvedValue({
      id: 101,
      course: {
        id: 11,
        title: 'Bridge Resource Management',
        price: 1000,
        discountedPrice: 900,
        instructor: 81,
      },
      student: {
        id: 21,
        srn: 'TR-1',
        user: {
          id: 31,
          email: 'trainee@example.com',
          firstName: 'Ana',
          lastName: 'Santos',
          phone: '0917',
          completeAddress: 'Manila',
        },
      },
      enrolledAt: '2026-05-10T00:00:00.000Z',
      status: 'pending',
      enrollmentType: 'paid',
      paymentStatus: 'pending',
      listPriceSnapshot: 1000,
      finalPriceSnapshot: 800,
      couponCode: 'LESS100',
      couponDiscountAmount: 100,
      pricingBreakdown: {
        couponCode: 'LESS100',
      },
    })

    findMock.mockImplementation(async ({ collection }) => {
      if (collection === 'accounting-customers') return { docs: [], totalPages: 1, totalDocs: 0 }
      if (collection === 'accounting-enrollment-billing-links') return { docs: [], totalPages: 1, totalDocs: 0 }
      if (collection === 'accounting-course-fee-profiles') return { docs: [], totalPages: 1, totalDocs: 0 }
      if (
        [
          'accounting-scholarship-awards',
          'accounting-corporate-billing-links',
          'accounting-billing-adjustments',
          'accounting-payment-allocations',
          'accounting-refunds',
        ].includes(String(collection))
      ) {
        return { docs: [], totalPages: 1, totalDocs: 0 }
      }
      return { docs: [], totalPages: 1, totalDocs: 0 }
    })

    createMock.mockImplementation(async ({ collection, data }) => {
      if (collection === 'accounting-customers') return { id: 401, ...data }
      if (collection === 'accounting-enrollment-billing-links') return { id: 501, ...data }
      return { id: 999, ...data }
    })

    const link = await AccountingEnrollmentBillingService.ensureBillingLink({
      payload,
      enrollmentId: 101,
    })

    expect(createMock).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'accounting-customers',
        data: expect.objectContaining({
          displayName: 'Ana Santos',
          email: 'trainee@example.com',
        }),
      }),
    )
    expect(link).toMatchObject({
      id: 501,
      billingStatus: 'not_started',
      listPriceSnapshot: 1000,
      salePriceSnapshot: 900,
      couponDiscountSnapshot: 100,
      finalChargeSnapshot: 800,
    })
  })

  it('creates an enrollment invoice using the deferred revenue account for straight-line recognition', async () => {
    const payload = createPayloadMock()
    const createMock = payload.create as unknown as ReturnType<typeof vi.fn>
    const findMock = payload.find as unknown as ReturnType<typeof vi.fn>
    const updateMock = payload.update as unknown as ReturnType<typeof vi.fn>
    const findByIDMock = payload.findByID as unknown as ReturnType<typeof vi.fn>

    vi.spyOn(AccountingEnrollmentBillingService, 'ensureBillingLink').mockResolvedValue({
      id: 501,
      customer: 401,
      invoice: null,
    } as any)
    vi.spyOn(AccountingEnrollmentBillingService, 'getEnrollmentFinanceSummary').mockResolvedValue({
      enrollmentId: 101,
      billingLinkId: 501,
      invoiceId: null,
      invoiceNumber: null,
      customerId: 401,
      customerName: 'Ana Santos',
      enrollmentType: 'paid',
      billingStatus: 'not_started',
      listPrice: 1000,
      salePrice: 900,
      couponDiscount: 100,
      scholarshipDiscount: 0,
      corporateCoverage: 0,
      adjustmentsNet: 0,
      finalCharge: 800,
      amountAllocated: 0,
      amountPaid: 0,
      balanceDue: 800,
      currency: 'PHP',
    })
    vi.spyOn(AccountingEnrollmentBillingService, 'getFinanceContext').mockResolvedValue({
      enrollment: {
        id: 101,
        enrolledAt: '2026-05-10T00:00:00.000Z',
      },
      course: {
        id: 11,
        title: 'Bridge Resource Management',
      },
      trainee: { id: 21 },
      user: { id: 31 },
      billingLink: { id: 501, customer: 401 },
      invoice: null,
      customer: { id: 401 },
      feeProfile: {
        defaultRecognitionMethod: 'straight_line',
        deferredRevenueAccount: 9100,
      },
      scholarshipAwards: [],
      corporateLinks: [],
      adjustments: [],
      allocations: [],
      refund: null,
    } as any)

    createMock.mockImplementation(async ({ collection, data }) => {
      if (collection === 'accounting-invoices') return { id: 601, ...data }
      if (collection === 'accounting-invoice-line-items') return { id: 701, ...data }
      return { id: 999, ...data }
    })
    findMock.mockResolvedValue({
      docs: [],
      totalPages: 1,
      totalDocs: 0,
    })
    findByIDMock.mockResolvedValue({
      id: 601,
      invoiceNumber: 'INV-601',
      customer: 401,
      status: 'draft',
    })
    updateMock.mockResolvedValue({})

    await AccountingEnrollmentInvoiceService.ensureInvoiceForEnrollment({
      payload,
      enrollmentId: 101,
      userId: 31,
      autoPost: false,
    })

    expect(createMock).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'accounting-invoice-line-items',
        data: expect.objectContaining({
          incomeAccount: 9100,
          unitPrice: 800,
          referenceEntityType: 'enrollment',
          referenceEntityId: '101',
        }),
      }),
    )
    expect(updateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'accounting-enrollment-billing-links',
        id: 501,
      }),
    )
  })

  it('updates an existing mutable enrollment invoice when LMS billing changes', async () => {
    const payload = createPayloadMock()
    const findMock = payload.find as unknown as ReturnType<typeof vi.fn>
    const findByIDMock = payload.findByID as unknown as ReturnType<typeof vi.fn>
    const updateMock = payload.update as unknown as ReturnType<typeof vi.fn>

    vi.spyOn(AccountingEnrollmentBillingService, 'ensureBillingLink').mockResolvedValue({
      id: 501,
      customer: 401,
      invoice: 601,
    } as any)
    vi.spyOn(AccountingEnrollmentBillingService, 'getEnrollmentFinanceSummary').mockResolvedValue({
      enrollmentId: 101,
      billingLinkId: 501,
      invoiceId: 601,
      invoiceNumber: 'INV-601',
      customerId: 401,
      customerName: 'Ana Santos',
      enrollmentType: 'paid',
      billingStatus: 'drafted',
      listPrice: 1000,
      salePrice: 900,
      couponDiscount: 100,
      scholarshipDiscount: 0,
      corporateCoverage: 0,
      adjustmentsNet: 250,
      finalCharge: 1050,
      amountAllocated: 0,
      amountPaid: 0,
      balanceDue: 1050,
      currency: 'PHP',
    })
    vi.spyOn(AccountingEnrollmentBillingService, 'getFinanceContext').mockResolvedValue({
      enrollment: { id: 101, enrolledAt: '2026-05-10T00:00:00.000Z' },
      course: { id: 11, title: 'Bridge Resource Management' },
      trainee: { id: 21 },
      user: { id: 31 },
      billingLink: { id: 501, customer: 401, invoice: 601 },
      invoice: { id: 601 },
      customer: { id: 401 },
      feeProfile: {
        defaultRecognitionMethod: 'on_activation',
        courseRevenueAccount: 4100,
      },
      scholarshipAwards: [],
      corporateLinks: [],
      adjustments: [],
      allocations: [],
      refund: null,
    } as any)

    findByIDMock
      .mockResolvedValueOnce({
        id: 601,
        status: 'draft',
      })
      .mockResolvedValueOnce({
        id: 601,
        status: 'draft',
      })
    findMock.mockResolvedValue({
      docs: [{ id: 701, lineNumber: 1 }],
      totalPages: 1,
      totalDocs: 1,
    })
    updateMock.mockImplementation(async ({ collection, id, data }) => ({ id, collection, ...data }))

    await AccountingEnrollmentInvoiceService.ensureInvoiceForEnrollment({
      payload,
      enrollmentId: 101,
    })

    expect(updateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'accounting-invoice-line-items',
        id: 701,
        data: expect.objectContaining({
          unitPrice: 1050,
          incomeAccount: 4100,
        }),
      }),
    )
  })

  it('rebuilds LMS payment allocations from posted payment applications', async () => {
    const payload = createPayloadMock()
    const findByIDMock = payload.findByID as unknown as ReturnType<typeof vi.fn>
    const findMock = payload.find as unknown as ReturnType<typeof vi.fn>
    const createMock = payload.create as unknown as ReturnType<typeof vi.fn>
    const deleteMock = payload.delete as unknown as ReturnType<typeof vi.fn>

    findByIDMock.mockResolvedValue({
      id: 901,
      amountReceived: 800,
      paymentDate: '2026-05-11T00:00:00.000Z',
      postingDate: '2026-05-11T00:00:00.000Z',
      applications: [{ invoice: 601, amountApplied: 800 }],
    })
    findMock.mockImplementation(async ({ collection }) => {
      if (collection === 'accounting-payment-allocations') {
        return { docs: [{ id: 1 }], totalPages: 1, totalDocs: 1 }
      }
      if (collection === 'accounting-enrollment-billing-links') {
        return { docs: [{ id: 501, enrollment: 101 }], totalPages: 1, totalDocs: 1 }
      }
      return { docs: [], totalPages: 1, totalDocs: 0 }
    })
    createMock.mockResolvedValue({ id: 2 })
    deleteMock.mockResolvedValue({})
    vi.spyOn(AccountingEnrollmentBillingService, 'ensureBillingLink').mockResolvedValue({ id: 501 } as any)
    vi.spyOn(AccountingEnrollmentBillingService, 'syncEnrollmentOperationalPaymentState').mockResolvedValue({} as any)

    const rows = await AccountingLmsPaymentAllocationService.rebuildAllocationsForPayment(payload, 901)

    expect(deleteMock).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'accounting-payment-allocations',
        id: 1,
      }),
    )
    expect(createMock).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'accounting-payment-allocations',
        data: expect.objectContaining({
          paymentReceived: 901,
          invoice: 601,
          enrollmentBillingLink: 501,
          allocatedAmount: 800,
        }),
      }),
    )
    expect(rows).toHaveLength(1)
  })

  it('issues official receipts linked to payment proof documents', async () => {
    const payload = createPayloadMock()
    const findByIDMock = payload.findByID as unknown as ReturnType<typeof vi.fn>
    const findMock = payload.find as unknown as ReturnType<typeof vi.fn>
    const createMock = payload.create as unknown as ReturnType<typeof vi.fn>

    findByIDMock.mockResolvedValue({
      id: 901,
      customer: 401,
      paymentDate: '2026-05-11T00:00:00.000Z',
      postingDate: '2026-05-11T00:00:00.000Z',
      amountReceived: 800,
      currency: 'PHP',
      applications: [{ invoice: 601, amountApplied: 800 }],
    })
    findMock.mockImplementation(async ({ collection }) => {
      if (collection === 'accounting-receipts') return { docs: [], totalPages: 1, totalDocs: 0 }
      if (collection === 'accounting-enrollment-billing-links') {
        return { docs: [{ id: 501, enrollment: 101, customer: 401 }], totalPages: 1, totalDocs: 1 }
      }
      return { docs: [], totalPages: 1, totalDocs: 0 }
    })
    createMock.mockImplementation(async ({ collection: _collection, data }) => ({ id: 801, ...data }))
    vi.spyOn(AccountingLmsPaymentAllocationService, 'rebuildAllocationsForPayment').mockResolvedValue([])
    vi.spyOn(AccountingEnrollmentBillingService, 'syncEnrollmentOperationalPaymentState').mockResolvedValue({} as any)

    const receipt = await AccountingReceiptService.issueReceipt({
      payload,
      paymentId: 901,
      proofDocument: 77,
      notes: 'GCash confirmation',
      userId: 1,
    })

    expect(receipt).toMatchObject({
      id: 801,
      status: 'issued',
      proofDocument: 77,
      issuedBy: 1,
    })
  })

  it('creates a straight-line revenue recognition schedule from an enrollment invoice', async () => {
    const payload = createPayloadMock()
    const findMock = payload.find as unknown as ReturnType<typeof vi.fn>
    const createMock = payload.create as unknown as ReturnType<typeof vi.fn>

    vi.spyOn(AccountingEnrollmentBillingService, 'getFinanceContext').mockResolvedValue({
      enrollment: {
        id: 101,
        enrolledAt: '2026-05-01T00:00:00.000Z',
        accessExpiresAt: '2026-05-03T00:00:00.000Z',
      },
      course: {
        id: 11,
        courseEndDate: '2026-05-03T00:00:00.000Z',
      },
      trainee: { id: 21 },
      user: { id: 31 },
      billingLink: { id: 501, invoice: 601 },
      invoice: { id: 601 },
      customer: { id: 401 },
      feeProfile: { defaultRecognitionMethod: 'straight_line' },
      scholarshipAwards: [],
      corporateLinks: [],
      adjustments: [],
      allocations: [],
      refund: null,
    } as any)
    vi.spyOn(AccountingEnrollmentBillingService, 'buildFinanceSummaryFromContext').mockReturnValue({
      enrollmentId: 101,
      billingLinkId: 501,
      invoiceId: 601,
      invoiceNumber: 'INV-601',
      customerId: 401,
      customerName: 'Ana Santos',
      enrollmentType: 'paid',
      billingStatus: 'invoiced',
      listPrice: 1000,
      salePrice: 900,
      couponDiscount: 100,
      scholarshipDiscount: 0,
      corporateCoverage: 0,
      adjustmentsNet: 0,
      finalCharge: 900,
      amountAllocated: 0,
      amountPaid: 0,
      balanceDue: 900,
      currency: 'PHP',
    })
    findMock.mockResolvedValue({ docs: [], totalPages: 1, totalDocs: 0 })
    createMock.mockImplementation(async ({ data }) => ({ id: 901, ...data }))

    const schedule = (await AccountingRevenueRecognitionService.ensureScheduleForEnrollment({
      payload,
      enrollmentId: 101,
    })) as any

    expect(schedule.scheduleData).toHaveLength(3)
    expect(schedule.totalDeferredAmount).toBe(900)
    expect(schedule.status).toBe('scheduled')
  })

  it('recognizes certificate-based deferred revenue when a certificate milestone is triggered', async () => {
    const payload = createPayloadMock()
    vi.spyOn(AccountingRevenueRecognitionService, 'ensureScheduleForEnrollment').mockResolvedValue({
      id: 901,
      recognitionMethod: 'certificate_based',
      remainingDeferredAmount: 900,
    } as any)
    const recognizeSpy = vi
      .spyOn(AccountingRevenueRecognitionService, 'recognizeRevenue')
      .mockResolvedValue({ id: 901, status: 'recognized' } as any)

    await AccountingRevenueRecognitionService.processEnrollmentRecognitionTrigger({
      payload,
      enrollmentId: 101,
      trigger: 'certificate_issued',
    })

    expect(recognizeSpy).toHaveBeenCalledWith({
      payload,
      scheduleId: 901,
      amount: 900,
    })
  })

  it('syncs certificate monetization into billing adjustments and finance metadata', async () => {
    const payload = createPayloadMock()
    const findByIDMock = payload.findByID as unknown as ReturnType<typeof vi.fn>
    const findMock = payload.find as unknown as ReturnType<typeof vi.fn>
    const createMock = payload.create as unknown as ReturnType<typeof vi.fn>
    const updateMock = payload.update as unknown as ReturnType<typeof vi.fn>

    findByIDMock.mockResolvedValue({
      id: 301,
      certificateCode: 'CERT-2026-0001',
      issueDate: '2026-05-20T00:00:00.000Z',
      course: 11,
      enrollment: 101,
      metadata: {
        snapshot: true,
      },
    })
    findMock
      .mockResolvedValueOnce({
        docs: [{ id: 201, certificateFee: 250 }],
        totalPages: 1,
        totalDocs: 1,
      })
      .mockResolvedValueOnce({
        docs: [],
        totalPages: 1,
        totalDocs: 0,
      })
    createMock.mockImplementation(async ({ collection: _collection, data }) => ({ id: 801, ...data }))
    updateMock.mockImplementation(async ({ collection: _collection, id, data }) => ({ id, ...data }))

    vi.spyOn(AccountingLmsBridgeSyncService, 'syncEnrollmentArtifacts')
      .mockResolvedValueOnce({
        billingLink: { id: 501 },
        summary: { finalCharge: 900 },
        invoice: { id: 601 },
        schedule: null,
        paymentState: {},
      } as any)
      .mockResolvedValueOnce({
        billingLink: { id: 501 },
        summary: { finalCharge: 1150 },
        invoice: { id: 601 },
        schedule: { id: 901, recognizedAmount: 1150, remainingDeferredAmount: 0 },
        paymentState: {},
      } as any)

    await AccountingCertificateMonetizationService.syncCertificateAccounting({
      payload,
      certificateId: 301,
      userId: 1,
    })

    expect(createMock).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'accounting-billing-adjustments',
        data: expect.objectContaining({
          adjustmentType: 'certificate_fee',
          amount: 250,
        }),
      }),
    )
    expect(updateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'certificates',
        id: 301,
        data: expect.objectContaining({
          metadata: expect.objectContaining({
            finance: expect.objectContaining({
              certificateFee: 250,
              invoiceId: 601,
              scheduleId: 901,
            }),
          }),
        }),
      }),
    )
  })

  it('processes refunds by creating and posting a linked credit note', async () => {
    const payload = createPayloadMock()
    const findByIDMock = payload.findByID as unknown as ReturnType<typeof vi.fn>
    const createMock = payload.create as unknown as ReturnType<typeof vi.fn>
    const updateMock = payload.update as unknown as ReturnType<typeof vi.fn>

    findByIDMock
      .mockResolvedValueOnce({
        id: 301,
        enrollmentBillingLink: 501,
        invoice: 601,
        paymentReceived: 901,
        refundDate: '2026-05-12T00:00:00.000Z',
        refundReason: 'Trainee cancellation',
        requestedAmount: 400,
        approvedAmount: 400,
        currency: 'PHP',
        status: 'approved',
      })
      .mockResolvedValueOnce({
        id: 901,
        customer: 401,
        currency: 'PHP',
        depositAccount: {
          ledgerAccount: 1100,
        },
      })
      .mockResolvedValueOnce({
        id: 501,
        enrollment: 101,
      })

    createMock.mockImplementation(async ({ collection: _collection, data }) => ({ id: 701, ...data }))
    updateMock.mockImplementation(async ({ data }) => ({ id: 301, ...data }))
    vi.spyOn(AccountingCreditNoteService, 'postCreditNote').mockResolvedValue({ id: 701 } as any)
    vi.spyOn(AccountingEnrollmentBillingService, 'ensureBillingLink').mockResolvedValue({ id: 501 } as any)
    vi.spyOn(AccountingEnrollmentBillingService, 'syncEnrollmentOperationalPaymentState').mockResolvedValue({} as any)

    const refund = await AccountingLmsRefundService.processRefund({
      payload,
      refundId: 301,
      userId: 1,
    })

    expect(createMock).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'accounting-credit-notes',
        data: expect.objectContaining({
          sourceInvoice: 601,
          total: 400,
        }),
      }),
    )
    expect(refund).toMatchObject({
      id: 301,
      creditNote: 701,
      status: 'processed',
      processedBy: 1,
    })
  })

  it('keeps the enrollment billing link collection under the Accounting admin group', () => {
    expect(AccountingEnrollmentBillingLinks.admin?.group).toBe('Accounting')
  })

  it('builds the LMS dashboard from standardized accounting outputs and LMS bridge data', async () => {
    const payload = createPayloadMock()
    const findMock = payload.find as unknown as ReturnType<typeof vi.fn>

    findMock.mockImplementation(async ({ collection }) => {
      if (collection === 'accounting-enrollment-billing-links') {
        return {
          docs: [
            {
              id: 1,
              finalChargeSnapshot: 800,
              recognizedRevenueSnapshot: 300,
              trainee: 21,
              customer: 401,
              enrollment: { id: 101, enrollmentType: 'paid' },
              course: { id: 11, title: 'Bridge Resource Management', instructor: 81 },
            },
          ],
          totalPages: 1,
          totalDocs: 1,
        }
      }
      if (collection === 'course-enrollments') {
        return {
          docs: [
            { id: 101, status: 'pending', enrollmentType: 'paid', finalPriceSnapshot: 800, amountPaid: 0 },
            { id: 102, status: 'active', enrollmentType: 'free', finalPriceSnapshot: 0, amountPaid: 0 },
          ],
          totalPages: 1,
          totalDocs: 2,
        }
      }
      return { docs: [], totalPages: 1, totalDocs: 0 }
    })

    vi.spyOn(await import('@/accounting/queries/getCouponRevenueImpact'), 'getCouponRevenueImpact').mockResolvedValue([
      {
        couponId: 1,
        couponCode: 'LESS100',
        enrollmentCount: 1,
        grossRevenue: 900,
        couponDiscountAmount: 100,
        netRevenue: 800,
      },
    ])
    vi.spyOn(await import('@/accounting/queries/getScholarshipUtilization'), 'getScholarshipUtilization').mockResolvedValue([])
    vi.spyOn(await import('@/accounting/queries/getCorporateReceivables'), 'getCorporateReceivables').mockResolvedValue([])
    vi.spyOn(await import('@/accounting/queries/getCompletionToRevenue'), 'getCompletionToRevenue').mockResolvedValue([])
    vi.spyOn(await import('@/accounting/queries/getCertificateRevenue'), 'getCertificateRevenue').mockResolvedValue([])

    const dashboard = await AccountingLmsDashboardService.getDashboard(payload)

    expect(dashboard.summary).toMatchObject({
      enrollmentBillingLinks: 1,
      pendingEnrollmentRequests: 1,
      freeEnrollments: 1,
    })
    expect(dashboard.revenueByCourse[0]).toMatchObject({
      courseTitle: 'Bridge Resource Management',
      amount: 800,
    })
    expect(dashboard.couponImpact[0]?.couponCode).toBe('LESS100')
  })

  it('derives certificate revenue from billing adjustments instead of only certificate metadata', async () => {
    const payload = createPayloadMock()
    const findMock = payload.find as unknown as ReturnType<typeof vi.fn>

    findMock.mockImplementation(async ({ collection }) => {
      if (collection === 'certificates') {
        return {
          docs: [
            {
              id: 301,
              enrollment: 101,
              course: { id: 11, title: 'Bridge Resource Management' },
              issueDate: '2026-05-20T00:00:00.000Z',
              metadata: {},
            },
          ],
          totalPages: 1,
          totalDocs: 1,
        }
      }
      if (collection === 'accounting-enrollment-billing-links') {
        return {
          docs: [{ id: 501, enrollment: 101 }],
          totalPages: 1,
          totalDocs: 1,
        }
      }
      if (collection === 'accounting-billing-adjustments') {
        return {
          docs: [{ id: 801, enrollmentBillingLink: 501, amount: 250 }],
          totalPages: 1,
          totalDocs: 1,
        }
      }
      return { docs: [], totalPages: 1, totalDocs: 0 }
    })

    const rows = await getCertificateRevenue(payload)

    expect(rows[0]).toMatchObject({
      certificateId: 301,
      enrollmentId: 101,
      billedAmount: 250,
    })
  })
})
