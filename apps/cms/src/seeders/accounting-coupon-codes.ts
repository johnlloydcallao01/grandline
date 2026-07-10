import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../payload.config'

const SAMPLE_COUPONS = [
  {
    code: 'WELCOME10',
    name: 'New Trainee Welcome',
    description: '10% off for first-time enrollees.',
    status: 'active',
    discountType: 'percent',
    amount: 10,
    scopeType: 'all_courses',
    stackable: false,
    priority: 100,
    usageLimitTotal: 500,
    usageLimitPerUser: 1,
    excludeSaleCourses: false,
    startsAt: new Date('2026-01-01').toISOString(),
    expiresAt: new Date('2026-12-31').toISOString(),
  },
  {
    code: 'FLAT500',
    name: 'Fixed Discount PHP 500',
    description: 'PHP 500 off any course enrollment.',
    status: 'active',
    discountType: 'fixed_cart',
    amount: 500,
    scopeType: 'all_courses',
    stackable: true,
    priority: 50,
    usageLimitTotal: 200,
    usageLimitPerUser: 3,
    minimumAmount: 2000,
    excludeSaleCourses: true,
    startsAt: new Date('2026-06-01').toISOString(),
    expiresAt: new Date('2026-09-30').toISOString(),
  },
  {
    code: 'SUMMER20',
    name: 'Summer Enrollment Promo',
    description: '20% discount for summer term enrollments.',
    status: 'active',
    discountType: 'percent',
    amount: 20,
    maxDiscountAmount: 3000,
    scopeType: 'all_courses',
    stackable: false,
    priority: 200,
    usageLimitTotal: 300,
    usageLimitPerUser: 2,
    startsAt: new Date('2026-03-01').toISOString(),
    expiresAt: new Date('2026-05-31').toISOString(),
  },
  {
    code: 'BULK5',
    name: 'Bulk Enrollment Discount',
    description: 'PHP 5,000 off for bulk course packages.',
    status: 'active',
    discountType: 'fixed_cart',
    amount: 5000,
    scopeType: 'all_courses',
    stackable: false,
    priority: 300,
    usageLimitTotal: 50,
    usageLimitPerUser: 1,
    minimumAmount: 25000,
    maxItemsAffected: 10,
    excludeSaleCourses: false,
    startsAt: new Date('2026-01-01').toISOString(),
    expiresAt: new Date('2026-12-31').toISOString(),
  },
  {
    code: 'LOYALTY15',
    name: 'Loyalty Discount',
    description: '15% off for returning trainees.',
    status: 'active',
    discountType: 'percent',
    amount: 15,
    maxDiscountAmount: 2000,
    scopeType: 'all_courses',
    stackable: true,
    priority: 150,
    usageLimitTotal: 1000,
    usageLimitPerUser: 999,
    startsAt: new Date('2026-01-01').toISOString(),
    expiresAt: new Date('2026-12-31').toISOString(),
  },
  {
    code: 'EARLYBIRD',
    name: 'Early Bird Registration',
    description: '25% off for early registrants.',
    status: 'draft',
    discountType: 'percent',
    amount: 25,
    maxDiscountAmount: 4000,
    scopeType: 'all_courses',
    stackable: false,
    priority: 250,
    usageLimitTotal: 100,
    usageLimitPerUser: 1,
    startsAt: new Date('2026-08-01').toISOString(),
    expiresAt: new Date('2026-10-31').toISOString(),
  },
  {
    code: 'CORP-PARTNER',
    name: 'Corporate Partner Rate',
    description: 'Special 30% discount for corporate partners.',
    status: 'active',
    discountType: 'percent',
    amount: 30,
    maxDiscountAmount: 5000,
    scopeType: 'all_courses',
    stackable: false,
    priority: 500,
    usageLimitTotal: 200,
    usageLimitPerUser: 10,
    startsAt: new Date('2026-01-01').toISOString(),
    expiresAt: new Date('2026-12-31').toISOString(),
  },
  {
    code: 'REFER50',
    name: 'Referral Discount',
    description: 'PHP 50 off per referral enrollment.',
    status: 'active',
    discountType: 'fixed_cart',
    amount: 50,
    scopeType: 'all_courses',
    stackable: true,
    priority: 75,
    usageLimitTotal: 500,
    usageLimitPerUser: 5,
    minimumAmount: 500,
    startsAt: new Date('2026-01-01').toISOString(),
    expiresAt: new Date('2026-12-31').toISOString(),
  },
  {
    code: 'FINANCIAL-AID',
    name: 'Financial Assistance Grant',
    description: 'PHP 10,000 financial aid for qualified trainees.',
    status: 'paused',
    discountType: 'fixed_cart',
    amount: 10000,
    scopeType: 'all_courses',
    stackable: false,
    priority: 1000,
    usageLimitTotal: 20,
    usageLimitPerUser: 1,
    minimumAmount: 15000,
    startsAt: new Date('2026-01-01').toISOString(),
    expiresAt: new Date('2026-06-30').toISOString(),
  },
  {
    code: 'FREE-SHIPPING',
    name: 'Course Material Discount',
    description: 'PHP 250 off course materials and supplies.',
    status: 'expired',
    discountType: 'fixed_cart',
    amount: 250,
    scopeType: 'all_courses',
    stackable: true,
    priority: 25,
    usageLimitTotal: 1000,
    usageLimitPerUser: 999,
    startsAt: new Date('2025-01-01').toISOString(),
    expiresAt: new Date('2025-12-31').toISOString(),
  },
]

async function seedCouponCodes() {
  console.log('[seed:coupon-codes] Connecting to Payload...')
  const payload = await getPayload({ config })

  let created = 0
  let skipped = 0

  for (const coupon of SAMPLE_COUPONS) {
    const existing = await payload.find({
      collection: 'coupon-codes',
      where: { code: { equals: coupon.code } } as never,
      limit: 1,
      overrideAccess: true,
    })

    if (existing.totalDocs > 0) {
      console.log(`[seed:coupon-codes] Skipping ${coupon.code} — already exists.`)
      skipped++
      continue
    }

    await payload.create({
      collection: 'coupon-codes',
      overrideAccess: true,
      data: coupon as never,
    })

    console.log(`[seed:coupon-codes] Created ${coupon.code} — ${coupon.name}`)
    created++
  }

  console.log(`[seed:coupon-codes] Done. Created: ${created}, Skipped: ${skipped}`)
  process.exit(0)
}

seedCouponCodes().catch((error) => {
  console.error('[seed:coupon-codes] Fatal error:', error)
  process.exit(1)
})
