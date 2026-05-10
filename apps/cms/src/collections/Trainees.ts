import type { CollectionConfig } from 'payload'
import { adminOnly } from '../access'

export const Trainees: CollectionConfig = {
  slug: 'trainees',
  admin: {
    useAsTitle: 'user',
    defaultColumns: ['user', 'srn', 'enrollmentDate', 'currentLevel'],
  },
  access: {
    read: ({ req: { user } }) => {
      if (!user) return false;
      if (user.role === 'admin' || user.role === 'service' || user.role === 'instructor') return true;
      return { user: { equals: user.id } };
    },
    create: adminOnly,
    update: ({ req: { user } }) => {
      if (!user) return false;
      if (user.role === 'admin') return true;
      return { user: { equals: user.id } };
    },
    delete: adminOnly,
  },
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      unique: true,
      admin: {
        description: 'Link to user account',
      },
    },

    // ROLE-SPECIFIC FIELDS (trainee learning data)
    {
      name: 'srn',
      type: 'text',
      unique: true,
      required: true,
      admin: {
        description: 'Student Registration Number (unique identifier)',
      },
    },
    {
      name: 'couponCode',
      type: 'text',
      admin: {
        description: 'Marketing coupon code used during registration',
      },
    },
    {
      name: 'enrollmentDate',
      type: 'date',
      admin: {
        description: 'Date when trainee enrolled in the program',
      },
    },
    {
      name: 'currentLevel',
      type: 'select',
      options: [
        {
          label: 'Standard',
          value: 'standard',
        },
        {
          label: 'Intermediate',
          value: 'intermediate',
        },
        {
          label: 'Advanced',
          value: 'advanced',
        },
      ],
      defaultValue: 'standard',
      admin: {
        description: 'Current learning level',
      },
    },

  ],
}
