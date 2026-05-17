import type { CollectionConfig } from 'payload'

export const WebPushSubscriptions: CollectionConfig = {
  slug: 'web-push-subscriptions',
  admin: {
    useAsTitle: 'endpoint',
    defaultColumns: ['user', 'browser', 'platform', 'isActive', 'lastSuccessAt'],
    group: 'Notifications',
    description: 'Browser/device push subscriptions used for web push delivery',
  },
  access: {
    read: ({ req: { user } }) => {
      if (!user) return false
      if (user.role === 'admin' || user.role === 'service') return true
      return {
        user: {
          equals: user.id,
        },
      }
    },
    create: ({ req: { user } }) => !!user,
    update: ({ req: { user } }) => {
      if (!user) return false
      if (user.role === 'admin' || user.role === 'service') return true
      return {
        user: {
          equals: user.id,
        },
      }
    },
    delete: ({ req: { user } }) => {
      if (!user) return false
      if (user.role === 'admin' || user.role === 'service') return true
      return {
        user: {
          equals: user.id,
        },
      }
    },
  },
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      admin: {
        description: 'The user who owns this browser/device subscription',
      },
      hooks: {
        beforeChange: [
          ({ req, value, operation }) => {
            if (operation === 'create' && req.user && req.user.role !== 'admin' && req.user.role !== 'service') {
              return req.user.id
            }
            return value
          },
        ],
      },
    },
    {
      name: 'endpoint',
      type: 'textarea',
      required: true,
    },
    {
      name: 'p256dh',
      type: 'text',
      required: true,
    },
    {
      name: 'auth',
      type: 'text',
      required: true,
    },
    {
      name: 'userAgent',
      type: 'textarea',
    },
    {
      name: 'browser',
      type: 'text',
    },
    {
      name: 'platform',
      type: 'text',
    },
    {
      name: 'deviceLabel',
      type: 'text',
    },
    {
      name: 'permissionState',
      type: 'select',
      options: [
        { label: 'Default', value: 'default' },
        { label: 'Granted', value: 'granted' },
        { label: 'Denied', value: 'denied' },
      ],
      defaultValue: 'granted',
      required: true,
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
      required: true,
    },
    {
      name: 'lastSeenAt',
      type: 'date',
    },
    {
      name: 'lastSubscribedAt',
      type: 'date',
    },
    {
      name: 'lastSuccessAt',
      type: 'date',
    },
    {
      name: 'lastFailureAt',
      type: 'date',
    },
    {
      name: 'failureReason',
      type: 'textarea',
    },
    {
      name: 'subscriptionJSON',
      type: 'json',
      admin: {
        description: 'Raw PushSubscription payload for debugging and recovery',
      },
    },
  ],
}
