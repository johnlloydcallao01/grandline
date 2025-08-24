import type { CollectionConfig } from 'payload'

export const Admins: CollectionConfig = {
  slug: 'admins',
  admin: {
    useAsTitle: 'user',
    defaultColumns: ['user', 'department', 'adminLevel', 'isActive'],
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
      name: 'department',
      type: 'text',
      required: true,
      admin: {
        description: 'Department or area of responsibility',
      },
    },
    {
      name: 'adminLevel',
      type: 'select',
      options: [
        { label: 'System Admin', value: 'system' },
        { label: 'Department Admin', value: 'department' },
        { label: 'Content Admin', value: 'content' },
      ],
      required: true,
      admin: {
        description: 'Level of administrative access',
      },
    },
    {
      name: 'permissions',
      type: 'select',
      hasMany: true,
      options: [
        { label: 'User Management', value: 'user_management' },
        { label: 'Course Management', value: 'course_management' },
        { label: 'Content Management', value: 'content_management' },
        { label: 'System Settings', value: 'system_settings' },
        { label: 'Reports Access', value: 'reports_access' },
      ],
      admin: {
        description: 'Specific admin permissions',
      },
    },
    {
      name: 'hireDate',
      type: 'date',
      admin: {
        description: 'Date when admin was hired',
      },
    },
    {
      name: 'officeLocation',
      type: 'text',
      admin: {
        description: 'Office location or building',
      },
    },
    {
      name: 'directReports',
      type: 'number',
      admin: {
        description: 'Number of direct reports',
      },
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Whether admin is currently active',
      },
    },
  ],
}
