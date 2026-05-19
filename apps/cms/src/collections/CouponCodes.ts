import type { CollectionConfig } from 'payload'
import { adminOnly } from '../access'

const couponStatusOptions = [
  { label: 'Draft', value: 'draft' },
  { label: 'Active', value: 'active' },
  { label: 'Paused', value: 'paused' },
  { label: 'Expired', value: 'expired' },
  { label: 'Archived', value: 'archived' },
]

const discountTypeOptions = [
  { label: 'Percent', value: 'percent' },
  { label: 'Fixed Course', value: 'fixed_course' },
  { label: 'Fixed Cart', value: 'fixed_cart' },
]

const scopeTypeOptions = [
  { label: 'All Courses', value: 'all_courses' },
  { label: 'Specific Courses', value: 'specific_courses' },
  { label: 'Specific Categories', value: 'specific_categories' },
]

export const CouponCodes: CollectionConfig = {
  slug: 'coupon-codes',
  admin: {
    useAsTitle: 'code',
    defaultColumns: ['code', 'status', 'discountType', 'amount', 'usageCount', 'expiresAt'],
    group: 'Learning Management',
    description: 'Master coupon definitions and rule configuration for course pricing.',
  },
  access: {
    read: ({ req: { user } }) => {
      if (!user) return false
      if (user.role === 'admin' || user.role === 'service') return true
      return {
        status: {
          equals: 'active',
        },
      }
    },
    create: adminOnly,
    update: adminOnly,
    delete: adminOnly,
  },
  fields: [
    {
      name: 'code',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        description: 'Unique coupon code used at enrollment/checkout.',
      },
      hooks: {
        beforeValidate: [
          ({ value }) => String(value || '').trim().toUpperCase(),
        ],
      },
    },
    {
      name: 'name',
      type: 'text',
      admin: {
        description: 'Internal campaign name for this coupon.',
      },
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'status',
      type: 'select',
      options: couponStatusOptions,
      defaultValue: 'draft',
      required: true,
      index: true,
    },
    {
      name: 'startsAt',
      type: 'date',
      admin: {
        date: { pickerAppearance: 'dayAndTime' },
      },
      index: true,
    },
    {
      name: 'expiresAt',
      type: 'date',
      admin: {
        date: { pickerAppearance: 'dayAndTime' },
      },
      index: true,
    },
    {
      name: 'discountType',
      type: 'select',
      options: discountTypeOptions,
      defaultValue: 'percent',
      required: true,
    },
    {
      name: 'amount',
      type: 'number',
      required: true,
      min: 0,
    },
    {
      name: 'maxDiscountAmount',
      type: 'number',
      min: 0,
    },
    {
      name: 'scopeType',
      type: 'select',
      options: scopeTypeOptions,
      defaultValue: 'all_courses',
      required: true,
    },
    {
      name: 'includedCourses',
      type: 'relationship',
      relationTo: 'courses',
      hasMany: true,
      admin: {
        condition: (_, siblingData) => siblingData.scopeType === 'specific_courses',
      },
    },
    {
      name: 'excludedCourses',
      type: 'relationship',
      relationTo: 'courses',
      hasMany: true,
    },
    {
      name: 'includedCategories',
      type: 'relationship',
      relationTo: 'course-categories',
      hasMany: true,
      admin: {
        condition: (_, siblingData) => siblingData.scopeType === 'specific_categories',
      },
    },
    {
      name: 'excludedCategories',
      type: 'relationship',
      relationTo: 'course-categories',
      hasMany: true,
    },
    {
      name: 'excludeSaleCourses',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'minimumAmount',
      type: 'number',
      min: 0,
    },
    {
      name: 'maximumAmount',
      type: 'number',
      min: 0,
    },
    {
      name: 'usageLimitTotal',
      type: 'number',
      min: 0,
    },
    {
      name: 'usageLimitPerUser',
      type: 'number',
      min: 0,
    },
    {
      name: 'maxItemsAffected',
      type: 'number',
      min: 1,
    },
    {
      name: 'stackable',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'priority',
      type: 'number',
      defaultValue: 100,
    },
    {
      name: 'allowedEmails',
      type: 'array',
      fields: [
        {
          name: 'email',
          type: 'email',
          required: true,
        },
      ],
    },
    {
      name: 'allowedTrainees',
      type: 'relationship',
      relationTo: 'trainees',
      hasMany: true,
    },
    {
      name: 'usageCount',
      type: 'number',
      defaultValue: 0,
      min: 0,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'lastUsedAt',
      type: 'date',
      admin: {
        date: { pickerAppearance: 'dayAndTime' },
        readOnly: true,
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

        if (data.code) {
          data.code = String(data.code).trim().toUpperCase()
        }

        if (data.startsAt && data.expiresAt) {
          const startsAt = new Date(data.startsAt)
          const expiresAt = new Date(data.expiresAt)
          if (startsAt > expiresAt) {
            throw new Error('Coupon start date cannot be after expiration date.')
          }
        }

        if (
          data.minimumAmount != null &&
          data.maximumAmount != null &&
          Number(data.minimumAmount) > Number(data.maximumAmount)
        ) {
          throw new Error('Minimum amount cannot be greater than maximum amount.')
        }

        return data
      },
    ],
  },
}
