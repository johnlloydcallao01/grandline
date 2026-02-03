import type { CollectionConfig } from 'payload'

export const Notifications: CollectionConfig = {
  slug: 'notifications',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'origin', 'status', 'scheduledAt'],
    group: 'Notifications',
    description: 'Logical notification events and broadcasts',
  },
  access: {
    read: ({ req: { user } }) => {
      if (!user) return false
      if (user.role === 'admin' || user.role === 'service') return true
      return false
    },
    create: ({ req: { user } }) => {
      if (!user) return false
      if (user.role === 'admin' || user.role === 'service') return true
      return false
    },
    update: ({ req: { user } }) => {
      if (!user) return false
      if (user.role === 'admin' || user.role === 'service') return true
      return false
    },
    delete: ({ req: { user } }) => {
      if (!user) return false
      if (user.role === 'admin' || user.role === 'service') return true
      return false
    },
  },
  fields: [
    {
      name: 'template',
      type: 'relationship',
      relationTo: 'notification-templates',
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
      name: 'metadata',
      type: 'json',
    },
    {
      name: 'sourceType',
      type: 'text',
    },
    {
      name: 'sourceId',
      type: 'text',
    },
    {
      name: 'actor',
      type: 'relationship',
      relationTo: 'users',
    },
    {
      name: 'origin',
      type: 'select',
      options: [
        { label: 'Manual', value: 'manual' },
        { label: 'Automatic', value: 'automatic' },
      ],
      defaultValue: 'automatic',
      required: true,
    },
    {
      name: 'audienceType',
      type: 'select',
      options: [
        { label: 'All Users', value: 'all-users' },
        { label: 'Role', value: 'role' },
        { label: 'Segment', value: 'segment' },
        { label: 'Specific Users', value: 'specific-users' },
      ],
      required: true,
    },
    {
      name: 'audienceRole',
      type: 'select',
      options: [
        { label: 'Trainee', value: 'trainee' },
        { label: 'Instructor', value: 'instructor' },
        { label: 'Admin', value: 'admin' },
        { label: 'Service', value: 'service' },
      ],
      admin: {
        condition: (_, siblingData) => siblingData.audienceType === 'role',
      },
    },
    {
      name: 'audienceUsers',
      type: 'relationship',
      relationTo: 'users',
      hasMany: true,
      admin: {
        condition: (_, siblingData) => siblingData.audienceType === 'specific-users',
      },
    },
    {
      name: 'segmentDefinition',
      type: 'json',
      admin: {
        condition: (_, siblingData) => siblingData.audienceType === 'segment',
      },
    },
    {
      name: 'scheduledAt',
      type: 'date',
    },
    {
      name: 'expiresAt',
      type: 'date',
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Scheduled', value: 'scheduled' },
        { label: 'Sent', value: 'sent' },
        { label: 'Cancelled', value: 'cancelled' },
      ],
      defaultValue: 'draft',
      required: true,
    },
  ],
}

