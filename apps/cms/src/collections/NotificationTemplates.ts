import type { CollectionConfig } from 'payload'

export const NotificationTemplates: CollectionConfig = {
  slug: 'notification-templates',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'code', 'category', 'automatic', 'manual'],
    group: 'Notifications',
    description: 'Define reusable notification types and templates',
  },
  access: {
    read: ({ req: { user } }) => {
      if (!user) return false
      if (user.role === 'admin' || user.role === 'service') return true
      return false
    },
    create: ({ req: { user } }) => {
      if (!user) return false
      return user.role === 'admin'
    },
    update: ({ req: { user } }) => {
      if (!user) return false
      return user.role === 'admin'
    },
    delete: ({ req: { user } }) => {
      if (!user) return false
      return user.role === 'admin'
    },
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'code',
      type: 'text',
      required: true,
      unique: true,
    },
    {
      name: 'category',
      type: 'select',
      options: [
        { label: 'Learning', value: 'learning' },
        { label: 'Account', value: 'account' },
        { label: 'System Updates', value: 'system-update' },
        { label: 'Other', value: 'other' },
      ],
      defaultValue: 'learning',
      required: true,
    },
    {
      name: 'titleTemplate',
      type: 'text',
      required: true,
    },
    {
      name: 'bodyTemplate',
      type: 'textarea',
    },
    {
      name: 'defaultLink',
      type: 'text',
    },
    {
      name: 'channels',
      type: 'select',
      hasMany: true,
      options: [
        { label: 'In-app', value: 'in-app' },
        { label: 'Email', value: 'email' },
        { label: 'Push', value: 'push' },
      ],
      defaultValue: ['in-app'],
    },
    {
      name: 'automatic',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'manual',
      type: 'checkbox',
      defaultValue: true,
    },
    {
      name: 'metadataSchema',
      type: 'json',
    },
  ],
}

