import type { CollectionConfig } from 'payload'

export const Instructors: CollectionConfig = {
  slug: 'instructors',
  admin: {
    useAsTitle: 'user',
    defaultColumns: ['user', 'specialization', 'yearsExperience', 'teachingPermissions'],
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

    // ROLE-SPECIFIC FIELDS (instructor-specific data only)
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

    // ENTERPRISE ENHANCEMENT: Teaching-specific permissions
    {
      name: 'teachingPermissions',
      type: 'json',
      admin: {
        description: 'Course management and teaching capabilities',
      },
    },
  ],
}
