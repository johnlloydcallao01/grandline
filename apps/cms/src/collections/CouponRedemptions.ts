import type { CollectionConfig } from 'payload'
import { adminOnly } from '../access'
import { refreshCouponUsageStats } from '../utils/couponEngine'

const redemptionStatusOptions = [
  { label: 'Applied', value: 'applied' },
  { label: 'Voided', value: 'voided' },
  { label: 'Reversed', value: 'reversed' },
]

const redemptionContextOptions = [
  { label: 'Checkout Preview', value: 'checkout_preview' },
  { label: 'Checkout Commit', value: 'checkout_commit' },
  { label: 'Manual Adjustment', value: 'manual_adjustment' },
  { label: 'Refund Reversal', value: 'refund_reversal' },
]

export const CouponRedemptions: CollectionConfig = {
  slug: 'coupon-redemptions',
  admin: {
    useAsTitle: 'codeSnapshot',
    defaultColumns: ['codeSnapshot', 'coupon', 'trainee', 'course', 'status', 'appliedAt'],
    group: 'Learning Management',
    description: 'Immutable-ish audit log of coupon usage and coupon-linked enrollment pricing.',
  },
  access: {
    read: adminOnly,
    create: adminOnly,
    update: adminOnly,
    delete: adminOnly,
  },
  fields: [
    {
      name: 'coupon',
      type: 'relationship',
      relationTo: 'coupon-codes',
      required: true,
      index: true,
    },
    {
      name: 'trainee',
      type: 'relationship',
      relationTo: 'trainees',
      index: true,
    },
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      index: true,
    },
    {
      name: 'courseEnrollment',
      type: 'relationship',
      relationTo: 'course-enrollments',
      index: true,
    },
    {
      name: 'course',
      type: 'relationship',
      relationTo: 'courses',
      index: true,
    },
    {
      name: 'contextType',
      type: 'select',
      options: redemptionContextOptions,
      defaultValue: 'checkout_commit',
      required: true,
    },
    {
      name: 'status',
      type: 'select',
      options: redemptionStatusOptions,
      defaultValue: 'applied',
      required: true,
      index: true,
    },
    {
      name: 'codeSnapshot',
      type: 'text',
      required: true,
      index: true,
    },
    {
      name: 'discountTypeSnapshot',
      type: 'text',
      required: true,
    },
    {
      name: 'discountAmountSnapshot',
      type: 'number',
      required: true,
      min: 0,
    },
    {
      name: 'subtotalSnapshot',
      type: 'number',
      required: true,
      min: 0,
    },
    {
      name: 'finalTotalSnapshot',
      type: 'number',
      required: true,
      min: 0,
    },
    {
      name: 'currencySnapshot',
      type: 'text',
      defaultValue: 'PHP',
      required: true,
    },
    {
      name: 'appliedAt',
      type: 'date',
      defaultValue: () => new Date().toISOString(),
      required: true,
      index: true,
      admin: {
        date: { pickerAppearance: 'dayAndTime' },
      },
    },
    {
      name: 'metadata',
      type: 'json',
    },
  ],
  hooks: {
    beforeChange: [
      ({ data }) => {
        if (!data) return data

        if (data.codeSnapshot) {
          data.codeSnapshot = String(data.codeSnapshot).trim().toUpperCase()
        }

        return data
      },
    ],
    afterChange: [
      async ({ doc, req }) => {
        const couponId = typeof doc.coupon === 'object' ? doc.coupon.id : doc.coupon
        if (!couponId) return
        await refreshCouponUsageStats(req.payload, couponId)
      },
    ],
    afterDelete: [
      async ({ doc, req }) => {
        const couponId = typeof doc.coupon === 'object' ? doc.coupon.id : doc.coupon
        if (!couponId) return
        await refreshCouponUsageStats(req.payload, couponId)
      },
    ],
  },
}
