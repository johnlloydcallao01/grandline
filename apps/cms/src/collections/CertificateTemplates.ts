import type { CollectionConfig } from 'payload'
import { adminOnly } from '../access'

export const CertificateTemplates: CollectionConfig = {
  slug: 'certificate-templates',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'status', 'updatedAt'],
    group: 'Learning Management',
    description: 'Design blueprints for course certificates',
  },
  access: {
    read: ({ req: { user } }) => {
      // Allow admins, instructors, and service accounts (for generation) to read templates
      if (user?.role === 'admin' || user?.role === 'service' || user?.role === 'instructor') {
        return true
      }
      return false
    },
    create: adminOnly,
    update: adminOnly,
    delete: adminOnly,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      admin: {
        description: 'Internal name (e.g., "Standard Completion Template")',
      },
    },
    {
      name: 'slug',
      type: 'text',
      unique: true,
      required: true,
      admin: {
        description: 'URL-friendly identifier',
      },
    },
    {
      name: 'backgroundImage',
      type: 'upload',
      relationTo: 'media',
      required: true,
      admin: {
        description: 'The base certificate design (borders, logos) without dynamic text',
      },
    },
    {
      name: 'canvasSchema',
      type: 'json',
      required: true,
      admin: {
        description: 'Stores the layout configuration from the Drag-and-Drop builder',
      },
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Published', value: 'published' },
        { label: 'Archived', value: 'archived' },
      ],
      defaultValue: 'draft',
      required: true,
      admin: {
        position: 'sidebar',
      },
    },
  ],
}
