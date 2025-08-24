import type { CollectionConfig } from 'payload'
import { basicContentFields, organizationFields, publishingFields, seoFields } from '../fields'

export const Services: CollectionConfig = {
  slug: 'services',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'status', 'excerpt', 'updatedAt'],
  },
  access: {
    read: () => true, // Public can read active services
    create: ({ req: { user } }) => {
      // Only admins can create services
      return user?.role === 'super-admin' || user?.role === 'admin'
    },
    update: ({ req: { user } }) => {
      // Only admins can update services
      return user?.role === 'super-admin' || user?.role === 'admin'
    },
    delete: ({ req: { user } }) => {
      // Only super-admin can delete services
      return user?.role === 'super-admin'
    },
  },
  fields: [
    ...basicContentFields,
    ...organizationFields,
    ...publishingFields,
    seoFields,
  ],
}
