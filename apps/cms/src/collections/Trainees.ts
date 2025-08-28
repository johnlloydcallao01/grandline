import type { CollectionConfig } from 'payload'
import { adminOnly, instructorOrAbove } from '../access'

export const Trainees: CollectionConfig = {
  slug: 'trainees',
  admin: {
    useAsTitle: 'user',
    defaultColumns: ['user', 'srn', 'enrollmentDate', 'currentLevel'],
  },
  access: {
    read: instructorOrAbove, // Instructors and admins can read trainee data
    create: adminOnly, // Only admins can create trainee records
    update: adminOnly, // Only admins can update trainee records
    delete: adminOnly, // Only admins can delete trainee records
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
          label: 'Beginner',
          value: 'beginner',
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
      defaultValue: 'beginner',
      admin: {
        description: 'Current learning level',
      },
    },

  ],
}
