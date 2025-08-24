import type { CollectionConfig } from 'payload'

export const Instructors: CollectionConfig = {
  slug: 'instructors',
  admin: {
    useAsTitle: 'user',
    defaultColumns: ['user', 'specialization', 'yearsExperience', 'isActive'],
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
    {
      name: 'specialization',
      type: 'text',
      required: true,
      admin: {
        description: 'Teaching specialization or subject area',
      },
    },
    {
      name: 'yearsExperience',
      type: 'number',
      admin: {
        description: 'Years of teaching experience',
      },
    },
    {
      name: 'certifications',
      type: 'textarea',
      admin: {
        description: 'Professional certifications and qualifications',
      },
    },
    {
      name: 'bio',
      type: 'textarea',
      admin: {
        description: 'Instructor biography',
      },
    },
    {
      name: 'officeHours',
      type: 'text',
      admin: {
        description: 'Office hours schedule',
      },
    },
    {
      name: 'contactEmail',
      type: 'email',
      admin: {
        description: 'Professional contact email',
      },
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Whether instructor is currently active',
      },
    },
  ],
}
