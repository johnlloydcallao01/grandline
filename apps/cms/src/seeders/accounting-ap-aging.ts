import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../payload.config'
import {
    ACCOUNTING_COLLECTION_SLUGS,
    ACCOUNTING_HOOK_CONTEXT,
} from '../accounting/constants/accounting'
import { AccountingBillService } from '../accounting/services/bills/AccountingBillService'

type UserDoc = {
    id: number | string
}

type VendorDoc = {
    id: number | string
    vendorCode?: string | null
    displayName?: string | null
    status?: string | null
}

type ChartAccountDoc = {
    id: number | string
    code?: string | null
    name?: string | null
    accountType?: string | null
    accountSubType?: string | null
    isActive?: boolean | null
}

type BillDoc = {
    id: number | string
    billNumber?: string | null
    status?: string | null
    postingStatus?: string | null
}

const SAMPLE_COUNT = 20
const AGING_DAY_OFFSETS = [
    10,
    5,
    0,
    -4,
    -9,
    -15,
    -22,
    -29,
    -34,
    -42,
    -51,
    -59,
    -63,
    -78,
    -89,
    -96,
    -110,
    -127,
    -143,
    -168,
] as const

const toIsoTimestamp = (date: Date, hour = 8) => {
    const value = new Date(date)
    value.setHours(hour, 0, 0, 0)
    return value.toISOString()
}

const shiftDays = (date: Date, days: number) => {
    const value = new Date(date)
    value.setDate(value.getDate() + days)
    return value
}

const getVendorLabel = (vendor: VendorDoc) =>
    vendor.displayName || vendor.vendorCode || `Vendor ${String(vendor.id)}`

const getAccountLabel = (account: ChartAccountDoc) =>
    `${account.code ? `${account.code} - ` : ''}${account.name || String(account.id)}`

const buildLineAmounts = (sequence: number) => {
    const primary = 18000 + sequence * 3100
    const secondary = sequence % 4 === 0 ? 64000 + sequence * 1800 : 9500 + sequence * 1350
    return {
        primary,
        secondary,
        total: primary + secondary,
    }
}

async function seedAccountingApAging() {
    const payload = await getPayload({ config })

    const [adminUsers, vendorResult, accountResult] = await Promise.all([
        payload.find({
            collection: 'users',
            where: { role: { equals: 'admin' } } as never,
            limit: 1,
            depth: 0,
            overrideAccess: true,
        }),
        payload.find({
            collection: ACCOUNTING_COLLECTION_SLUGS.vendors as any,
            where: {
                status: {
                    in: ['active', 'on_hold'],
                },
            } as never,
            limit: 200,
            depth: 0,
            sort: 'displayName',
            overrideAccess: true,
        }),
        payload.find({
            collection: ACCOUNTING_COLLECTION_SLUGS.chartOfAccounts as any,
            where: {
                isActive: {
                    not_equals: false,
                },
            } as never,
            limit: 1000,
            depth: 0,
            sort: 'code',
            overrideAccess: true,
        }),
    ])

    const adminId = (adminUsers.docs[0] as UserDoc | undefined)?.id ?? null
    const vendors = vendorResult.docs as VendorDoc[]
    const accounts = accountResult.docs as ChartAccountDoc[]

    if (vendors.length === 0) {
        throw new Error('No eligible vendors were found. Seed vendors first, then rerun this AP aging seeder.')
    }

    if (accounts.length === 0) {
        throw new Error('No active chart accounts were found. Seed chart of accounts first, then rerun this AP aging seeder.')
    }

    const expenseAccounts = accounts.filter((account) =>
        ['expense', 'asset', 'cost_of_sales', 'other_expense'].includes(String(account.accountType || '')),
    )
    const payableAccounts = accounts.filter((account) => {
        const label = `${account.code || ''} ${account.name || ''}`.toLowerCase()
        return (
            String(account.accountSubType || '') === 'accounts_payable' ||
            String(account.accountType || '') === 'liability' ||
            /accounts payable|trade payable|payable/.test(label)
        )
    })

    if (expenseAccounts.length === 0) {
        throw new Error('No expense or asset accounts were found for bill lines. Seed chart accounts first, then rerun.')
    }

    if (payableAccounts.length === 0) {
        throw new Error('No payable or liability accounts were found for payable overrides. Seed chart accounts first, then rerun.')
    }

    let createdCount = 0
    let postedCount = 0
    let skippedCount = 0
    let failedCount = 0

    const today = new Date()
    today.setHours(8, 0, 0, 0)

    for (let index = 0; index < SAMPLE_COUNT; index += 1) {
        const sequence = index + 1
        const vendor = vendors[index % vendors.length]
        const primaryExpenseAccount = expenseAccounts[index % expenseAccounts.length]
        const secondaryExpenseAccount = expenseAccounts[(index + 3) % expenseAccounts.length]
        const payableAccount = payableAccounts[index % payableAccounts.length]
        const billNumber = `BILL-APAGING-SEED-2026-${String(sequence).padStart(3, '0')}`
        const noteSeedKey = `[seed:ap-aging-${String(sequence).padStart(3, '0')}]`
        const notes = `${noteSeedKey} Sample bill seeded for accounts-payable-aging coverage.`

        const existing = await payload.find({
            collection: ACCOUNTING_COLLECTION_SLUGS.bills as any,
            where: {
                or: [
                    {
                        billNumber: {
                            equals: billNumber,
                        },
                    },
                    {
                        notes: {
                            equals: notes,
                        },
                    },
                ],
            } as never,
            limit: 1,
            depth: 0,
            overrideAccess: true,
        })

        const existingBill = existing.docs[0] as BillDoc | undefined
        if (existingBill) {
            if (
                ['posted', 'partially_paid'].includes(String(existingBill.status || '')) &&
                String(existingBill.postingStatus || '') === 'posted'
            ) {
                skippedCount += 1
                console.log(
                    `Skipped AP aging seed ${billNumber} for ${getVendorLabel(vendor)} (already exists as ${String(existingBill.status || 'unknown')})`,
                )
                continue
            }

            const existingLines = await payload.find({
                collection: ACCOUNTING_COLLECTION_SLUGS.billLineItems as any,
                where: {
                    bill: {
                        equals: existingBill.id,
                    },
                } as never,
                limit: 100,
                depth: 0,
                overrideAccess: true,
            })

            for (const line of existingLines.docs as Array<{ id: number | string }>) {
                await payload.delete({
                    collection: ACCOUNTING_COLLECTION_SLUGS.billLineItems as any,
                    id: line.id,
                    overrideAccess: true,
                    context: {
                        [ACCOUNTING_HOOK_CONTEXT.skipBillTotalsSync]: true,
                    },
                })
            }

            await payload.update({
                collection: ACCOUNTING_COLLECTION_SLUGS.bills as any,
                id: existingBill.id,
                depth: 0,
                overrideAccess: true,
                context: {
                    [ACCOUNTING_HOOK_CONTEXT.skipBillTotalsSync]: true,
                    [ACCOUNTING_HOOK_CONTEXT.skipBillBalanceSync]: true,
                },
                data: {
                    status: 'approved',
                    postingStatus: 'unposted',
                    subtotal: 0,
                    taxTotal: 0,
                    total: 0,
                    balanceDue: 0,
                    postedJournalEntry: null,
                } as never,
            })

            console.log(`Reset partial AP aging seed ${billNumber} for ${getVendorLabel(vendor)} and will rebuild it.`)
        }

        const dueDate = shiftDays(today, AGING_DAY_OFFSETS[index])
        const billDate = shiftDays(dueDate, -Math.max(14, 24 - (index % 6) * 2))
        const postingDate = new Date(today)
        const lineAmounts = buildLineAmounts(sequence)

        const createdBill = existingBill
            ? ((await payload.update({
                collection: ACCOUNTING_COLLECTION_SLUGS.bills as any,
                id: existingBill.id,
                depth: 0,
                overrideAccess: true,
                context: {
                    [ACCOUNTING_HOOK_CONTEXT.skipBillTotalsSync]: true,
                    [ACCOUNTING_HOOK_CONTEXT.skipBillBalanceSync]: true,
                },
                data: {
                    billNumber,
                    vendor: vendor.id,
                    billDate: toIsoTimestamp(billDate, 8),
                    postingDate: toIsoTimestamp(postingDate, 9),
                    dueDate: toIsoTimestamp(dueDate, 9),
                    status: 'approved',
                    currency: 'PHP',
                    exchangeRate: 1,
                    referenceNumber: `REF-APAG-${String(sequence).padStart(4, '0')}`,
                    memo: `Seeded AP aging bill ${sequence} for ${getVendorLabel(vendor)}.`,
                    payableAccountOverride: payableAccount.id,
                    notes,
                    postedJournalEntry: null,
                    createdBy: adminId,
                    updatedBy: adminId,
                } as never,
            })) as BillDoc)
            : ((await payload.create({
                collection: ACCOUNTING_COLLECTION_SLUGS.bills as any,
                depth: 0,
                overrideAccess: true,
                data: {
                    billNumber,
                    vendor: vendor.id,
                    billDate: toIsoTimestamp(billDate, 8),
                    postingDate: toIsoTimestamp(postingDate, 9),
                    dueDate: toIsoTimestamp(dueDate, 9),
                    status: 'approved',
                    currency: 'PHP',
                    exchangeRate: 1,
                    referenceNumber: `REF-APAG-${String(sequence).padStart(4, '0')}`,
                    memo: `Seeded AP aging bill ${sequence} for ${getVendorLabel(vendor)}.`,
                    payableAccountOverride: payableAccount.id,
                    notes,
                    createdBy: adminId,
                    updatedBy: adminId,
                } as never,
            })) as BillDoc)

        await payload.create({
            collection: ACCOUNTING_COLLECTION_SLUGS.billLineItems as any,
            depth: 0,
            overrideAccess: true,
            context: {
                [ACCOUNTING_HOOK_CONTEXT.skipBillTotalsSync]: true,
            },
            data: {
                bill: createdBill.id,
                lineNumber: 1,
                description: `Seeded AP aging line 1 for ${getVendorLabel(vendor)}.`,
                quantity: 1,
                unitPrice: lineAmounts.primary,
                expenseAccount: primaryExpenseAccount.id,
                payableAccountOverride: payableAccount.id,
                referenceEntityType: 'bill',
                referenceEntityId: String(createdBill.id),
                metadata: {
                    seedCategory: 'accounts-payable-aging',
                    seedSequence: sequence,
                },
                createdBy: adminId,
                updatedBy: adminId,
            } as never,
        })

        await payload.create({
            collection: ACCOUNTING_COLLECTION_SLUGS.billLineItems as any,
            depth: 0,
            overrideAccess: true,
            context: {
                [ACCOUNTING_HOOK_CONTEXT.skipBillTotalsSync]: true,
            },
            data: {
                bill: createdBill.id,
                lineNumber: 2,
                description: `Seeded AP aging line 2 for ${getVendorLabel(vendor)}.`,
                quantity: 1,
                unitPrice: lineAmounts.secondary,
                expenseAccount: secondaryExpenseAccount.id,
                payableAccountOverride: payableAccount.id,
                referenceEntityType: 'bill',
                referenceEntityId: String(createdBill.id),
                metadata: {
                    seedCategory: 'accounts-payable-aging',
                    seedSequence: sequence,
                },
                createdBy: adminId,
                updatedBy: adminId,
            } as never,
        })

        createdCount += 1

        try {
            const postedBill = (await AccountingBillService.postBill({
                payload,
                billId: createdBill.id,
                userId: adminId,
            })) as BillDoc

            postedCount += 1
            console.log(
                `Created AP aging seed ${billNumber} for ${getVendorLabel(vendor)} as ${String(postedBill.status || 'posted')} with payable override ${getAccountLabel(payableAccount)} and total ${lineAmounts.total.toFixed(2)}`,
            )
        } catch (error) {
            failedCount += 1
            console.log(
                `Created AP aging bill ${billNumber} for ${getVendorLabel(vendor)} but posting failed: ${error instanceof Error ? error.message : 'Unknown error'
                }`,
            )
        }
    }

    const totalCount = await payload.count({
        collection: ACCOUNTING_COLLECTION_SLUGS.bills as any,
        overrideAccess: true,
    })

    console.log(
        `Done. AP aging bills created: ${createdCount}, posted: ${postedCount}, skipped: ${skippedCount}, posting failures: ${failedCount}, total bills now: ${totalCount.totalDocs}`,
    )
}

seedAccountingApAging()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('Failed to seed AP aging bills:', error)
        process.exit(1)
    })
