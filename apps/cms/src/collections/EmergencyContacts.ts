import type { CollectionConfig } from 'payload'
import { adminOnly } from '../access'

export const EmergencyContacts: CollectionConfig = {
  slug: 'emergency-contacts',
  admin: {
    useAsTitle: 'firstName',
    defaultColumns: ['user', 'firstName', 'lastName', 'contactNumber', 'relationship'],
  },
  access: {
    read: ({ req: { user } }) => {
      if (!user) return false
      if (user.role === 'admin' || user.role === 'service' || user.role === 'instructor') return true
      return { user: { equals: user.id } }
    },
    create: ({ req: { user } }) => {
      if (!user) return false
      return user.role === 'admin' || user.role === 'service' || user.role === 'instructor'
    },
    update: ({ req: { user } }) => {
      if (!user) return false
      if (user.role === 'admin' || user.role === 'service' || user.role === 'instructor') return true
      return { user: { equals: user.id } }
    },
    delete: adminOnly, // Only admins can delete emergency contacts
  },
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      unique: true,
      admin: {
        description: 'User this emergency contact belongs to',
      },
    },
    {
      name: 'firstName',
      type: 'text',
      required: true,
      admin: {
        description: 'Emergency contact first name',
      },
    },
    {
      name: 'middleName',
      type: 'text',
      required: false,
      admin: {
        description: 'Emergency contact middle name (optional)',
      },
    },
    {
      name: 'lastName',
      type: 'text',
      required: true,
      admin: {
        description: 'Emergency contact last name',
      },
    },
    {
      name: 'contactNumber',
      type: 'text',
      required: true,
      admin: {
        description: 'Emergency contact phone number',
      },
    },
    {
      name: 'relationship',
      type: 'select',
      required: true,
      options: [
        { label: 'Parent', value: 'parent' },
        { label: 'Spouse', value: 'spouse' },
        { label: 'Sibling', value: 'sibling' },
        { label: 'Child', value: 'child' },
        { label: 'Guardian', value: 'guardian' },
        { label: 'Friend', value: 'friend' },
        { label: 'Relative', value: 'relative' },
        { label: 'Other', value: 'other' },
      ],
      admin: {
        description: 'Relationship to the user',
      },
    },
    {
      name: 'completeAddress',
      type: 'textarea',
      required: true,
      admin: {
        description: 'Emergency contact complete address',
      },
    },
    {
      name: 'isPrimary',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Mark as primary emergency contact',
      },
    },
  ],
}
