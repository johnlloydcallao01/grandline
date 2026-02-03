import type { CollectionConfig } from 'payload'

export const UserNotifications: CollectionConfig = {
  slug: 'user-notifications',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['user', 'category', 'title', 'deliveredAt', 'readAt'],
    group: 'Notifications',
    description: 'Per-user notifications powering the in-app inbox',
  },
  access: {
    read: ({ req: { user } }) => {
      if (!user) return false
      if (user.role === 'admin' || user.role === 'service') return true
      return {
        user: { equals: user.id },
      }
    },
    create: ({ req: { user } }) => {
      if (!user) return false
      if (user.role === 'admin' || user.role === 'service') return true
      return false
    },
    update: ({ req: { user } }) => {
      if (!user) return false
      if (user.role === 'admin' || user.role === 'service') return true
      return {
        user: { equals: user.id },
      }
    },
    delete: ({ req: { user } }) => {
      if (!user) return false
      if (user.role === 'admin' || user.role === 'service') return true
      return false
    },
  },
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
    },
    {
      name: 'notification',
      type: 'relationship',
      relationTo: 'notifications',
      required: true,
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
      required: true,
    },
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'body',
      type: 'textarea',
    },
    {
      name: 'link',
      type: 'text',
    },
    {
      name: 'metadata',
      type: 'json',
    },
    {
      name: 'readAt',
      type: 'date',
    },
    {
      name: 'seenAt',
      type: 'date',
    },
    {
      name: 'deliveredAt',
      type: 'date',
      defaultValue: () => new Date().toISOString(),
    },
    {
      name: 'channel',
      type: 'select',
      options: [
        { label: 'In-app', value: 'in-app' },
        { label: 'Email', value: 'email' },
        { label: 'Push', value: 'push' },
      ],
      defaultValue: 'in-app',
      required: true,
    },
    {
      name: 'archived',
      type: 'checkbox',
      defaultValue: false,
    },
  ],
}

