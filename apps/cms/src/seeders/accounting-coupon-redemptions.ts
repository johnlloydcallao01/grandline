import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../payload.config'
import { Pool } from 'pg'

const COUPON_REDEMPTIONS = [
  { code: 'WELCOME10', discountType: 'percent', discountAmount: 2500, subtotal: 25000, finalTotal: 22500 },
  { code: 'WELCOME10', discountType: 'percent', discountAmount: 1800, subtotal: 18000, finalTotal: 16200 },
  { code: 'WELCOME10', discountType: 'percent', discountAmount: 3200, subtotal: 32000, finalTotal: 28800 },
  { code: 'FLAT500', discountType: 'fixed_cart', discountAmount: 500, subtotal: 5000, finalTotal: 4500 },
  { code: 'FLAT500', discountType: 'fixed_cart', discountAmount: 500, subtotal: 7500, finalTotal: 7000 },
  { code: 'FLAT500', discountType: 'fixed_cart', discountAmount: 500, subtotal: 12000, finalTotal: 11500 },
  { code: 'FLAT500', discountType: 'fixed_cart', discountAmount: 500, subtotal: 3000, finalTotal: 2500 },
  { code: 'SUMMER20', discountType: 'percent', discountAmount: 4000, subtotal: 20000, finalTotal: 16000 },
  { code: 'SUMMER20', discountType: 'percent', discountAmount: 3000, subtotal: 15000, finalTotal: 12000 },
  { code: 'SUMMER20', discountType: 'percent', discountAmount: 2000, subtotal: 10000, finalTotal: 8000 },
  { code: 'BULK5', discountType: 'fixed_cart', discountAmount: 5000, subtotal: 50000, finalTotal: 45000 },
  { code: 'BULK5', discountType: 'fixed_cart', discountAmount: 5000, subtotal: 35000, finalTotal: 30000 },
  { code: 'LOYALTY15', discountType: 'percent', discountAmount: 1500, subtotal: 10000, finalTotal: 8500 },
  { code: 'LOYALTY15', discountType: 'percent', discountAmount: 3000, subtotal: 20000, finalTotal: 17000 },
  { code: 'LOYALTY15', discountType: 'percent', discountAmount: 2250, subtotal: 15000, finalTotal: 12750 },
  { code: 'CORP-PARTNER', discountType: 'percent', discountAmount: 9000, subtotal: 30000, finalTotal: 21000 },
  { code: 'CORP-PARTNER', discountType: 'percent', discountAmount: 6000, subtotal: 20000, finalTotal: 14000 },
  { code: 'REFER50', discountType: 'fixed_cart', discountAmount: 50, subtotal: 5000, finalTotal: 4950 },
  { code: 'REFER50', discountType: 'fixed_cart', discountAmount: 50, subtotal: 8000, finalTotal: 7950 },
  { code: 'REFER50', discountType: 'fixed_cart', discountAmount: 50, subtotal: 3500, finalTotal: 3450 },
]

async function seedCouponRedemptions() {
  console.log('[seed:coupon-redemptions] Connecting...')
  const payload = await getPayload({ config })

  const couponResult = await payload.find({
    collection: 'coupon-codes',
    limit: 100,
    overrideAccess: true,
  })
  const couponIdMap = new Map<string, string>()
  for (const c of couponResult.docs) {
    couponIdMap.set(String(c.code), String(c.id))
  }
  console.log(`[seed:coupon-redemptions] Found ${couponIdMap.size} coupon codes.`)

  const enrollmentResult = await payload.find({
    collection: 'course-enrollments',
    limit: 50,
    overrideAccess: true,
  })
  const enrollmentIds = enrollmentResult.docs.map((d) => String(d.id))
  console.log(`[seed:coupon-redemptions] Found ${enrollmentIds.length} course enrollments.`)

  const pool = new Pool({ connectionString: process.env.DATABASE_URI })

  let created = 0
  let skipped = 0

  for (let i = 0; i < COUPON_REDEMPTIONS.length; i++) {
    const row = COUPON_REDEMPTIONS[i]
    const couponId = couponIdMap.get(row.code)
    if (!couponId) {
      console.log(`[seed:coupon-redemptions] Skipping ${row.code} — coupon code not found.`)
      skipped++
      continue
    }

    const appliedAt = new Date(Date.now() - Math.floor(Math.random() * 90 * 86400000)).toISOString()
    const enrollmentId = enrollmentIds.length > 0 ? enrollmentIds[i % enrollmentIds.length] : null

    try {
      await pool.query(
        `INSERT INTO coupon_redemptions (coupon_id, code_snapshot, discount_type_snapshot, discount_amount_snapshot, subtotal_snapshot, final_total_snapshot, currency_snapshot, context_type, status, course_enrollment_id, applied_at, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())`,
        [couponId, row.code, row.discountType, row.discountAmount, row.subtotal, row.finalTotal, 'PHP', 'checkout_commit', 'applied', enrollmentId, appliedAt],
      )
      console.log(`[seed:coupon-redemptions] Created redemption #${i + 1} — ${row.code}, PHP ${row.discountAmount}`)
      created++
    } catch (err) {
      console.log(`[seed:coupon-redemptions] Error creating #${i + 1} (${row.code}): ${err instanceof Error ? err.message : err}`)
      skipped++
    }
  }

  await pool.end()
  console.log(`[seed:coupon-redemptions] Done. Created: ${created}, Skipped: ${skipped}`)
  process.exit(0)
}

seedCouponRedemptions().catch((error) => {
  console.error('[seed:coupon-redemptions] Fatal error:', error)
  process.exit(1)
})
