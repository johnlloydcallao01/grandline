import type { CollectionConfig } from 'payload'

export const UserCertifications: CollectionConfig = {
  slug: 'user-certifications',
  admin: {
    useAsTitle: 'certificationName',
    defaultColumns: ['user', 'certificationName', 'issuingAuthority', 'expiryDate', 'isActive'],
  },
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      admin: {
        description: 'User who holds this certification',
      },
    },
    {
      name: 'certificationName',
      type: 'text',
      required: true,
      admin: {
        description: 'Name of the certification',
      },
    },
    {
      name: 'issuingAuthority',
      type: 'text',
      admin: {
        description: 'Organization that issued the certification',
      },
    },
    {
      name: 'issueDate',
      type: 'date',
      admin: {
        description: 'Date when certification was issued',
      },
    },
    {
      name: 'expiryDate',
      type: 'date',
      admin: {
        description: 'Date when certification expires (if applicable)',
      },
    },
    {
      name: 'verificationUrl',
      type: 'text',
      admin: {
        description: 'URL to verify the certification',
      },
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Whether this certification is currently active/valid',
      },
    },
  ],
}
